///<reference path='../libs/babylon.d.ts'/>
import Helpers from 'helpers'
import {Character,Ground,Skybox,Misc} from 'actors'
import Tutorial from 'tutorial'
import Main from './main';
import * as States from './states/index';

export default class Level {
    //public
    public scene: BABYLON.Scene;
    public _camera: BABYLON.ArcFollowCamera;
    public _character: BABYLON.Mesh;
    public _ground: BABYLON.Mesh;
    public _colliders: BABYLON.AbstractMesh[];
    public _skybox :BABYLON.Mesh;
    public env:Main;
    public gameState:States.AbstractState;
    public strengthVector;
    public fadeLevel = 1.0;
    public postProcess:BABYLON.PostProcess;
    //private
    private sounds =  [];

    constructor(levelname:String,env:Main)
    {
        BABYLON.SceneLoader.LoadAsync("../assets/", levelname+".babylon", env.engine).then((scene)=>
        {
            this.scene = scene;
            this.env = env;

            //TODO Move those into a scene in main
            this.sounds.push(new BABYLON.Sound("Jump", "../assets/boing.mp3", this.scene));
            this.sounds.push(new BABYLON.Sound("Win", "../assets/gong.mp3", this.scene));
            this.sounds.push(new BABYLON.Sound("Lose", "../assets/lose.mp3", this.scene));
    

            //activate physic
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

            //meshes
            this.setupMeshes();

            //collisions
            this.setupCollisions();

            //actions
            this.setupActions();

            //post Processing
            this.setupPostProcess();

            //initilize the State Machine
            this.gameState = new States.Default(this.env);
            this.scene.registerBeforeRender(()=>{this.gameState.Update()});

            //add tutorial if level0
            if(levelname = "level0") Tutorial(this.scene);

            Helpers.showAxis(7,this.scene);
        });
    }

    /*
     * load the meshes from the file and assign the rôles
     */
    private setupMeshes()
    {
        //setup camera
        this._camera = new BABYLON.ArcFollowCamera("ArcCamera", this.env.STARTSTATE.camera[0],this.env.STARTSTATE.camera[1],this.env.STARTSTATE.camera[2],this.scene.getMeshByName("collide"), this.scene);
        this.scene.activeCamera = this._camera;

        //setup character
        this._character = Character.create(this.env);

        //link character and camera
        this._camera.target=this._character;

        //setup lights
        //var light = new BABYLON.PointLight("light", new BABYLON.Vector3(5, 5, -5), this.scene);

        //setup ground
        this._ground = Ground.create(this.env);

        //skybox
        this._skybox = Skybox.create(this.env);
        
        //setup Misc decoration
        Misc.create(this.env);
    }

    private setupActions()
    {
        //define the strength vector
        this.strengthVector = new BABYLON.Vector3(...this.env.STARTSTATE.strength);

        //define the camera rotation animation
        const rotateAnimation = new BABYLON.Animation('rotation','alpha',25,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

        //actions from keys
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if(this.env.inputUnlocked && kbInfo.type==BABYLON.KeyboardEventTypes.KEYDOWN){
                switch (kbInfo.event.keyCode) {
                    // up arrow
                    case 38: 
                    if(this.checkGroundCollision()) {
                        this._character.applyImpulse(new BABYLON.Vector3(0,this.env.JUMP_FORCE,0),this._character.position);
                        this.scene.getSoundByName("Jump").play();
                    }
                    break;
                    // left arrow
                    case 37:
                        this._character.physicsImpostor.applyImpulse(this.strengthVector,this._character.position);
                    break;
                    // right arrow
                    case 39:
                        this._character.physicsImpostor.applyImpulse(BABYLON.Vector3.TransformCoordinates(this.strengthVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)),this._character.position);
                    break;
                    //spaceBar
                    case 32:
                        //ROTATE CAMERA BASED ON THE POSITION OF THE character
                        let rotationAngle =  Helpers.getRotationSignFromCharaPosition(this._character,this._camera)*Math.PI/2;
                        this.env.inputUnlocked = false;
                        rotateAnimation.setKeys([
                            {frame: 0, value:this._camera.alpha},
                            {frame: 30, value:this._camera.alpha+rotationAngle},
                        ]);
                        this.scene.beginDirectAnimation(this._camera, [rotateAnimation],0,30,false, 1.0,()=>{this.env.inputUnlocked= true;});
                        //ROTATE CHARACTER
                        this._character.rotate(new BABYLON.Vector3(0,1,0),-rotationAngle,BABYLON.Space.LOCAL);
                        //ROTATE DIRECTIONAL VECTOR
                        this.strengthVector = BABYLON.Vector3.TransformCoordinates(this.strengthVector, BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, -rotationAngle));
                break;
                }
            }
        });
        //actions from mouse
        /*
        //FOR DEBUG ONLY
        this.scene.onPointerDown = (evt, pickResult) => {
            // if the click hits the ground object, we change the impact position
            if (pickResult.hit) {
                console.log(" x = "+pickResult.pickedPoint.x+" y = "+pickResult.pickedPoint.z);
            }
        }*/
    }

    

    private setupCollisions()
    {
        //setup collisions box from decor
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
    }
    private checkGroundCollision():boolean
    {
        let value = false;
        this._colliders.forEach(collider => {
            if(this._character.intersectsMesh(collider,true))value = true;
        });
        return value;
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
        this.postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._camera);
        this.postProcess.onApply = (effect) => {
            effect.setFloat("fadeLevel", this.fadeLevel);
        };
    }
}
