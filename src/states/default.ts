///<reference path='../../libs/babylon.d.ts'/>
import AbstractState from './astate'
import StateLose from './lose';
import StateWin from './win';

export default class StateDefault extends AbstractState{
    private goal;
    constructor(context)
    {
        super(context);
        this.goal =this.context.level.scene.getMeshByName("Goal") 
    }

    public Update():void
    {
        if(this.context.level._character.intersectsMesh(this.context.level._ground,true))
        {
            this.Next(new StateLose(this.context));
        }
        if(this.context.level._character.intersectsMesh(this.goal,true))
        {
            this.Next(new StateWin(this.context));
        }
    }
    public Trigger():void
    {
        //super.parname();
    }
}