//import Helpers from './helpers';
module BABYLON {
    export class Main {
        // Public members

        private gameState = "";




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
           
        }

        
        
    }
}
