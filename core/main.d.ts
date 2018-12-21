/// <reference path="../libs/babylon.d.ts" />
import Level from 'level';
export default class Main {
    level: Level;
    private engine;
    private fadeLevel;
    private postProcess;
    private inputUnlocked;
    private readonly MAX_VELOCITY;
    private readonly TERMINAL_VELOCITY;
    private readonly JUMP_FORCE;
    private readonly SPEED;
    private readonly STARTSTATE;
    constructor();
    /**
     * Runs the engine to render the level into the canvas
     */
    run(): void;
    loadLevel(levelname: any): void;
    private updatePostProcess;
}
