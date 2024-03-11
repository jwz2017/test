import { stage,gframe } from "../../classes/gframe.js";
import { Game} from "../../classes/Game.js";
//游戏变量;

export class WheelJoint extends Game {
    constructor() {
        super("WheelJoint");
        gframe.buildWorld(true);
        
    }
    

}
