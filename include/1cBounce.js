import { Actor, BounceActor, CirActor } from "../classes/actor.js";
import {GridsMapGame, Node } from "../classes/GridsMapGame.js";
import { game, gframe, pressed, stage } from "../classes/gframe.js";

window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(Bounce,true);
    gframe.startFPS();
};
var bricks,
    actorChars,
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

class Bounce extends GridsMapGame {
    constructor() {
        stage.canvas.style.background=gframe.style.SCOREBOARD_COLOR;
        super("弹球06",plans[0][0].length * stepWidth, plans[0].length * stepHeight, stepWidth, stepHeight);
        this.x = stage.width - this.width >> 1;
        this.y=this.scoreboard.height;
        this.maxLevel = plans.length;
        actorChars = {
            "@": Pandle,
            "p": Puck,
            "/": AngleBounce
        }
        this.backshape= new createjs.Shape;
        this.backshape.graphics.clear().beginFill("#fff").drawRect(0, 0, this.width, this.height);
        this.addChildAt(this.backshape,0);
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0,0,true);
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement("lives");
        this.scoreboard.placeElements();
    }
    newLevel() {
        this.scoreboard.update("score",this.score);
        this.scoreboard.update("level",this.level);
        this.scoreboard.update("lives",this.lives);
        bricks = [];
        let plan = plans[this.level - 1];
        this.createGridMap(plan, actorChars, (ch, node) => {
            if (ch == "w") {
                node.type = Node.NOWALKABLE;
                let bg = new Actor(node.x * stepWidth, node.y * stepHeight);
                bg.init(stepWidth, stepHeight);
                this.addChildToFloor(bg);
            } else if (ch == "x" || ch == "l") {
                node.type = "brick";
                let fieldType = new Brick(node.x * stepWidth, node.y * stepHeight, ch);
                node.brick = fieldType;
                bricks.push(fieldType);
                this.addChildToFloor(fieldType);
            }
        });
        
    }
    runGame() {
        // console.time("a");
        this.moveActors();
        // console.timeEnd("a");
    }
}

class Pandle extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.type = "player";
        this.color = "#555";
        this.xspeed = 7.5;
        this.init(150, 15);
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
        if (!game.hitMap(rect)) {
            this.plus(this.speed.x, 0);
        }
    }
}
class Puck extends CirActor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.speedlength = 7;
        this.speed.length = this.speedlength;
        this.init(15, 15);
        this.speed.angle = Math.PI / 2;
        this.combo = 0;
        this.homePos = this.rect.clone();
    }
    act() {
        this.moveX();
        this.moveY();
        var actor = this.hitActors(game.world.children);
        if (actor) this.hitResult(actor);
    }
    moveX() {
        let rect = this.rect.clone();
        rect.x += this.speed.x;
        var fieldType = game.hitMap(rect);
        if (!fieldType) {
            this.plus(this.speed.x, 0);
        } else if (fieldType.type=="brick") {
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
                game.scoreboard.update("lives",game.lives);
            } else {
                game.clear(gframe.event.GAME_OVER);
            }
        } else if (fieldType.type=="brick") {
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
            game.addChild(combotex);
            createjs.Tween.get(combotex).to({
                alpha: 1,
                scaleY: 2,
                scaleX: 2,
                y: combotex.y - 60
            }, 1000).call(() => {
                game.removeChild(combotex);
            });
        }
        game.scoreboard.update("score",game.score)
        if (fieldType.type == "live") {
            game.lives++;
            game.scoreboard.update("lives",game.lives);
        }
        bricks.splice(bricks.indexOf(fieldType), 1);
        fieldType1.type = Node.WALKABLE;
        fieldType.parent.removeChild(fieldType);
        game.floor.updateCache();
        if (bricks.length == 0) {
            game.clear(gframe.event.LEVEL_UP);
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
        super(xpos, ypos);
        if (ch == "x") {
            this.color = createjs.Graphics.getHSL(Math.cos((count++) * 0.1) * 30 + colorOffse,
                80,
                35,
                1);
            this.type = "brick";
            this.init(stepWidth, stepHeight);
        } else if (ch == "l") {
            this.color = "#595";
            this.type = "live";
            this.init(stepWidth, stepHeight);
            var text = new createjs.Text('1Up', "24px Times", '#fff');
            text.textAlign = "center";
            text.textBaseline = "middle";
            this.addChild(text);
        }
    }
}
class AngleBounce extends BounceActor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.init(200, 20);
        // this.setRotation(30);
    }

}
