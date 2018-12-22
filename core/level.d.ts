/// <reference path="../libs/babylon.d.ts" />
import Main from './main';
export default class Level {
    scene: BABYLON.Scene;
    _camera: BABYLON.ArcFollowCamera;
    _character: BABYLON.Mesh;
    _ground: BABYLON.Mesh;
    _colliders: BABYLON.AbstractMesh[];
    _skybox: BABYLON.Mesh;
    env: Main;
    private strengthVector;
    private sounds;
    constructor(levelname: String, env: Main);
    private setupMeshes;
    private setupActions;
    private setupCollisions;
    private checkGroundCollision;
}
