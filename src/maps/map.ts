///<reference path='../../libs/babylon.d.ts'/>

import Main from "../main";
import { AbstractMesh } from "babylonjs";

export default abstract class Map{
    protected context:Main;
    protected triggers:[];

    constructor(context:Main)
    {
        this.context = context;
        this.loadingGrids();
    }
    public abstract Trigger(triggerName:String):void;
    protected loadingGrids(){
        //setup bascules
        let bascules = this.context.level.scene.meshes.filter((mesh,index,array)=>{
            if(mesh.name.substr(0,7)=="bascule"){ console.log("added"); return mesh; }
        });
        if(bascules.length>0)
        {
            bascules.forEach((bascule)=>{
                bascule.physicsImpostor = new BABYLON.PhysicsImpostor(bascule, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    friction:1.0
                });
                this.context.level.scene.beginDirectAnimation(bascule, [bascule.animations[1]],0, 120, true);
                //bascule.animations
            });

            console.log(bascules);
        }
    }
}