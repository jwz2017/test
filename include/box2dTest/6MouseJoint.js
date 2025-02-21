import { stage } from "../../classes/gframe.js";
import { Box2dGame} from "../../classes/Game.js";
//游戏变量;
export class MouseJoint extends Box2dGame {
    constructor() {
        super("鼠标关节");
        this.x=100
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
        this.body=EasyBody.createBox(200, 400, 30, 40);
        this.p=this.body.GetLinearVelocityFromLocalPoint(new b2Vec2(1,0))
        
        this.dragBody();
    }
}


