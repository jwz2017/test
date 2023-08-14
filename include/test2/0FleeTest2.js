import { Actor, SteeredActor } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var vehicleA, vehicleB, vehicleC;
export class FleeTest2 extends gframe.Game {
    constructor() {
        super("逃离测试2");
    }
    waitComplete() {
        vehicleA = new SteeredActor(200, 200);
        vehicleA.init(15);
        vehicleA.edgeBehavior = Actor.BOUNCE;

        vehicleB = new SteeredActor(400, 200);
        vehicleB.init(15);
        vehicleB.edgeBehavior = Actor.BOUNCE;

        vehicleC = new SteeredActor(300, 260);
        vehicleC.init(15)
        vehicleC.edgeBehavior = Actor.BOUNCE;
        stage.addChild(vehicleA, vehicleB, vehicleC);
    }
    runGame() {
        vehicleA.seek(vehicleB);
        vehicleA.flee(vehicleC);

        vehicleB.seek(vehicleC);
        vehicleB.flee(vehicleA);

        vehicleC.seek(vehicleA);
        vehicleC.flee(vehicleB);
        vehicleA.act();
        vehicleB.act();
        vehicleC.act();
    }

}