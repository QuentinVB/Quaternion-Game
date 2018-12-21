///<reference path='../libs/babylon.d.ts'/>
export default class Helpers{
    public static showAxis(size:number,scene:BABYLON.Scene) {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
    }
    /*
     * return a rad angle based on character position
     */
    public static getRotationSignFromCharaPosition(character,camera)
    {
        const x =character.position.x;
        const z = character.position.z;
        const alpha = Math.abs(camera.alpha%(2*Math.PI)<0 ? camera.alpha%(2*Math.PI) + 2*Math.PI:camera.alpha%(2*Math.PI));
        if(alpha == 0 || alpha==2*Math.PI)
        {
            if(x > 0 && z < 0 ) return -1;//A
            if(x > 0 && z > 0 ) return +1;//B
        }
        if(alpha == Math.PI/2)
        {
            if(x > 0 && z > 0 ) return -1;//B
            if(x < 0 && z > 0 ) return +1;//C
        }
        if(alpha == Math.PI || alpha == -Math.PI)
        {
            if(x < 0 && z > 0 ) return -1;//C
            if(x < 0 && z < 0 ) return +1;//D
        }
        if(alpha == 3*Math.PI/2 || alpha == -Math.PI/2)
        {
            if(x < 0 && z < 0 ) return -1;//D
            if(x > 0 && z < 0 ) return +1;//A
        }
        return 0;
    }
}

 /*
            this.scene.onPointerDown = function (evt, pickResult) {
            // if the click hits the ground object, we change the impact position
            if (pickResult.hit) {
                console.log(" x = "+pickResult.pickedPoint.x+" y = "+pickResult.pickedPoint.z);
            }*/
