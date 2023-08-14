import { stage, queue, keys, pressed, gframe, game } from "../classes/gframe.js";
import { GridsMapGame } from "../classes/GridsMapGame.js";
import { Vector, Actor } from "../classes/actor.js";
import { Sparkles } from "../classes/effect.js";
window.onload = function () {
    /*************游戏入口*****/
    gframe.init('canvas');
    gframe.preload(Jump, true);
    gframe.startFPS();
};
//游戏变量;
var spriteSheet,
    actorChars,
    bullets,
    step = 30,
    winWidth = 750,
    winHeight = 400,
    plans = [
        [
            "                      v      |         x",
            "                                        ",
            "                                        ",
            "  x             = x                     ",
            "  x      oooooooooooooooooooooooooooo   ",
            "  x b @  xxyyyyxxxxxxxxxxxxxxxxxxxxxx   ",
            "  xxxxx            x                    ",
            "         !!!!!!!!x                      ",
            "     m   xxxxxxxxx                      ",
            "      x                                 ",
            "       x                                ",
            "         x                              ",
            "        x                               ",
            "      x                                 ",
            "                                        ",
            "     xxxm                               ",
            "     xxxxx                              ",
            "     xxxxx                              ",
            "     xxxxx                              ",
            "     xxxxx                              ",
            "x    xxxxx                              "
        ],
        [
            "                             |                        ",
            "                                                      ",
            "                 x   =       x                        ",
            "  x       o                                           ",
            "  x          o                    o                   ",
            "  x  @   xxxxxx  x xx  xx  xxx  x xxxxxxxxxxxxxxxx    ",
            "  xxxxx           x                                   ",
            "      x!!!!!!!!!!!x           xxxxxxxxxx              ",
            "      xxxxxxxxxxxxx                                   ",
            "                                                      "
        ]
    ];

export class Jump extends GridsMapGame {
    static loadItem = [{
        id: "woody_0",
        src: "jump/woody_0.png"
    }, {
        id: "woody_1",
        src: "jump/woody_1.png"
    }, {
        id: "woody_2",
        src: "jump/woody_2.png"
    }, {
        id: "guiqizhan",
        src: "jump/guiqizhan.png"
    }, {
        id: "sparkle",
        src: "effect/sparkles.json",
        type: "spritesheet"
    }];
    constructor() {
        super("Jump1", winWidth, winHeight, step, step);
        this.instructionScreen.title.text = "方向w,a,s,d\n小键盘4567普通攻击，跳跃，技能";
    }
    init() {
        this.y = stage.height - this.height >> 1;
        this.maxLevel = plans.length;
        let spriteData = {
            images: [queue.getResult("woody_0"), queue.getResult("woody_1"), queue.getResult("woody_2")],
            frames: {
                width: 80,
                height: 80,
                regX: 40,
                regY: 40
            },
            animations: {
                stand: [0, 3, "stand", 0.1], //[]表示从0到3帧
                walk: { //{}表示逐帧
                    frames: [4, 5, 6, 7, 6, 5],
                    next: "walk", //next:null就停止在末帧
                    speed: 0.15
                },
                run: {
                    frames: [20, 21, 22, 21],
                    next: "run",
                    speed: 0.1
                },
                roll: {
                    frames: [58, 59, 69, 58, 59, 69],
                    next: "stand",
                    speed: 0.2
                },
                attack1: [10, 13, "stand", 0.2],
                attack2: [14, 17, "stand", 0.2],
                skill1: {
                    frames: [8, 9, 19],
                    next: "stand",
                    speed: 0.14
                },
                jump: {
                    frames: [60, 61, 62],
                    next: "jumpSky",
                    speed: 0.3
                },
                jumpSky: {
                    frames: [62],
                    speed: 0.3
                },
                crouch: {
                    frames: [61],
                    next: "stand",
                    speed: 2
                },
                runJump: {
                    frames: [112],
                    speed: 0.3
                },
                fire: {
                    frames: [140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151],
                    next: "stand",
                    speed: 0.3
                }
            }
        };
        spriteSheet = new createjs.SpriteSheet(spriteData);
        actorChars = {
            "@": JumpPlayer,
            "b": Big,
            "o": Coin,
            "=": Lava,
            "|": Lava,
            "v": Lava,
            "m": MoveBrick
        };
        this.sparkle = new Sparkles(queue.getResult("sparkle"), stage.width, 200);
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0, 0, true);
        this.scoreboard.createTextElement(gframe.Game.SCORE);
        this.scoreboard.createTextElement(gframe.Game.LEVEL);
        this.scoreboard.createTextElement(gframe.Game.LIVES);
        this.scoreboard.placeElements();
    }
    newLevel() {
        // this.level=2;
        bullets = [];
        let plan = plans[this.level - 1];
        game.createGridMap(plan, actorChars, (ch, node) => {
            let color = "#555";
            let shape = new createjs.Shape();
            if (ch == "x") {
                node.walkable = false;
                color = "#fff";
            } else if (ch == "!") {
                node.walkable = false;
                node.death = true;
                color = "rgb(255,100,100)";
            } else if (ch == "y") {
                node.walkable = false;
                color = "#666";
                node.costMultiplier = 0.5;
            }
            shape.graphics.beginStroke(color).beginFill(color).drawRect(node.x * step, node.y * step, step, step);
            shape.cache(node.x * step, node.y * step, step, step);
            this.addChildToFloor(shape);
        });
    }
    waitComplete() {
        // this.sparkle.addSparkles(100, 200, 0, 0.1);
        stage.addChild(this,this.sparkle);
        this.scrollPlayerIntoView();
    }

    runGame() {
        // this.sparkle.addSparkles(3, Math.random() * stage.width, 0, 0.1)
        // 渲染actors
        this.moveActors();
        //滚动地图
        this.scrollPlayerIntoView();
    }

}

class JumpPlayer extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.speed.zero();
        this.type = "player";
        this.walkspeed = 1.2;
        this.jumpspeed = 6;
        this.gravity = 0.27;
        this.runspeed = 1.8;
        this.mult = 1;
        this.init(0.8 * 30, 1.5 * 30);
        this.plus(0, -0.5 * 30);
        this.setSpriteData(spriteSheet, "stand", 0.6);
    }
    startRoll() {
        this.oldPos = new Vector(this.x, this.y);
        this.speed.x = this.scaleX > 0 ? this.walkspeed : -this.walkspeed;
        this.image.gotoAndPlay("roll");
        this.image.on("animationend", this.stopRoll, this, true);
        //重设图片位置
        this.rect.height /= 2;
        this.rect.y += this.rect.height;
    }
    stopRoll() {
        this.rect.y -= this.rect.height;
        this.rect.height *= 2;
        let obstacle = game.hitMap(this.rect);
        if (obstacle) {
            this.setPos(this.oldPos.x, this.oldPos.y);
        }
    }
    moveY() {
        this.speed.y += this.gravity;
        var newRect = this.rect.clone();
        newRect.y += this.speed.y;
        var obstacle = game.hitMap(newRect);
        if (obstacle) {
            if (obstacle.death) {
                this.dispatchEvent(gframe.event.GAME_OVER, true);
                return;
            }
            this.mult = obstacle.costMultiplier;
        }
        if (obstacle || this._hitMove) {
            let status = this.image.currentAnimation;
            let idle = (status == "walk" || status == "stand" || status == "run");
            if (pressed.length == 0) this._roll = false;
            //落地地面以后
            if (status == "jumpSky" && this.speed.y > 0) {
                //检测跳跃是否结束
                this.image.gotoAndPlay("crouch");
            } else if (keys.jump && idle) {
                this.speed.y = -this.jumpspeed;
                this.image.gotoAndPlay("jump");
            } else if (keys.down && idle && !this._roll) {
                //开始滚动
                this._roll = true;
                this.startRoll();
            } else if (keys.attack && idle) {
                //开始普通攻击
                if (Math.random() > 0.5) {
                    this.image.gotoAndPlay("attack1");
                } else {
                    this.image.gotoAndPlay("attack2");
                }
            } else if (keys.skill1 && idle) {
                //开始技能1攻击
                this.image.gotoAndPlay("skill1");
            } else if (keys.fire && idle) {
                //放子弹
                this.image.gotoAndPlay("fire");
                this.image.on("animationend", this.createBullet, this, true);
            } else {
                this.speed.y = 0;
            }
            this._hitMove = false;
        } else {
            //未碰撞地图状态
            this.plus(0, this.speed.y);
        }
    }
    //创建子弹
    createBullet() {
        let bullet = gframe.Game.getActor(bullets, Barrage1);
        if (this.scaleX > 0) {
            bullet.scaleX = 1;
            bullet.speed.angle = 0;
        } else {
            bullet.scaleX = -1;
            bullet.speed.angle = Math.PI;
        }
        bullet.setPos(this.x, this.y);
        game.addChildToWorld(bullet);
    }
    //玩家移动
    moveX() {
        let status = this.image.currentAnimation;
        let idle=status=="stand"||status=="walk"||status=="run"||status=="jump"||status=="jumpSky";
        let key = pressed[pressed.length - 1];
        if (status == "roll") {}
        else if(!idle) this.speed.x=0;
        else if (key == "right") {
            if (status == "stand") {
                if (keys.rightRun) {
                    this.speed.x = this.runspeed;
                    this.image.gotoAndPlay("run");
                } else {
                    this.speed.x = this.walkspeed;
                    this.image.gotoAndPlay("walk")
                }
                keys.rightRun = keys.leftRun = false;
            } else if (status == "walk") {
                this.speed.x = this.walkspeed;
            } else if (status == "run" && this.scaleX < 0) {
                this.speed.x = this.walkspeed;
                this.image.gotoAndPlay("walk")
            }
            else if (status == "jump" || status == "jumpSky") {
                this.speed.x = Math.abs(this.speed.x) || this.walkspeed;
            }
            this.scaleX = Math.abs(this.scaleX);
        } else if (key == "left") {
            if (status == "stand") {
                if (keys.leftRun) {
                    this.speed.x = -this.runspeed;
                    this.image.gotoAndPlay("run");
                } else {
                    this.speed.x = -this.walkspeed;
                    this.image.gotoAndPlay("walk")
                }
                keys.rightRun = keys.leftRun = false;
            } else if (status == "walk") {
                this.speed.x = -this.walkspeed;
            } else if (status == "run" && this.scaleX > 0) {
                this.speed.x = -this.walkspeed;
                this.image.gotoAndPlay("walk")
            }
            else if (status == "jump" || status == "jumpSky") {
                this.speed.x = -Math.abs(this.speed.x) || -this.walkspeed;
            }
            this.scaleX = -Math.abs(this.scaleX);
        }
        else {
            this.speed.x = 0;
            if (status == "walk" || status == "run") {
                this.image.gotoAndPlay("stand");
            }
        }
        var newRect = this.rect.clone();
        newRect.x += this.speed.x;
        var obstacle = game.hitMap(newRect);
        if (obstacle) {
            if (obstacle.death == true) {
                this.dispatchEvent(gframe.event.GAME_OVER, true);
            }
        } else {
            this.plus(this.speed.x * this.mult, 0);
        }
    }
    act() {
        this.moveY();
        this.moveX();
        var actor = game.hitActor(this);
        if (actor) {
            if (actor.type == "coin") {
                actor.parent.removeChild(actor);
                game.score += 20;
                game.scoreboard.update("score", game.score);
                if (!game.hasTypeOnWorld("coin")) {
                    this.dispatchEvent(gframe.event.LEVEL_UP, true);
                }
            } else if (actor.type == "big") {
                actor.parent.removeChild(actor);
                if (this.image.currentAnimation == "roll") {
                    this.image.gotoAndPlay("stand");
                    this.stopRoll();
                }
                this.plus(0, -this.rect.height * 0.1);
                let a = this.act;
                this.act = function () { };
                createjs.Tween.get(this).to({
                    scaleX: this.scaleX * 1.2,
                    scaleY: this.scaleY * 1.2
                }, 800, createjs.Ease.quadOut).call(() => {
                    this.rect.copy(this.getTransformedBounds());
                    this.act = a;
                });
            } else if (actor.type == "lava") {
                this.dispatchEvent(gframe.event.GAME_OVER, true);
            } else if (actor.type == "move" && this.speed.y >= 0 && this.y < actor.y) {
                this._hitMove = true;
                let newRect = this.rect.clone();
                newRect.x += actor.speed.x;
                let obstacle = game.hitMap(newRect);
                if (obstacle) {
                    if (obstacle.death == true) {
                        this.dispatchEvent(gframe.event.GAME_OVER, true);
                    }
                } else {
                    // this.setPos(this.x + actor.speed.x, actor.rect.y-this.getBounds().height/2*this.scale)
                    this.plus(actor.speed.x, 0)
                }
            }
        }
    }
}
class Barrage1 extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.speed.length = 5;
        var skilData = {
            images: [queue.getResult("guiqizhan")],
            frames: {
                width: 82,
                height: 83,
                regX: 41,
                regY: 41.5
            },
            animations: {
                run: [0, 3, "run", 0.1],
                hit: [4, 7, "", 0.3],
                run2: [8, 11, "run2", 0.3]
            }
        };
        this.init(0.7 * game.stepWidth, 0.7 * game.stepHeight);
        this.setSpriteData(new createjs.SpriteSheet(skilData), "run", 0.5);
    }
    act() {
        var obstacle = game.hitMap(this.rect);
        if (!obstacle) {
            let actor = game.hitActor(this);
            if (actor && actor.type == "lava") {
                this.recycle();
            } else {
                this.speed.truncate(this.maxSpeed);
                this.plus(this.speed.x, this.speed.y);
                if (game.outOfWin(this)) {
                    this.recycle()
                }
            }
        } else {
            this.recycle();
        }
    }
}

class Lava extends Actor {
    constructor(xpos, ypos, ch) {
        super(xpos, ypos);
        this.speed.length = 1.6;
        this.type = "lava";
        this.color = "rgb(255,100,100)";
        this.init(30, 30);
        if (ch == "=") {
        } else if (ch == "|") {
            this.speed.angle = Math.PI / 2;
        } else if (ch == "v") {
            this.speed.angle = Math.PI / 2;
            this.repeatPos = new Vector(this.x, this.y);
        }

    }
    act() {
        var newrect = this.rect.clone();
        newrect.x += this.speed.x;
        newrect.y += this.speed.y;
        if (!game.hitMap(newrect)) {
            this.plus(this.speed.x, this.speed.y);
        } else if (this.repeatPos) {
            this.setPos(this.repeatPos.x, this.repeatPos.y);
        } else {
            this.speed = this.speed.times(-1);
        }
    }
}
class MoveBrick extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.speed.length = 1.5;
        this.type = "move";
        this.color = "#0f0";
        this.init(90, 15);
    }
    act() {
        var newrect = this.rect.clone();
        newrect.x += this.speed.x;
        newrect.y += this.speed.y;
        if (!game.hitMap(newrect)) {
            this.plus(this.speed.x, this.speed.y);
        } else {
            this.speed = this.speed.times(-1);
        }
    }

}
class Coin extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.angleSpeed = 0.08;
        this.wobbleDist = 2.1;
        this.angle = Math.random() * Math.PI * 2;
        this.type = "coin";
        this.color = "rgb(241,229,89)";
        this.init(0.6 * 30, 0.6 * 30);
        this.y += 0.2 * 30;
        this.basePos = new Vector(this.x, this.y);
    }
    act() {
        this.image.rotation++;
        this.angle += this.angleSpeed;
        this.speed.y = Math.sin(this.angle) * this.wobbleDist;
        this.y = this.basePos.y + this.speed.y;
    }
}
class Big extends Coin {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.type = "big";
        this.scaleX = this.scaleY = 0.6;
    }

}