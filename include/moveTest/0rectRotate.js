import { stage } from "../../classes/gframe.js";
import {Vector,Actor } from "../../classes/actor.js";
import { OBB, detectorOBBvsOBB } from "../../classes/hitTest.js";
import { Game } from "../../classes/Game.js";
var rect0, rect1;
export class RectRotate extends Game {
    constructor() {
        super("矩形旋转碰撞");
        rect0 = new Actor(350,400);
        rect0.drawSpriteData(200,80);

        rect1 = new Actor(350,580);
        rect1.drawSpriteData(200,50)

        stage.addChild(rect0, rect1);
    }
    runGame() {
        rect0.rotation += 1;
        rect1.rotation += 0.5;
        // //中心点
        // let r0 = rect0.getTransformedBounds();
        // let rect0center = new Vector(r0.x + r0.width / 2, r0.y + r0.height / 2);
        let rect0center = new Vector(rect0.x, rect0.y);
        
        // //外接圆碰撞
        if (this.hitRadius(rect0,rect1)) {
            let obb1 = new OBB(rect0center, rect0.rect.width, rect0.rect.height, rect0.rotation * Math.PI / 180);
            let obb2 = new OBB(new Vector(rect1.x, rect1.y), rect1.rect.width, rect1.rect.height, rect1.rotation * Math.PI / 180);
            //旋转矩形碰撞
            var r = detectorOBBvsOBB(obb1, obb2);
            if (r) {
                rect0.color = rect1.color = "#ff0000";
            } else {
                rect0.color = rect1.color = "rgb(64,64,64)";
            }
        }
    }
}
