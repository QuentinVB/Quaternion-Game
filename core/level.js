define(["require", "exports", "helpers", "actors", "tutorial"], function (require, exports, helpers_1, actors_1, tutorial_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Level = /** @class */ (function () {
        function Level(levelname, env) {
            var _this = this;
            this.sounds = [];
            BABYLON.SceneLoader.LoadAsync("../assets/", levelname + ".babylon", env.engine).then(function (scene) {
                _this.scene = scene;
                _this.env = env;
                //TODO Move those into a scene in main
                _this.sounds.push(new BABYLON.Sound("Jump", "../assets/boing.mp3", _this.scene));
                _this.sounds.push(new BABYLON.Sound("Win", "../assets/gong.mp3", _this.scene));
                _this.sounds.push(new BABYLON.Sound("Lose", "../assets/lose.mp3", _this.scene));
                //activate physic
                _this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
                //meshes
                _this.setupMeshes();
                //collisions
                _this.setupCollisions();
                //actions
                _this.setupActions();
                //add tutorial if level0
                if (levelname = "level0")
                    tutorial_1.default(_this.scene);
                helpers_1.default.showAxis(7, _this.scene);
            });
        }
        /*
         * load the meshes from the file and assign the rôles
         */
        Level.prototype.setupMeshes = function () {
            //setup camera
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", this.env.STARTSTATE.camera[0], this.env.STARTSTATE.camera[1], this.env.STARTSTATE.camera[2], this.scene.getMeshByName("collide"), this.scene);
            this.scene.activeCamera = this._camera;
            //setup character
            this._character = actors_1.Character.create(this.env);
            //link character and camera
            this._camera.target = this._character;
            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(5, 5, -5), this.scene);
            //setup ground
            this._ground = actors_1.Ground.create(this.env);
            //skybox
            this._skybox = actors_1.Skybox.create(this.env);
            //initilize the State Machine
            //define an enum !
            //setup Misc decoration
            actors_1.Misc.create(this.env);
        };
        Level.prototype.setupActions = function () {
            var _this = this;
            var _a;
            //define the strength vector
            this.strengthVector = new ((_a = BABYLON.Vector3).bind.apply(_a, [void 0].concat(this.env.STARTSTATE.strength)))();
            //define the camera rotation animation
            var rotateAnimation = new BABYLON.Animation('rotation', 'alpha', 25, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
            //actions from keys
            this.scene.onKeyboardObservable.add(function (kbInfo) {
                if (_this.env.inputUnlocked && kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                    switch (kbInfo.event.keyCode) {
                        // up arrow
                        case 38:
                            if (_this.checkGroundCollision()) {
                                _this._character.applyImpulse(new BABYLON.Vector3(0, _this.env.JUMP_FORCE, 0), _this._character.position);
                                _this.scene.getSoundByName("Jump").play();
                            }
                            break;
                        // left arrow
                        case 37:
                            console.log("left");
                            _this._character.physicsImpostor.applyImpulse(_this.strengthVector, _this._character.position);
                            break;
                        // right arrow
                        case 39:
                            _this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(_this.strengthVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)), _this._character.position);
                            break;
                        //spaceBar
                        case 32:
                            //ROTATE CAMERA BASED ON THE POSITION OF THE character
                            var rotationAngle = helpers_1.default.getRotationSignFromCharaPosition(_this._character, _this._camera) * Math.PI / 2;
                            _this.env.inputUnlocked = false;
                            rotateAnimation.setKeys([
                                { frame: 0, value: _this._camera.alpha },
                                { frame: 30, value: _this._camera.alpha + rotationAngle },
                            ]);
                            _this.scene.beginDirectAnimation(_this._camera, [rotateAnimation], 0, 30, false, 1.0, function () { _this.env.inputUnlocked = true; });
                            //ROTATE CHARACTER
                            _this._character.rotate(new BABYLON.Vector3(0, 1, 0), -rotationAngle, BABYLON.Space.LOCAL);
                            //ROTATE DIRECTIONAL VECTOR
                            _this.strengthVector = BABYLON.Vector3.TransformCoordinates(_this.strengthVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, -rotationAngle));
                            break;
                    }
                }
            });
            //actions from mouse
            this.scene.onPointerDown = function (evt, pickResult) {
                // if the click hits the ground object, we change the impact position
                if (pickResult.hit) {
                    console.log(" x = " + pickResult.pickedPoint.x + " y = " + pickResult.pickedPoint.z);
                }
                //this.env.loadLevel("level1");
            };
        };
        Level.prototype.setupCollisions = function () {
            //setup collisions box from decor
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
        Level.prototype.checkGroundCollision = function () {
            var _this = this;
            var value = false;
            this._colliders.forEach(function (collider) {
                if (_this._character.intersectsMesh(collider, true))
                    value = true;
            });
            return value;
        };
        return Level;
    }());
    exports.default = Level;
});
//# sourceMappingURL=level.js.map