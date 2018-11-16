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
            this._camera = new BABYLON.ArcRotateCamera("ArcCamera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
            this._camera.setTarget(BABYLON.Vector3.Zero());
            this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;
            // this._camera.keysUp = [90]; // Z
            // this._camera.keysDown = [83]; // S
            // this._camera.keysLeft = [81] // Q
            // this._camera.keysRight = [68]; // D
            //setup character
            // this._character = BABYLON.Mesh.CreateBox("box", 5.0, this.scene);
            // this._character.position.set(2,2,2);
            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), scene);
        };
        // Create collisions
        Main.prototype.setupCollisions = function () {
        };
        // Setup physics
        Main.prototype.setupPhysics = function () {
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=main.js.map