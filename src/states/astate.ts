///<reference path='../../libs/babylon.d.ts'/>

import Main from "../main";

export default abstract class AbstractState{
    protected context:Main;
    
    constructor(context)
    {
        this.context = context;
    }
    public abstract Update():void;
    public abstract Trigger(env):void;
    protected Next(newState:AbstractState):void{
        this.context.level.gameState = newState;
    }
}