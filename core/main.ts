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
            var cameraStartPosition:Vector3 = this.scene.activeCamera.position;
            this._camera = new BABYLON.ArcRotateCamera("ArcCamera", -Math.PI/2, Math.PI/2, 10, new BABYLON.Vector3(0, 2, 0), this.scene)
            this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;
            
            //this._camera.attachControl();
            // this._camera.keysUp = [90]; // Z
            // this._camera.keysDown = [83]; // S
            // this._camera.keysLeft = [81] // Q
            // this._camera.keysRight = [68]; // D

            //setup character
            this._character = BABYLON.Mesh.CreateBox("box", 0.5, this.scene);
            this._character.position.set(1.3,2,-1.6);

            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), scene);

        }
        // Create collisions
        public setupCollisions () : void {
            
        }

        // Setup physics
        public setupPhysics () :void {
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());
            this._character.position.y += 0.5;
            this._character.physicsImpostor = new PhysicsImpostor(this._character, PhysicsImpostor.SphereImpostor, {
                mass: 1
            });
            var platforms = this.scene.getMeshByName("platforms");
            //scene.meshes
            platforms.physicsImpostor = new PhysicsImpostor(platforms, PhysicsImpostor.BoxImpostor,
                {
                    mass:0
                });
        }
    }
}
