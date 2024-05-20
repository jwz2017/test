import { stage, gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
//游戏变量;
export class MouseJoint extends Game {
    constructor() {
        super("鼠标关节");
        this.x=100
        gframe.buildWorld(true);
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
        this.body=EasyBody.createBox(200, 400, 30, 40);
        this.p=this.body.GetLinearVelocityFromLocalPoint(new b2Vec2(1,0))
        
        this.dragBody();
    }
}


