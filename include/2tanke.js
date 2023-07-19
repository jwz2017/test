window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    // g.loaderBar=null;
    g.preload(Tanke);
    g.startFPS();
};
(function () {
    "use strict";
    //游戏变量;
    const SCORE = "score",
        LEVEL = "level";
    var score;
    var spriteData, spriteSheet, actorChars,
        tanks, bullets, enemyBullets,
        step = 32,
        plans = [
            [
                [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
                [30, 9, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 9, 30],
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
        ],
        mapContainer = new GridsMap(0, 0, plans[0][0].length * step, plans[0].length * step, step, step);

    class Tanke extends Game {
        static loadItem = [{
            id: "tanke",
            src: "tanke/q.png"
        }];
        constructor() {
            super("坦克大战");
            this.instructionScreen.title.text = "方向w,a,s,d\n小键盘4开火攻击";
        }
        init() {
            actorChars = {
                "1": SpritePlayer,
                "23": Live,
                "20": Bullet,
                "22": Tank,
                "9": Enemy
            }
            spriteData = {
                images: [queue.getResult("tanke")],
                frames: {
                    width: step,
                    height: step,
                    regX: step / 2,
                    regY: step / 2
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
            mapContainer.x = width - mapContainer.width >> 1;
            mapContainer.y = height - mapContainer.height >> 1;
        }
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
            let plan = plans[this.level - 1];
            bullets = [];
            enemyBullets = [];
            mapContainer.createGridMap(plan, actorChars, (ch, node) => {
                var tile = new createjs.Sprite(spriteSheet).set({
                    regX: -step / 2,
                    regY: -step / 2,
                    x: node.x * step,
                    y: node.y * step
                });
                if (actorChars[ch] || ch == 0) {
                    tile.gotoAndStop(0);
                } else {
                    tile.gotoAndStop(ch);
                    node.walkable = false;
                }
                mapContainer.addChildToFloor(tile);
            });
            tanks= mapContainer.actors.filter(function (actor) {
                return actor.type == "player" || actor.type == "enemy";
            });
        }
        waitComplete() {
            stage.addChild(this.scoreBoard, mapContainer);
        }
        runGame() {
            for (let i = mapContainer.actors.length - 1; i >= 0; i--) {
                const actor = mapContainer.actors[i];
                actor.act();
            }
            for (const bullet of bullets) {
                if (bullet.active) {
                    bullet.act();
                }
            }
            for (const enemybullet of enemyBullets) {
                if (enemybullet.active) {
                    enemybullet.act();
                }
            }
        }
        clear() {
            mapContainer.clear();
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
    }
    window.Tanke = Tanke;

    class SpritePlayer extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "player";
            this.speedRate = 1;
            this.init(0.8 * step, 0.8 * step);
            this.setSpriteData(spriteSheet, "player");
            this.image.paused = true;
            this.nextBullet = 0;
            this.BULLET_TIME = 40;
        }
        act() {
            this.move();
        }
        move() {
            this.speed.x = this.speed.y = 0;
            this.image.paused = true;
            switch (pressed[pressed.length - 1]) {
                case "up":
                    this.speed.y = -this.speedRate;
                    this.rotation = 0;
                    this.image.paused = false;
                    break;
                case "down":
                    this.speed.y = this.speedRate;
                    this.rotation = 180;
                    this.image.paused = false;
                    break;
                case "right":
                    this.speed.x = this.speedRate;
                    this.rotation = 90;
                    this.image.paused = false;
                    break;
                case "left":
                    this.speed.x = -this.speedRate;
                    this.rotation = 270;
                    this.image.paused = false;
                    break;
            }
            //开火
            if (this.nextBullet <= 0) {
                if (keys.attack) {
                    this.nextBullet = this.BULLET_TIME;
                    this.createBullet();
                }
            } else {
                this.nextBullet--;
            }

            let rect = this.rect.clone();
            rect.x += this.speed.x;
            rect.y += this.speed.y;
            var obstacle = mapContainer.hitMap(rect);
            if (obstacle) {
                // if (obstacle == "lava") {
                //     this.status = "lose";
                // }
            } else {
                var actor = this.hitActors(mapContainer.actors, rect);
                if (!actor || actor.type != "enemy") {
                    this.plus(this.speed.x,this.speed.y);
                }
                if (actor) {
                    switch (actor.type) {
                        case "enemy":
                            console.log("enemy");
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
            }
        }
        createBullet() {
            let bullet, angle = (this.rotation - 90) * Math.PI / 180;
            bullet = Game.getActor(bullets, Barrage1);
            bullet.speed.angle = angle;
            bullet.x = this.x + Math.cos(angle) * this.hit;
            bullet.y = this.y + Math.sin(angle) * this.hit;
            bullet.setPos(bullet.x,bullet.y);
            mapContainer.addChild(bullet);
        }
    }
    class Barrage1 extends CirActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speed.length = 3;
            this.init(8, 8);
            this.setSpriteData(spriteSheet, "barrage")
        }
        act() {
            let obstacle = mapContainer.hitMap(this.rect);
            if (!obstacle) {
                let actor = this.hitActors(mapContainer.actors);
                if (!actor || actor.type != "enemy") {
                    super.act();
                } else if (actor.type == "enemy") {
                    this.recycle();
                }
            } else {
                this.recycle();
            }
        }
    }

    class EnemyBarrage extends CirActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speed.length = 3;
            this.init(8, 8);
        }
        act() {
            let obstacle = mapContainer.hitMap(this.rect);
            if (!obstacle) {
                let actor = this.hitActors(mapContainer.actors);
                if (!actor || actor.type != "player") {
                    super.act();
                } else if (actor.type == "player") {
                    this.recycle();
                }
            } else {
                this.recycle();
            }
        }
    }

    class Live extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "live";
            this.init(step, step);
            this.setSpriteData(spriteSheet, "live");
        }
    }
    class Bullet extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "bullet";
            this.init(0.3 * step, 0.7 * step);
            this.setSpriteData(spriteSheet, "buttle");
        }
    }
    class Tank extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.init(0.6 * step, 0.6 * step);
            this.setSpriteData(spriteSheet, "tanke");
            this.type = "tank";
        }
    }
    class Enemy extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speedRate = 0.64;
            this.init(0.8 * step, 0.8 * step);
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
                this.speed.y = -this.speedRate;
                this.rotation = 0;

            } else if (this.key > 10 && this.key <= 40) {
                //下
                this.speed.y = this.speedRate;
                this.rotation = 180;
            } else if (this.key > 40 && this.key <= 65) {
                //右
                this.speed.x = this.speedRate;
                this.rotation = 90;
            } else if (this.key > 65) {
                //左
                this.speed.x = -this.speedRate;
                this.rotation = 270;
            }
            if (this.tick1 >= 201) {
                this.tick1 = 0;
                this.createBullet();
            }
            let rect = this.rect.clone();
            rect.x += this.speed.x;
            rect.y += this.speed.y;
            var obstacle = mapContainer.hitMap(rect);
            if (!obstacle) {
                let actor = this.hitActors(mapContainer.actors, rect);
                if (!actor || (actor.type != "enemy" && actor.type != "player")) {
                    this.plus(this.speed.x,this.speed.y);
                }
            } else {
                this.key = Math.random() * 100;
                this.tick = 0;
            }
        }
        createBullet() {
            let bullet, angle = (this.rotation - 90) * Math.PI / 180;
            bullet = Game.getActor(enemyBullets, EnemyBarrage);
            bullet.speed.angle = angle;
            bullet.x = this.x + Math.cos(angle) * this.hit;
            bullet.y = this.y + Math.sin(angle) * this.hit;
            bullet.setPos(bullet.x,bullet.y);
            mapContainer.addChild(bullet);
        }

    }
})();