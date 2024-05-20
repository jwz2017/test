import { Actor, BounceActor, CirActor } from "../classes/actor.js";
import { game, gframe, pressed, stage } from "../classes/gframe.js";
import { Game, ScoreBoard } from "../classes/Game.js";
import { Node } from "../classes/Node.js";

window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(Bounce);
};
var bricks,
    stepWidth = 44,
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
    }
    constructor() {
        super("弹球06",false, plans[0][0].length * stepWidth, plans[0].length * stepHeight, stepWidth, stepHeight);
        this.x = stage.width - this.width >> 1;
        this.maxLevel = plans.length;
        this.playerChars = {
            "p": Puck,
            "/": AngleBounce,
            "@": Pandle
        }
        this.backshape = new createjs.Shape;
        this.backshape.graphics.clear().beginFill("#fff").drawRect(0, 0, this.width, this.height);
        this.addChildAt(this.backshape, 0);
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement("lives");
        this.y = this.scoreboard.getBounds().height;
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        this.scoreboard.update("lives", this.lives);
        bricks = [];
        let plan = plans[this.level - 1];
        this.createGridMap(plan, (ch, node) => {
            if (ch == "w") {
                node.type = Node.NOWALKABLE;
                let bg = new Actor(node.x * stepWidth, node.y * stepHeight,stepWidth,stepHeight);
                this.addToFloor(bg)
            } else if (ch == "x" || ch == "l") {
                node.type = Node.NOWALKABLE;
                let fieldType = new Brick(node.x * stepWidth, node.y * stepHeight, ch);
                node.brick = fieldType;
                bricks.push(fieldType);
                this.addToEnemy(fieldType)
            }
        });

    }
    runGame() {
        this.moveActors(this.enemyLayer);
        this.moveActors(this.playerLayer);
    }
}

class Pandle extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 150, 15);
        this.type = "player";
        this.xspeed = 7.5;
        this.color = "#555";
    }
    act() {
        this.moveX();
    }
    moveX() {
        this.speed.x = 0;
        if (pressed[pressed.length - 1] == "left") {
            this.speed.x = -this.xspeed;
        } else if (pressed[pressed.length - 1] == "right") {
            this.speed.x = this.xspeed;
        }
        var rect = this.rect.clone();
        rect.x += this.speed.x;
        rect.y += this.speed.y;
        if(!game.hitBounds(rect)){
            this.plus(this.speed.x,0);
        }
    }
}
class Puck extends CirActor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 8);
        this.speedlength = 7;
        this.speed.length = this.speedlength;
        this.speed.angle = Math.PI / 2;
        this.combo = 0;
        this.homePos = this.rect.clone();
    }
    act() {
        this.moveX();
        this.moveY();
        var actor = this.hitActors(game.playerChildren);
        if (actor) this.hitResult(actor);
    }
    moveX() {
        let rect = this.rect.clone();
        rect.x += this.speed.x;
        var fieldType = game.hitMap(rect);
        if (!fieldType) {
            this.plus(this.speed.x, 0);
        } else if (fieldType.brick) {
            this.speed.x *= -1;
            this.hitBrickResult(fieldType);
        } else {
            this.combo = 0;
            this.speed.x *= -1;
        }
    }
    moveY() {
        let rect = this.rect.clone();
        rect.y += this.speed.y;
        var fieldType = game.hitMap(rect);
        if (!fieldType) {
            this.plus(0, this.speed.y);
        } else if (fieldType.type == Node.DEATH) {
            game.lives--;
            if (game.lives > 0) {
                this.setPos(this.homePos.x, this.homePos.y);
                this.speed.length = this.speedlength;
                this.speed.angle = Math.PI / 2;
                game.scoreboard.update("lives", game.lives);
            } else {
                game.gameOver = true;
            }
        } else if (fieldType.brick) {
            this.speed.y *= -1;
            this.hitBrickResult(fieldType);
        } else {
            this.combo = 0;
            this.speed.y *= -1;
        }
    }
    hitBrickResult(fieldType1) {
        let fieldType = fieldType1.brick;
        this.combo++;
        game.score++;
        let rect = fieldType.rect;
        if (this.combo > 4) {
            game.score += (this.combo * 10);
            let combotex = new createjs.Text('combo x' + (this.combo * 10), '14px Times', '#ff0000');
            combotex.regX = combotex.getBounds().width / 2;
            combotex.regY = combotex.getBounds().height / 2;
            combotex.x = fieldType.x + rect.width / 2;
            combotex.y = fieldType.y + rect.height / 2;
            combotex.alpha = 0;
            game.addToProp(combotex);
            createjs.Tween.get(combotex).to({
                alpha: 1,
                scaleY: 2,
                scaleX: 2,
                y: combotex.y - 60
            }, 1000).call(() => {
                game.propLayer.removeChild(combotex);
            });
        }
        game.scoreboard.update("score", game.score)
        if (fieldType.type == "live") {
            game.lives++;
            game.scoreboard.update("lives", game.lives);
        }
        bricks.splice(bricks.indexOf(fieldType), 1);
        fieldType1.type =null;
        fieldType.parent.removeChild(fieldType);
        if (bricks.length == 0) {
            game.levelUp = true;
        }
    }

    hitResult(actor) {
        let rect = this.rect;
        if (actor.type == "player") {
            let rect1 = actor.rect;
            this.combo = 0;
            this.speed.length = this.speedlength + Math.abs(rect.x - rect1.x - rect1.width / 2) * 0.15;
            this.speed.angle = 210 * Math.PI / 180 + (rect.x - rect1.x) / rect1.width * 120 * Math.PI / 180;
        } else if (actor.type == "angleBounce") {
            actor.hitAngleBounce(this);
        }
    }
}
class Brick extends Actor {
    constructor(xpos, ypos, ch) {
        super(xpos, ypos, stepWidth, stepHeight);
        if (ch == "x") {
            this.color = createjs.Graphics.getHSL(Math.cos((count++) * 0.1) * 30 + colorOffse,
                80,
                35,
                1);
            this.type = "brick";
        } else if (ch == "l") {
            this.color = "#595";
            this.type = "live";
            var text = new createjs.Text('1Up', "24px Times", '#fff');
            text.textAlign = "center";
            text.textBaseline = "middle";
            this.addChild(text);
        }
    }
}
class AngleBounce extends BounceActor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 200, 10);
        this.setRotation(15);
    }
    drawShape(width, height) {
        this.image.graphics.clear().beginFill(this._color).drawRect(0, 0, width, height);
        this.image.setBounds(0, 0, width, height);
    }
}
