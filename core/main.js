var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        // Constructor
        function Main(scene) {
            this._camera = null;
            this._character = null;
            this._colliders = null;
            this.MAX_VELOCITY = 1.5;
            this.TERMINAL_VELOCITY = 20;
            this.JUMP_FORCE = 4;
            this.SPEED = 3;
            this.inputUnlocked = true;
            this.collided = null;
            this.activeSensor = null;
            this.scene = scene;
        }
        // Create camera
        Main.prototype.createMeshes = function () {
            //setup camera
            var cameraStartPosition = this.scene.activeCamera.position;
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", -Math.PI / 2, 0, 10, this.scene.getMeshByName("collide"), this.scene);
            //this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;
            //setup character
            this._character = BABYLON.Mesh.CreateBox("character", 0.5, this.scene);
            this._character.position.set(1.3, 2, -1.6);
            var material = new BABYLON.StandardMaterial("material", this.scene);
            material.diffuseColor = new BABYLON.Color3(0.9, 0.2, 0);
            this._character.material = material;
            //link character and camera
            this._camera.target = this._character;
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
        };
        // Create collisions
        Main.prototype.setupCollisions = function () {
            //this.scene.registerBeforeRender(()=>{});
        };
        Main.prototype.checkGroundCollision = function () {
            var _this = this;
            this._colliders.forEach(function (collider) {
                if (_this._character.intersectsMesh(collider, true)) {
                    _this.collided = true;
                    return true; // NO OUTPUT §!%$* !!!
                }
            });
            return false;
        };
        Main.prototype.checkSensorCollision = function () {
            var _this = this;
            this.scene.getMeshByName("sensorParent").getChildMeshes().forEach(function (sensor) {
                if (_this._character.intersectsMesh(sensor, true)) {
                    _this.activeSensor = sensor;
                }
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
            });
        };
        // Create actions
        Main.prototype.setupActions = function () {
            var _this = this;
            var strentghVector = new BABYLON.Vector3(-this.SPEED, 0, 0);
            var rotateAnimation = new BABYLON.Animation('rotation', 'alpha', 25, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
            this.scene.onKeyboardObservable.add(function (kbInfo) {
                if (_this.inputUnlocked) {
                    switch (kbInfo.type) {
                        case BABYLON.KeyboardEventTypes.KEYDOWN:
                            switch (kbInfo.event.keyCode) {
                                // up arrow
                                case 38:
                                    _this.checkGroundCollision();
                                    if (_this.collided) {
                                        _this._character.applyImpulse(new BABYLON.Vector3(0, _this.JUMP_FORCE, 0), _this._character.position);
                                        _this.collided = false;
                                    }
                                    break;
                                // down arrow 40
                                // left arrow
                                case 37:
                                    _this._character.physicsImpostor.applyImpulse(strentghVector, _this._character.position);
                                    break;
                                // right arrow
                                case 39:
                                    _this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)), _this._character.position);
                                    break;
                                //spaceBar
                                case 32:
                                    _this.checkSensorCollision();
                                    if (_this.activeSensor) {
                                        //ROTATE CAMERA BASED ON THE POSITION OF THE SENSOR
                                        // this.getRotationSignFromSensor(this.activeSensor)*
                                        var rotationAngle = _this.getRotationSignFromSensor(_this.activeSensor) * Math.PI / 2;
                                        //console.log(rotationAngle);
                                        _this.inputUnlocked = false;
                                        rotateAnimation.setKeys([
                                            { frame: 0, value: _this._camera.alpha },
                                            { frame: 30, value: _this._camera.alpha + rotationAngle },
                                        ]);
                                        _this.scene.beginDirectAnimation(_this._camera, [rotateAnimation], 0, 30, false, 1.0, function () { _this.inputUnlocked = true; });
                                        //ROTATE CHARACTER
                                        _this._character.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2, BABYLON.Space.LOCAL);
                                        //ROTATE DIRECTIONAL VECTOR
                                        strentghVector = BABYLON.Vector3.TransformCoordinates(strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
                                        _this.activeSensor = null;
                                    }
                                    break;
                            }
                            break;
                    }
                }
            });
        };
        //return a rad angle based on
        Main.prototype.getRotationSignFromSensor = function (sensor) {
            var x = sensor.position.x;
            var z = sensor.position.z;
            var alpha = this._camera.alpha % (2 * Math.PI);
            //console.log(x, z, alpha);
            console.log(x, z, alpha);
            if (alpha == 0 || alpha == -Math.PI) {
                if (x < 0 && z < 0)
                    return -1; //A
                if (x < 0 && z > 0)
                    return +1; //A
            }
            if (alpha == Math.PI / 2) {
                if (x > 0 && z < 0)
                    return +1; //B
                if (x > 0 && z > 0)
                    return -1; //C
            }
            if (alpha == Math.PI) {
                if (x > 0 && z > 0)
                    return +1; //C
                if (x < 0 && z > 0)
                    return -1; //D
            }
            if (alpha == 3 * Math.PI / 2) {
                if (x < 0 && z > 0)
                    return +1; //D
                if (x < 0 && z < 0)
                    return -1; //A
            }
            return 1;
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=main.js.map