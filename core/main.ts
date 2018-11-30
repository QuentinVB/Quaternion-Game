module BABYLON {
    export class Main {
        // Public members
        public scene: Scene;

        private _camera: ArcFollowCamera = null;
        private _character: Mesh = null;
        private _sensors: AbstractMesh[]= null;
        private _colliders: AbstractMesh[]= null;
        private groundCollide:boolean = true;
        private sensorCollide:boolean = false;
        private readonly MAX_SPEED =1.5;
        private readonly TERMINAL_VELOCITY =20;

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
                        this.sensorCollide=true;
                    }
                });
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
                restitution:0.2
            });
            this._character.getPhysicsImpostor().registerBeforePhysicsStep(impostor =>{
                impostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                //impostor.setLinearVelocity();
                var x = impostor.getLinearVelocity().x
                var y = impostor.getLinearVelocity().y
                var z = impostor.getLinearVelocity().z
                if(Math.abs(x) > this.MAX_SPEED) x=x>0?this.MAX_SPEED:-this.MAX_SPEED;
                if(Math.abs(y) > this.TERMINAL_VELOCITY) y=y>0?this.TERMINAL_VELOCITY:-this.TERMINAL_VELOCITY;
                if(Math.abs(z) > this.MAX_SPEED) z=z>0?this.MAX_SPEED:-this.MAX_SPEED;
                impostor.setLinearVelocity(new BABYLON.Vector3(x, y, z));
                //console.log(impostor.getLinearVelocity());
            });
            
            //env
            var firstCollider = this.scene.getMeshByName("collide");
            var collidersChild = firstCollider.getChildMeshes();
            this._colliders=[...collidersChild,firstCollider];
            this._colliders.forEach(collider => {
                collider.physicsImpostor = new BABYLON.PhysicsImpostor(collider, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0
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
            this.scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        //var x = 0;
                        //var y = 0;
                        switch (kbInfo.event.keyCode) {
                            // up arrow
                            case 38:
                            //this._character.moveWithCollisions()
                                console.log(this.groundCollide);
                                if(this.groundCollide) 
                                {this._character.applyImpulse(new Vector3(0,5,0),this._character.position);
                                this.groundCollide =false;}
                            break;
                            // down arrow
                            case 40:
                                //this._character.position.y -= 0.1;
                            break;
                            // left arrow
                            case 37:
                            /*
                                var invertParentWorldMatrix = this._character.getWorldMatrix().clone();
                                invertParentWorldMatrix.invert();
                                var worldPosition = new BABYLON.Vector3(x, y, z);
                                var position = BABYLON.Vector3.TransformCoordinates(worldPosition, invertParentWorldMatrix);*/
                                var targetVector = new BABYLON.Vector3(-3,0,0);
                                targetVector.rotateByQuaternionAroundPointToRef(this._character.rotationQuaternion,this._character.position,targetVector)
                                this._character.physicsImpostor.applyImpulse(targetVector,this._character.position);
                            break;
                            // right arrow
                            case 39:
                                this._character.locallyTranslate(new BABYLON.Vector3(0.08,0,0));
                            break;
                            //DEBBUG 
                            case 32:
                                if(this.sensorCollide)
                                {
                                    this._camera.alpha-=Math.PI/2;
                                    this._character.rotate(new BABYLON.Vector3(0,1,0),Math.PI/2,BABYLON.Space.LOCAL);
                                }
                                this.sensorCollide =false;

                            break;
                            // a
                            case 65:
                                this._camera.alpha-=Math.PI/2;
                                this._character.rotate(new BABYLON.Vector3(0,1,0),Math.PI/2,BABYLON.Space.LOCAL);
                            break;
                            // z
                            case 90:
                                this._camera.alpha+=Math.PI/2;
                                this._character.rotate(new BABYLON.Vector3(0,1,0),-Math.PI/2,BABYLON.Space.LOCAL);
                            break;
                        }
                    break;
                }
            });
        }
    }
}
