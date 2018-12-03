module BABYLON {
    export class Main {
        // Public members
        public scene: Scene;

        private _camera: ArcFollowCamera = null;
        private _character: Mesh = null;
        private _colliders: AbstractMesh[]= null;
        private readonly MAX_VELOCITY =1.5;
        private readonly TERMINAL_VELOCITY = 20;
        private readonly JUMP_FORCE = 4;
        private readonly SPEED = 3;
        private inputUnlocked = true;
        private collided:boolean=null;
        private activeSensor:AbstractMesh=null;

        // Constructor
        constructor (scene: Scene) {
            this.scene = scene;
        }
        // Create camera
        public createMeshes() : void {
            //setup camera
            var cameraStartPosition:Vector3 = this.scene.activeCamera.position;
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", -Math.PI/2, 0, 10,this.scene.getMeshByName("collide"), this.scene);
            //this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;

            //setup character
            this._character = BABYLON.Mesh.CreateBox("character", 0.5, this.scene);
            this._character.position.set(1.3,2,-1.6);
            var material =  new BABYLON.StandardMaterial("material",this.scene);
            material.diffuseColor = new BABYLON.Color3(0.9,0.2,0);
            this._character.material = material;

            //link character and camera
            this._camera.target=this._character;
            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), scene);
            //TEST
               /*********************************Start World Axes********************/
    var showAxis = function (size) {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], this.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], this.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], this.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
    };
    /***************************End World Axes***************************/

    showAxis(7);
        }

        // Create collisions
        public setupCollisions () : void {
        //this.scene.registerBeforeRender(()=>{});
           
        }
        private checkGroundCollision():boolean
        {
            this._colliders.forEach(collider => {
                if(this._character.intersectsMesh(collider,true))
                {
                    this.collided = true;
                    return true; // NO OUTPUT §!%$* !!!
                }
            });
            return false;
        }
        private checkSensorCollision(): any
        {
            this.scene.getMeshByName("sensorParent").getChildMeshes().forEach(sensor => {
                if(this._character.intersectsMesh(sensor,true))
                {
                    this.activeSensor = sensor;
                }
            });
        }

        // Setup physics
        public setupPhysics () :void {
            //character
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());
            this._character.position.y += 0.5;
            this._character.physicsImpostor = new PhysicsImpostor(this._character, PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution:0.2,
                friction:1.0
            });
            //lock rotation and clamp velocity
            this._character.getPhysicsImpostor().registerBeforePhysicsStep(impostor =>{
                impostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                impostor.setLinearVelocity(
                    new BABYLON.Vector3(
                        BABYLON.Scalar.Clamp(impostor.getLinearVelocity().x,-this.MAX_VELOCITY,this.MAX_VELOCITY),
                        BABYLON.Scalar.Clamp(impostor.getLinearVelocity().y,-this.TERMINAL_VELOCITY,this.TERMINAL_VELOCITY),
                        BABYLON.Scalar.Clamp(impostor.getLinearVelocity().z,-this.MAX_VELOCITY,this.MAX_VELOCITY)
                ));
            });
            
            //setup collisions box decor
            var firstCollider = this.scene.getMeshByName("collide");
            var collidersChild = firstCollider.getChildMeshes();
            this._colliders=[...collidersChild,firstCollider];
            this._colliders.forEach(collider => {
                collider.physicsImpostor = new BABYLON.PhysicsImpostor(collider, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    friction:1.0
                });
                collider.isVisible = false;
            });
        }
        
        // Create actions
        public setupActions () : void {
            var strentghVector = new BABYLON.Vector3(-this.SPEED,0,0);
            const rotateAnimation = new Animation('rotation','alpha',25,Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_RELATIVE);

            this.scene.onKeyboardObservable.add((kbInfo) => {
                if(this.inputUnlocked){
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        switch (kbInfo.event.keyCode) {
                            // up arrow
                            case 38: 
                                this.checkGroundCollision();
                                if(this.collided) {
                                    this._character.applyImpulse(new Vector3(0,this.JUMP_FORCE,0),this._character.position);
                                    this.collided = false;
                                }
                            break;
                            // down arrow 40
                            // left arrow
                            case 37:
                                this._character.physicsImpostor.applyImpulse(strentghVector,this._character.position);
                            break;
                            // right arrow
                            case 39:
                                this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)),this._character.position);
                            break;
                            //spaceBar
                            case 32:
                                this.checkSensorCollision();
                                if(this.activeSensor)
                                {
                                    //ROTATE CAMERA BASED ON THE POSITION OF THE SENSOR
                                    // this.getRotationSignFromSensor(this.activeSensor)*
                                    var rotationAngle =  this.getRotationSignFromSensor(this.activeSensor)*Math.PI/2;
                                    //console.log(rotationAngle);
                                    this.inputUnlocked = false;
                                    rotateAnimation.setKeys([
                                        {frame: 0, value:this._camera.alpha},
                                        {frame: 30, value:this._camera.alpha+rotationAngle},
                                    ]);
                                    this.scene.beginDirectAnimation(this._camera, [rotateAnimation],0,30,false, 1.0,()=>{this.inputUnlocked= true;});
                                    //ROTATE CHARACTER
                                    this._character.rotate(new BABYLON.Vector3(0,1,0),Math.PI/2,BABYLON.Space.LOCAL);
                                    //ROTATE DIRECTIONAL VECTOR
                                    strentghVector = BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
                                    this.activeSensor = null;
                                }
                            break;
                        }
                    break;
                }
               } 
            });
        
        }
        //return a rad angle based on
        private getRotationSignFromSensor(sensor:AbstractMesh) :int
        {
            const x =sensor.position.x;
            const z = sensor.position.z;
            const alpha = this._camera.alpha%(2*Math.PI);
            //console.log(x, z, alpha);
            console.log(x,z,alpha);
            if(alpha==0 || alpha==-Math.PI)
            {
                if(x < 0 && z < 0 ) return -1;//A
                if(x < 0 && z > 0 ) return +1;//A
            }
            if(alpha == Math.PI/2)
            {
                if(x > 0 && z < 0 ) return +1;//B
                if(x > 0 && z > 0 ) return -1;//C
            }
            if(alpha ==Math.PI)
            {
                if(x > 0 && z > 0 ) return +1;//C
                if(x < 0 && z > 0 ) return -1;//D
            }
            if(alpha == 3*Math.PI/2)
            {
                if(x < 0 && z > 0 ) return +1;//D
                if(x < 0 && z < 0 ) return -1;//A
            }
            return 1;
        }
    }
}
