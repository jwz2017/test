import { Game } from "../../classes/Game.js";
import { Actor, MoveManage, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicles, numVehicles = 30;
var moveManage=new MoveManage();
export class FlockTest extends Game{
    constructor() {
        super("群落测试");
    }
    waitComplete() {
        vehicles = [];
        for (let i = 0; i < numVehicles; i++) {
            const vehicle = new SteeredActor();
            vehicle.edgeBehavior = Actor.BOUNCE;
            vehicle.drawSpriteData(15);
            vehicle.setPos(Math.random() *stage.width, Math.random() * stage.height);
            vehicle.speed.setValues(Math.random() * 20 - 10, Math.random() * 20 - 10);
            vehicles.push(vehicle);
            stage.addChild(vehicle);
        }
    }
    runGame() {
        for (let i = 0; i < numVehicles; i++) {
            moveManage.flock(vehicles[i],vehicles);
            vehicles[i].act();
        }
    }

}