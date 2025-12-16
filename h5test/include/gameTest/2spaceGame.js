import { Game } from "../../classes/Game.js";
import { Actor, SteeredActor, Vector } from "../../classes/actor.js";
import { game, gframe, keys, stage } from "../../classes/gframe.js";
import { MoveManage } from "../../classes/moveManage/move.js";
import { Fps, ScoreBoard } from "../../classes/zujian/screen.js";
import { Weapon } from "../../classes/weapon/weapon.js";

window.onload = function () {
    gframe.buildStage('canvas', false, true);
    gframe.preload(SpaceShip);
    gframe.fps = new Fps
};
var ROCK_TIME = 500,
    SUB_ROCK_COUNT = 3,
    DIFFICULTY = 2;

var nextRock, timeToRock;
var ship;
var moveManage = new MoveManage();
class SpaceShip extends Game {
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
        100: "attack",
        32: "pause"
    }
    constructor() {
        super("飞机游戏");
        ship = new Ship();
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.x = 200;
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        nextRock = 0;
        timeToRock = ROCK_TIME;
        ship.speed = new Vector(0, 0);
        ship.x = stage.width / 2;
        ship.y = stage.height / 2;
        ship.updateRect();
        this.addToFloor(ship);
    }
    runGame() {
        this.moveContainer(this.floorChildren);
        //创建石块
        if (nextRock <= 0) {
            timeToRock -= DIFFICULTY;
            let index = SpaceRock.getActor();
            index.init(SpaceRock.LRG_ROCK);
            this.container.addChild(index);
            index.floatOnScreen(stage.width, stage.height);
            nextRock = timeToRock + timeToRock * Math.random();
        } else {
            nextRock--;
        }
        // 移动飞船
        //移动石块
        this.moveActors(SpaceRock.array);
    }
}

class Bullet extends Actor {
    static array = [];
    constructor(xpos, ypos) {
        super(xpos, ypos, 6, 2);
        this.edgeBehavior = Actor.RECYCLE;
        this.speed.length = 4;
        this.drawSpriteData(6, 2, "#fff")
    }
    act() {
        super.act();
        let rock = this.hitRActors(SpaceRock.array);
        if (rock) {
            game.score += rock.score;
            game.scoreboard.update("score", game.score);
            this.recycle();
            rock.hp=0;
        }
    }
}
class Ship extends SteeredActor {
    constructor() {
        super();
        this.edgeBehavior = Ship.WRAP;
        this.thrust = 0;
        this.timeout = 0;
        this.toggle = 60;
        this.drawSpriteData(15,15)
        this.weapon = new Weapon(this, Bullet, 30);
    }
    act() {
        moveManage.driveShip(this, keys, 5, 0.05);
        this.weapon.fire(keys.attack);
        super.act();
        let a=this.hitRActors(SpaceRock.array);
        if(a){
            game.gameOver=true;
        }

        if (this.thrust > 0) {
            this.timeout++;
            this.shipFlame.alpha = 1;
            if (this.timeout > this.toggle) {
                this.timeout = 0;
                if (this.shipFlame.scaleX == 1) {
                    this.shipFlame.scale = 0.6;
                } else {
                    this.shipFlame.scale = 1;
                }
            }
            this.thrust -= 0.04;
        } else {
            this.shipFlame.alpha = 0;
            this.thrust = 0;
        }
        if (keys.up) {
            this.thrust += 0.05;
        }
    }
}
//石头
class SpaceRock extends Actor {
    static array=[];
    static LRG_ROCK = 60;
    static MED_ROCK = 40;
    static SML_ROCK = 20;
    constructor() {
        super();
        this.edgeBehavior = Actor.WRAP;
    }
    init(size) {
        this.drawSpriteData(size, size)
        super.init(0,0);
        let angle = Math.random() * (Math.PI * 2);
        this.speed.length = Math.sin(angle) * (2 + 20 / this.hit);
        this.speed.angle = angle;
        this.spin = (Math.random() + 0.2) * this.speed.x;
        this.score = Math.floor((5 + size / 10) * 100);
    }
    drawShape(width) {
        this.image.graphics.clear();
        this.hit = width / 2;
        let angle = 0,
            size = width / 2,
            radius = width / 2;
        this.image.graphics.clear();
        this.image.graphics.beginStroke("#ffffff");
        this.image.graphics.moveTo(0, radius);
        //draw spacerock
        while (angle < (Math.PI * 2 - .5)) {
            angle += .25 + (Math.random() * 100) / 500;
            radius = size + (size / 2 * Math.random());
            this.image.graphics.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
            this.hit = (this.hit + radius) / 2;
        }
        this.image.graphics.closePath();
    }
    floatOnScreen(width, height) {
        let rect = this.rect;
        if (Math.random() * (width + height) > width) {
            if (this.speed.x > 0) {
                this.x = -rect.width / 2;
            } else {
                this.x = width + rect.width / 2;
            }
            if (this.speed.y > 0) {
                this.y = Math.random() * height * 0.5;
                this.set
            } else {
                this.y = Math.random() * height * 0.5 + 0.5 * height;
            }
        } else {
            if (this.speed.y > 0) {
                this.y = -rect.height / 2;
            } else {
                this.y = height + rect.height / 2;
            }
            if (this.speed.x > 0) {
                this.x = Math.random() * width * 0.5;
            } else {
                this.x = Math.random() * width * 0.5 + 0.5 * width;
            }
        }
        this.updateRect();
    }
    act() {
        super.act();
        this.rotation += this.spin;
        if (!this.hp) {
            let width = this.getBounds().width;
            let newSize;
            switch (width) {
                case SpaceRock.LRG_ROCK:
                    newSize = SpaceRock.MED_ROCK;
                    break;
                    case SpaceRock.MED_ROCK:
                    newSize = SpaceRock.SML_ROCK;
                    break;
                    case SpaceRock.SML_ROCK:
                    newSize = 0;
                    break;
            }
            if (newSize > 0) {
                let i;
                let index;
                let offset;
                for (i = 0; i < SUB_ROCK_COUNT; i++) {
                    index = SpaceRock.getActor();
                    index.init(newSize);
                    game.container.addChild(index);
                    offset = (Math.random() * width * 2) - width;
                    index.x = this.x+offset;
                    index.y = this.y + offset;
                    index.updateRect();
                }
            }
            this.recycle();

        }
    }
}