var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        // Constructor
        function Main(scene) {
            this._camera = null;
            this._character = null;
            this._sensors = null;
            this._colliders = null;
            this.groundCollide = true;
            this.sensorCollide = false;
            this.MAX_SPEED = 1.5;
            this.TERMINAL_VELOCITY = 20;
            this.scene = scene;
        }
        // Create camera
        Main.prototype.createMeshes = function () {
            //setup camera
            var cameraStartPosition = this.scene.activeCamera.position;
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", Math.PI / 2, -Math.PI, 10, this.scene.getMeshByName("collide"), this.scene);
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
            this._camera.target = this._character;
            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), scene);
        };
        // Create collisions
        Main.prototype.setupCollisions = function () {
            var _this = this;
            this._sensors = this.scene.getMeshByName("sensorParent").getChildMeshes();
            //register 
            this.scene.registerBeforeRender(function () {
                _this._sensors.forEach(function (sensor) {
                    if (_this._character.intersectsMesh(sensor, true)) {
                        _this.sensorCollide = true;
                    }
                });
                _this._colliders.forEach(function (collider) {
                    if (_this._character.intersectsMesh(collider, true)) {
                        _this.groundCollide = true;
                    }
                });
            });
        };
        // Setup physics
        Main.prototype.setupPhysics = function () {
            var _this = this;
            //character
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
            this._character.position.y += 0.5;
            this._character.physicsImpostor = new BABYLON.PhysicsImpostor(this._character, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution: 0.2
            });
            this._character.getPhysicsImpostor().registerBeforePhysicsStep(function (impostor) {
                impostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                //impostor.setLinearVelocity();
                var x = impostor.getLinearVelocity().x;
                var y = impostor.getLinearVelocity().y;
                var z = impostor.getLinearVelocity().z;
                if (Math.abs(x) > _this.MAX_SPEED)
                    x = x > 0 ? _this.MAX_SPEED : -_this.MAX_SPEED;
                if (Math.abs(y) > _this.TERMINAL_VELOCITY)
                    y = y > 0 ? _this.TERMINAL_VELOCITY : -_this.TERMINAL_VELOCITY;
                if (Math.abs(z) > _this.MAX_SPEED)
                    z = z > 0 ? _this.MAX_SPEED : -_this.MAX_SPEED;
                impostor.setLinearVelocity(new BABYLON.Vector3(x, y, z));
                //console.log(impostor.getLinearVelocity());
            });
            //env
            var firstCollider = this.scene.getMeshByName("collide");
            var collidersChild = firstCollider.getChildMeshes();
            this._colliders = collidersChild.concat([firstCollider]);
            this._colliders.forEach(function (collider) {
                collider.physicsImpostor = new BABYLON.PhysicsImpostor(collider, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0
                });
                collider.isVisible = false;
                /*collider.physicsImpostor.registerOnPhysicsCollide(this._character.physicsImpostor, function(main, collided) {
                    this.groundCollide = true;
                });*/
            });
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
                                //this._character.moveWithCollisions()
                                console.log(_this.groundCollide);
                                if (_this.groundCollide) {
                                    _this._character.applyImpulse(new BABYLON.Vector3(0, 5, 0), _this._character.position);
                                    _this.groundCollide = false;
                                }
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
                                var targetVector = new BABYLON.Vector3(-3, 0, 0);
                                targetVector.rotateByQuaternionAroundPointToRef(_this._character.rotationQuaternion, _this._character.position, targetVector);
                                _this._character.physicsImpostor.applyImpulse(targetVector, _this._character.position);
                                break;
                            // right arrow
                            case 39:
                                _this._character.locallyTranslate(new BABYLON.Vector3(0.08, 0, 0));
                                break;
                            //DEBBUG 
                            case 32:
                                if (_this.sensorCollide) {
                                    _this._camera.alpha -= Math.PI / 2;
                                    _this._character.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2, BABYLON.Space.LOCAL);
                                }
                                _this.sensorCollide = false;
                                break;
                            // a
                            case 65:
                                _this._camera.alpha -= Math.PI / 2;
                                _this._character.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2, BABYLON.Space.LOCAL);
                                break;
                            // z
                            case 90:
                                _this._camera.alpha += Math.PI / 2;
                                _this._character.rotate(new BABYLON.Vector3(0, 1, 0), -Math.PI / 2, BABYLON.Space.LOCAL);
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