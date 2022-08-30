window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.adapt();
    var loader = new createjs.FontLoader({
        src: ["assets/fonts/regul-book.woff",
            "assets/fonts/regul-bold.woff"
        ]
    });
    loader.on("complete", () => {
        g.preload(SpaceShip);
        g.startFPS();
    }, null, true);
    loader.load();
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
        SUB_ROCK_COUNT=3,
        DIFFICULTY = 2;

    var nextBullet, nextRock, rockBelt, timeToRock, bullets, ship;

    class SpaceShip extends Game {
        constructor() {
            GFrame.style.TITLE_TEXT_COLOR = "#fff";
            super();
            this.titleScreen.setText("飞机游戏");
            // stepWidth=stepHeight=10;
            ship = new Ship();
        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard();
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
            ship.speed=new Vector(0,0);
        }
        waitComplete() {
            stage.addChild(ship, this.scoreBoard);
            ship.pos = new Vector(width / stepWidth / 2, height / stepHeight / 2);

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
                    let angle = ship.rotation + 90;
                    const bullet = this.createBullet(angle, Bullet);
                    bullet.x = ship.x + ship.bounds * Math.cos(angle * Math.PI / 180);
                    bullet.y = ship.y + ship.bounds * Math.sin(angle * Math.PI / 180);
                    bullets.push(bullet);
                }
            } else {
                nextBullet--;
            }

            //石块
            if (nextRock <= 0) {
                timeToRock -= DIFFICULTY;
                let index = this.getSpackRock(SpaceRock.LRG_ROCK / stepWidth);
                rockBelt[index].floatOnScreen(width / stepWidth, height / stepHeight);

                nextRock = timeToRock + timeToRock * Math.random();
            } else {
                nextRock--;
            }
            //石块移动
            for (const spaceRock in rockBelt) {
                const o = rockBelt[spaceRock];
                if (!o || !o.active) {
                    continue;
                }
                o.act();
                //石块与飞船碰撞
                if (o.hitRadius(ship.x, ship.y, ship.bounds)) {
                    model.dispatchEvent(GFrame.event.GAME_OVER);
                    return;
                }
                //与子弹碰撞
                for (let i=bullets.length-1;i>=0;i--) {
                    const p = bullets[i];
                    if (o.hitPoint(p.x, p.y)) {
                        score+=o.score;
                        this.scoreBoard.update(SCORE,score);
                        p.recycle();
                        let newSize;
                        switch (o.bounds) {
                            case SpaceRock.LRG_ROCK:
                                newSize=SpaceRock.MED_ROCK;
                                break;
                            case SpaceRock.MED_ROCK:
                                newSize=SpaceRock.SML_ROCK;
                                break;
                            case SpaceRock.SML_ROCK:
                                newSize=0;
                                break;
                        }
                        if (newSize>0) {
                            let i;
                            let index;
                            let offset;
                            for(i=0;i<SUB_ROCK_COUNT;i++){
                                index=this.getSpackRock(newSize);
                                offset=(Math.random()*o.size.x*2)-o.size.x;
                                rockBelt[index].pos.x=o.pos.x+offset;
                                rockBelt[index].pos.y=o.pos.y+offset;
                                rockBelt[index].setPos();
                            }
                        }
                        stage.removeChild(o);
                        o.active=false;
                    }

                }
            }
            this.checkBullets(bullets);
        }
        getSpackRock(size) {
            let i = 0,
                len = rockBelt.length;
            while (i <= len) {
                if (!rockBelt[i]) {
                    rockBelt[i] = new SpaceRock(null, size);
                    break;
                } else if (!rockBelt[i].active) {
                    rockBelt[i].setSize(size,size);
                    rockBelt[i].activate();
                    break;
                } else {
                    i++;
                }
            }
            stage.addChild(rockBelt[i]);
            return i;
        }
        clear() {
            // this.container.removeAllChildren();

        }

    }
    SpaceShip.loadItem = null;
    SpaceShip.loaderbar = null;;
    window.SpaceShip = SpaceShip;

    class Bullet extends Barrage {
        constructor(pos) {
            super(pos);
            this.v = 5;
            this.setSize(2 / stepWidth, 1 / stepHeight);
        }
        drawShape() {
            this.image.graphics.beginStroke("#ffffff").moveTo(-1, 0).lineTo(1, 0);
        }
        act() {
            this.x += this.speed.x;
            this.y += this.speed.y;
            if (this.outOfBounds()) {
                this.recycle();
            }
        }
        recycle() {
            super.recycle();
            bullets.splice(bullets.indexOf(this),1);
            Bullet.bullets.push(this);
        }
    }
    Bullet.bullets = [];
})();