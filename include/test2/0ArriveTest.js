import { Game } from "../../classes/Game.js";
import { SteeredActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle;
export class VehiclArrive extends Game {
    constructor() {
        super("机车到达");
    }
    waitComplete() {
        vehicle = new SteeredActor();
        stage.addChild(vehicle);
    }
    runGame() {
        vehicle.arrive(new Vector(stage.mouseX, stage.mouseY));
        vehicle.act();
    }

}