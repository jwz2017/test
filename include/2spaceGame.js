import { Game, ScoreBoard } from "../classes/Game.js";
import { Actor, SteeredActor, Vector } from "../classes/actor.js";
import { gframe, keys, stage } from "../classes/gframe.js";

window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(SpaceShip,true);
};
var TURN_FACTOR = 6,
    ROCK_TIME = 500,
    SUB_ROCK_COUNT = 3,
    DIFFICULTY = 2;

var  nextRock, rockBelt, timeToRock, bullets;
var ship;
class SpaceShip extends Game{
    constructor() {
        super("飞机游戏");
        ship = new Ship();
    }
    /**建立游戏元素游戏初始化
     * 在构造函数内建立
     */
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
    }
    newLevel() {
        this.scoreboard.update("score",this.score);
        this.scoreboard.update("level",this.level);
        nextRock=0;
        timeToRock = ROCK_TIME;
        bullets = [];
        rockBelt = [];
        ship.speed = new Vector(0, 0);
    }
    waitComplete() {
        stage.addChild(ship);
        ship.x=stage.width/2;
        ship.y=stage.height/2;
        ship.updateRect();
    }
    runGame() {
        // 控制飞船
        ship.act();
        // 开火
        if(keys.attack) ship.fire(bullets,Bullet,stage);
        else ship.fireIndex--;

        // //石块
        if (nextRock <= 0) {
            timeToRock -= DIFFICULTY;
            let index = Game.getActor(rockBelt, SpaceRock);
            index.init(SpaceRock.LRG_ROCK);
            stage.addChild(index);
            index.floatOnScreen(stage.width, stage.height);
            nextRock = timeToRock + timeToRock * Math.random();
        } else {
            nextRock--;
        }
        //石块移动
        for (const o of rockBelt) {
            if (!o.active) {
                continue;
            }
            o.act();
            //石块与飞船碰撞
            if (o.hitRadius(ship)) {
                this.gameOver=true;
            }
            //与子弹碰撞
            for (let i = bullets.length - 1; i >= 0; i--) {
                const p = bullets[i];
                if (p.active && o.hitRadius(null, p.x, p.y)) {
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
                            index = Game.getActor(rockBelt, SpaceRock);
                            stage.addChild(index);
                            index.init(newSize,newSize);
                            offset = (Math.random() * rect.width * 2) - rect.width;
                            index.x=o.x;
                            index.y=o.y+offset;
                            index.updateRect();
                        }
                    }
                    o.recycle();
                    break;
                }

            }
        }
        //检测子弹
        for (const bullet of bullets) {
            if (bullet.active) {
                bullet.act();
            }
        }
    }
}

class Bullet extends Actor {
    constructor(xpos,ypos) {
        super(xpos,ypos,6,2);
        this.speed.length = 5;
        this.color="#fff";
    }
}
class Ship extends SteeredActor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.thrust = 0;
        this.timeout = 0;
        this.toggle = 60;
        this.mass = 4;
        this.maxForce = 0.2;
        this.fireStep=20;
    }
    act() {
        let r=this.rotation;
        super.act();
        if (keys.left) {
            this.rotation =r- TURN_FACTOR;
        } else if (keys.right) {
            this.rotation =r+ TURN_FACTOR;
        }else{
            this.rotation=r;
        }
        if (keys.up) {
            ship.accelerate();
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
    }
    accelerate() {
        this.thrust += 0.05;
        this.steeringForce = this.speed.clone().normalize();
        this.steeringForce.angle = this.rotation * Math.PI / 180;
        this.steeringForce = this.steeringForce.times(this.thrust);
    }
}
//石头
class SpaceRock extends Actor {
    static LRG_ROCK = 60;
    static MED_ROCK = 40;
    static SML_ROCK = 20;
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.edgeBehavior = Actor.WRAP;
    }
    init(width,height) {
        super.init(width,height);
        let angle = Math.random() * (Math.PI * 2);
        this.speed.length = Math.sin(angle) * (2 + 20 / this.hit);
        this.speed.angle = angle;
        this.spin = (Math.random() + 0.2) * this.speed.x;
        this.score = Math.floor((5 + this.getBounds().width / 10) * 100);
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