import { SteeredActor, Vector } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var vehicle;
export class VehiclArrive extends gframe.Game {
    constructor() {
        super("机车到达");
    }
    waitComplete() {
        vehicle = new SteeredActor();
        vehicle.init(15, 15);
        stage.addChild(vehicle);
    }
    runGame() {
        vehicle.arrive(new Vector(stage.mouseX, stage.mouseY));
        vehicle.act();
    }

}