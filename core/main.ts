module BABYLON {
    export class Main {
        // Public members
        public scene: Scene;

        private _camera: ArcRotateCamera = null;
        private _character: Mesh = null;

        // Constructor
        constructor (scene: Scene) {
            this.scene = scene;
        }
        // Create camera
        public createMeshes() : void {
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

        }
        // Create collisions
        public setupCollisions () : void {

        }

        // Setup physics
        public setupPhysics () :void {
            
        }
    }
}
