import { Game } from "../../classes/Game.js";
import { MoveManage, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle;
var moveManage=new MoveManage();
export class WanderTest extends Game {
    constructor() {
        super("漫游行为");
    }
    waitComplete() {
        vehicle = new SteeredActor(200, 200);
        stage.addChild(vehicle);

    }
    runGame() {
        moveManage.wander(vehicle);
        vehicle.act();
        this.checkBounds(vehicle);
    }

}