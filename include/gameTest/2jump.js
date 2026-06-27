import { stage, keys, pressed, gframe, game, queue, pressedOther } from "../../classes/gframe.js";
import { Vector, Actor, JumpActor } from "../../classes/actor.js";
import { Sparkles } from "../../classes/zujian/sparkles.js";
import { Node, ScrollMapGame } from "../../classes/Game.js";
import { Pannel } from "../../classes/dat.gui-pannel.js";
import { Fps, LoaderBar, ScoreBoard } from "../../classes/zujian/screen.js";
class LoaderBar1 extends LoaderBar {
    constructor() {
        super("加载中......");
    }
    createTitle(titleText, width) {
        this.title = this.createText(titleText);
        this.title.x = width - this.title.getBounds().width >> 1;
        let t = this.title;
        this.title = new createjs.Sprite(queue.getResult("loaderbar"), "title");
        this.title.regX = this.title.getBounds().width / 2;
        this.title.y = t.getBounds().height;
        this.addChild(this.title);
    }
    createValue(width, height) {
        this.value = new createjs.BitmapText("000%", queue.getResult("loaderbar"));
        this.addChild(this.value);
        this.value.x = width - this.value.getBounds().width >> 1;
        this.value.y = this.bar.y + height + 10;
    }
    startLoad(e) {
        this.bar.htmlElement.value = e.progress * 100;
        this.title.x = e.progress * this.bar.getBounds().width;
        this.value.text = Math.floor(e.progress * 100) + "%";
    }
}
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas', false);
    gframe.pannel = new Pannel(70, 120);
    gframe.preload(Jump);
    gframe.fps = new Fps();
};

//游戏变量;
var spriteSheet, step = 30, plans;
var stage1;
export class Jump extends ScrollMapGame {
    static LoaderBar = LoaderBar1;
    static backgroundColor = "#333";
    static loadBarItem = [{
        id: "loaderbar",
        src: "loaderbar/loaderbar.json",
        type: "spritesheet"
    }, {
        src: "fonts/regul-book.woff",
        type: "font",
    }, {
        src: "fonts/pf_ronda_seven.ttf",
        type: "font"
    }, {
        src: "fonts/regul-bold.woff",
        type: "font",
    }];
    static loadItem = [{
        id: "spritedata",
        src: "jump/spriteData.json",
        type: "spritesheet"
    }, {
        id: "guiqizhan",
        src: "../assets/jump/guiqizhan.png"
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
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
        32: "pause",
        100: "attack",
        101: "jump",
        102: "skill1",
        103: "fire",
        16: "shift",
        17: "ctrl"
    };
    constructor() {
        super("Jump02", 750, 400);
        plans = queue.getResult("levels");
        this.instructionText = "方向:w,a,s,d <br>小键盘4567:普通攻击，跳跃，技能";
        // this.backSound = createjs.Sound.createInstance("titlesound");
        this.y = stage.height - this.height >> 1;
        this.maxLevel = plans.length;
        spriteSheet = queue.getResult("spritedata");
        this.noMoveChars = {
            "b": Big,
            "o": Coin,
        };
        this.playerChars={
            "@": JumpPlayer,
        };
        this.moveChars = {
            "m": MoveBrick,
            "=": Lava,
            "|": Lava,
            "v": Lava
        };

        this.sparkle = new Sparkles(queue.getResult("sparkle"), stage.width, this.y);

        this.fader = new createjs.Shape();
        var gfx = this.fader.graphics;
        gfx.beginFill("rgba(0,0,0, 0.05)").drawRect(0, 0, this.width, this.height).endFill();
        this.fader.cache(0, 0, this.width, this.height)

        stage1 = new createjs.Stage("canvas1");
        stage.nextStage = stage1;
        createjs.Ticker.addEventListener("tick", stage1);
        stage1.x = this.x;
        stage1.y = this.y;
        this.player1 = new JumpPlayer();
    }
    newGame() {
        this.lives = 1;
        
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(Jump.SCORE);
        this.scoreboard.createTextElement(Jump.LEVEL);
        this.scoreboard.createTextElement(Jump.LIVES);
        this.scoreboard.x = 100
    }
    newLevel() {
        this.scoreboard.update(Jump.SCORE, this.score);
        this.scoreboard.update(Jump.LEVEL, this.level);
        this.scoreboard.update(Jump.LIVES, this.lives);
        let plan = plans[this.level - 1];
        this.createGridMap(plan, step, step, (ch, node) => {
            let color;
            let shape = new createjs.Shape();
            this.addToFloor(shape);
            switch (ch) {
                case "x":
                    node.type = Node.NOWALKABLE;
                    color = "#fff";
                    shape.graphics.beginStroke(color).beginFill(color).drawRect(node.x * step, node.y * step, step, step);
                    break;
                case "!":
                    node.type = Node.DEATH;
                    color = "rgb(255,100,100)";
                    shape.graphics.beginStroke(color).beginFill(color).drawRect(node.x * step, node.y * step, step, step);
                    break;
                case "y":
                    node.type = Node.NOWALKABLE;
                    node.costMultiplier = 0.5;
                    color = "#666";
                    shape.graphics.beginStroke(color).beginFill(color).drawRect(node.x * step, node.y * step, step, step);
                    break;
                case "k":
                    node.type = Node.NOWALKABLE;
                    node.actor = K.getActor();
                    node.actor.init(node.x * step, node.y * step)
                    this.addToFloor(node.actor);
                    break;
                default:
                    break;
            }
        });
        this.setActorScroll(this.player, this.width / 3, this.height / 3);
        this.scrollView();
        stage.addChild(this.fps)
        stage.addChild(this.sparkle);
    }
    waitComplete() {
        stage1.addChild(this.fader);
        stage1.addChild(this.player1);
        stage1.autoClear = false;
    }

    runGame() {
        // this.sparkle.addSparkles(3, Math.random() * stage.width, 0, 0.1)
        this.moveContainer(this.playerChildren);
        this.moveActors(Coin.array);
        this.moveActors(Big.array);
        this.moveContainer(this.moveLayer.children);
        this.scrollView();

        this.player1.image.gotoAndStop(this.player.image.currentFrame);
        this.player1.scaleX = this.player.scaleX;
        this.player1.x = this.player.x + this.scrollX;
        this.player1.y = this.player.y + this.scrollY;
    }
    clearBefore() {
        super.clearBefore();
        stage1.removeChild(this.fader)
        stage1.autoClear = true;
        stage1.removeChild(this.player1);
    }
}

class JumpPlayer extends JumpActor {
    static array = [];
    constructor() {
        super(0.8 * step, 1.4 * step);
        this.name = "player";
        // this.drawSpriteData(0.8 * step, 1.4 * step)
        this.setSpriteData(spriteSheet, "stand", { imageScale: 0.6, offsetY: -2, isinit: false });
    }
    init(xpos,ypos){
        super.init(xpos,ypos);
        this.plus(0,-0.4*step);
        this.image.gotoAndPlay("stand")
    }
    act() {
        this.moveY();
        this.moveX(pressed[pressed.length - 1], keys);
    }
    //与运动元素碰撞
    checkMoveProp() {
        let actor=this.hitActors(game.moveChildren);
        if(actor){
            if(actor.name=="lava")game.gameOver=true;
            else if(actor.name=="move") this.hitMoveFloor(actor);
        }
    }
    //与不动元素碰撞
    checkHitProp(node) {
        const actor = node.actor;
        if (actor.name == "coin") {
            game.score += 20;
            game.scoreboard.update("score", game.score);
            actor.parent.removeChild(actor);
            let a=game.hasParent(Coin.array);
            if (!a) {
                game.levelUp = true;
            }
            node.init();
        } else if (actor.name == "big") {
            actor.parent.removeChild(actor);
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
            node.init();
        }
    }
    startFloorAct() {
        if (keys.jump) this.jump();
        else if (keys.attack) this.attack();
        else if (pressedOther[pressedOther.length - 1] == "skill1") {
            this.skill1();
            pressedOther.splice(pressedOther.indexOf("skill1"), 1);
        }
        else if (pressed[pressed.length - 1] == "down") {
            this.roll();
            pressed.splice(pressed.indexOf("down"), 1)
        }
        else if (keys.fire) this.fire(Barrage1);
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
}

class Barrage1 extends Actor {
    static array = [];
    constructor() {
        super(0.7 * step, 0.7 * step);
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
        this.setSpriteData(new createjs.SpriteSheet(skilData), "run", { imageScale: 0.5 });
    }
    init(){
        
    }
    act() {
        var node = game.hitMap(this.rect);

        if (!node) {
            let actor = this.hitActors(Lava.array);
            if (actor) {
                this.recycle();
            } else {
                this.plus(this.speed.x, this.speed.y);
                if (this.outOfBounds()) {
                    this.recycle()
                }
            }
        } else {
            this.recycle();
        }
    }
}

class Lava extends Actor {
    constructor() {
        super(step, step);
        this.speed.length = 1.6;
        this.name = "lava";
        this.drawSpriteData(step, step, "rgb(255,100,100)");
    }
    init(xpos,ypos,ch){
        super.init(xpos,ypos);
        if (ch == "=") {
            this.speed.angle=0;
            this.repeatPos=null;
        } else if (ch == "|") {
            this.speed.angle = Math.PI / 2;
            this.repeatPos=null;
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
    constructor() {
        super(90, 15);
        this.speed.length = 1.5;
        this.name = "move";
        this.drawSpriteData(90, 15, "#0f0");
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
    hitRun(actor) {
        actor.offSpeedX = this.speed.x;
    }
}
class Coin extends Actor {
    constructor() {
        super(0.6 * step, 0.6 * step);
        this.drawSpriteData(0.6 * step, 0.6 * step, "rgb(241,229,89)");
        this.angleSpeed = 0.08;
        this.wobbleDist = 2.1;
        this.name = "coin";
    }
    init(xpos,ypos){
        super.init(xpos,ypos);
        this.plus(0.2 * 30, 0.2 * 30);
        this.image.rotation=0;
        this.basePos = new Vector(this.x, this.y);
        this.angle = Math.random() * Math.PI * 2;

    }
    act() {
        this.image.rotation++;
        this.angle += this.angleSpeed;
        this.speed.y = Math.sin(this.angle) * this.wobbleDist;
        this.y = this.basePos.y + this.speed.y;
    }
}
class Big extends Coin {
    static array = [];
    constructor() {
        super();
        this.name = "big";
    }
    init(xpos,ypos){
        super.init(xpos,ypos);
        this.scale=0.6;
    }
}

//半高地图块
class K extends Actor {
    constructor() {
        super();
        this.drawSpriteData(step, 0.5 * step, "#fff");
    }
    init(xpos,ypos){
        this.setPos(xpos,ypos);
        this.plus(0, 0.5 * step);
    }
}
