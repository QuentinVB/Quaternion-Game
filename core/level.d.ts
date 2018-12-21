/// <reference path="../libs/babylon.d.ts" />
export default class Level {
    scene: BABYLON.Scene;
    _camera: BABYLON.ArcFollowCamera;
    _character: BABYLON.Mesh;
    _ground: BABYLON.Mesh;
    private _colliders;
    _skybox: BABYLON.Mesh;
    private env;
    private strengthVector;
    private sounds;
    constructor(levelname: String, env: any);
    private setupMeshes;
    private setupActions;
    private setupCollisions;
    private checkGroundCollision;
}
