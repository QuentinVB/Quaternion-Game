var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        // Constructor
        function Main(scene) {
            var _this = this;
            this._camera = null;
            this._character = null;
            this._ground = null;
            this._colliders = null;
            this.MAX_VELOCITY = 1.5;
            this.TERMINAL_VELOCITY = 20;
            this.JUMP_FORCE = 4;
            this.SPEED = 3;
            this.STARTSTATE = { camera: [3 * Math.PI / 2, 0, 10], player: [1.3, 2, -1.6], strentgh: [-this.SPEED, 0, 0] };
            this.inputUnlocked = true;
            this.collided = null;
            this.activeSensor = null;
            this.sounds = [];
            this.fadeLevel = 1.0;
            this.gameState = "";
            this.engine = new BABYLON.Engine(document.getElementById('renderCanvas'));
            BABYLON.SceneLoader.LoadAsync("../assets/", "level0.babylon", this.engine).then(function (scene) {
                _this.scene = scene;
                _this.createMeshes();
                _this.setupPhysics();
                _this.setupCollisions();
                _this.setupActions();
                _this.setupPostProcess();
                _this.sounds.push(new BABYLON.Sound("Jump", "../assets/boing.mp3", _this.scene));
                _this.sounds.push(new BABYLON.Sound("Win", "../assets/gong.mp3", _this.scene));
                _this.sounds.push(new BABYLON.Sound("Lose", "../assets/lose.mp3", _this.scene));
                _this.showAxis(7, _this.scene);
            });
        }
        /**
         * Runs the engine to render the scene into the canvas
         */
        Main.prototype.run = function () {
            var _this = this;
            this.engine.runRenderLoop(function () {
                if (_this.scene != undefined)
                    _this.scene.render();
            });
        };
        // Create camera
        Main.prototype.createMeshes = function () {
            var _this = this;
            var _a;
            //setup camera
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", this.STARTSTATE.camera[0], this.STARTSTATE.camera[1], this.STARTSTATE.camera[2], this.scene.getMeshByName("collide"), this.scene);
            //this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;
            //setup character
            this._character = BABYLON.Mesh.CreateBox("character", 0.5, this.scene);
            this._character.position = new ((_a = BABYLON.Vector3).bind.apply(_a, [void 0].concat(this.STARTSTATE.player)))();
            //var noze = BABYLON.Mesh.CreateBox("characterNoze", 0.3, this.scene);
            //noze.position.set(1.1,2.3,-1.6);
            //this._character.addChild(noze);
            var material = new BABYLON.StandardMaterial("material", this.scene);
            material.diffuseColor = new BABYLON.Color3(0.9, 0.2, 0);
            this._character.material = material;
            //link character and camera
            this._camera.target = this._character;
            //setup lights
            var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), this.scene);
            //setup ground
            var pillarsize = this.scene.getMeshByName("levelPillar").getBoundingInfo().boundingBox.vectorsWorld;
            this._ground = BABYLON.Mesh.CreateGround('ground', 512, 512, 32, this.scene);
            this._ground.position.set(0, -Number(pillarsize[1].y - (pillarsize[0].y)), 0);
            this._ground.isVisible = false;
            //Setup clouds and floating islands
            var miscContainer;
            var plateformSize = this.scene.getMeshByName("platforms").getBoundingInfo().boundingBox.vectorsWorld;
            var plateformMaxWidth = Math.max(Number(plateformSize[1].x - (plateformSize[0].x)), Number(plateformSize[1].y - (plateformSize[0].y)));
            BABYLON.SceneLoader.LoadAssetContainer("../assets/", "misc.babylon", this.scene, function (container) {
                miscContainer = container;
                var startValue = -plateformMaxWidth;
                for (var i = 0; i < 9; i++) {
                    if (Math.random() > 0.5) {
                        var position = new BABYLON.Vector3(BABYLON.Scalar.RandomRange(-10, 10), BABYLON.Scalar.RandomRange(0, 2), BABYLON.Scalar.RandomRange(-10, 10));
                        var miscMesh = miscContainer.meshes[Math.round(Math.random() * (miscContainer.meshes.length - 1))];
                        console.log(miscMesh);
                        miscMesh.position = position;
                        _this.scene.addMesh(miscMesh);
                    }
                }
            });
            // miscMeshes = meshes.filter((value)=>{value.name == "cloud"});
        };
        // Create collisions
        Main.prototype.setupCollisions = function () {
            var _this = this;
            var fadeClock = -1;
            this.scene.registerBeforeRender(function () {
                var _a, _b;
                if (fadeClock > -1 && _this.fadeLevel > 0) {
                    _this.fadeLevel -= 0.01;
                    fadeClock++;
                }
                if (_this._character.intersectsMesh(_this.scene.getMeshByName("Goal"), true)) {
                    if (_this.gameState != "await")
                        _this.gameState = "win";
                }
                if (_this._character.intersectsMesh(_this._ground, true)) {
                    if (_this.gameState != "await")
                        _this.gameState = "lose";
                }
                if (_this.gameState) {
                    switch (_this.gameState) {
                        case "win":
                            _this.inputUnlocked = false;
                            fadeClock++;
                            _this.scene.getSoundByName("Win").play();
                            _this.gameState = "await";
                            break;
                        case "lose":
                            _this.scene.getSoundByName("Lose").play();
                            _this.gameState = "await";
                            _this._camera.alpha = _this.STARTSTATE.camera[0];
                            _this._camera.beta = _this.STARTSTATE.camera[1];
                            _this._character.position = new ((_a = BABYLON.Vector3).bind.apply(_a, [void 0].concat(_this.STARTSTATE.player)))();
                            _this._character.position.y += 0.2;
                            _this._character.rotation.set(0, 0, 0);
                            _this.strentghVector = new ((_b = BABYLON.Vector3).bind.apply(_b, [void 0].concat(_this.STARTSTATE.strentgh)))();
                            _this.gameState = "";
                            break;
                        default:
                            break;
                    }
                }
            });
            /*
            this.scene.onPointerDown = function (evt, pickResult) {
            // if the click hits the ground object, we change the impact position
            if (pickResult.hit) {
                console.log(" x = "+pickResult.pickedPoint.x+" y = "+pickResult.pickedPoint.z);
            }*/
            this.scene.getMeshByName("sensorParent").getChildMeshes().forEach(function (sensor) {
                sensor.isVisible = false;
            });
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
            //setup ground physic
            this._ground.physicsImpostor = new BABYLON.PhysicsImpostor(this._ground, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0
            });
        };
        // Create actions
        Main.prototype.setupActions = function () {
            var _this = this;
            var _a;
            this.strentghVector = new ((_a = BABYLON.Vector3).bind.apply(_a, [void 0].concat(this.STARTSTATE.strentgh)))();
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
                                        _this.scene.getSoundByName("Jump").play();
                                        _this.collided = false;
                                    }
                                    break;
                                // down arrow 40
                                // left arrow
                                case 37:
                                    _this._character.physicsImpostor.applyImpulse(_this.strentghVector, _this._character.position);
                                    break;
                                // right arrow
                                case 39:
                                    _this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(_this.strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)), _this._character.position);
                                    break;
                                //spaceBar
                                case 32:
                                    _this.checkSensorCollision();
                                    if (_this.activeSensor) {
                                        //ROTATE CAMERA BASED ON THE POSITION OF THE SENSOR
                                        // this.getRotationSignFromSensor(this.activeSensor)*
                                        var rotationAngle = _this.getRotationSignFromSensor(_this.activeSensor) * Math.PI / 2;
                                        _this.inputUnlocked = false;
                                        rotateAnimation.setKeys([
                                            { frame: 0, value: _this._camera.alpha },
                                            { frame: 30, value: _this._camera.alpha + rotationAngle },
                                        ]);
                                        _this.scene.beginDirectAnimation(_this._camera, [rotateAnimation], 0, 30, false, 1.0, function () { _this.inputUnlocked = true; });
                                        //ROTATE CHARACTER
                                        _this._character.rotate(new BABYLON.Vector3(0, 1, 0), -rotationAngle, BABYLON.Space.LOCAL);
                                        //ROTATE DIRECTIONAL VECTOR
                                        _this.strentghVector = BABYLON.Vector3.TransformCoordinates(_this.strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, -rotationAngle));
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
            var alpha = Math.abs(this._camera.alpha % (2 * Math.PI) < 0 ? this._camera.alpha % (2 * Math.PI) + 2 * Math.PI : this._camera.alpha % (2 * Math.PI));
            if (alpha == 0 || alpha == 2 * Math.PI) {
                if (x > 0 && z < 0)
                    return -1; //A
                if (x > 0 && z > 0)
                    return +1; //B
            }
            if (alpha == Math.PI / 2) {
                if (x > 0 && z > 0)
                    return -1; //B
                if (x < 0 && z > 0)
                    return +1; //C
            }
            if (alpha == Math.PI || alpha == -Math.PI) {
                if (x < 0 && z > 0)
                    return -1; //C
                if (x < 0 && z < 0)
                    return +1; //D
            }
            if (alpha == 3 * Math.PI / 2 || alpha == -Math.PI / 2) {
                if (x < 0 && z < 0)
                    return -1; //D
                if (x > 0 && z < 0)
                    return +1; //A
            }
            return 1;
        };
        Main.prototype.setupPostProcess = function () {
            var _this = this;
            BABYLON.Effect.ShadersStore["fadePixelShader"] =
                "precision highp float;" +
                    "varying vec2 vUV;" +
                    "uniform sampler2D textureSampler; " +
                    "uniform float fadeLevel; " +
                    "void main(void){" +
                    "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
                    "baseColor.a = 1.0;" +
                    "gl_FragColor = baseColor;" +
                    "}";
            var postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._camera);
            postProcess.onApply = function (effect) {
                effect.setFloat("fadeLevel", _this.fadeLevel);
            };
        };
        Main.prototype.showAxis = function (size, scene) {
            var axisX = BABYLON.Mesh.CreateLines("axisX", [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
                new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ], scene);
            axisX.color = new BABYLON.Color3(1, 0, 0);
            var axisY = BABYLON.Mesh.CreateLines("axisY", [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
            ], scene);
            axisY.color = new BABYLON.Color3(0, 1, 0);
            var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
                new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
            ], scene);
            axisZ.color = new BABYLON.Color3(0, 0, 1);
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=core.js.map