import { Game } from "../../classes/Game.js";
import { Actor, MoveManage, SteeredActor, Vector, Weapon } from "../../classes/actor.js";
import { gframe, keys, stage } from "../../classes/gframe.js";
import { Fps, ScoreBoard } from "../../classes/screen.js";

window.onload = function () {
    gframe.buildStage('canvas',false,true);
    gframe.preload(SpaceShip);
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
        100:"attack",
        32:"pause"
    }
    constructor() {
        super("飞机游戏");
        ship = new Ship();
        this.fps=new Fps();
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.x=200;
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        nextRock = 0;
        timeToRock = ROCK_TIME;
        ship.speed = new Vector(0, 0);
    }
    waitComplete() {
        stage.addChild(this.fps)
        this.addToPlayer(ship);
        ship.x = stage.width / 2;
        ship.y = stage.height / 2;
        
        ship.updateRect();
    }
    runGame() {
        // 控制飞船
        this.moveActors(this.playerLayer);
        // 开火
        ship.weapon.fire(keys.attack);
        // //石块
        if (nextRock <= 0) {
            timeToRock -= DIFFICULTY;
            let index = SpaceRock.getActor();
            index.init(SpaceRock.LRG_ROCK);
            this.addToEnemy(index);
            index.floatOnScreen(stage.width, stage.height);
            nextRock = timeToRock + timeToRock * Math.random();
        } else {
            nextRock--;
        }
        //石块移动
        for (const o of SpaceRock.array) {
            if (!o.active) {
                continue;
            }
            o.act();
            //石块与飞船碰撞
            if (this.hitRadius(o,ship)) {
                this.gameOver = true;
            }
            //与子弹碰撞
            let l = this.playerLayer.numChildren - 1;
            for (let i = l; i >= 0; i--) {
                const p = this.playerLayer.children[i];
                if (this.hitRadius(o,p) && p.type == "bullet") {
                    this.score += o.score;
                    this.scoreboard.update("score", this.score);
                    p.recycle();
                    let newSize;
                    let rect = o.getBounds()
                    switch (rect.width) {
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
                            this.addToEnemy(index);
                            index.init(newSize);
                            offset = (Math.random() * rect.width * 2) - rect.width;
                            index.x = o.x;
                            index.y = o.y + offset;
                            index.updateRect();
                        }
                    }
                    o.recycle();
                    break;
                }

            }
        }
        //检测子弹
        for (const bullet of Bullet.array) {
            if (bullet.active) {
                bullet.act();
            }
        }
    }
}

class Bullet extends Actor {
    static array=[];
    constructor(xpos, ypos) {
        super(xpos, ypos, 6, 2);
        this.edgeBehavior=Actor.RECYCLE;
        this.type = "bullet";
        this.speed.length = 3;
        this.drawSpriteData(6,2,"#fff")
    }
}
class Ship extends SteeredActor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.edgeBehavior=Ship.WRAP;
        this.thrust = 0;
        this.timeout = 0;
        this.toggle = 60;
        this.drawSpriteData(15)
        this.weapon = new Weapon(this,Bullet, 30);
    }
    act() {
        moveManage.driveShip(this,keys);
        super.act();
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
        if(keys.up){
            this.thrust+=0.05;
        }
    }
}
//石头
class SpaceRock extends Actor {
    static array=[];
    static LRG_ROCK = 60;
    static MED_ROCK = 40;
    static SML_ROCK = 20;
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.edgeBehavior = Actor.WRAP;
    }
    init(size) {
        this.drawSpriteData(size)
        let angle = Math.random() * (Math.PI * 2);
        this.speed.length = Math.sin(angle) * (2 + 20 / this.hit);
        this.speed.angle = angle;
        this.spin = (Math.random() + 0.2) * this.speed.x;
        this.score = Math.floor((5 + size / 10) * 100);
    }
    get hit() {
        return this._hit;
    }
    drawShape(width) {
        this.image.graphics.clear();
        this._hit = width / 2;
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
            this._hit = (this._hit + radius) / 2;
        }
        this.image.graphics.closePath();
        this.image.setBounds(-width / 2, -width / 2, width, width);
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
    }
}