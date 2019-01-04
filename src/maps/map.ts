///<reference path='../../libs/babylon.d.ts'/>

import Main from "../main";
import { AbstractMesh, Mesh } from "babylonjs";
import Helpers from "../helpers";

export default abstract class Map{
    protected context:Main;
    protected triggers:[];
    protected doors:AbstractMesh[]
    protected elevators:AbstractMesh[]
    constructor(context:Main)
    {
        this.context=context;
        this.elevators=Helpers.ItemPlacer(this.context.level.scene,"elevator",(scene,elevator)=>{
            console.log(elevator);
            //scene.beginDirectAnimation(elevator, [elevator.animations[1]],0, 120, true);
        });
        this.doors=Helpers.ItemPlacer(this.context.level.scene,"door");
    }
    public abstract Trigger(triggerName:String):void;
}