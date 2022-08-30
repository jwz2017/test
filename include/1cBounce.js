window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.adapt(true);
    var loader = new createjs.FontLoader({
        src: ["assets/fonts/regul-book.woff",
            "assets/fonts/regul-bold.woff"
        ],
        type:"font"
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
            this.container=new createjs.Container();
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
                    "  /            ",
                    "               ",
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
            this.map=new createjs.Shape();



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

            this.createGrid(this.plans, 50, 30, this.actorChars,this.map);
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
                fieldType = new Brick(new Vector(xpos, ypos), ch);
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
        constructor(pos) {
            super(pos);
            this.type="player";
            this.color = "#555";
            this.xspeed = 0.15;
            this.pos.y+=0.5;
            this.setSize(3, 0.5);
            // this.setPos(this.pos.x,this.pos.y+0.5);
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
            if (newPos.x >= 0 && Math.ceil(newPos.x + this.size.x) <= grids[0].length) {
                // this.setPos(newPos.x,newPos.y);
                this.pos=newPos;
                this.setPos();
            }
        }
    }
    class Puck extends Barrage {
        constructor(pos) {
            super(pos);
            this.av = this.v = 0.22;
            this.setSize(0.3, 0.3);
            this.angle = 90;
            this.combo = 0;
            this.oldPos = new Vector(pos.x, pos.y);
        }
        act() {
            this.moveX();
            this.moveY();
            var actor=this.hitActors(actors);
            if (actor) {
                this.hitResult(actor);
            }
            this.setPos();
        }
        moveX() {
            var newPos = this.pos.plus(new Vector(this.speed.x, 0));
            var fieldType = this.hitMap(newPos);
            if (!fieldType) {
                // this.setPos(newPos.x,newPos.y);
                this.pos=newPos;
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
                // this.setPos(newPos.x,newPos.y);
                this.pos=newPos;
            } else if (fieldType == "wall") {
                this.combo = 0;
                this.speed.y *= -1;
            } else if (fieldType == "lava") {
                if (lives > 0) {
                    this.pos = new Vector(this.oldPos.x, this.oldPos.y);
                    this.v = this.av;
                    this.angle = 90;
                    lives--;
                    model.dispatchEvent(new ScoreUpdate(LIVES, lives));
                } else {
                    model.dispatchEvent(GFrame.event.GAME_OVER);
                }
            } else if (fieldType.type == "brick" || fieldType.type == "live") {
                this.speed.y *= -1;
                this.hitBrickResult(fieldType);
                if (bricks.length==0) {
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
                this.v = this.av + Math.abs(this.pos.x - actor.pos.x - actor.size.x / 2) / actor.size.x / 3;
                this.angle = 220 + (this.pos.x - actor.pos.x) / actor.size.x * 100;
            } else if (actor.type == "angleBounce") {
                this.angleBounce(actor);
            }
        }
    }
    class Brick extends Actor {
        constructor(pos, ch) {
            super(pos);
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
                text.x = this.size.x * stepWidth / 2;
                text.y = this.size.y * stepHeight / 2;
                this.addChild(text);
            }
            this.setSize(1, 1);
        }

    }
    class AngleBounce extends Actor {
        constructor(pos) {
            super(pos);
            this.type = "angleBounce";
            this.setSize(3, 3);
            var angle = Math.atan2(-this.size.y, this.size.x);
            this.cos = Math.cos(angle);
            this.sin = Math.sin(angle);
            this.posX=this.pos.x;
            this.posY=this.pos.y+this.size.y;
        }
        drawShape() {
            var width = this.size.x * stepWidth,
                height = this.size.y * stepHeight;
            this.image.graphics.clear().setStrokeStyle(2).beginStroke(this.color).moveTo(-width / 2, height / 2).lineTo(width / 2, -height / 2);
        }
    }

})();