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
            this.player = new Ship();
            this.player.pos.x=width-this.player.size.x>>1;
            this.player.pos.y = height - this.player.size.y;
            this.player.update();
            stage.addChild(this.player, this.scoreBoard);
        }
        runGame() {
            //飞船
            this.player.act();
            if (nextBullet <= 0) {
                if (keys.attack) {
                    nextBullet = BULLET_TIME;
                    let bullet = this.getActor(bullets, Bullet);
                    bullet.speed.angle = -Math.PI/2;
                    bullet.x = this.player.x;
                    bullet.y = this.player.y+this.player.offsetY;
                    bullet.updatePos();
                    console.log(bullets.length);
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
                enemy.activate();
                // enemy.pos=new Vector(200,200);
                enemy.update();
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
            this.vx= 2.5;
            this.setSize(50,40);
            this.setSpriteData(queue.getResult("all"), "heroIdle", 0.7);
            // this.setReg(this.size.x / 2, this.size.y / 2);
        }
        act() {
            this.speed.x = this.speed.y = 0;
            if (keys.left) {
                this.speed.x = -this.vx;
            } else if (keys.right) {
                this.speed.x = this.vx;
            }
            if (keys.up) {
                this.speed.y = -this.vx;
            } else if (keys.down) {
                this.speed.y = this.vx;
            }
            let nextPos=this.pos.plus(this.speed);
            if (!this.hitBounds(nextPos)) {
                this.pos=nextPos;
                this.update();
            }
        }
    }

    class Enemy extends HitActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.setSpriteData(queue.getResult("all"), "enemy1Idle", 1);
        }
        activate() {
            this.speed.length=Math.random()*2+2;
            this.speed.angle=Math.random()*Math.PI/2+Math.PI/4;
        }
        floatOnScreen(width, height) {
            //上下进入
            this.pos.y=-this.size.y;
            if (this.speed.x > 0) {
                this.pos.x = Math.random() * width * 0.5;
            } else {
                this.pos.x = Math.random() * width * 0.5 + 0.5 * width;
            }
        }
    }
    class Bullet extends HitActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speed.length=5;
            this.setSpriteData(queue.getResult("all"), "bullet");
            this.setReg(this.size.x/2,this.size.y/2);
        }
    }
})();