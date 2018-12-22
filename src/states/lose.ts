///<reference path='../../libs/babylon.d.ts'/>
import AbstractState from './astate'
import StateDefault from './default';

export default class StateLose extends AbstractState{
    
    constructor(context)
    {
        super(context);
    }

    public Update():void
    {
        this.context.level.scene.getSoundByName("Lose").play();
        this.context.inputUnlocked=false;
        this.context.level._camera.alpha = this.context.STARTSTATE.camera[0];
        this.context.level._camera.beta = this.context.STARTSTATE.camera[1];
        this.context.level._character.position = this.context.level.scene.getMeshByName("start").position; //TODO CHECKPOINT HERE
        this.context.level._character.position.y+=0.2;
        this.context.level._character.rotation.set(0,0,0);
        this.context.level.strengthVector = new BABYLON.Vector3(...this.context.STARTSTATE.strength);
        this.context.inputUnlocked=true;
        this.Next(new StateDefault(this.context));
    }
    public Trigger():void
    {

        //super.parname();
    }
}