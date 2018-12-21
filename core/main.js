define(["require", "exports", "level"], function (require, exports, level_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = /** @class */ (function () {
        // Constructor
        function Main() {
            this.fadeLevel = 1.0;
            this.inputUnlocked = true;
            //const
            this.MAX_VELOCITY = 1.5;
            this.TERMINAL_VELOCITY = 20;
            this.JUMP_FORCE = 4;
            this.SPEED = 3;
            this.STARTSTATE = {
                camera: [3 * Math.PI / 2, 0, 10],
                strength: [-this.SPEED, 0, 0]
            };
            this.engine = new BABYLON.Engine(document.getElementById('renderCanvas'));
            //TODO : load a scene with common elements such as sounds
            this.loadLevel("level0");
        }
        /**
         * Runs the engine to render the level into the canvas
         */
        Main.prototype.run = function () {
            var _this = this;
            //this.updatePostProcess();
            this.engine.runRenderLoop(function () {
                if (_this.level != undefined && _this.level.scene != undefined)
                    _this.level.scene.render();
            });
        };
        Main.prototype.loadLevel = function (levelname) {
            if (this.level)
                this.level.scene.dispose();
            this.level = new level_1.default(levelname, this);
            //this.updatePostProcess();
        };
        Main.prototype.updatePostProcess = function () {
            var _this = this;
            BABYLON.Effect.ShadersStore["fadePixelShader"] =
                "precision highp float;" +
                    "varying vec2 vUV;" +
                    "uniform sampler2D textureSampler; " +
                    "uniform float fadeLevel; " +
                    "void main(void){" +
                    "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
                    "baseColor.a = 1.0;" +
                    "gl_FragColor = baseColor;" +
                    "}";
            this.postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this.level._camera);
            this.postProcess.onApply = function (effect) {
                effect.setFloat("fadeLevel", _this.fadeLevel);
            };
        };
        return Main;
    }());
    exports.default = Main;
});
//# sourceMappingURL=main.js.map