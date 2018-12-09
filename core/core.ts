module BABYLON {
    export class Main {
        // Public members
        public engine: Engine;
        public scene: Scene;
        private _camera: ArcFollowCamera = null;
        private _character: Mesh = null;
        private _ground: Mesh = null;
        private _colliders: AbstractMesh[]= null;
        private readonly MAX_VELOCITY =1.5;
        private readonly TERMINAL_VELOCITY = 20;
        private readonly JUMP_FORCE = 4;
        private readonly SPEED = 3;
        private readonly STARTSTATE = {camera:[3*Math.PI/2, 0,10],player: [1.3, 2, -1.6],strentgh:[-this.SPEED,0,0]};
        private strentghVector;
        private inputUnlocked = true;
        //private activeSensor:AbstractMesh=null;
        private sounds =  [];
        private fadeLevel = 1.0;

        private gameState = "";

        // Constructor
        constructor (scene: Scene) {
            this.engine = new Engine(<HTMLCanvasElement> document.getElementById('renderCanvas'));
            
            BABYLON.SceneLoader.LoadAsync("../assets/", "level0.babylon", this.engine).then((scene)=>
            {
                this.scene = scene;
                this.createMeshes();
                this.setupPhysics();
                this.setupCollisions();
                this.setupActions();
                this.setupPostProcess();
                this.setupTutorial();
                this.sounds.push(new BABYLON.Sound("Jump", "../assets/boing.mp3", this.scene));
                this.sounds.push(new BABYLON.Sound("Win", "../assets/gong.mp3", this.scene));
                this.sounds.push(new BABYLON.Sound("Lose", "../assets/lose.mp3", this.scene));
                //this.showAxis(7,this.scene);
            });
        }
        /**
         * Runs the engine to render the scene into the canvas
         */
        public run () {
            this.engine.runRenderLoop(() => {
                if(this.scene != undefined)this.scene.render();
            });
        }

        // Create camera
        public createMeshes() : void {

            //setup camera
            this._camera = new BABYLON.ArcFollowCamera("ArcCamera", this.STARTSTATE.camera[0],this.STARTSTATE.camera[1],this.STARTSTATE.camera[2],this.scene.getMeshByName("collide"), this.scene);
            //this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            this.scene.activeCamera = this._camera;

            //setup character
            this._character = BABYLON.Mesh.CreateBox("character", 0.5, this.scene);
            this._character.position=new BABYLON.Vector3(...this.STARTSTATE.player);

            //var noze = BABYLON.Mesh.CreateBox("characterNoze", 0.3, this.scene);
            //noze.position.set(1.1,2.3,-1.6);
            //this._character.addChild(noze);
            let material =  new BABYLON.StandardMaterial("material",this.scene);
            material.diffuseColor = new BABYLON.Color3(0.9,0.2,0);
            this._character.material = material;

            //link character and camera
            this._camera.target=this._character;

            //setup lights
            //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(15, 15, 15), this.scene);

            //setup ground
            var pillarsize = this.scene.getMeshByName("levelPillar").getBoundingInfo().boundingBox.vectorsWorld; 
            this._ground = <GroundMesh> Mesh.CreateGround('ground', 512, 512, 32, this.scene);
            this._ground.position.set(0,-Number(pillarsize[1].y-(pillarsize[0].y)),0);
            this._ground.isVisible = false;

            //skybox
            let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, this.scene);
            let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../assets/skybox/day", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;	

            //Setup clouds and floating islands
            var miscContainer;
            var plateformSize = this.scene.getMeshByName("platforms").getBoundingInfo().boundingBox.vectorsWorld; 
            var plateformMaxWidth=Math.max(Number(plateformSize[1].x-(plateformSize[0].x)),Number(plateformSize[1].y-(plateformSize[0].y)));
            BABYLON.SceneLoader.LoadAssetContainer("../assets/", "misc.babylon", this.scene, (container)=> {
                miscContainer = container;
                var startValue = -plateformMaxWidth
                for (let i = 0; i < 9; i++) {
                    if(Math.random()>0.5)
                    {
                        var position = new BABYLON.Vector3(
                            BABYLON.Scalar.RandomRange(-10,10),
                            BABYLON.Scalar.RandomRange(0,2),
                            BABYLON.Scalar.RandomRange(-10,10)
                        );
                        var miscMesh = miscContainer.meshes[Math.round(Math.random()*(miscContainer.meshes.length-1))];

                        //console.log(miscMesh);
                        miscMesh.position=position;
                        this.scene.addMesh(miscMesh);
                    }
                    
                }
            });
            
            // miscMeshes = meshes.filter((value)=>{value.name == "cloud"});
            
        }

        // Create collisions
        public setupCollisions () : void {
            let fadeClock = -1;
            this.scene.registerBeforeRender(()=>{
                if(fadeClock>-1 && this.fadeLevel>0 ) {this.fadeLevel-=0.05;fadeClock++;}
                if(this._character.intersectsMesh(this.scene.getMeshByName("Goal"),true))
                {
                    if(this.gameState !="await") this.gameState = "win";
                }
                if(this._character.intersectsMesh(this._ground,true))
                {
                    if(this.gameState !="await") this.gameState = "lose";
                }
                if(this.gameState)
                {
                    switch (this.gameState) {
                        case "win":
                            this.inputUnlocked = false;
                            fadeClock++;
                            this.scene.getSoundByName("Win").play();
                            this.gameState = "await";
                            break;
                        case "lose":
                            this.scene.getSoundByName("Lose").play();
                            this.gameState = "await";
                            this._camera.alpha = this.STARTSTATE.camera[0];
                            this._camera.beta = this.STARTSTATE.camera[1];
                            this._character.position = new BABYLON.Vector3(...this.STARTSTATE.player);
                            this._character.position.y+=0.2;
                            this._character.rotation.set(0,0,0);
                            this.strentghVector = new BABYLON.Vector3(...this.STARTSTATE.strentgh);
                            this.gameState = "";
                            break;
                        default:
                            break;
                    }
                }
            });
            /*
            this.scene.onPointerDown = function (evt, pickResult) {
            // if the click hits the ground object, we change the impact position
            if (pickResult.hit) {
                console.log(" x = "+pickResult.pickedPoint.x+" y = "+pickResult.pickedPoint.z);
            }*/
            /*
            this.scene.getMeshByName("sensorParent").getChildMeshes().forEach(sensor => {
                sensor.isVisible = false;
            });*/
        }
        private checkGroundCollision():boolean
        {
            let value = false;
            this._colliders.forEach(collider => {
                if(this._character.intersectsMesh(collider,true))value = true;
            });
            return value;
        }
        /*
        private checkSensorCollision(): any
        {
            this.scene.getMeshByName("sensorParent").getChildMeshes().forEach(sensor => {
                if(this._character.intersectsMesh(sensor,true))
                {
                    this.activeSensor = sensor;
                }
            });
        }*/

        // Setup physics
        public setupPhysics () :void {
            //character
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());
            this._character.position.y += 0.5;
            this._character.physicsImpostor = new PhysicsImpostor(this._character, PhysicsImpostor.BoxImpostor, {
                mass: 1,
                restitution:0.2,
                friction:1.0
            });
            //lock rotation and clamp velocity
            this._character.getPhysicsImpostor().registerBeforePhysicsStep(impostor =>{
                impostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                impostor.setLinearVelocity(
                    new BABYLON.Vector3(
                        BABYLON.Scalar.Clamp(impostor.getLinearVelocity().x,-this.MAX_VELOCITY,this.MAX_VELOCITY),
                        BABYLON.Scalar.Clamp(impostor.getLinearVelocity().y,-this.TERMINAL_VELOCITY,this.TERMINAL_VELOCITY),
                        BABYLON.Scalar.Clamp(impostor.getLinearVelocity().z,-this.MAX_VELOCITY,this.MAX_VELOCITY)
                ));
            });
            
            //setup collisions box decor
            let firstCollider = this.scene.getMeshByName("collide");
            let collidersChild = firstCollider.getChildMeshes();
            this._colliders=[...collidersChild,firstCollider];
            this._colliders.forEach(collider => {
                collider.physicsImpostor = new BABYLON.PhysicsImpostor(collider, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    friction:1.0
                });
                collider.isVisible = false;
            });

            //setup ground physic
            this._ground.physicsImpostor = new PhysicsImpostor(this._ground, PhysicsImpostor.BoxImpostor, {
                mass: 0,
                restitution:0,
                friction:1.0
            });
        }
        // Create actions
        public setupActions () : void {
            this.strentghVector = new BABYLON.Vector3(...this.STARTSTATE.strentgh);
            const rotateAnimation = new Animation('rotation','alpha',25,Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_RELATIVE);

            this.scene.onKeyboardObservable.add((kbInfo) => {
                if(this.inputUnlocked){
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        switch (kbInfo.event.keyCode) {
                            // up arrow
                            case 38: 
                                if(this.checkGroundCollision()) {
                                    this._character.applyImpulse(new Vector3(0,this.JUMP_FORCE,0),this._character.position);
                                    this.scene.getSoundByName("Jump").play();
                                }
                            break;
                            // down arrow 40
                            // left arrow
                            case 37:
                                this._character.physicsImpostor.applyImpulse(this.strentghVector,this._character.position);
                            break;
                            // right arrow
                            case 39:
                                this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(this.strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)),this._character.position);
                            break;
                            //spaceBar
                            case 32:

                                //ROTATE CAMERA BASED ON THE POSITION OF THE character
                                // this.getRotationSignFromSensor(this.activeSensor)*
                                let rotationAngle =  this.getRotationSignFromCharaPosition()*Math.PI/2;
                                this.inputUnlocked = false;
                                rotateAnimation.setKeys([
                                    {frame: 0, value:this._camera.alpha},
                                    {frame: 30, value:this._camera.alpha+rotationAngle},
                                ]);
                                this.scene.beginDirectAnimation(this._camera, [rotateAnimation],0,30,false, 1.0,()=>{this.inputUnlocked= true;});
                                //ROTATE CHARACTER
                                this._character.rotate(new BABYLON.Vector3(0,1,0),-rotationAngle,BABYLON.Space.LOCAL);
                                //ROTATE DIRECTIONAL VECTOR
                                this.strentghVector = BABYLON.Vector3.TransformCoordinates(this.strentghVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, -rotationAngle));
                            break;
                        }
                    break;
                }
               } 
            });
        
        }
        //return a rad angle based on
        private getRotationSignFromCharaPosition() :int
        {
            const x =this._character.position.x;
            const z = this._character.position.z;
            const alpha = Math.abs(this._camera.alpha%(2*Math.PI)<0 ? this._camera.alpha%(2*Math.PI) + 2*Math.PI:this._camera.alpha%(2*Math.PI));
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
            return 1;
        }
        private setupPostProcess() :void
        {
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
            let postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._camera);
            postProcess.onApply = (effect) => {
                effect.setFloat("fadeLevel", this.fadeLevel);
            };
        }
        public showAxis(size:number,scene:Scene) {
            var axisX = Mesh.CreateLines("axisX", [
                Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
                new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
            ], scene);
            axisX.color = new Color3(1, 0, 0);
            var axisY = Mesh.CreateLines("axisY", [
                Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
                new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
            ], scene);
            axisY.color = new Color3(0, 1, 0);
            var axisZ = Mesh.CreateLines("axisZ", [
                Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
                new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
            ], scene);
            axisZ.color = new Color3(0, 0, 1);
        }
        private setupTutorial() :void{
            let tutoA = this.scene.getMeshByName("tutoA");
            var myDynamicTexture = new BABYLON.DynamicTexture("tutoAtexture", {width:512, height:512}, this.scene,false);
            var textureContext = myDynamicTexture.getContext();
            var myMaterial = new BABYLON.StandardMaterial("Mat", this.scene);                    
            myMaterial.diffuseTexture = myDynamicTexture;
            tutoA.material = myMaterial;
            myDynamicTexture.hasAlpha = true;
           

            var img = new Image();
            img.src = '../assets/move2.png';
            img.onload = function() {
                //Add image to dynamic texture
                textureContext.drawImage(img, 140, 290);
                myDynamicTexture.update();
                myDynamicTexture.drawText("Move", 180, 256, "bold 44px monospace", "red",null, true, true);
            }


            let tutoB = this.scene.getMeshByName("tutoB");
            console.log(tutoB);
            var myDynamicTextureB = new BABYLON.DynamicTexture("tutoBtexture", {width:512, height:512}, this.scene,false);
            var textureContextB = myDynamicTextureB.getContext();
            var myMaterialB = new BABYLON.StandardMaterial("Mat2", this.scene);                    
            myMaterialB.diffuseTexture = myDynamicTextureB;
            tutoB.material = myMaterialB;
            myDynamicTextureB.hasAlpha = true;
           

            var imgB = new Image();
            imgB.src = '../assets/rotate.png';
            imgB.onload = function() {
                //Add image to dynamic texture
                textureContextB.drawImage(imgB, 140, 290);
                myDynamicTextureB.update();
                myDynamicTextureB.drawText("Change dimension !", 0, 256, "bold 44px monospace", "red",null, true, true);
            }

            let tutoC = this.scene.getMeshByName("tutoC");
            console.log(tutoC);
            var myDynamicTextureC = new BABYLON.DynamicTexture("tutoCtexture", {width:512, height:512}, this.scene,false);
            var textureContextC = myDynamicTextureC.getContext();
            var myMaterialC = new BABYLON.StandardMaterial("Mat3", this.scene);                    
            myMaterialC.diffuseTexture = myDynamicTextureC;
            tutoC.material = myMaterialC;
            myDynamicTextureC.hasAlpha = true;
           

            var imgC = new Image();
            imgC.src = '../assets/jump.png';
            imgC.onload = function() {
                //Add image to dynamic texture
                textureContextC.drawImage(imgC, 200, 290);
                myDynamicTextureC.update();
                myDynamicTextureC.drawText("Jump !", 180, 256, "bold 44px monospace", "red",null, true, true);
            }
            
        }
    }
}
