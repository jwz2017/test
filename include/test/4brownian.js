import { Game } from "../../classes/Game.js";
import { Actor, CirActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var numDots = 50, friction = 0.95, dots, shape;
export class Brownian extends Game {
    constructor() {
        super("布朗运动");
    }
    waitComplete() {
        shape = new createjs.Shape();
        shape.graphics.beginStroke("#ffffff55")
        stage.addChild(shape);
        dots = [];
        for (let i = 0; i < numDots; i++) {
            const dot = new CirActor(0,0,1);
            dot.edgeBehavior=Actor.WRAP;
            dot.x = Math.random() * stage.width;
            dot.y = Math.random() * stage.height;
            dots.push(dot);
            stage.addChild(dot);
        }
    }
    runGame() {
        for (let i = 0; i < numDots; i++) {
            const dot = dots[i];
            shape.graphics.moveTo(dot.x, dot.y)
            dot.speed.x += Math.random() * 0.2 - 0.1;
            dot.speed.y += Math.random() * 0.2 - 0.1;
            dot.x += dot.speed.x;
            dot.y += dot.speed.y;
            dot.speed.x *= friction;
            dot.speed.y *= friction;
            shape.graphics.lineTo(dot.x, dot.y);
            this.checkBounds(dot)
        }
    }

}