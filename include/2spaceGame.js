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
            ship.pos = new Vector(width/ 2, height / 2);
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
                    const bullet=this.getActor(bullets,Bullet);
                    bullet.rotation=ship.rotation + 90;
                    bullet.speed.angle=bullet.rotation*Math.PI/180;
                    bullet.x = ship.x + ship.hit * Math.cos(bullet.speed.angle);
                    bullet.y = ship.y + ship.hit * Math.sin(bullet.speed.angle);
                    bullet.updatePos();
                    console.log(bullets.length);
                }
            } else {
                nextBullet--;
            }

            //石块
            if (nextRock <= 0) {
                timeToRock -= DIFFICULTY;
                let index = this.getSpackRock(SpaceRock.LRG_ROCK );
                rockBelt[index].floatOnScreen(width , height);

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
                    model.dispatchEvent(GFrame.event.GAME_OVER);
                    return;
                }
                //与子弹碰撞
                for (let i=bullets.length-1;i>=0;i--) {
                    const p = bullets[i];
                    if (p.active&&o.contains(p.x,p.y)) {
                        score+=o.score;
                        this.scoreBoard.update(SCORE,score);
                        p.recycle();
                        let newSize;
                        switch (o.size.x) {
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
                                rockBelt[index].pos=new Vector(o.pos.x+offset,o.pos.y+offset)
                                rockBelt[index].update();
                            }
                        }
                        o.recycle();
                        break;
                    }

                }
            }
            //检测子弹
            for (const bullet of bullets) {
                if(bullet.active){
                    bullet.act();
                }
            }
        }
        getSpackRock(size) {
            let i = 0,
                len = rockBelt.length;
            while (i <= len) {
                if (!rockBelt[i]) {
                    rockBelt[i] = new SpaceRock(0,0, size);
                    break;
                } else if (!rockBelt[i].active) {
                    rockBelt[i].drawShape(size,size);
                    rockBelt[i].init();
                    rockBelt[i].activate();
                    break;
                } else {
                    i++;
                }
            }
            stage.addChild(rockBelt[i]);
            return i;
        }

    }
    SpaceShip.loadItem = null;
    SpaceShip.loaderbar = null;;
    window.SpaceShip = SpaceShip;

    class Bullet extends HitActor {
        constructor(pos) {
            super(pos);
            this.speed.length=5;
            this.setSize(6 , 1);
        }
        drawShape(width,height) {
            this.image.graphics.beginStroke("#ffffff").moveTo(-width/2, 0).lineTo(width/2, 0);
            this.image.setBounds(-width/2,-height/2,width,height);
        }
    }
})();