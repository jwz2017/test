import { stage, keys, pressed, gframe, game, queue } from "../classes/gframe.js";
import { GridsMapGame, Node } from "../classes/GridsMapGame.js";
import { Vector, Actor } from "../classes/actor.js";
import { Sparkles } from "../classes/effect.js";
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas');
    gframe.createQueue();
    queue.loadFile({
        id: "loaderbar",
        src: "loaderbar/loaderbar.json",
        type: "spritesheet"
    });
    queue.on("complete", () => {
        gframe.loaderBar = new LoaderBar1();
        gframe.preload(Jump);
        gframe.startFPS();
    }, null, true);
};
//游戏变量;
var spriteSheet,
    actorChars,
    bullets,
    step = 30,
    winWidth = 750,
    winHeight = 400,
    plans;

export class Jump extends GridsMapGame {
    static loadItem = [{
        id: "spritedata",
        src: "jump/spriteData.json",
        type: "spritesheet"
    }, {
        id: "guiqizhan",
        src: "jump/guiqizhan.png"
    }, {
        id: "sparkle",
        src: "effect/sparkles.json",
        type: "spritesheet"
    }, {
        id: "levels",
        src: "jump/levels.json"
    }, {
        id: "titlesound",
        src: "sounds/sister.mp3"
    }];
    constructor() {
        plans = queue.getResult("levels");
        super("Jump2", winWidth, winHeight, step, step, 0, 0, { titleSoundId: "titlesound", backSoundId: "titlesound" });
        this.keyboard = true;
        this.instructionScreen.title.text = "方向w,a,s,d 小键盘 4567普通攻击，跳跃，技能";
        this.maxLevel = plans.length;
        this.backSound = createjs.Sound.createInstance("titlesound");
        this.y = stage.height - this.height >> 1;
        spriteSheet = queue.getResult("spritedata");
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
        // console.log(this.scoreboard.children[0],this.scoreboard.tickChildren);
    }
    newLevel() {
        this.scoreboard.update(gframe.Game.SCORE, this.score);
        this.scoreboard.update(gframe.Game.LEVEL, this.level);
        this.scoreboard.update(gframe.Game.LIVES, this.lives);
        bullets = [];
        let plan = plans[this.level - 1];
        game.createGridMap(plan, actorChars, (ch, node) => {
            let color = "#555";
            let shape = new createjs.Shape();
            if (ch == "x") {
                node.type = Node.NOWALKABLE;
                color = "#fff";
            } else if (ch == "!") {
                node.type = Node.DEATH;
                color = "rgb(255,100,100)";
            } else if (ch == "y") {
                node.type = Node.NOWALKABLE;
                color = "#666";
                node.costMultiplier = 0.5;
            }
            shape.graphics.beginStroke(color).beginFill(color).drawRect(node.x * step, node.y * step, step, step);
            this.addChildToFloor(shape);
        });
    }
    waitComplete() {
        stage.addChild(this, this.sparkle);
        this.scrollPlayerIntoView(this.player);
    }

    runGame() {
        this.sparkle.addSparkles(3, Math.random() * stage.width, 0, 0.1)
        // 渲染actors
        this.moveActors();
        //滚动地图
        this.scrollPlayerIntoView(this.player);
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
        this.init(0.8 * 30, 1.6 * 30);
        this.plus(0, -0.6 * 30);
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
        let node = game.hitMap(this.rect);
        if (node) {
            this.setPos(this.oldPos.x, this.oldPos.y);
        }
    }
    moveY() {
        this.speed.y += this.gravity;
        var newRect = this.rect.clone();
        newRect.y += this.speed.y;
        var node = game.hitMap(newRect);
        if (node) {
            if (node.type == Node.DEATH) {
                game.clear(gframe.event.GAME_OVER);
                return;
            }
            this.mult = node.costMultiplier;
        }
        if (node || this._hitMove) {
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
        let idle = status == "stand" || status == "walk" || status == "run" || status == "jump" || status == "jumpSky";
        let key = pressed[pressed.length - 1];
        if (status == "roll") { }
        else if (key == "right" || key == "left") {
            let a=key=="right";
            if (status == "stand") {
                if (keys.rightRun) {
                    this.speed.x = this.runspeed;
                    this.image.gotoAndPlay("run");
                } else if (keys.leftRun) {
                    this.speed.x = -this.runspeed;
                    this.image.gotoAndPlay("run");
                } else if (key == "right") {
                    this.speed.x = this.walkspeed;
                    this.image.gotoAndPlay("walk")
                } else {
                    this.speed.x = -this.walkspeed;
                    this.image.gotoAndPlay("walk")
                }
                keys.rightRun = keys.leftRun = false;
            } else if (status == "walk") {
                this.speed.x=a?this.walkspeed:-this.walkspeed;
            } else if (status == "run") {
                if (this.scaleX < 0 && key == "right") {
                    this.speed.x = this.walkspeed;
                    this.image.gotoAndPlay("walk")
                } else if (this.scaleX > 0 && key == "left") {
                    this.speed.x = -this.walkspeed;
                    this.image.gotoAndPlay("walk")
                }
            }
            else if (status == "jump" || status == "jumpSky") {
                this.speed.x=a?Math.abs(this.speed.x) || this.walkspeed:-Math.abs(this.speed.x) || -this.walkspeed
            }
            else if (!idle) this.speed.x = 0;
            this.scaleX = key == "right"? Math.abs(this.scaleX) : -Math.abs(this.scaleX);
        } else {
            this.speed.x = 0;
            if (status == "walk" || status == "run")this.image.gotoAndPlay("stand");
        }
        var newRect = this.rect.clone();
        newRect.x += this.speed.x;
        var node = game.hitMap(newRect);
        if (node) {
            if (node.type == Node.DEATH) {
                game.clear(gframe.event.GAME_OVER);
            }
        } else {
            this.plus(this.speed.x * this.mult, 0);
        }
    }
    act() {
        this.moveY();
        this.moveX();
        // var actor = game.hitActor(this);
        var actor = this.hitActors(game.world.children);
        if (actor) {
            if (actor.type == "coin") {
                actor.parent.removeChild(actor);
                game.score += 20;
                game.scoreboard.update("score", game.score);
                if (!game.hasTypeOnContainer("coin")) {
                    game.clear(gframe.event.LEVEL_UP);
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
                game.clear(gframe.event.GAME_OVER);
            } else if (actor.type == "move" && this.speed.y >= 0 && this.y < actor.y) {
                this._hitMove = true;
                let newRect = this.rect.clone();
                newRect.x += actor.speed.x;
                let node = game.hitMap(newRect);
                if (node) {
                    if (node.type == Node.DEATH) {
                        game.clear(gframe.event.GAME_OVER);
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
        var node = game.hitMap(this.rect);
        if (!node) {
            let actor = this.hitActors(game.world.children);
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
        this.plus(0.2 * 30, 0.2 * 30);
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
class LoaderBar1 extends gframe.LoaderBar {
    constructor() {
        super();
    }
    createTitle() {
        this.title = new createjs.Sprite(queue.getResult("loaderbar"), "title");
        this.title.regY = this.title.getBounds().height;
        this.title.regX = this.title.getBounds().width / 2;
        this.addChild(this.title);
    }
    createValue() {
        this.percent = new createjs.BitmapText("0%", queue.getResult("loaderbar"));
        this.percent.regX = this.percent.getBounds().width / 2;
        this.percent.x = this.width / 2 - 10;
        this.percent.y = this.height + 10;
        this.addChild(this.percent);
    }
    startLoad(e) {
        super.startLoad(e);
        this.title.x = this.bar.scaleX;
    }

}
