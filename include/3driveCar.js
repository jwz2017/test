import { GridsMapGame, Node } from "../classes/GridsMapGame.js";
import { Actor, SteeredActor } from "../classes/actor.js";
import { game, gframe, queue, stage } from "../classes/gframe.js";

window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas',true);
    stage.setClearColor(0x00000000);
    gframe.preload(DriveCar, true);
    gframe.startFPS();
};
//游戏变量;
var step = 32;
var levels, actorChars, floorChars, sprite;
export class DriveCar extends GridsMapGame {
    static loadItem = [{
        id: "drivecar",
        src: "drivecar/drivercar.json",
        type: "spritesheet"
    }, {
        id: "levels",
        src: "drivecar/level.json"
    }];
    constructor() {
        gframe.style.TEXT_COLOR = "#fff";
        super("DriveCar", stage.width, stage.height, step, step);
        this.y=this.scoreboard.height;
        this.setSize(stage.width,stage.height-this.scoreboard.height);
        this.instructionScreen.updateTitle("上下左右：w,a,s,d");
        stage.canvas.style.background = "#000";
        levels = queue.getResult("levels");
        sprite = new createjs.Sprite(queue.getResult("drivecar"));
        actorChars = {
            "4": Car
        };
        floorChars = {
            "1": Hart,
            "3": Clock
        }
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard();
        this.scoreboard.createTextElement(DriveCar.SCORE);
        this.scoreboard.createTextElement(DriveCar.LEVEL);
        this.scoreboard.createTextElement(DriveCar.LIVES);
    }
    newLevel() {
        this.scoreboard.update(DriveCar.SCORE, this.score);
        this.scoreboard.update(DriveCar.LEVEL, this.level);
        this.scoreboard.update(DriveCar.LIVES, this.lives);
        let plan = levels[this.level - 1];
        this.createGridMap(plan, actorChars, (ch, node) => {
            let actor;
            switch (ch) {
                case 2:
                    node.type = Node.DEATH;
                    actor = new Actor(node.x * step, node.y * step);
                    actor.init(step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "death");
                    this.addChildToFloor(actor);
                    node.actor = actor;
                    this.addChildToFloor(actor);
                    break;
                case 7:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step);
                    actor.init(step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block5");
                    this.addChildToFloor(actor);
                    node.actor = actor;
                    break;
                case 8:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step);
                    actor.init(step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block4");
                    this.addChildToFloor(actor);
                    node.actor = actor;
                    break;
                case 9:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step);
                    actor.init(step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block3");
                    this.addChildToFloor(actor);
                    node.actor = actor;
                    break;
                case 10:
                    node.type = Node.NOWALKABLE;
                    actor = sprite.clone();
                    actor.gotoAndStop("block1");
                    actor.x = node.x * step;
                    actor.y = node.y * step;
                    this.addChildToFloor(actor);
                    break;
                case 11:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step);
                    actor.init(step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block2");
                    this.addChildToFloor(actor);
                    node.actor = actor;
                    break;
                default:
                    break;
            }
        }, floorChars)
    }
    runGame() {
        this.moveActors(this.world);
        this.scrollPlayerIntoView(this.player,this.width/2-6,this.height/2-6)
    }

}
class Hart extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.type="hart";
        this.init(step, step);
        this.setSpriteData(queue.getResult("drivecar"), "hart")
    }

}
class Clock extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.type="clock";
        this.init(step, step);
        this.setSpriteData(queue.getResult("drivecar"), "clock");
    }
}
class Car extends SteeredActor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.type="player";
        this.edgeBehavior=Car.BOUNCE;
        this.init(step , step);
        this.setSpriteData(queue.getResult("drivecar"), "car",2,90);
        this.image.paused = true;
        this.friction=0.98;
    }
    act(){
        let node=game.hitMap(this.rect,this.image);
        if(node){
            if(node.type==Node.DEATH){
                game.clear(gframe.event.GAME_OVER);
                return;
            }
            this.speed.normalize();
            this.speed=this.speed.times(-8);
            super.act();
            this.speed.length=0;
        }else{
            this.driveCar(0.15);
            super.act();
        }
        if(this.speed.length>0.1) this.image.paused=false;
        else this.image.paused=true;
        this.hitflooractor();
    }
    hitflooractor(){
        let node=game.hitFloorActor(this.rect,this.image);
        if(node){
            let actor=node.actor;
            actor.parent.removeChild(node.actor);
            node.actor=null;
            if(actor.type=="hart"){
                game.score+=20;
                game.scoreboard.update(DriveCar.SCORE,game.score);
                if(!game.hasTypeOnContainer("hart",game.floorActor)){
                    game.clear(gframe.event.LEVEL_UP);
                }
            }
        }
    }
}
