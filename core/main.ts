module BABYLON {
    export class Main {
        // Public members
        public scene: Scene;

        private _camera: ArcFollowCamera = null;
        private _character: Mesh = null;
        private _sensors: AbstractMesh[]= null;
        private _colliders: AbstractMesh[]= null;
        private groundCollide:boolean = true;
        private sensorActive: AbstractMesh =null;
        private readonly MAX_VELOCITY =1.5;
        private readonly TERMINAL_VELOCITY = 20;
        private readonly JUMP_FORCE = 4;
        private readonly SPEED = 3;
        private inputUnlocked = true;

        // Constructor
        constructor (scene: Scene) {
            this.scene = scene;
        }
        // Create camera
        public createMeshes() : void {
            //setup camera
            var cameraStartPosition:Vector3 = this.scene.activeCamera.position;
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", Math.PI/2, -Math.PI, 10,this.scene.getMeshByName("collide"), this.scene);
            //this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            //this._camera.lowerBetaLimit = (Math.PI / 2) * 0.99;
            //this._camera.upperBetaLimit = (Math.PI / 2) * 0.99;
            this.scene.activeCamera = this._camera;

            //setup character
            this._character = BABYLON.Mesh.CreateBox("box", 0.5, this.scene);
            this._character.position.set(1.3,2,-1.6);
            var material =  new BABYLON.StandardMaterial("material",this.scene);
            material.diffuseColor = new BABYLON.Color3(0.9,0.2,0);
            this._character.material = material;

            //link character and camera
            this._camera.target=this._character;
            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), scene);

        }

        // Create collisions
        public setupCollisions () : void {
            this._sensors = this.scene.getMeshByName("sensorParent").getChildMeshes();

            //register 
            this.scene.registerBeforeRender(()=>
            {
                this._sensors.forEach(sensor => {
                    if(this._character.intersectsMesh(sensor,true))
                    {
                        this.sensorActive = sensor;
                        //console.log(this.sensorActive.position);
                    }
                });
                //CALL ONLY ON JUMP; BAKA !
                if(this.sensorActive != null && !this._character.intersectsMesh(this.sensorActive,true))
                {
                    this.sensorActive = null;
                }
                this._colliders.forEach(collider => {
                    if(this._character.intersectsMesh(collider,true))
                    {
                        this.groundCollide=true;
                    }
                });
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
                /*collider.physicsImpostor.registerOnPhysicsCollide(this._character.physicsImpostor, function(main, collided) {
                    this.groundCollide = true;
                });*/
            });
        }
        
        // Create actions
        public setupActions () : void {
            /*
            this._character.actionManager = new ActionManager(this.scene);
            this._character.actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: 'r'
                },
                (event) =>{
                    console.log("ping");
                    var direction = new Vector3(1,0,0);
                    this._character.applyImpulse(direction,Vector3.Zero());
                }
            ));*/
            //character
            // var centerOfGravity = this._character.position;
            // centerOfGravity.y += 0.4;
            //this._character.moveWithCollisions()
            var strentghVector = new BABYLON.Vector3(-this.SPEED,0,0);
            const rotateAnimation = new Animation('rotation','alpha',25,Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_RELATIVE);

            this.scene.onKeyboardObservable.add((kbInfo) => {
                if(this.inputUnlocked){
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        switch (kbInfo.event.keyCode) {
                            // up arrow
                            case 38: 
                                //console.log(this.groundCollide);
                                if(this.groundCollide) 
                                {this._character.applyImpulse(new Vector3(0,this.JUMP_FORCE,0),this._character.position);
                                this.groundCollide =false;}
                            break;
                            // down arrow
                            case 40:
                                //this._character.position.y -= 0.1;
                            break;
                            // left arrow
                            case 37:
                                this._character.physicsImpostor.applyImpulse(strentghVector,this._character.position);
                            break;
                            // right arrow
                            case 39:
                                this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)),this._character.position);
                            break;
                            //DEBBUG 
                            case 32:
                                if(this.sensorActive)
                                {
                                    // this.getRotationSignFromSensor()*
                                    var rotationAngle = -Math.PI/2;
                                    console.log(rotationAngle);
                                    this.inputUnlocked = false;
                                    rotateAnimation.setKeys([
                                        {frame: 0, value:this._camera.alpha},
                                        {frame: 30, value:this._camera.alpha+rotationAngle},
                                    ]);
                                    this.scene.beginDirectAnimation(this._camera, [rotateAnimation],0,30,false, 1.0,()=>{this.inputUnlocked= true;});
                                    this._character.rotate(new BABYLON.Vector3(0,1,0),Math.PI/2,BABYLON.Space.LOCAL);
                                    strentghVector = BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
                                }
                                //this.sensorActive=null;
                            break;
                        }
                    break;
                }
               } 
            });
        
        }
        //return a rad angle based on
        private getRotationSignFromSensor() :int
        {
            const x =this.sensorActive.position.x;
            const z = this.sensorActive.position.z;
            const alpha = this._camera.alpha;
            console.log(x, z, alpha);
            //1
            if(alpha==0)
            {
                if(x > 0 && z<0 ) return -1;//D
                if(x > 0 && z>0 ) return +1;//A
            }
            //2
            if(alpha == Math.PI/2)
            {
                console.log("ping");
                if(x > 0 && z > 0 ) return -1;//A
                if(x < 0 && z>0) return +1;//B
            }
            //3
            if(alpha ==Math.PI)
            {
                if(x < 0 && z>0) return -1;//B
                if(x < 0 && z<0 ) return +1//C
            }
            //4
            if(alpha ==-Math.PI/2)
            {
                if(x < 0 && z<0 ) return -1;//C
                if(x > 0 && z<0 ) return +1;//D
            }
            //return 1;
        }
    }
}
