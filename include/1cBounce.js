window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.preload(Bounce);
    g.startFPS();
};
(function () {
    "use strict";
    //游戏变量;
    const SCORE = "Score",
        LEVEL = "level",
        LIVES = "lives";

    var score, lives, bricks, container,
        actorChars,
        stepWidth=50,
        stepHeight=30,
        colorOffse = Math.random() * 360,
        count = 0,
        plans=[
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
                "      @        "
            ]
        ];

    class Bounce extends Game {
        constructor() {
            super("弹球06");
        }
        init() {
            this.maxLevel = plans.length;
            actorChars = {
                "@": Pandle,
                "p": Puck,
                "/": AngleBounce
            }
            container = new GridsMap(0, GFrame.style.SCOREBOARD_HEIGHT, width, height, stepWidth, stepHeight);

        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard();
            this.scoreBoard.createTextElement(SCORE, '0', 10, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 300, 14);
            this.scoreBoard.createTextElement(LIVES, '5', 590, 14);
        }
        newGame() {
            score = 0;
            lives = 5;
            this.scoreBoard.update(SCORE, score);
            this.scoreBoard.update(LIVES, lives);
        }
        newLevel() {
            bricks = [];
            this.scoreBoard.update(LEVEL, this.level);
            let plan = plans[this.level - 1];
            container.createGridMap(plan, actorChars, (ch, xpos, ypos) => {
                var fieldType = null;
                if (ch == "w") {
                    fieldType = "wall";
                    let bg = new Actor(xpos, ypos);
                    bg.init(stepWidth,stepHeight);
                    container.addChild(bg);
                } else if (ch == "x" || ch == "l") {
                    fieldType = new Brick(xpos, ypos, ch);
                    bricks.push(fieldType);
                    container.addChild(fieldType);
                }
                return fieldType;
            });

        }
        waitComplete() {
            container.player.pos.y=height-GFrame.style.SCOREBOARD_HEIGHT-container.player.size.y;
            container.player.update();
            stage.addChild(container, this.scoreBoard);
        }
        runGame() {
            // console.time("a");
            let l=container.actors.length;
            for (let i = l - 1; i >= 0; i--) {
                const actor = container.actors[i];
                actor.act();
            }
            // console.timeEnd("a");
        }
        clear() {
            container.clear();
        }
    }
    window.Bounce = Bounce;

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
            var newPos = this.pos.plus(this.speed);
            if (!this.hitBounds(newPos)) {
                this.pos = newPos;
                this.update();
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
            this.homePos = this.pos.clone();
        }
        act() {
            this.moveX();
            this.moveY();
            this.update();
            var actor = this.hitActors(container.actors);
            if (actor) {
                this.hitResult(actor);
            }
        }
        moveX() {
            var newPos = this.pos.plus(new Vector(this.speed.x, 0));
            var fieldType = container.hitMap(this.size,newPos);
            if (!fieldType) {
                this.pos = newPos;
            } else if (fieldType == "wall") {
                this.combo = 0;
                this.speed.x *= -1;
            } else if (fieldType.type == "brick" || fieldType.type == "live") {
                this.speed.x *= -1;
                this.hitBrickResult(fieldType);
            }
        }
        moveY() {
            var newPos = this.pos.plus(new Vector(0, this.speed.y));
            var fieldType = container.hitMap(this.size,newPos);
            if (!fieldType) {
                this.pos = newPos;
            } else if (fieldType == "wall") {
                this.combo = 0;
                this.speed.y *= -1;
            } else if (fieldType == "lava") {
                if (lives > 0) {
                    this.pos = this.homePos;
                    this.speed.length = this.speedlength;
                    this.speed.angle = Math.PI / 2;
                    // this.speedRate = this.av;
                    // this.angle = 90;
                    lives--;
                    this.dispatchEvent(new ScoreUpdate(LIVES, lives));
                } else {
                    this.dispatchEvent(GFrame.event.GAME_OVER,true);
                }
            } else if (fieldType.type == "brick" || fieldType.type == "live") {
                this.speed.y *= -1;
                this.hitBrickResult(fieldType);
            }
        }
        hitBrickResult(fieldType) {
            this.combo++;
            score++;
            if (this.combo > 4) {
                score += (this.combo * 10);
                let combotex = new createjs.Text('combo x' + (this.combo * 10), '14px Times', '#ff0000');
                combotex.regX = combotex.getBounds().width / 2;
                combotex.regY = combotex.getBounds().height / 2;
                combotex.x = fieldType.x + fieldType.size.x / 2;
                combotex.y = fieldType.y + fieldType.size.y / 2;
                combotex.alpha = 0;
                this.parent.addChild(combotex);
                createjs.Tween.get(combotex).to({
                    alpha: 1,
                    scaleY: 2,
                    scaleX: 2,
                    y: combotex.y - 60
                }, 1000).call(() => {
                    this.parent.removeChild(combotex);
                });
            }
            this.dispatchEvent(new ScoreUpdate(SCORE, score));
            if (fieldType.type == "live") {
                lives++;
                this.dispatchEvent(new ScoreUpdate(LIVES, lives));
            }
            bricks.splice(bricks.indexOf(fieldType), 1);
            container.grids[fieldType.pos.y / stepHeight][fieldType.pos.x / stepWidth] = null;
            fieldType.parent.removeChild(fieldType);
            if (bricks.length == 0) {
                this.dispatchEvent(GFrame.event.LEVEL_UP,true);
            }
        }

        hitResult(actor) {
            if (actor.type == "player") {
                this.combo = 0;
                this.speed.length = this.speedlength + Math.abs(this.pos.x - actor.pos.x - actor.size.x / 2) * 0.15;
                this.speed.angle = 210 * Math.PI / 180 + (this.pos.x - actor.pos.x) / actor.size.x * 120 * Math.PI / 180;
            } else if (actor.type == "angleBounce") {
                this.hitAngleBounce(actor);
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
            } else if (ch == "l") {
                this.color = "#595";
                this.type = "live";
                var text = new createjs.Text('1Up', "24px Times", '#fff');
                text.textAlign = "center";
                text.textBaseline = "middle";
                this.addChild(text);
            }
            this.init(stepWidth,stepHeight);
        }
    }
    class AngleBounce extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "angleBounce";
            this.init(200);
        }
        drawShape(w) {
            this.image.graphics.clear().setStrokeStyle(2).beginStroke(this.color).moveTo(-w / 2, 0).lineTo(w / 2, 0);
            this.image.setBounds(-w / 2, 0, w, 1);
            this.image.rotation = 20;

            let angle = this.image.rotation * Math.PI / 180;
            this.cos = Math.cos(angle);
            this.sin = Math.sin(angle);
        }
    }

})();