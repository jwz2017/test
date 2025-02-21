import { Game } from "../../classes/Game.js";
import { Actor, MoveManage, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicleA, vehicleB, vehicleC;
var moveManage=new MoveManage();
export class FleeTest2 extends Game {
    constructor() {
        super("逃离测试2");
    }
    waitComplete() {
        vehicleA = new SteeredActor(200, 200);
        vehicleA.drawSpriteData(15);
        vehicleA.edgeBehavior = Actor.BOUNCE;

        vehicleB = new SteeredActor(400, 200);
        vehicleB.drawSpriteData(15);
        vehicleB.edgeBehavior = Actor.BOUNCE;

        vehicleC = new SteeredActor(300, 260);
        vehicleC.drawSpriteData(15);
        vehicleC.edgeBehavior = Actor.BOUNCE;
        stage.addChild(vehicleA, vehicleB, vehicleC);
    }
    runGame() {
        moveManage.seek(vehicleA,vehicleB);
        moveManage.flee(vehicleA,vehicleC);
        vehicleA.act();

        moveManage.seek(vehicleB,vehicleC);
        moveManage.flee(vehicleB,vehicleA);
        vehicleB.act();

        moveManage.seek(vehicleC,vehicleA);
        moveManage.flee(vehicleC,vehicleB);
        vehicleC.act();
    }

}