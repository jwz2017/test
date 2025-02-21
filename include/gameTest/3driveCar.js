import {ScrollMapGame,Node } from "../../classes/Game.js";
import { Actor, MoveManage, SteeredActor } from "../../classes/actor.js";
import { game, gframe, keys, queue, stage } from "../../classes/gframe.js";
import { ScoreBoard } from "../../classes/screen.js";

window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas', true);
    // stage.setClearColor(0x000000ff);
    gframe.preload(DriveCar);
};
//游戏变量;
var step = 32;
var levels, sprite;
var moveManage = new MoveManage();
class DriveCar extends ScrollMapGame {
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
        32:"pause"
    }
    static loadItem = [{
        id: "drivecar",
        src: "drivecar/drivercar.json",
        type: "spritesheet"
    }, {
        id: "levels",
        src: "drivecar/level.json"
    }];
    constructor() {
        super("DriveCar", stage.width, stage.height, step, step);
        this.instructionText = "上下左右：w,a,s,d";
        levels = queue.getResult("levels");
        sprite = new createjs.Sprite(queue.getResult("drivecar"));
        this.playerChars = {
            "4": Car
        };
        this.propChars = {
            "1": Hart,
            "3": Clock
        }
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard;
        this.scoreboard.createTextElement(DriveCar.SCORE);
        this.scoreboard.createTextElement(DriveCar.LEVEL);
        this.scoreboard.createTextElement(DriveCar.LIVES);
        let h=this.scoreboard.getBounds().height;
        this.setSize(stage.width, stage.height - h);
        this.y = h;
    }
    newLevel() {
        this.scoreboard.update(DriveCar.SCORE, this.score);
        this.scoreboard.update(DriveCar.LEVEL, this.level);
        this.scoreboard.update(DriveCar.LIVES, this.lives);
        let plan = levels[this.level - 1];
        this.createGridMap(plan, (ch, node) => {
            let actor;
            switch (ch) {
                case 2:
                    node.type = Node.DEATH;
                    actor = new Actor(node.x * step, node.y * step, step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "death");
                    this.addToFloor(actor);
                    node.actor = actor;
                    this.addToFloor(actor);
                    break;
                case 7:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step, step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block5");
                    this.addToFloor(actor);
                    node.actor = actor;
                    break;
                case 8:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step, step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block4");
                    this.addToFloor(actor);
                    node.actor = actor;
                    break;
                case 9:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step, step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block3");
                    this.addToFloor(actor);
                    node.actor = actor;
                    break;
                case 10:
                    node.type = Node.NOWALKABLE;
                    actor = sprite.clone();
                    actor.gotoAndStop("block1");
                    actor.x = node.x * step;
                    actor.y = node.y * step;
                    this.addToFloor(actor);
                    break;
                case 11:
                    node.type = Node.NOWALKABLE;
                    actor = new Actor(node.x * step, node.y * step, step, step);
                    actor.setSpriteData(queue.getResult("drivecar"), "block2");
                    this.addToFloor(actor);
                    node.actor = actor;
                    break;
                default:
                    break;
            }
        })
        this.setActorScroll(this.player,this.width / 2,this.height / 2);
    }
    runGame() {
        this.moveActors(this.playerLayer);
        this.scrollView()
    }

}
class Hart extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, step, step);
        this.type = "hart";
        this.setSpriteData(queue.getResult("drivecar"), "hart")
    }

}
class Clock extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, step, step);
        this.type = "clock";
        this.setSpriteData(queue.getResult("drivecar"), "clock");
    }
}
class Car extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, step,step);
        this.type = "player";
        this.setSpriteData(queue.getResult("drivecar"), "car",{imageScale:2,rotation:90});
        this.image.paused = true;
        this.friction = 0.96;
        this.velocity = 0.2;
    }
    act() {
        let node = game.hitMap(this.rect, this.image,0,this.hitflooractor);
       
        if (node) {
            if (node.type == Node.DEATH) {
                game.gameOver = true;
                return;
            }
            this.speed.normalize();
            this.speed.mul(-8);
            super.act();
            this.speed.length = -0.2;
            
        } else {
            moveManage.driveCar(this, keys);
            super.act();
        }
        if (this.speed.length > 0.1) this.image.paused = false;
        else this.image.paused = true;
    }
    hitflooractor(node) {
        node.type=null;
        let actor = node.actor;
        actor.parent.removeChild(node.actor);
        node.actor = null;
        if (actor.type == "hart") {
            game.score += 20;
            game.scoreboard.update(DriveCar.SCORE, game.score);
            if (!game.hasTypeOnContainer("hart", game.propLayer)) {
                game.levelUp = true;
            }
        }
    }
}
