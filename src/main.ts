///<reference path='../libs/babylon.d.ts'/>
import Level from 'level'

export default class Main {
    //public
    public level: Level;
    public engine: BABYLON.Engine;
    public inputUnlocked = true;

    // private members
    private fadeLevel = 1.0;
    private postProcess:BABYLON.PostProcess;
    

    //const
    public readonly MAX_VELOCITY =1.5;
    public readonly TERMINAL_VELOCITY = 20;
    public readonly JUMP_FORCE = 4;
    public readonly SPEED = 3;
    public readonly STARTSTATE = {
        camera:[3*Math.PI/2, 0,10],
        strength:[-this.SPEED,0,0]
    }
    
    
    
    // Constructor
    constructor () {
        this.engine = new BABYLON.Engine(<HTMLCanvasElement> document.getElementById('renderCanvas'));
        //TODO : load a scene with common elements such as sounds
        this.level = new Level("level0",this);
        //this.loadLevel();
    }
    /**
     * Runs the engine to render the level into the canvas
     */
    public run () {
        //this.updatePostProcess();
        this.engine.runRenderLoop(() => {
            if(this.level!=undefined && this.level.scene!= undefined )this.level.scene.render();
        });
    }
    public loadLevel(levelname) //MUST BE ASYNC !
    {
        if(this.level) this.level.scene.dispose();
        this.level = new Level(levelname,this);
        //this.updatePostProcess();
    }
    private updatePostProcess() :void
    {
        BABYLON.Effect.ShadersStore["fadePixelShader"] =
        "precision highp float;" +
        "varying vec2 vUV;" +
        "uniform sampler2D textureSampler; " +
        "uniform float fadeLevel; " +
        "void main(void){" +
        "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
        "baseColor.a = 1.0;" +
        "gl_FragColor = baseColor;" +
        "}";
        this.postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this.level._camera);
        this.postProcess.onApply = (effect) => {
            effect.setFloat("fadeLevel", this.fadeLevel);
        };
    }
}