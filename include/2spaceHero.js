window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    GFrame.style.TITLE_TEXT_COLOR = "#ffffff";
    var g = new GFrame('canvas');
    g.adapt();
    var loader = new createjs.FontLoader({
        src: ["assets/fonts/regul-book.woff",
            "assets/fonts/regul-bold.woff"
        ]
    });
    loader.on("complete", () => {
        g.preload(SpaceHero);
        // g.startFPS();
    }, null, true);
    loader.load();
};
(function () {
    "use strict";
    //游戏变量;
    var score;
    var ENEMY_TIME = 120,
        BULLET_TIME = 40,
        DIFFICULTY = 2;
    var enemys,
        nextEnemy,
        timeToEnemy,
        nextBullet,
        bullets;

    const SCORE = "Score",
        LEVEL = "level";

    class SpaceHero extends Game {
        constructor() {
            super();
            this.titleScreen.setTitleSprite(queue.getResult("all"), "title");
            this.instructionScreen.setText("方向：w,a,s,d\n攻击：小键盘4");
        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard();
            this.scoreBoard.createTextElement(SCORE, '0', 20, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 14);
            this.player = new Ship();
        }
        newGame() {
            score = 0;
            this.scoreBoard.update(SCORE, score);
        }
        newLevel() {
            enemys = [];
            bullets = [];
            nextEnemy = nextBullet = 0;
            timeToEnemy = ENEMY_TIME;
            this.scoreBoard.update(LEVEL, this.level);

        }
        waitComplete() {
            this.player.x = width / 2;
            this.player.y = height - this.player.rect.height;
            stage.addChild(this.player, this.scoreBoard);
        }
        runGame() {
            //飞船
            this.player.act();
            if (nextBullet <= 0) {
                if (keys.attack) {
                    nextBullet = BULLET_TIME;
                    let bullet = this.getActor(bullets, Bullet);
                    bullet.angle = -90;
                    bullet.rotation = 180;
                    bullet.x = this.player.x;
                    bullet.y = this.player.y + this.player.rect.y;
                }
            } else {
                nextBullet--;
            }
            //飞船子弹
            for (const bullet of bullets) {
                if (bullet.active) {
                    bullet.act();
                }
            }
            //敌机
            if (nextEnemy <= 0) {
                timeToEnemy -= DIFFICULTY;
                timeToEnemy = Math.max(timeToEnemy, 10);
                let enemy = this.getActor(enemys, Enemy);
                enemy.init();
                enemy.floatOnScreen(width, height);
                nextEnemy = timeToEnemy + timeToEnemy * Math.random();
            } else {
                nextEnemy--;
            }
            for (const enemy of enemys) {
                if (enemy.active) {
                    enemy.act();
                }
            }
            //飞船与敌机矩形碰撞
            const enemyhit = this.player.hitActors(enemys);
            if (enemyhit && this.player.image.currentAnimation == "heroIdle") {
                //像素碰撞
                if (ndgmr.checkPixelCollision(this.player.image, enemyhit.image)) {
                    this.player.image.gotoAndPlay("heroHit");
                }
            }
        }
    }
    SpaceHero.loadItem = [{
        id: "all",
        src: "spacehero/all.json",
        type: "spritesheet"
    }];
    SpaceHero.loaderbar = null;
    window.SpaceHero = SpaceHero;

    class Ship extends HitActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speedRate = 2.5;
            this.setSpriteData(queue.getResult("all"), "heroIdle", 1);
            this.setReg(this.size.x / 2, this.size.y / 2);
        }
        act() {
            this.speed.x = this.speed.y = 0;
            if (keys.left) {
                this.speed.x = -this.speedRate;
            } else if (keys.right) {
                this.speed.x = this.speedRate;
            }
            if (keys.up) {
                this.speed.y = -this.speedRate;
            } else if (keys.down) {
                this.speed.y = this.speedRate;
            }
            let nextX = this.x + this.speed.x,
                nextY = this.y + this.speed.y;
            if (!this.hitBounds(nextX, nextY)) {
                this.x = nextX;
                this.y = nextY;
            }
        }
    }

    class Enemy extends HitActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.setSpriteData(queue.getResult("all"), "enemy1Idle", 1);
        }
        init() {
            let angle = Math.random() * (Math.PI * 2);
            this.speed.x = Math.sin(angle) * 1.5;
            this.speed.y = Math.random() * 2 + 1;
        }
        floatOnScreen(width, height) {
            //上下进入
            this.y = -this.rect.height - this.rect.y;
            if (this.speed.x > 0) {
                this.x = Math.random() * width * 0.5 - this.rect.x;
            } else {
                this.x = Math.random() * width * 0.5 + 0.5 * width - this.rect.x;
            }
        }
        act() {
            this.x += this.speed.x;
            this.y += this.speed.y;
            if (this.outOfBounds()) {
                this.recycle();
            }
        }
    }
    class Bullet extends Barrage {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speedRate = 5;
            this.setSpriteData(queue.getResult("all"), "bullet");
            this.setReg(this.size.x / 2, this.size.y / 2);
        }
        act() {
            this.y += this.speed.y;
            if (this.outOfBounds()) {
                this.recycle();
            }
        }
    }
})();