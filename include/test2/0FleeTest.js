import { Actor, SteeredActor, Vector } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var vehicle;
export class VehiclFlee extends gframe.Game {
    constructor() {
        super("机车逃离测试");
    }
    waitComplete() {
        vehicle = new SteeredActor(200, 200);
        vehicle.init(15);
        vehicle.speed.zero();
        vehicle.edgeBehavior = Actor.BOUNCE;
        stage.addChild(vehicle);
    }
    runGame() {
        vehicle.flee(new Vector(stage.mouseX, stage.mouseY));
        vehicle.act()
    }

}