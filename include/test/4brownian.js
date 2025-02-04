import { Game } from "../../classes/Game.js";
import { Actor, CirActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var numDots = 50, dots, shape;
export class Brownian extends Game {
    static codes={
        32:"pause"
    }
    constructor() {
        super("布朗运动");
    }
    waitComplete() {
        shape = new createjs.Shape();
        shape.graphics.beginStroke("#ffffff55")
        stage.addChild(shape);
        dots = [];
        for (let i = 0; i < numDots; i++) {
            const dot = new CirActor(0,0,2);
            dot.edgeBehavior=Actor.WRAP;
            dot.friction=0.95;
            dot.x = Math.random() * stage.width;
            dot.y = Math.random() * stage.height;
            // dot.updateRect();
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
            dot.act();
            shape.graphics.lineTo(dot.x, dot.y);
        }
    }

}