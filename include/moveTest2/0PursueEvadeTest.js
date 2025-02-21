import { Game } from "../../classes/Game.js";
import { Actor, MoveManage, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var pursuer, evader;
var moveManage=new MoveManage();
export class PursueEvade extends Game {
    constructor() {
        super("追捕和躲避测试");
    }
    waitComplete() {
        pursuer = new SteeredActor(200, 200);
        pursuer.drawSpriteData(15);
        pursuer.edgeBehavior = Actor.BOUNCE;

        evader = new SteeredActor(400, 300);
        evader.drawSpriteData(15);
        evader.edgeBehavior = Actor.BOUNCE;
        stage.addChild(pursuer, evader);
    }
    runGame() {
        moveManage.pursue(pursuer,evader);
        moveManage.evade(evader,pursuer);
        pursuer.act();
        evader.act();
        
    }
}