import { Game } from "../../classes/Game.js";
import { SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle;
export class WanderTest extends Game {
    constructor() {
        super("漫游行为");
    }
    waitComplete() {
        vehicle = new SteeredActor(200, 200);
        stage.addChild(vehicle);

    }
    runGame() {
        vehicle.wander();
        vehicle.act();
    }

}