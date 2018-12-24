///<reference path='../libs/babylon.d.ts'/>
import Level from 'level'

export default class Main {
    //public
    public level: Level;
    public engine: BABYLON.Engine;
    public inputUnlocked = true;
    

    

    //const
    public readonly MAX_VELOCITY =1.5;
    public readonly TERMINAL_VELOCITY = 20;
    public readonly JUMP_FORCE = 6; //default 4
    public readonly SPEED = 3;
    public readonly STARTSTATE = {
        camera:[3*Math.PI/2, 0,10],
        strength:[-this.SPEED,0,0]
    }
    public readonly TRANSITIONDURATION = 7;//sec
    
    public oldLevel: Level;
    
    
    // Constructor
    constructor () {
        this.engine = new BABYLON.Engine(<HTMLCanvasElement> document.getElementById('renderCanvas'));
        //TODO : load a scene with common elements such as sounds, this to play the sound between loading
        this.loadLevel("level0");
    }
    /**
     * Runs the engine to render the level into the canvas
     */
    public run () {
        this.engine.runRenderLoop(() => {
            if(this.level!=undefined && this.level.scene!= undefined )this.level.scene.render();
        });
    }
    public loadLevel(levelname) //MUST BE ASYNC !
    {
        this.engine.stopRenderLoop();
        console.log("renderloopstoped");
        this.level = new Level(levelname,this);
    }
}