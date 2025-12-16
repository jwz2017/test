import { Actor, BounceActor, CirActor } from "../../classes/actor.js";
import { game, gframe, pressed, stage } from "../../classes/gframe.js";
import { Game, Node } from "../../classes/Game.js";
import { Fps, ScoreBoard } from "../../classes/zujian/screen.js";
import { floorMove } from "../../classes/moveManage/move.js";

window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(Bounce);
    gframe.fps = new Fps();
};
var stepWidth = 44,
    stepHeight = 30,
    colorOffse = Math.random() * 360,
    count = 0,
    plans = [
        [
            "xxxlxxxx x x   ",
            "               ",
            "  xw wxxxx xx  ",
            "               ",
            "xxxxlxx   w w  ",
            "               ",
            "x    xx        ",
            "               ",
            "xxlxxxx        ",
            "            xlx",
            "     xx        ",
            " x           xx",
            "       p       ",
            "               ",
            "               ",
            "  /            ",
            "               ",
            "               ",
            "               ",
            "               ",
            "               ",
            "               ",
            "               ",
            "      @        "
        ]
    ];

class Bounce extends Game {
    static codes = {
        65: "left",
        68: "right",
        32: "pause",
    }
    static backgroundColor = "#555"
    constructor() {
        super("弹球06", plans[0][0].length * stepWidth, plans[0].length * stepHeight);
        this.x = stage.width - this.width >> 1;
        this.maxLevel = plans.length;
        this.moveChars = {
            "p": Puck,
            "/": AngleBounce,
            "@": Pandle
        }
        this.backshape = new createjs.Shape;
        this.backshape.graphics.clear().beginFill("#222").drawRect(0, 0, this.width, this.height);
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement("lives");
        let b = this.scoreboard.getBounds();
        this.scoreboard.x = stage.width - b.width >> 1;
        this.y = b.height;
    }
    newGame() {
        this.lives = 3;
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        this.scoreboard.update("lives", this.lives);
        let plan = plans[this.level - 1];
        this.addToFloor(this.backshape);
        this.createGridMap(plan, stepWidth, stepHeight, (ch, node) => {
            if (ch == "w") {
                node.type = Node.NOWALKABLE;
                let bg = new Actor();
                bg.init(node.x * stepWidth, node.y * stepHeight)
                bg.drawSpriteData(stepWidth, stepHeight)
                this.addToFloor(bg)
            } else if (ch == "x" || ch == "l") {
                node.type = Node.NOWALKABLE;
                node.actor = Brick.getActor();
                node.actor.init(node.x * stepWidth, node.y * stepHeight, ch)
                this.container.addChild(node.actor)
            }
        });
    }
    runGame() {
        this.moveActors(this.moveChildren);
    }
}

class Pandle extends Actor {
    constructor() {
        super();
        this.name = "player";
        this.xspeed = 7.5;
        this.drawSpriteData(150, 15);
        this.color = "#555";
    }
    act() {
        this.moveX();
    }
    moveX() {
        floorMove(this, this.xspeed, pressed[pressed.length - 1])
        var rect = this.rect.clone();
        rect.x += this.speed.x;
        rect.y += this.speed.y;
        if (!this.hitBounds(rect)) {
            this.plus(this.speed.x, 0);
        }
    }
}
class Puck extends CirActor {
    constructor() {
        super();
        this.drawSpriteData(16)
    }
    init(xpos, ypos) {
        super.init(xpos, ypos);
        this.speedlength = 7;
        this.speed.length = 7;
        this.speed.angle = Math.PI / 2;
        this.combo = 0;
        this.homePos = this.rect.clone();
    }
    act() {
        this.moveX();
        this.moveY();
        var actor = this.hitActors(game.moveChildren);
        if (actor) {
            let rect = this.rect;
            if (actor.name == "player") {
                let rect1 = actor.rect;
                this.combo = 0;
                this.speed.length = this.speedlength + Math.abs(rect.x - rect1.x - rect1.width / 2) * 0.15;
                this.speed.angle = 210 * Math.PI / 180 + (rect.x - rect1.x) / rect1.width * 120 * Math.PI / 180;
            } else if (actor.name == "angleBounce") {
                actor.hitAngleBounce(this);
            }
        }
    }
    moveX() {
        let rect = this.rect.clone();
        rect.x += this.speed.x;
        var node = game.hitMap(rect);
        if (!node) {
            this.plus(this.speed.x, 0);
        } else if (node.actor) {
            this.speed.x *= -1;
            this.hitBrickResult(node);
        } else {
            this.combo = 0;
            this.speed.x *= -1;
        }
    }
    moveY() {
        let rect = this.rect.clone();
        rect.y += this.speed.y;
        var node = game.hitMap(rect);
        if (!node) {
            this.plus(0, this.speed.y);
        } else if (node.type == Node.DEATH) {
            game.lives--;
            if (game.lives > 0) {
                this.setPos(this.homePos.x, this.homePos.y);
                this.speed.length = this.speedlength;
                this.speed.angle = Math.PI / 2;
                game.scoreboard.update("lives", game.lives);
            } else {
                game.gameOver = true;
            }
        } else if (node.actor) {
            this.speed.y *= -1;
            this.hitBrickResult(node);
        } else {
            this.combo = 0;
            this.speed.y *= -1;
        }
    }
    hitBrickResult(node) {
        let actor = node.actor;
        this.combo++;
        game.score++;
        if (this.combo > 4) {
            game.score += (this.combo * 10);
            let combotex = new createjs.Text('combo x' + (this.combo * 10), '14px Times', '#ff0000');
            combotex.regX = combotex.getBounds().width / 2;
            combotex.regY = combotex.getBounds().height / 2;
            combotex.x = actor.x;
            combotex.y = actor.y;
            combotex.alpha = 0;
            game.container.addChild(combotex);
            createjs.Tween.get(combotex).to({
                alpha: 1,
                scaleY: 2,
                scaleX: 2,
                y: combotex.y - 60
            }, 1000).call(() => {
                game.container.removeChild(combotex);
            });
        }
        game.scoreboard.update("score", game.score)
        if (actor.name == "live") {
            game.lives++;
            game.scoreboard.update("lives", game.lives);
        }
        node.init();
        actor.parent.removeChild(actor);
        if (!game.hasParent(Brick.array)) {
            game.levelUp = true;

        }
    }
}
class Brick extends Actor {
    constructor() {
        super();
    }
    init(xpos, ypos, ch) {
        super.init(xpos, ypos);
        if(this.text){
            this.removeChild(this.text);
            this.text=null;
        }
        if (ch == "x") {
            this._color = createjs.Graphics.getHSL(Math.cos((count++) * 0.1) * 30 + colorOffse,
                80,
                35,
                1);
            this.name = "brick";
            this.drawSpriteData(stepWidth, stepHeight)
        } else if (ch == "l") {
            this._color = "#595";
            this.drawSpriteData(stepWidth, stepHeight)
            this.name = "live";
            this.text = new createjs.Text('1Up', "24px Times", '#fff');
            this.text.textAlign = "center";
            this.text.textBaseline = "middle";
            this.addChild(this.text);
        }
        this.setRotation(5)
    }
}
class AngleBounce extends BounceActor {
    constructor() {
        super();
        this.drawSpriteData(200, 10);
    }
    init(xpos, ypos) {
        super.init(xpos, ypos);
        this.setRotation(15);
    }
}
