import { Game } from "../../classes/Game.js";
import { MoveManage, SteeredActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

export class VehiclSeek extends Game {
    constructor() {
        super("机车追寻测试");
    }
    waitComplete() {
        this.vehicle = new SteeredActor();
        this.moveManage=new MoveManage()
        stage.addChild(this.vehicle);
    }
    runGame() {
        this.moveManage.seek(this.vehicle,new Vector(stage.mouseX, stage.mouseY));
        this.vehicle.act()
    }

}