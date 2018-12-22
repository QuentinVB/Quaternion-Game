///<reference path='../../libs/babylon.d.ts'/>
import AbstractState from './astate'

export default class StateWin extends AbstractState{
    private fadeClock = 0;
    
    constructor(context)
    {
        super(context);
        
    }

    public Update():void
    {
        if(this.fadeClock==0)
        {
            this.context.inputUnlocked = false;
            this.context.level.scene.getSoundByName("Win").play();
            this.fadeClock++;
        }

        if(this.fadeClock>0 && this.context.level.fadeLevel>0) {
            this.context.level.fadeLevel-=(1/this.context.TRANSITIONDURATION*0.1);
            this.context.level.fadeLevel= parseFloat(this.context.level.fadeLevel.toPrecision(3));
            this.fadeClock++;
        }
        console.log( this.context.level.fadeLevel);
        //TODO load next level !
        if(this.fadeClock>= this.context.TRANSITIONDURATION*10) this.context.loadLevel("level1");
        
    }
    public Trigger():void
    {
        this.Update();
    }
}