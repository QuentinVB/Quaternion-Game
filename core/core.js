//import Helpers from './helpers';
var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        function Main() {
            // Public members
            this.gameState = "";
        }
        // Create collisions
        Main.prototype.setupCollisions = function () {
            var _this = this;
            var fadeClock = -1;
            this.scene.registerBeforeRender(function () {
                var _a, _b;
                if (fadeClock > -1 && _this.fadeLevel > 0) {
                    _this.fadeLevel -= 0.05;
                    fadeClock++;
                }
                if (_this._character.intersectsMesh(_this.scene.getMeshByName("Goal"), true)) {
                    if (_this.gameState != "await")
                        _this.gameState = "win";
                }
                if (_this._character.intersectsMesh(_this._ground, true)) {
                    if (_this.gameState != "await")
                        _this.gameState = "lose";
                }
                if (_this.gameState) {
                    switch (_this.gameState) {
                        case "win":
                            _this.inputUnlocked = false;
                            fadeClock++;
                            _this.scene.getSoundByName("Win").play();
                            _this.gameState = "await";
                            break;
                        case "lose":
                            _this.scene.getSoundByName("Lose").play();
                            _this.gameState = "await";
                            _this._camera.alpha = _this.STARTSTATE.camera[0];
                            _this._camera.beta = _this.STARTSTATE.camera[1];
                            _this._character.position = new ((_a = BABYLON.Vector3).bind.apply(_a, [void 0].concat(_this.STARTSTATE.player)))();
                            _this._character.position.y += 0.2;
                            _this._character.rotation.set(0, 0, 0);
                            _this.strentghVector = new ((_b = BABYLON.Vector3).bind.apply(_b, [void 0].concat(_this.STARTSTATE.strentgh)))();
                            _this.gameState = "";
                            break;
                        default:
                            break;
                    }
                }
            });
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=core.js.map