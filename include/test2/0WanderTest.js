import { SteeredActor } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var vehicle;
export class WanderTest extends gframe.Game {
    constructor() {
        super("漫游行为");
    }
    waitComplete() {
        vehicle = new SteeredActor(200, 200);
        vehicle.init(15);
        stage.addChild(vehicle);

    }
    runGame() {
        vehicle.wander();
        vehicle.act();
    }

}