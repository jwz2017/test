import { ScrollMapGame, Node } from "../../classes/Game.js";
import { Actor } from "../../classes/actor.js";
import { game, gframe, keys, queue, stage } from "../../classes/gframe.js";
import { MoveManage } from "../../classes/moveManage/move.js";
import { Fps, ScoreBoard } from "../../classes/zujian/screen.js";

window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas', true);
    // stage.setClearColor(0xffffffff);
    gframe.preload(DriveCar);
    gframe.fps = new Fps
};
//游戏变量;
var step = 32;
var moveManage = new MoveManage();
class DriveCar extends ScrollMapGame {
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
        32: "pause"
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
        super("DriveCar", stage.width, stage.height);
        this.instructionText = "上下左右：w,a,s,d";
        this.levels = queue.getResult("levels");
        this.noMoveChars = {
            "1": Hart,
            "3": Clock
        }
        this.playerChars={
            "4": Car,
        }
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard;
        this.scoreboard.createTextElement(DriveCar.SCORE);
        this.scoreboard.createTextElement(DriveCar.LEVEL);
        this.scoreboard.createTextElement(DriveCar.LIVES);
        let h = this.scoreboard.getBounds();
        this.scoreboard.x = stage.width - h.width >> 1;
        this.setSize(stage.width, stage.height - h.height);
        this.y = h.height;
    }
    newGame() {
        this.lives = 3;
    }
    newLevel() {
        this.scoreboard.update(DriveCar.SCORE, this.score);
        this.scoreboard.update(DriveCar.LEVEL, this.level);
        this.scoreboard.update(DriveCar.LIVES, this.lives);
        let plan = this.levels[this.level - 1];
        this.createGridMap(plan, step, step, (ch, node) => {
            let actor;
            switch (ch) {
                case 2:
                    actor = Back.getActor();
                    actor.init(node.x * step, node.y * step)
                    actor.image.gotoAndStop("death")
                    this.addToFloor(actor);
                    node.type = Node.DEATH;
                    node.actor = actor;
                    break;
                case 7:
                    actor = Back.getActor();
                    actor.image.gotoAndStop("block5")
                    actor.init(node.x * step, node.y * step)
                    this.addToFloor(actor);
                    node.type = Node.NOWALKABLE;
                    node.actor = actor;
                    break;
                case 8:
                    actor = Back.getActor();
                    actor.init(node.x * step, node.y * step)
                    actor.image.gotoAndStop("block4")
                    this.addToFloor(actor);
                    node.type = Node.NOWALKABLE;
                    node.actor = actor;
                    break;
                case 9:
                    actor = Back.getActor();
                    actor.init(node.x * step, node.y * step)
                    actor.image.gotoAndStop("block3")
                    this.addToFloor(actor);
                    node.type = Node.NOWALKABLE;
                    node.actor = actor;
                    break;
                case 10:
                    actor=Back.getActor();
                    actor.init(node.x*step,node.y*step);
                    actor.image.gotoAndStop("block1")
                    this.addToFloor(actor);
                    node.type = Node.NOWALKABLE;
                    break;
                case 11:
                    actor = Back.getActor();
                    actor.image.gotoAndStop("block2")
                    actor.init(node.x * step, node.y * step)
                    this.addToFloor(actor);
                    node.actor = actor;
                    node.type = Node.NOWALKABLE;
                    break;
                default:
                    break;
            }
        })
        this.setActorScroll(this.player, this.width / 3, this.height / 3);
        this.scrollView()
    }
    runGame() {
        this.player.act();
        this.scrollView()
    }

}
class Back extends Actor{
    constructor() {
        super(step,step);
        this.setSpriteData(queue.getResult("drivecar"))
    }
    init(xpos,ypos){
        this.setPos(xpos,ypos);
    }
}
class Hart extends Actor {
    constructor() {
        super(step, step);
        this.name = "hart";
        this.setSpriteData(queue.getResult("drivecar"), "hart")
    }

}
class Clock extends Actor {
    constructor() {
        super(step, step);
        this.name = "clock";
        this.setSpriteData(queue.getResult("drivecar"), "clock");
    }
}
class Car extends Actor {
    constructor() {
        super(step, step);
        this.name = "player";
        this.setSpriteData(queue.getResult("drivecar"), "car", { imageScale: 2, rotation: 90 });
        this.friction = 0.96;
        moveManage.maxForce = 0.2;
    }
    init(xpos,ypos){
        super.init(xpos,ypos);
        this.image.paused = true;
        this.speed.zero();
    }
    act() {
        let node = game.hitMap(this.rect, this.hitflooractor, this.image, 0.9);

        if (node) {
            if (node.type == Node.DEATH) {
                game.gameOver = true;
                return;
            }
            this.speed.normalize();
            this.speed.mul(-10);
            super.act();
            this.speed.length = -0.1;

        } else {
            moveManage.driveCar(this, keys);
            super.act();
        }
        if (this.speed.length > 0.1) this.image.paused = false;
        else this.image.paused = true;
    }
    hitflooractor(node) {
        let actor = node.actor;
        node.type = null;
        actor.parent.removeChild(actor);
        if (actor.name == "hart") {
            game.score += 20;
            game.scoreboard.update(DriveCar.SCORE, game.score);
            if (!game.hasParent(Hart.array)) {
                game.levelUp = true;

            }
        }
    }
}
