import {  stage } from "../../classes/gframe.js";
import { Actor,CirActor } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
var ball0, ball1;
export class Billiard2 extends Game {
    constructor() {
        super("动量碰撞");
        ball0 = new CirActor(300, 300,100);
        ball0.edgeBehavior = Actor.BOUNCE
        ball0.mass = 2;
        ball0.speed.x = Math.random() * 10 - 5;
        ball0.speed.y = Math.random() * 10 - 5;
    
        ball1 = new CirActor(200, 200,90);
        ball1.edgeBehavior = Actor.BOUNCE;
        ball1.mass = 1;
        ball1.speed.x = Math.random() * 10 - 5;
        ball1.speed.y = Math.random() * 10 - 5;
        stage.addChild(ball0, ball1);
        ball1.setScale(0.5)
    }
    runGame() {
        ball0.act();
        ball1.act();
        if (ball0.hitRadius(ball1)) {
            CirActor.billiardCollision(ball0, ball1);
        }
    }

}
