import { Game } from "../../classes/Game.js";
import { SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";
import { MoveManage } from "../../classes/moveManage/move.js";

var vehicle;
var moveManage=new MoveManage();
export class WanderTest extends Game {
    constructor() {
        super("漫游行为");
    }
    waitComplete() {
        vehicle = new SteeredActor();
        vehicle.setPos(200,200)
        vehicle.edgeBehavior=SteeredActor.WRAP
        vehicle.drawSpriteData(15,15);
        stage.addChild(vehicle);

    }
    runGame() {
        moveManage.wander(vehicle);
        vehicle.act();
    }

}