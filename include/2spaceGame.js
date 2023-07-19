window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    GFrame.style.TITLE_TEXT_COLOR = "#fff";
    canvas.style.backgroundColor = "#000";
    var g = new GFrame('canvas');
    g.preload(SpaceShip);
    g.startFPS();
};
(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";

    var TURN_FACTOR = 6,
        BULLET_TIME = 20,
        ROCK_TIME = 500,
        SUB_ROCK_COUNT = 3,
        DIFFICULTY = 2;

    var nextBullet, nextRock, rockBelt, timeToRock, bullets, ship;
    var ship;
    class SpaceShip extends Game {
        constructor() {
            super("飞机游戏");
            ship = new Ship();
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
            nextBullet = nextRock = 0;
            timeToRock = ROCK_TIME;
            bullets = [];
            rockBelt = [];
            ship.speed = new Vector(0, 0);
        }
        waitComplete() {
            stage.addChild(ship, this.scoreBoard);
            ship.setPos(width / 2, height / 2);
        }
        runGame() {
            // 控制飞船
            if (keys.left) {
                ship.rotation -= TURN_FACTOR;
            } else if (keys.right) {
                ship.rotation += TURN_FACTOR;
            }
            if (keys.up) {
                ship.accelerate();
            }
            ship.act();
            // 开火
            if (nextBullet <= 0) {
                if (keys.attack) {
                    nextBullet = BULLET_TIME;
                    const bullet = Game.getActor(bullets, Bullet);
                    bullet.rotation = ship.rotation;
                    bullet.speed.angle = bullet.rotation * Math.PI / 180;
                    bullet.x = ship.x + ship.hit * Math.cos(bullet.speed.angle);
                    bullet.y = ship.y + ship.hit * Math.sin(bullet.speed.angle);
                    bullet.setPos(bullet.x, bullet.y);
                    stage.addChild(bullet);
                }
            } else {
                nextBullet--;
            }

            //石块
            if (nextRock <= 0) {
                timeToRock -= DIFFICULTY;
                // let index = this.getSpackRock(SpaceRock.LRG_ROCK);
                let index = Game.getActor(rockBelt, SpaceRock);
                index.init(SpaceRock.LRG_ROCK);
                stage.addChild(index);
                index.floatOnScreen(width, height);
                nextRock = timeToRock + timeToRock * Math.random();
            } else {
                nextRock--;
            }
            //石块移动
            for (const o of rockBelt) {
                if (!o.active) {
                    continue;
                }
                o.act();
                //石块与飞船碰撞
                if (o.hitRadius(ship)) {
                    stage.dispatchEvent(GFrame.event.GAME_OVER);
                    return;
                }
                //与子弹碰撞
                for (let i = bullets.length - 1; i >= 0; i--) {
                    const p = bullets[i];
                    if (p.active && o.hitRadius(null, p.x, p.y)) {
                        score += o.score;
                        this.scoreBoard.update(SCORE, score);
                        p.recycle();
                        let newSize;
                        let rect = o.getBounds()
                        switch (rect.width) {
                            case SpaceRock.LRG_ROCK:
                                newSize = SpaceRock.MED_ROCK;
                                break;
                            case SpaceRock.MED_ROCK:
                                newSize = SpaceRock.SML_ROCK;
                                break;
                            case SpaceRock.SML_ROCK:
                                newSize = 0;
                                break;
                        }
                        if (newSize > 0) {
                            let i;
                            let index;
                            let offset;
                            for (i = 0; i < SUB_ROCK_COUNT; i++) {
                                index = Game.getActor(rockBelt, SpaceRock);
                                index.init(newSize);
                                stage.addChild(index);
                                offset = (Math.random() * rect.width * 2) - rect.width;
                                index.setPos(o.x + offset, o.y + offset);
                            }
                        }
                        o.recycle();
                        break;
                    }

                }
            }
            //检测子弹
            for (const bullet of bullets) {
                if (bullet.active) {
                    bullet.act();
                }
            }
        }
    }
    window.SpaceShip = SpaceShip;

    class Bullet extends Actor {
        constructor(pos) {
            super(pos);
            this.speed.length = 5;
            this.init(6, 1);
        }
        drawShape(width, height) {
            this.image.graphics.clear().beginStroke("#ffffff").moveTo(-width / 2, 0).lineTo(width / 2, 0);
            this.image.setBounds(-width / 2, -height / 2, width, height);
        }
    }
    class Ship extends SteeredActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.thrust = 0;
            this.timeout = 0;
            this.toggle = 60;
            this.mass = 4;
            this.maxForce = 0.2;
            this.key = true;
            this.init(15);
        }
        act() {
            super.act();
            if (this.thrust > 0) {
                this.timeout++;
                this.shipFlame.alpha = 1;
                if (this.timeout > this.toggle) {
                    this.timeout = 0;
                    if (this.shipFlame.scaleX == 1) {
                        this.shipFlame.scale = 0.6;
                    } else {
                        this.shipFlame.scale = 1;
                    }
                }
                this.thrust -= 0.04;
            } else {
                this.shipFlame.alpha = 0;
                this.thrust = 0;
            }
        }
        accelerate() {
            this.thrust += 0.05;
            this.steeringForce = this.speed.clone().normalize();
            this.steeringForce.angle = this.rotation * Math.PI / 180;
            this.steeringForce = this.steeringForce.times(this.thrust);
        }
    }
    //石头
    class SpaceRock extends Actor {
        static LRG_ROCK = 60;
        static MED_ROCK = 40;
        static SML_ROCK = 20;
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.edgeBehavior = Actor.WRAP;
        }
        init(size) {
            super.init(size);
            let angle = Math.random() * (Math.PI * 2);
            this.speed.length = Math.sin(angle) * (2 + 20 / this.hit);
            this.speed.angle = angle;
            this.spin = (Math.random() + 0.2) * this.speed.x;
            this.score = Math.floor((5 + this.getBounds().width / 10) * 100);
        }
        drawShape(width) {
            this.hit = width / 2;
            let angle = 0,
                size = width / 2,
                radius = width / 2;
            this.image.graphics.clear();
            this.image.graphics.beginStroke("#ffffff");
            this.image.graphics.moveTo(0, radius);
            //draw spacerock
            while (angle < (Math.PI * 2 - .5)) {
                angle += .25 + (Math.random() * 100) / 500;
                radius = size + (size / 2 * Math.random());
                this.image.graphics.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
                this.hit = (this.hit + radius) / 2;
            }
            this.image.graphics.closePath();
            this.image.setBounds(-width / 2, -width / 2, width, width);
        }
        floatOnScreen(width, height) {
            let rect = this.rect;
            if (Math.random() * (width + height) > width) {
                if (this.speed.x > 0) {
                    this.x = -rect.width / 2;
                } else {
                    this.x = width + rect.width / 2;
                }
                if (this.speed.y > 0) {
                    this.y = Math.random() * height * 0.5;
                    this.set
                } else {
                    this.y = Math.random() * height * 0.5 + 0.5 * height;
                }
            } else {
                if (this.speed.y > 0) {
                    this.y = -rect.height / 2;
                } else {
                    this.y = height + rect.height / 2;
                }
                if (this.speed.x > 0) {
                    this.x = Math.random() * width * 0.5;
                } else {
                    this.x = Math.random() * width * 0.5 + 0.5 * width;
                }
            }
            this.setPos(this.x, this.y);
        }
        act() {
            super.act();
            this.rotation += this.spin;
        }
    }
})();