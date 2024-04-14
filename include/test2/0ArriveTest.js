import { Game } from "../../classes/Game.js";
import { MoveManage, SteeredActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle;
var moveManage=new MoveManage();
export class VehiclArrive extends Game {
    constructor() {
        super("机车到达");
    }
    waitComplete() {
        vehicle = new SteeredActor();
        stage.addChild(vehicle);
    }
    runGame() {
        moveManage.arrive(vehicle,new Vector(stage.mouseX, stage.mouseY));
        vehicle.act();
    }

}