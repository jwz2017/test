import { Game } from "../../classes/Game.js";
import { Actor, CirActor, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var seeker, pursuer, target;
export class VehiclPursue extends Game {
    constructor() {
        super("机车追捕");
    }
    waitComplete() {
        seeker = new SteeredActor();
        pursuer = new SteeredActor();
        target = new CirActor(200, 300,15);
        target.edgeBehavior = Actor.WRAP;
        target.speed.length = 15;
        stage.addChild(seeker, pursuer, target);

    }
    runGame() {
        seeker.seek(target);
        seeker.act();

        pursuer.pursue(target);
        pursuer.act();

        target.act();

    }

}