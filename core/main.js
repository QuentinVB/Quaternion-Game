var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        // Constructor
        function Main(scene) {
            this._camera = null;
            this._character = null;
            this.scene = scene;
        }
        // Create camera
        Main.prototype.createMeshes = function () {
            //setup camera
            var cameraStartPosition = this.scene.activeCamera.position;
            this._camera = new BABYLON.ArcRotateCamera("ArcCamera", -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 2, 0), this.scene);
            //this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            //this._camera.lowerBetaLimit = (Math.PI / 2) * 0.99;
            //this._camera.upperBetaLimit = (Math.PI / 2) * 0.99;
            this.scene.activeCamera = this._camera;
            //setup character
            this._character = BABYLON.Mesh.CreateBox("box", 0.5, this.scene);
            this._character.position.set(1.3, 2, -1.6);
            var material = new BABYLON.StandardMaterial("material", this.scene);
            material.diffuseColor = new BABYLON.Color3(0.9, 0.2, 0);
            this._character.material = material;
            //link character and camera
            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), scene);
        };
        // Create collisions
        Main.prototype.setupCollisions = function () {
        };
        // Setup physics
        Main.prototype.setupPhysics = function () {
            //character
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
            this._character.position.y += 0.5;
            this._character.physicsImpostor = new BABYLON.PhysicsImpostor(this._character, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution: 0.2
            });
            //env
            var firstCollider = this.scene.getMeshByName("collide");
            var collidersChild = firstCollider.getChildMeshes();
            var colliders = collidersChild.concat([firstCollider]);
            colliders.forEach(function (collider) {
                collider.physicsImpostor = new BABYLON.PhysicsImpostor(collider, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0
                });
                collider.isVisible = false;
            });
            /*rootCollider.physicsImpostor = new BABYLON.PhysicsImpostor(platforms, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0
            });*/
            //scene.meshes
            /*platforms.physicsImpostor = new BABYLON.PhysicsImpostor(platforms, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0
            });*/
        };
        // Create actions
        Main.prototype.setupActions = function () {
            var _this = this;
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
            this.scene.onKeyboardObservable.add(function (kbInfo) {
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        //var x = 0;
                        //var y = 0;
                        switch (kbInfo.event.keyCode) {
                            // up arrow
                            case 38:
                                _this._character.applyImpulse(new BABYLON.Vector3(0, 3, 0), _this._character.position);
                                break;
                            // down arrow
                            case 40:
                                //this._character.position.y -= 0.1;
                                break;
                            // left arrow
                            case 37:
                                _this._character.position.x -= 0.1;
                                break;
                            // right arrow
                            case 39:
                                _this._character.position.x += 0.1;
                                break;
                        }
                        break;
                }
            });
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=main.js.map