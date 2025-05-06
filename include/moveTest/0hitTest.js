
import { stage } from "../../classes/gframe.js";
import { Actor, Vector } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
var rect1, rect2;
export class hitTest extends Game {
    constructor() {
        super("hitTest");
        rect1 = new Actor(300, 400);
        rect1.drawSpriteData(200, 80)

        rect2 = new Actor(500, 100);
        rect2.drawSpriteData(200, 50)
        stage.on("stagemousemove", (e) => {
            rect2.setPos(e.stageX, e.stageY);
        })
        stage.addChild(rect1, rect2);

        let a=new Vector(20,30);
        let b=new Vector(45,50);
        console.log(a.dot(b));

        


    }
    runGame() {
        //测试矩形碰撞
        let r = rect1.rect;
        if (r.intersects(rect2.rect)) {
            // let color=createjs.Graphics.getHSL(Math.random()*360,80,60);
            rect1.color = "#f00";
        } else {
            rect1.color = "#555";
        }
        //测试hittest
        let p = rect2.globalToLocal(r.x, r.y);
        if (rect2.hitTest(p.x, p.y)) {
            rect2.color = "#0f0";
        } else {
            rect2.color = "#555"
        }
        // rect1.drawShape(rect1.rect.width, rect1.rect.height);
        // rect2.drawShape(rect2.rect.width, rect2.rect.height);
    }
}


