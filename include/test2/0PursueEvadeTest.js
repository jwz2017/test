import { Actor, SteeredActor } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var pursuer, evader;
export class PursueEvade extends gframe.Game {
    constructor() {
        super("追捕和躲避测试");
    }
    waitComplete() {
        pursuer = new SteeredActor(200, 200);
        pursuer.init(15);
        pursuer.edgeBehavior = Actor.BOUNCE;

        evader = new SteeredActor(400, 300);
        evader.init(15);
        evader.edgeBehavior = Actor.BOUNCE;
        stage.addChild(pursuer, evader);
    }
    runGame() {
        pursuer.pursue(evader);
        evader.evade(pursuer);
        pursuer.act();
        evader.act();
    }
}