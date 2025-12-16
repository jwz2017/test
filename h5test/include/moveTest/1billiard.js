import {  stage } from "../../classes/gframe.js";
import { CirActor } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
var ball0, ball1;
export class Billiard extends Game {
    constructor() {
        super("单轴动量碰撞");
        ball0 = new CirActor();
        ball0.init(100,400);
        ball0.drawSpriteData(80);
        ball0.mass = 2;
        ball0.speed.x = 1;
    
        ball1 = new CirActor();
        ball1.init(600,420);
        ball1.drawSpriteData(40);
        ball1.mass = 1;
        ball1.speed.x = -1;
        stage.addChild(ball0, ball1);
    }
    runGame() {
        ball0.x += ball0.speed.x;
        ball1.x += ball1.speed.x;
        if (ball0.hitRadius(ball1)) {
            let vxTotal = ball0.speed.x - ball1.speed.x;
            ball0.speed.x = ((ball0.mass - ball1.mass) * ball0.speed.x +
                2 * ball1.mass * ball1.speed.x) / (ball0.mass + ball1.mass);
            ball1.speed.x = vxTotal + ball0.speed.x;
            ball0.x += ball0.speed.x;
            ball1.x += ball1.speed.x;
        }
    }
}