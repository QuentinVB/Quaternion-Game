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
            this.sensorActive = null;
            this.MAX_VELOCITY = 1.5;
            this.TERMINAL_VELOCITY = 20;
            this.JUMP_FORCE = 4;
            this.SPEED = 3;
            this.inputUnlocked = true;
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
                        _this.sensorActive = sensor;
                        //console.log(this.sensorActive.position);
                    }
                });
                //CALL ONLY ON JUMP; BAKA !
                if (_this.sensorActive != null && !_this._character.intersectsMesh(_this.sensorActive, true)) {
                    _this.sensorActive = null;
                }
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
                restitution: 0.2,
                friction: 1.0
            });
            //lock rotation and clamp velocity
            this._character.getPhysicsImpostor().registerBeforePhysicsStep(function (impostor) {
                impostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                impostor.setLinearVelocity(new BABYLON.Vector3(BABYLON.Scalar.Clamp(impostor.getLinearVelocity().x, -_this.MAX_VELOCITY, _this.MAX_VELOCITY), BABYLON.Scalar.Clamp(impostor.getLinearVelocity().y, -_this.TERMINAL_VELOCITY, _this.TERMINAL_VELOCITY), BABYLON.Scalar.Clamp(impostor.getLinearVelocity().z, -_this.MAX_VELOCITY, _this.MAX_VELOCITY)));
            });
            //setup collisions box decor
            var firstCollider = this.scene.getMeshByName("collide");
            var collidersChild = firstCollider.getChildMeshes();
            this._colliders = collidersChild.concat([firstCollider]);
            this._colliders.forEach(function (collider) {
                collider.physicsImpostor = new BABYLON.PhysicsImpostor(collider, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    friction: 1.0
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
            //this._character.moveWithCollisions()
            var strentghVector = new BABYLON.Vector3(-this.SPEED, 0, 0);
            var rotateAnimation = new BABYLON.Animation('rotation', 'alpha', 25, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
            this.scene.onKeyboardObservable.add(function (kbInfo) {
                if (_this.inputUnlocked) {
                    switch (kbInfo.type) {
                        case BABYLON.KeyboardEventTypes.KEYDOWN:
                            switch (kbInfo.event.keyCode) {
                                // up arrow
                                case 38:
                                    //console.log(this.groundCollide);
                                    if (_this.groundCollide) {
                                        _this._character.applyImpulse(new BABYLON.Vector3(0, _this.JUMP_FORCE, 0), _this._character.position);
                                        _this.groundCollide = false;
                                    }
                                    break;
                                // down arrow
                                case 40:
                                    //this._character.position.y -= 0.1;
                                    break;
                                // left arrow
                                case 37:
                                    _this._character.physicsImpostor.applyImpulse(strentghVector, _this._character.position);
                                    break;
                                // right arrow
                                case 39:
                                    _this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)), _this._character.position);
                                    break;
                                //DEBBUG 
                                case 32:
                                    if (_this.sensorActive) {
                                        // this.getRotationSignFromSensor()*
                                        var rotationAngle = -Math.PI / 2;
                                        console.log(rotationAngle);
                                        _this.inputUnlocked = false;
                                        rotateAnimation.setKeys([
                                            { frame: 0, value: _this._camera.alpha },
                                            { frame: 30, value: _this._camera.alpha + rotationAngle },
                                        ]);
                                        _this.scene.beginDirectAnimation(_this._camera, [rotateAnimation], 0, 30, false, 1.0, function () { _this.inputUnlocked = true; });
                                        _this._character.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2, BABYLON.Space.LOCAL);
                                        strentghVector = BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
                                    }
                                    //this.sensorActive=null;
                                    break;
                            }
                            break;
                    }
                }
            });
        };
        //return a rad angle based on
        Main.prototype.getRotationSignFromSensor = function () {
            var x = this.sensorActive.position.x;
            var z = this.sensorActive.position.z;
            var alpha = this._camera.alpha;
            console.log(x, z, alpha);
            //1
            if (alpha == 0) {
                if (x > 0 && z < 0)
                    return -1; //D
                if (x > 0 && z > 0)
                    return +1; //A
            }
            //2
            if (alpha == Math.PI / 2) {
                console.log("ping");
                if (x > 0 && z > 0)
                    return -1; //A
                if (x < 0 && z > 0)
                    return +1; //B
            }
            //3
            if (alpha == Math.PI) {
                if (x < 0 && z > 0)
                    return -1; //B
                if (x < 0 && z < 0)
                    return +1; //C
            }
            //4
            if (alpha == -Math.PI / 2) {
                if (x < 0 && z < 0)
                    return -1; //C
                if (x > 0 && z < 0)
                    return +1; //D
            }
            //return 1;
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=main.js.map