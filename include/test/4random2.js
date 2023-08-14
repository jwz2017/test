import { CirActor } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var numDots = 300, iterations = 6;
export class Random2 extends gframe.Game {
    constructor() {
        super("偏向分布");
    }
    waitComplete() {
        for (let i = 0; i < numDots; i++) {
            const dot = new CirActor();
            dot.init(2, 2);
            stage.addChild(dot);
            var xpos = 0;
            for (let j = 0; j < iterations; j++) {
                xpos += Math.random() * stage.width;
            }
            dot.x = xpos / iterations;
            // let x1=Math.random()*width;
            // let x2=Math.random()*width;
            // dot.x=(x1+x2)/2;
            var ypos = 0;
            for (let j = 0; j < iterations; j++) {
                ypos += Math.random() * stage.height;

            }
            dot.y = ypos / iterations;
            // dot.y=height/2+Math.random()*50-25;
        }
    }
}