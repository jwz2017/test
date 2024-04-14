import { Game } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var numDots = 300, maxRadius = 50;
export class Random extends Game {
    constructor() {
        super("平均圆形分布");
    }
    waitComplete() {
        for (let i = 0; i < numDots; i++) {
            const dot = new CirActor(0, 0, 1);
            stage.addChild(dot);
            let radius = Math.sqrt(Math.random()) * maxRadius;
            let angle = Math.random() * Math.PI * 2;
            dot.x = stage.width / 2 + Math.cos(angle) * radius;
            dot.y = stage.height / 2 + Math.sin(angle) * radius;
        }
    }

}