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
            this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;
            //this._camera.attachControl();
            // this._camera.keysUp = [90]; // Z
            // this._camera.keysDown = [83]; // S
            // this._camera.keysLeft = [81] // Q
            // this._camera.keysRight = [68]; // D
            //setup character
            this._character = BABYLON.Mesh.CreateBox("box", 0.5, this.scene);
            this._character.position.set(1.3, 2, -1.6);
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
                mass: 1
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
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=main.js.map