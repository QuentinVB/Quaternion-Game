///<reference path='../libs/babylon.d.ts'/>
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //very dirty, should improve.
    function setupTutorial(scene) {
        var tutoA = scene.getMeshByName("tutoA");
        var myDynamicTexture = new BABYLON.DynamicTexture("tutoAtexture", { width: 512, height: 512 }, scene, false);
        var textureContext = myDynamicTexture.getContext();
        var myMaterial = new BABYLON.StandardMaterial("Mat", scene);
        myMaterial.diffuseTexture = myDynamicTexture;
        tutoA.material = myMaterial;
        myDynamicTexture.hasAlpha = true;
        var img = new Image();
        img.src = '../assets/move2.png';
        img.onload = function () {
            //Add image to dynamic texture
            textureContext.drawImage(img, 140, 290);
            myDynamicTexture.update();
            myDynamicTexture.drawText("Move", 180, 256, "bold 44px monospace", "red", null, true, true);
        };
        var tutoB = scene.getMeshByName("tutoB");
        //console.log(tutoB);
        var myDynamicTextureB = new BABYLON.DynamicTexture("tutoBtexture", { width: 512, height: 512 }, scene, false);
        var textureContextB = myDynamicTextureB.getContext();
        var myMaterialB = new BABYLON.StandardMaterial("Mat2", scene);
        myMaterialB.diffuseTexture = myDynamicTextureB;
        tutoB.material = myMaterialB;
        myDynamicTextureB.hasAlpha = true;
        var imgB = new Image();
        imgB.src = '../assets/rotate.png';
        imgB.onload = function () {
            //Add image to dynamic texture
            textureContextB.drawImage(imgB, 140, 290);
            myDynamicTextureB.update();
            myDynamicTextureB.drawText("Change dimension !", 0, 256, "bold 44px monospace", "red", null, true, true);
        };
        var tutoC = scene.getMeshByName("tutoC");
        //console.log(tutoC);
        var myDynamicTextureC = new BABYLON.DynamicTexture("tutoCtexture", { width: 512, height: 512 }, scene, false);
        var textureContextC = myDynamicTextureC.getContext();
        var myMaterialC = new BABYLON.StandardMaterial("Mat3", scene);
        myMaterialC.diffuseTexture = myDynamicTextureC;
        tutoC.material = myMaterialC;
        myDynamicTextureC.hasAlpha = true;
        var imgC = new Image();
        imgC.src = '../assets/jump.png';
        imgC.onload = function () {
            //Add image to dynamic texture
            textureContextC.drawImage(imgC, 200, 290);
            myDynamicTextureC.update();
            myDynamicTextureC.drawText("Jump !", 180, 256, "bold 44px monospace", "red", null, true, true);
        };
    }
    exports.default = setupTutorial;
    ;
});
//# sourceMappingURL=tutorial.js.map