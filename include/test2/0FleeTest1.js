import { Game } from "../../classes/Game.js";
import { Actor, MoveManage, SteeredActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var seeker, fleer;
var moveManage=new MoveManage();
export class FleeTest1 extends Game {
    constructor() {
        super("逃离测试1");
    }
    waitComplete() {
        seeker = new SteeredActor(200, 200);
        seeker.edgeBehavior = Actor.BOUNCE;
        seeker.maxSpeed=3;

        fleer = new SteeredActor(400, 300);
        fleer.edgeBehavior = Actor.BOUNCE;
        stage.addChild(seeker, fleer);
    }
    runGame() {
        moveManage.seek(seeker,fleer);
        moveManage.flee(fleer,seeker);
        seeker.act();
        fleer.act();
    }

}