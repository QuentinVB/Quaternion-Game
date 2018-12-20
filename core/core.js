///<reference path='../libs/babylon.d.ts'/>
//import Helpers from './helpers';
var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        // Constructor
        function Main(scene) {
            var _this = this;
            //private
            this._camera = null;
            this._character = null;
            this._ground = null;
            //const
            this.MAX_VELOCITY = 1.5;
            this.TERMINAL_VELOCITY = 20;
            this.JUMP_FORCE = 4;
            this.SPEED = 3;
            this.STARTSTATE = {
                camera: [3 * Math.PI / 2, 0, 10],
                player: [1.3, 2, -1.6],
                strentgh: [-this.SPEED, 0, 0]
            };
            this.engine = new BABYLON.Engine(document.getElementById('renderCanvas'));
            BABYLON.SceneLoader.LoadAsync("../assets/", "level0.babylon", this.engine).then(function (scene) {
                _this.scene = scene;
                _this.createMeshes();
                _this.setupPhysics();
                _this.setupActions();
                // Helpers.showAxis(7,this.scene);
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
            var _a;
            //setup camera
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", this.STARTSTATE.camera[0], this.STARTSTATE.camera[1], this.STARTSTATE.camera[2], this.scene.getMeshByName("collide"), this.scene);
            this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;
            //setup character
            this._character = BABYLON.Mesh.CreateBox("character", 0.5, this.scene);
            this._character.position = new ((_a = BABYLON.Vector3).bind.apply(_a, [void 0].concat(this.STARTSTATE.player)))();
            var material = new BABYLON.StandardMaterial("material", this.scene);
            material.diffuseColor = new BABYLON.Color3(0.9, 0.2, 0);
            this._character.material = material;
            //link character and camera
            this._camera.target = this._character;
            //setup lights
            var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), this.scene);
            //setup ground
            this._ground = BABYLON.Mesh.CreateGround('ground', 512, 512, 32, this.scene);
            this._ground.position.set(0, -1, 0);
            //skybox
            var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../assets/skybox/day", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
        };
        // Setup physics
        Main.prototype.setupPhysics = function () {
            //character
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
            this._character.position.y += 0.5;
            this._character.physicsImpostor = new BABYLON.PhysicsImpostor(this._character, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution: 0.2,
                friction: 1.0
            });
            //setup ground physic
            this._ground.physicsImpostor = new BABYLON.PhysicsImpostor(this._ground, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0,
                restitution: 0,
                friction: 1.0
            });
        };
        // Create actions
        Main.prototype.setupActions = function () {
            var _this = this;
            this.scene.onKeyboardObservable.add(function (kbInfo) {
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        switch (kbInfo.event.keyCode) {
                            //spaceBar
                            case 32:
                                _this._character.translate(new BABYLON.Vector3(1, 0, 0), 3);
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
//# sourceMappingURL=core.js.map