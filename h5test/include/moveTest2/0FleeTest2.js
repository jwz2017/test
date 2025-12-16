import { Game } from "../../classes/Game.js";
import { Actor, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";
import { MoveManage } from "../../classes/moveManage/move.js";

var vehicleA, vehicleB, vehicleC;
var moveManage=new MoveManage();
export class FleeTest2 extends Game {
    constructor() {
        super("逃离测试2");
    }
    waitComplete() {
        vehicleA = new SteeredActor();
        vehicleA.drawSpriteData(15,15);
        vehicleA.edgeBehavior = Actor.BOUNCE;
        vehicleA.setPos(200,200);
        
        vehicleB = new SteeredActor();
        vehicleB.drawSpriteData(15,15);
        vehicleB.edgeBehavior = Actor.BOUNCE;
        vehicleA.setPos(400,200);
        
        vehicleC = new SteeredActor();
        vehicleA.setPos(300,260);
        vehicleC.drawSpriteData(15,15);
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