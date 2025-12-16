import { stage } from "../../classes/gframe.js";
import { Actor } from "../../classes/actor.js";
import { OBB } from "../../classes/hit/hitTest.js";
import { Game } from "../../classes/Game.js";
var rect0, rect1;
export class RectRotate extends Game {
    constructor() {
        super("矩形旋转碰撞");
        rect0 = new Actor();
        rect0.init(350, 400)
        rect0.drawSpriteData(200, 80);

        rect1 = new Actor();
        rect1.init(350, 580);
        rect1.drawSpriteData(200, 50)

        stage.addChild(rect0, rect1);
    }
    runGame() {
        rect0.rotation += 1;
        rect1.rotation += 0.5;

        // //外接圆碰撞
        if (rect0.hitRadius(rect1)) {
            var r = OBB.detectorOBBvsOBB(new OBB(rect0), new OBB(rect1));
            if (r) {
                rect0.color = rect1.color = "#ff0000";
            } else {
                rect0.color = rect1.color = "rgb(64,64,64)";
            }
        }
    }
}
