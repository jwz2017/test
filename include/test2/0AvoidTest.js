import { Actor, CirActor, SteeredActor } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var vehicle, circles, numCircles = 10;
export class AvoidTest extends gframe.Game {
    constructor() {
        super("回避绕路测试");
    }
    waitComplete() {
        circles = [];
        vehicle = new SteeredActor();
        vehicle.init(15, 15);
        // vehicle.maxSpeed=6;
        vehicle.edgeBehavior = Actor.BOUNCE;
        stage.addChild(vehicle);

        for (let i = 0; i < numCircles; i++) {
            const circle = new CirActor(Math.random() * stage.width, Math.random() * stage.height);
            let size = Math.random() * 50 + 50;
            circle.init(size, size);
            stage.addChild(circle);
            circles.push(circle);
        }

    }
    runGame() {
        vehicle.wander();
        vehicle.avoid(circles);
        vehicle.act();
    }

}