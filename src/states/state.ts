///<reference path='../../libs/babylon.d.ts'/>

export default abstract class State{
    private context;
    
    constructor(context)
    {
        this.context = context;
    }

    public abstract Update():void;
}