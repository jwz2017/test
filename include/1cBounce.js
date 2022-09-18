window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.adapt(true);
    var loader = new createjs.FontLoader({
        src: ["assets/fonts/regul-book.woff",
            "assets/fonts/regul-bold.woff"
        ],
        type: "font"
    });
    loader.on("complete", () => {
        g.preload(Bounce);
        // g.startFPS();
    }, null, true);
    loader.load();
};
(function () {
    "use strict";
    //游戏变量;
    var score, lives, bricks;
    const SCORE = "Score",
        LEVEL = "level",
        LIVES = "lives";

    var brickContainer = new createjs.Container();
    var colorOffse = Math.random() * 360,
        count = 0;

    class Bounce extends Game {
        constructor() {
            super();
            this.titleScreen.setText("弹球06");
            this.container = new createjs.Container();
            this.container.y = GFrame.style.SCOREBOARD_HEIGHT;
            this.actorChars = {
                "@": Pandle,
                "p": Puck,
                "/": AngleBounce
            }
            this.plans = [
                [
                    "xxxxxxxx x x   ",
                    "               ",
                    "  xw wxxxx xx  ",
                    "               ",
                    "xxxxlxx   ww   ",
                    "               ",
                    "x    xx        ",
                    "               ",
                    "xxlxxxx   ww   ",
                    "               ",
                    "xxxx         x ",
                    "               ",
                    "xxxxxxx        ",
                    "               ",
                    "xxxxxxx     xxx",
                    "               ",
                    "xxxxxlx      xx",
                    "               ",
                    "xxlxxxx      xx",
                    "          x    ",
                    "xxlxxxx        ",
                    "            xxx",
                    "     xx      xx",
                    " x           xx",
                    "        p      ",
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
                    "               ",
                    "      @        "
                ]
            ];

            this.maxLevel = this.plans.length;
            this.map = new createjs.Shape();



        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard();
            this.scoreBoard.createTextElement(SCORE, '0', 10, 0);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 0);
            this.scoreBoard.createTextElement(LIVES, '5', 600, 0);
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

            this.createGrid(this.plans, 50, 30, this.actorChars, this.map);
            brickContainer.cache(0, 0, grids[0].length * stepWidth, grids.length * stepHeight);
            //加入显示元素

        }
        waitComplete() {
            stage.addChild(this.container, this.scoreBoard);
            this.container.addChild(brickContainer)

        }
        runGame() {
            // console.time("a");
            for (let i = actors.length - 1; i >= 0; i--) {
                const actor = actors[i];
                actor.act();
            }
            // console.timeEnd("a");
            // console.log("d");
            // debugger;
        }
        clear() {
            this.container.removeAllChildren();
            brickContainer.removeAllChildren();
            brickContainer.updateCache();
            this.map.graphics.clear();
        }
        setGrid(ch, xpos, ypos) {
            var fieldType = null;
            var color = "#fff";
            if (ch == "w") {
                fieldType = "wall";
                color = "#555";
            } else if (ch == "x" || ch == "l") {
                fieldType = new Brick(xpos, ypos, ch);
                bricks.push(fieldType);
                brickContainer.addChild(fieldType);
            }
            this.map.graphics.beginFill(color).drawRect(xpos * stepWidth, ypos * stepHeight, stepWidth, stepHeight);
            return fieldType;
        }
    }
    Bounce.loadItem = null;
    Bounce.loaderbar = null;;
    window.Bounce = Bounce;

    class Pandle extends HitActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "player";
            this.color = "#555";
            this.xspeed = 0.15;
            this.pos.y += 0.5;
            this.setSize(3, 0.5);
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
            if (!this.hitBounds(this.getX(newPos),this.getY(newPos))) {
                this.pos = newPos;
                this.setXY();
            }
        }
    }
    class Puck extends Barrage {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.av = this.speedRate = 0.15;
            this.setSize(0.3, 0.3 * stepWidth / stepHeight);
            this.angle = 90;
            this.combo = 0;
            this.oldPos = new Vector(xpos, ypos);
        }
        act() {
            this.moveX();
            this.moveY();
            this.setXY();
            var actor = this.hitActors(actors);
            if (actor) {
                this.hitResult(actor);
            }
        }
        moveX() {
            var newPos = this.pos.plus(new Vector(this.speed.x, 0));
            var fieldType = this.hitMap(newPos);
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
            var fieldType = this.hitMap(newPos);
            if (!fieldType) {
                this.pos = newPos;
            } else if (fieldType == "wall") {
                this.combo = 0;
                this.speed.y *= -1;
            } else if (fieldType == "lava") {
                if (lives > 0) {
                    this.pos = new Vector(this.oldPos.x, this.oldPos.y);
                    this.speedRate = this.av;
                    this.angle = 90;
                    lives--;
                    model.dispatchEvent(new ScoreUpdate(LIVES, lives));
                } else {
                    model.dispatchEvent(GFrame.event.GAME_OVER);
                }
            } else if (fieldType.type == "brick" || fieldType.type == "live") {
                this.speed.y *= -1;
                this.hitBrickResult(fieldType);
                if (bricks.length == 0) {
                    model.dispatchEvent(GFrame.event.LEVEL_UP);
                }
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
                combotex.x = fieldType.x + fieldType.size.x * stepWidth / 2;
                combotex.y = fieldType.y + fieldType.size.y * stepHeight / 2;
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
            model.dispatchEvent(new ScoreUpdate(SCORE, score));
            if (fieldType.type == "live") {
                lives++;
                model.dispatchEvent(new ScoreUpdate(LIVES, lives));
            }
            bricks.splice(bricks.indexOf(fieldType), 1);
            grids[fieldType.pos.y][fieldType.pos.x] = null;
            fieldType.parent.removeChild(fieldType);
            brickContainer.updateCache();

        }

        hitResult(actor) {
            if (actor.type == "player") {
                this.combo = 0;
                this.speedRate = this.av + Math.abs(this.pos.x - actor.pos.x - actor.size.x / 2) / actor.size.x / 3;
                this.angle = 220 + (this.pos.x - actor.pos.x) / actor.size.x * 100;
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
            this.setSize(1, 1);
        }
    }
    class AngleBounce extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "angleBounce";
            this.drawShape(200);
        }
        drawShape(w) {
            this.image = new createjs.Shape();
            this.addChild(this.image);
            this.image.graphics.clear().setStrokeStyle(2).beginStroke(this.color).moveTo(-w/2, 0).lineTo(w/2, 0);
            this.image.setBounds(-w/2, 0, w, 1);
            this.image.rotation = 20;
            
            this.rect = this.getBounds();
            let angle = this.image.rotation * Math.PI / 180;
            this.cos = Math.cos(angle);
            this.sin = Math.sin(angle);
        }
    }

})();