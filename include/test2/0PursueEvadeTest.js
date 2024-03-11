import { Game } from "../../classes/Game.js";
import { Actor, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var pursuer, evader;
export class PursueEvade extends Game {
    constructor() {
        super("追捕和躲避测试");
    }
    waitComplete() {
        pursuer = new SteeredActor(200, 200);
        pursuer.edgeBehavior = Actor.BOUNCE;

        evader = new SteeredActor(400, 300);
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