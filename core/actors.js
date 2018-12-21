define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Character = /** @class */ (function () {
        function Character() {
        }
        Character.create = function (env) {
            //mesh
            var character = BABYLON.Mesh.CreateBox("character", 0.5, env.level.scene);
            character.position = env.level.scene.getMeshByName("start").position;
            //materials
            var material = new BABYLON.StandardMaterial("material", env.scene);
            material.diffuseColor = new BABYLON.Color3(0.9, 0.2, 0);
            character.material = material;
            //physic
            character.position.y += 0.5;
            character.physicsImpostor = new BABYLON.PhysicsImpostor(character, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution: 0.2,
                friction: 1.0
            });
            //lock rotation and clamp velocity
            character.getPhysicsImpostor().registerBeforePhysicsStep(function (impostor) {
                impostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                impostor.setLinearVelocity(new BABYLON.Vector3(BABYLON.Scalar.Clamp(impostor.getLinearVelocity().x, -env.MAX_VELOCITY, env.MAX_VELOCITY), BABYLON.Scalar.Clamp(impostor.getLinearVelocity().y, -env.TERMINAL_VELOCITY, env.TERMINAL_VELOCITY), BABYLON.Scalar.Clamp(impostor.getLinearVelocity().z, -env.MAX_VELOCITY, env.MAX_VELOCITY)));
            });
            return character;
        };
        return Character;
    }());
    exports.Character = Character;
    var Ground = /** @class */ (function () {
        function Ground() {
        }
        Ground.create = function (env) {
            //mesh
            var ground = BABYLON.Mesh.CreateGround('ground', 512, 512, 32, env.scene);
            var pillarsize = env.level.scene.getMeshByName("levelPillar").getBoundingInfo().boundingBox.vectorsWorld;
            ground.position.set(0, -Number(pillarsize[1].y - (pillarsize[0].y)), 0);
            //material
            ground.isVisible = false;
            //physic
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0,
                restitution: 0,
                friction: 1.0
            });
            return ground;
        };
        return Ground;
    }());
    exports.Ground = Ground;
    var Skybox = /** @class */ (function () {
        function Skybox() {
        }
        Skybox.create = function (env) {
            //mesh
            var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, env.level.scene);
            //material
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", env.level.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../assets/skybox/day", env.level.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
            return skybox;
        };
        return Skybox;
    }());
    exports.Skybox = Skybox;
    var Misc = /** @class */ (function () {
        function Misc() {
        }
        Misc.create = function (env) {
            ///Setup clouds and floating islands
            var width = 20;
            var miscContainer;
            var plateformSize = env.level.scene.getMeshByName("platforms").getBoundingInfo().boundingBox.vectorsWorld;
            var pWidth = Math.max(Number(plateformSize[1].x - (plateformSize[0].x)), Number(plateformSize[1].y - (plateformSize[0].y)));
            BABYLON.SceneLoader.LoadAssetContainer("../assets/", "misc.babylon", env.level.scene, function (container) {
                miscContainer = container;
                var placeElement = function (x, z) {
                    /*
                    let position = new BABYLON.Vector3(
                        BABYLON.Scalar.RandomRange(minX,maxX),
                        BABYLON.Scalar.RandomRange(-2,2),
                        BABYLON.Scalar.RandomRange(minZ,maxZ)
                    );*/
                    var index = Math.round(Math.random() * (miscContainer.meshes.length - 1));
                    var miscMesh = miscContainer.meshes[index];
                    var newMesh = miscMesh.createInstance(miscMesh.name + x * z);
                    env.level.scene.addMesh(newMesh);
                    newMesh.position = new BABYLON.Vector3(x, BABYLON.Scalar.RandomRange(-4, 5), z);
                };
                //good ol" CC , failed to solve the equation !§%&$
                /*
                placeElement(-width/2,-width/2-pWidth,-width/2,-width/2-pWidth);
                placeElement(width/2-pWidth,width/2,-width/2,-width/2-pWidth);
                placeElement(-width/2,width/2-pWidth,width/2-pWidth,width/2);
                placeElement(width/2-pWidth,width/2-pWidth,width/2,width/2);*/
                placeElement(8, 9);
                placeElement(-5, -6);
                placeElement(-8, 7);
                placeElement(6, -9);
            });
        };
        return Misc;
    }());
    exports.Misc = Misc;
});
//# sourceMappingURL=actors.js.map