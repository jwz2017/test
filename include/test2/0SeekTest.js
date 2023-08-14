import { SteeredActor, Vector } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var vehicle;
export class VehiclSeek extends gframe.Game {
    constructor() {
        super("机车追寻测试");
    }
    waitComplete() {
        vehicle = new SteeredActor();
        vehicle.init(20);
        stage.addChild(vehicle);
    }
    runGame() {
        vehicle.seek(new Vector(stage.mouseX, stage.mouseY));
        vehicle.act()
    }

}