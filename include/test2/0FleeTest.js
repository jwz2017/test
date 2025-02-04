import { Game } from "../../classes/Game.js";
import { Actor, MoveManage, SteeredActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle;
var moveManage=new MoveManage();
export class VehiclFlee extends Game{
    constructor() {
        super("机车逃离测试");
    }
    waitComplete() {
        vehicle = new SteeredActor(200, 200,15,15);
        vehicle.edgeBehavior = Actor.BOUNCE;
        stage.addChild(vehicle);
    }
    runGame() {
        moveManage.flee(vehicle,new Vector(stage.mouseX, stage.mouseY),2);
        vehicle.act()
    }

}