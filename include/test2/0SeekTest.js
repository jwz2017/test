import { Game } from "../../classes/Game.js";
import { SteeredActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle;
export class VehiclSeek extends Game {
    constructor() {
        super("机车追寻测试");
    }
    waitComplete() {
        vehicle = new SteeredActor();
        stage.addChild(vehicle);
    }
    runGame() {
        vehicle.seek(new Vector(stage.mouseX, stage.mouseY));
        vehicle.act()
    }

}