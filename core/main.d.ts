/// <reference path="../libs/babylon.d.ts" />
import Level from 'level';
export default class Main {
    level: Level;
    engine: BABYLON.Engine;
    inputUnlocked: boolean;
    private fadeLevel;
    private postProcess;
    readonly MAX_VELOCITY: number;
    readonly TERMINAL_VELOCITY: number;
    readonly JUMP_FORCE: number;
    readonly SPEED: number;
    readonly STARTSTATE: {
        camera: number[];
        strength: number[];
    };
    constructor();
    /**
     * Runs the engine to render the level into the canvas
     */
    run(): void;
    loadLevel(levelname: any): void;
    private updatePostProcess;
}
