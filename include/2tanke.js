window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.adapt();
    g.preload(Tanke);
    g.startFPS();
};
(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "score",
        LEVEL = "level";
    var spriteSheet, actorChars, map,
        tanks, bullets, enemyBullets,
        plans = [
            [
                [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
                [30, 9, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 9, 30],
                [30, 0, 0, 24, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 26, 26, 0, 30],
                [30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 26, 0, 30],
                [30, 0, 0, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30],
                [30, 0, 0, 0, 0, 0, 27, 0, 31, 31, 31, 31, 31, 31, 31, 31, 31, 0, 0, 30],
                [30, 0, 31, 31, 31, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, 0, 30],
                [30, 0, 0, 31, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, 0, 30],
                [30, 0, 0, 31, 0, 0, 29, 0, 0, 22, 0, 0, 0, 0, 0, 0, 31, 0, 0, 30],
                [30, 0, 0, 31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 0, 0, 0, 0, 30],
                [30, 0, 0, 31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 0, 0, 0, 0, 30],
                [30, 0, 0, 31, 0, 0, 0, 28, 28, 0, 28, 28, 0, 0, 0, 0, 0, 0, 0, 30],
                [30, 0, 0, 0, 0, 25, 0, 28, 0, 0, 0, 28, 0, 0, 25, 25, 25, 25, 0, 30],
                [30, 0, 0, 0, 0, 0, 0, 28, 0, 23, 0, 28, 1, 0, 0, 0, 0, 0, 0, 30],
                [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
            ]
        ]
    class Tanke extends Game {
        constructor() {
            super();
            this.titleScreen.setText("坦克大战");
            this.instructionScreen.setText("方向w,a,s,d\n小键盘4开火攻击");
            this.maxLevel = 1;
            this.container = new createjs.Container();
            actorChars = {
                "1": SpritePlayer,
                "23": Live,
                "20": Bullet,
                "22": Tank,
                "9": Enemy
            }
            map = new createjs.Container();
            var spriteData = {
                images: [queue.getResult("tanke")],
                frames: {
                    width: 32,
                    height: 32,
                    regX: 16,
                    regY: 16
                },
                animations: {
                    player: [1, 8, "player", 0.1],
                    live: [23],
                    explode: {
                        frames: [17, 18, 19],
                        next: null,
                        speed: 0.3
                    },
                    buttle: [20],
                    barrage: [21],
                    tanke: [22],
                    enemy: [9, 16, "enemy", 0.1]
                }
            };
            spriteSheet = new createjs.SpriteSheet(spriteData);
        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard(0, 0, null);
            this.scoreBoard.createTextElement(SCORE, '0', 20, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 14);
        }
        newGame() {
            score = 0;
            this.scoreBoard.update(SCORE, score);

        }
        newLevel() {
            this.scoreBoard.update(LEVEL, this.level);
            //创建网格
            this.createGrid(plans, 32, 32, actorChars, map);
            this.container.y = (height - grids.length * stepHeight) / 2;
            tanks = actors.filter(function (actor) {
                return actor.type == "player" || actor.type == "enemy";
            });
            bullets = [];
            enemyBullets = [];
        }
        waitComplete() {
            stage.addChild(this.container);

        }
        runGame() {
            for (let i = actors.length - 1; i >= 0; i--) {
                const actor = actors[i];
                actor.act();
                if (actor.fire) {
                    actor.fire = false;
                    let bullet;
                    switch (actor.type) {
                        case "player":
                            bullet = this.createBullet(actor.image.rotation - 90, Barrage1);
                            bullets.push(bullet);
                            break;
                        case "enemy":
                            bullet = this.createBullet(actor.image.rotation - 90, EnemyBarrage);
                            enemyBullets.push(bullet);
                            break;
                    }
                    bullet.pos.x=actor.pos.x + (actor.size.x - bullet.size.x) / 2;
                    bullet.pos.y=actor.pos.y + (actor.size.y - bullet.size.y) / 2;
                }
            }
            this.checkBullets(bullets);
            this.checkBullets(enemyBullets);
        }
        clear() {
            this.container.removeAllChild();
            map.removeAllChild();
            map.uncache();
        }
        // setGrid(ch, x, y) {
        //     var fieldType = null;
        //     var xpos = x * stepWidth,
        //         ypos = y * stepHeight;
        //     var mat = new createjs.Matrix2D();
        //     if (ch == "24") {
        //         fieldType = "wall";
        //         mat.translate(xpos, ypos - 96);
        //     } else if (ch == "25") {
        //         fieldType = "wall";
        //         mat.translate(xpos - 32, ypos - 96);
        //     } else if (ch == "26") {
        //         fieldType = "wall";
        //         mat.translate(xpos - 64, ypos - 96);
        //     } else if (ch == "27") {
        //         fieldType = "wall";
        //         mat.translate(xpos - 96, ypos - 96);
        //     } else if (ch == "28") {
        //         fieldType = "wall";
        //         mat.translate(xpos - 128, ypos - 96);
        //     } else if (ch == "29") {
        //         fieldType = "wall";
        //         mat.translate(xpos - 160, ypos - 96);
        //     } else if (ch == "30") {
        //         fieldType = "wall";
        //         mat.translate(xpos - 192, ypos - 96);
        //     } else if (ch == "31") {
        //         fieldType = "wall";
        //         mat.translate(xpos - 224, ypos - 96);
        //     } else {
        //         mat.translate(xpos, ypos);
        //     }
        //     this.map.graphics.beginBitmapFill(queue.getResult("tanke"), "no-repeat", mat).drawRect(xpos, ypos, stepWidth, stepHeight);
        //     return fieldType;
        // }
        setGrid(ch, xpos, ypos) {
            var fieldType = null;
            var tile = new createjs.Sprite(spriteSheet, ch).set({
                regX: -16,
                regY: -16,
                x: stepWidth * xpos,
                y: stepHeight * ypos
            });
            if (actorChars[ch] || ch == 0) {
                tile.gotoAndStop(0);
            } else {
                fieldType = "wall";
            }
            map.addChild(tile);
            return fieldType;
        }

    }
    Tanke.loadItem = [{
        id: "tanke",
        src: "tanke/q.png"
    }];
    Tanke.loaderbar = null;;
    window.Tanke = Tanke;

    class SpritePlayer extends HitActor {
        constructor(pose) {
            super(pose);
            this.type="player";
            this.v = 0.03;
            this.setSize(0.8, 0.8);
            this.setSpriteData(spriteSheet, "player");
            this.image.paused = true;
            this.nextBullet = 0;
            this.BULLET_TIME = 40;
        }
        act() {
            this.move();
        }
        move() {
            this.speed.x = 0;
            this.speed.y = 0;
            this.image.paused = true;
            var key = pressed[pressed.length - 1];
            if (key == "up") {
                this.speed.y = -this.v;
                this.image.rotation = 0;
                this.image.paused = false;
            } else if (key == "down") {
                this.speed.y = this.v;
                this.image.rotation = 180;
                this.image.paused = false;
            } else if (key == "right") {
                this.speed.x = this.v;
                this.image.rotation = 90;
                this.image.paused = false;
            } else if (key == "left") {
                this.speed.x = -this.v;
                this.image.rotation = 270;
                this.image.paused = false;
            }
            //开火
            if (this.nextBullet <= 0) {
                if (keys.attack) {
                    this.nextBullet = this.BULLET_TIME;
                    this.fire = true;
                }
            } else {
                this.nextBullet--;
            }

            var newPos = this.pos.plus(this.speed);
            var obstacle = this.hitMap(newPos);
            if (obstacle) {
                if (obstacle == "lava") {
                    this.status = "lose";
                }
            } else {
                var oldPos = new Vector(this.pos.x, this.pos.y);
                // this.setPos(newPos.x, newPos.y);
                this.pos=newPos;
                var actor = this.hitActors(actors)
                if (actor) {
                    switch (actor.type) {
                        case "enemy":
                            // this.setPos(oldPos.x, oldPos.y);
                            this.pos=oldPos;
                            break;
                        case "tank":
                            console.log("tank");
                            break;
                        case "bullet":
                            console.log("bullet");
                            break;
                        default:
                            break;
                    }
                }
                this.setPos();
            }
        }
    }
    class Barrage1 extends Barrage {
        constructor(pos) {
            super(pos);
            this.setSize(0.26, 0.26);
            this.setSpriteData(spriteSheet, "barrage")
        }
        recycle() {
            super.recycle();
            bullets.splice(bullets.indexOf(this),1);
            Barrage1.bullets.push(this);
        }
        hitResult(actor) {
            if (actor.type == "enemy") {
                this.recycle();
            }
        }
    }
    Barrage1.bullets = [];

    class EnemyBarrage extends Barrage {
        constructor(pos) {
            super(pos);
            this.setSize(0.2, 0.2);
        }
        recycle() {
            super.recycle();
            enemyBullets.splice(enemyBullets.indexOf(this),1);
            EnemyBarrage.bullets.push(this);
        }
        hitResult(actor) {
            if (actor.type == "player") {
                this.recycle();
            }
        }
    }
    EnemyBarrage.bullets = [];

    class Live extends Actor {
        constructor(pos) {
            super(pos);
            this.type = "live";
            this.setSize(1, 1);
            this.setSpriteData(spriteSheet, "live");
        }
    }
    class Bullet extends Actor {
        constructor(pos) {
            super(pos);
            this.type = "bullet";
            this.setSize(0.3, 0.7);
            this.setSpriteData(spriteSheet, "buttle")
        }

    }
    class Tank extends Actor {
        constructor(pos) {
            super(pos);
            this.setSize(0.6, 0.6);
            this.setSpriteData(spriteSheet, "tanke");
            this.type = "tank";
        }

    }
    class Enemy extends HitActor {
        constructor(pos) {
            super(pos);
            this.v = 0.02;
            this.setSize(0.8, 0.8);
            this.setSpriteData(spriteSheet, "enemy");
            this.tick = 0;
            this.key = 80;
            this.type = "enemy";
        }
        act() {
            this.move();
        }
        move() {
            this.speed.x = 0;
            this.speed.y = 0;
            this.tick++;
            if (this.tick > Math.random() * 80 + 200) {
                this.key = Math.random() * 100;
                this.tick1 = this.tick;
                this.tick = 0;
            }
            if (this.key <= 10) {
                //上
                this.speed.y = -this.v;
                this.image.rotation = 0;

            } else if (this.key > 10 && this.key <= 40) {
                //下
                this.speed.y = this.v;
                this.image.rotation = 180;
            } else if (this.key > 40 && this.key <= 65) {
                //右
                this.speed.x = this.v;
                this.image.rotation = 90;
            } else if (this.key > 65) {
                //左
                this.speed.x = -this.v;
                this.image.rotation = 270;
            }
            if (this.tick1 >= 201) {
                this.tick1 = 0;
                this.fire = true;
            }
            var newPos = this.pos.plus(this.speed);
            var obstacle = this.hitMap(newPos);
            if (!obstacle) {
                var oldPos = new Vector(this.pos.x, this.pos.y);
                // this.setPos(newPos.x, newPos.y);
                this.pos=newPos;
                if (this.hitActors(tanks)) {
                    this.setPos(oldPos.x, oldPos.y);
                    this.pos=oldPos;
                }
                this.setPos();
            } else {
                this.key = Math.random() * 100;
                this.tick = 0;
            }
        }

    }
})();