var BABYLON;
(function (BABYLON) {
    var Helpers = /** @class */ (function () {
        function Helpers() {
        }
        Helpers.showAxis = function (size, scene) {
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
        };
        return Helpers;
    }());
    BABYLON.Helpers = Helpers;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=helpers.js.map