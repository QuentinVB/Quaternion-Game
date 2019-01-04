///<reference path='../../libs/babylon.d.ts'/>

import Map from "./map";

export default class Map1 extends Map{
    constructor(context)
    {
        super(context);
    }
    public Trigger(triggerName:String){
        console.log(triggerName);
    }
}