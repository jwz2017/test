import { Game } from "../../classes/Game.js";
import { SteeredActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";
import { MoveManage } from "../../classes/moveManage/move.js";

var vehicle;
var moveManage=new MoveManage();
export class VehiclArrive extends Game {
    constructor() {
        super("机车到达");
    }
    waitComplete() {
        vehicle = new SteeredActor();
        vehicle.drawSpriteData(15,15);
        stage.addChild(vehicle);
    }
    runGame() {
        moveManage.arrive(vehicle,new Vector(stage.mouseX, stage.mouseY));
        vehicle.act();
    }

}