import { Game } from "../../classes/Game.js";
import { Actor, CirActor, MoveManage, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle, circles, numCircles = 10;
var moveManage=new MoveManage();
export class AvoidTest extends Game {
    constructor() {
        super("回避绕路测试");
    }
    waitComplete() {
        circles = [];
        vehicle = new SteeredActor();
        vehicle.drawSpriteData(15);
        vehicle.edgeBehavior = Actor.BOUNCE;
        stage.addChild(vehicle);

        for (let i = 0; i < numCircles; i++) {
            let size = Math.random() * 25 + 25;
            const circle = new CirActor(Math.random() * stage.width, Math.random() * stage.height);
            circle.drawSpriteData(size*2)
            stage.addChild(circle);
            circles.push(circle);
        }
    }
    runGame() {
        moveManage.wander(vehicle);
        moveManage.avoid(vehicle,circles);
        vehicle.act();
    }

}