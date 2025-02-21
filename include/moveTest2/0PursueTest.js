import { Game } from "../../classes/Game.js";
import { Actor, CirActor, MoveManage, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var seeker, pursuer, target;
var moveManage=new MoveManage();
export class VehiclPursue extends Game {
    constructor() {
        super("机车追捕");
    }
    waitComplete() {
        seeker = new SteeredActor();
        seeker.drawSpriteData(15);
        pursuer = new SteeredActor();
        pursuer.drawSpriteData(15);
        target = new CirActor(200, 300);
        target.drawSpriteData(30);
        target.edgeBehavior = Actor.WRAP;
        target.speed.length = 15;
        stage.addChild(seeker, pursuer, target);

    }
    runGame() {
        target.act();
        moveManage.seek(seeker,target);
        seeker.act();
        moveManage.pursue(pursuer,target);
        pursuer.act();


    }

}