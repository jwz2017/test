import { Game } from "../../classes/Game.js";
import { Actor, CirActor, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle, circles, numCircles = 10;
export class AvoidTest extends Game {
    constructor() {
        super("回避绕路测试");
    }
    waitComplete() {
        circles = [];
        vehicle = new SteeredActor();
        // vehicle.maxSpeed=6;
        vehicle.edgeBehavior = Actor.BOUNCE;
        stage.addChild(vehicle);

        for (let i = 0; i < numCircles; i++) {
            let size = Math.random() * 25 + 25;
            const circle = new CirActor(Math.random() * stage.width, Math.random() * stage.height,size);
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