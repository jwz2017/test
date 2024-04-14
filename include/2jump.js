import { stage, keys, pressed, gframe, game, queue } from "../classes/gframe.js";
import { Vector, Actor, JumpActor } from "../classes/actor.js";
import { Sparkles } from "../classes/effect.js";
import { Node } from "../classes/Node.js";
import { LoaderBar, ScoreBoard, ScrollMapGame } from "../classes/Game.js";
class LoaderBar1 extends LoaderBar {
    constructor() {
        super("加载中...");
        this.title.y = -100;
        this.createTitle();
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
        this.bar.htmlElement.value = e.progress * 100;
        this.title.x = e.progress * this.width;
        this.percent.text = Math.floor(e.progress * 100) + "%";
    }
}
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas');
    // gframe.startFPS();
    gframe.preload(Jump, true);
};

//游戏变量;
var spriteSheet, bullets, step = 30, plans;
export class Jump extends ScrollMapGame {
    static LoaderBar = LoaderBar1;
    static loadBarItem = [{
        id: "loaderbar",
        src: "loaderbar/loaderbar.json",
        type: "spritesheet"
    }];
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
        super("Jump2", 750, 400, step, step);
        plans = queue.getResult("levels");
        this.instructionText = "方向:w,a,s,d <br>小键盘4567:普通攻击，跳跃，技能";
        this.backSound = createjs.Sound.createInstance("titlesound");
        this.titleSound = createjs.Sound.createInstance("titlesound");
        this.y = stage.height - this.height >> 1;
        this.maxLevel = plans.length;
        spriteSheet = queue.getResult("spritedata");
        this.playerChars["@"] = JumpPlayer;
        this.propChars["b"] = Big;
        this.propChars["o"] = Coin;
        this.enemyChars["m"] = MoveBrick;
        this.enemyChars["="] = Lava;
        this.enemyChars["|"] = Lava;
        this.enemyChars["v"] = Lava;
        this.sparkle = new Sparkles(queue.getResult("sparkle"), stage.width, this.y);
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard(0, 0, true);
        this.scoreboard.createTextElement(Jump.SCORE);
        this.scoreboard.createTextElement(Jump.LEVEL);
        this.scoreboard.createTextElement(Jump.LIVES);
    }
    newLevel() {
        this.scoreboard.update(Jump.SCORE, this.score);
        this.scoreboard.update(Jump.LEVEL, this.level);
        this.scoreboard.update(Jump.LIVES, this.lives);
        bullets = [];
        let plan = plans[this.level - 1];
        this.createGridMap(plan, (ch, node) => {
            let color = "#555";
            let shape = new createjs.Shape();
            this.addToFloor(shape);
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
            } else if (ch == "k") {
                node.type = Node.NOWALKABLE;
                let k = new K(node.x * step, node.y * step);
                node.actor = k;
                this.addToFloor(k);
            }
            shape.graphics.beginStroke(color).beginFill(color).drawRect(node.x * step, node.y * step, step, step);
        });
        this.setActorScroll(this.player, this.width / 3, this.height / 3);
    }
    waitComplete() {
        stage.addChild(this, this.sparkle);
    }

    runGame() {
        this.sparkle.addSparkles(3, Math.random() * stage.width, 0, 0.1)
        // 移动flayer层元素
        this.moveActors(this.playerLayer);
        //移动道具层元素
        this.moveActors(this.propLayer);
        //移动敌人层元素
        this.moveActors(this.enemyLayer);
        //滚动地图
        this.scrollView();
    }

}

class JumpPlayer extends JumpActor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 0.8 * step, 1.4 * step, true);
        this.type = "player";
        this.plus(0, -0.4 * step);
        this.setSpriteData(spriteSheet, "stand", 0.6, 0, 0, -2);
    }
    act() {
        this.moveY();
        this.moveX();
        this.chectHitEnemy();
    }
    //与敌人层碰撞
    chectHitEnemy() {
        var actor = this.hitActors(game.enemyChildren);
        if (actor) {
            if (actor.type == "lava") {
                game.gameOver = true;
            } else if (actor.type == "move" && this.speed.y >= Math.max(0, this.y - actor.rect.y)) {
                this._hitMove = true;
                if (this.status != "roll") this.setPos(this.rect.x, actor.rect.y - this.rect.height);
                let newRect = this.rect.clone();
                newRect.x += actor.speed.x;
                let node = game.hitMap(newRect);
                if (node) {
                    if (node.type == Node.DEATH) {
                        game.gameOver = true;
                    }
                } else {
                    this.plus(actor.speed.x, 0)
                }
            }
        }
    }
    //与道具层碰撞
    chectHitProp(node) {
        const actor = node.actor;
        if (actor.type == "coin") {
            game.score += 20;
            game.updateScore("score", game.score);
            actor.parent.removeChild(actor);
            node.actor = null;
            if (!game.hasTypeOnContainer("coin", game.propLayer)) {
                game.levelUp = true;
            }
        } else if (actor.type == "big") {
            actor.parent.removeChild(actor);
            node.actor = null;
            if (this.status == "roll") {
                this.stopAct();
            }
            this.y -= this.rect.height * 0.1001;
            let a = this.act;
            this.act = function () { };
            createjs.Tween.get(this).to({
                scaleX: this.scaleX * 1.2,
                scaleY: this.scaleY * 1.2
            }, 800, createjs.Ease.quadOut).call(() => {
                this.updateRect();
                this.act = a;
            });
        }
        node.type = null;
    }
    startFloorAct() {
        if (keys.jump) this.jump();
        else if (keys.attack) this.attack();
        else if (keys.skill1) this.skill1();
        else if (keys.down) this.roll();
        else if (keys.fire) this.fire(bullets, Barrage1, game.playerLayer);
    }
    startJumpAct() {
        if (keys.attack) this.jumpAttack();
    }
    changeAct() {
        if (!this.status) this.image.gotoAndPlay("stand");
        else if (this.status == "attack") {
            if (Math.random() > 0.5) {
                this.image.gotoAndPlay("attack1");
            } else {
                this.image.gotoAndPlay("attack2");
            }
        } else {
            this.image.gotoAndPlay(this.status);
        }
    }
    moveY() {
        this.speed.y += this.gravity;
        let rect = this.rect.clone();
        rect.y += this.speed.y;
        let node = game.hitMap(rect, null, 0, (node) => {
            this.chectHitProp(node);
        });
        if (node) {
            if (node.type == Node.DEATH) {
                game.gameOver = true;
            } else if (node.type == Node.NOWALKABLE) {
                this.hitFloor(node.costMultiplier);

            }
        }
        else if (this._hitMove) {
            this.hitFloor();
            this.plus(0, this.speed.y);
            this._hitMove = false;
        } else {
            this.overhead();
            this.startJumpAct();

        }
    }
    moveX() {
        this.walk(pressed[pressed.length - 1], keys);
        let rect = this.rect.clone();
        rect.x += this.speed.x;
        let node = game.hitMap(rect, null, 0, (node) => {
            this.chectHitProp(node);
        });
        if (node) {
            if (node.type == Node.DEATH) game.gameOver = true;
        } else this.plus(this.speed.x * this.friction, 0);
    }
}
class Barrage1 extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 0.7 * step, 0.7 * step);
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
        this.setSpriteData(new createjs.SpriteSheet(skilData), "run", 0.5);
    }
    act() {
        var node = game.hitMap(this.rect);
        if (!node) {
            let actor = this.hitActors(game.enemyChildren);
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
        super(xpos, ypos, step, step);
        this.speed.length = 1.6;
        this.type = "lava";
        this.color = "rgb(255,100,100)";
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
            this.x = this.repeatPos.x;
            this.y = this.repeatPos.y;
            this.updateRect();
        } else {
            this.speed.mul(-1);
        }
    }
}
class MoveBrick extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 90, 15);
        this.speed.length = 1.5;
        this.type = "move";
        this.color = "#0f0";
    }
    act() {
        var newrect = this.rect.clone();
        newrect.x += this.speed.x;
        newrect.y += this.speed.y;
        if (!game.hitMap(newrect)) {
            this.plus(this.speed.x, this.speed.y);
        } else {
            this.speed.mul(-1);
        }
    }

}
class Coin extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 0.6 * step, 0.6 * step);
        this.angleSpeed = 0.08;
        this.wobbleDist = 2.1;
        this.angle = Math.random() * Math.PI * 2;
        this.type = "coin";
        this.plus(0.2 * 30, 0.2 * 30);
        this.color = "rgb(241,229,89)";
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

//半高地图块
class K extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, step, 0.5 * step);
        this.plus(0, 0.5 * step);
        this.color = "#00f";
    }
}
