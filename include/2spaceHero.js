import { Actor } from "../classes/actor.js";
import { gframe, keys, queue, stage } from "../classes/gframe.js";

window.onload = function () {
    gframe.style.TITLE_TEXT_COLOR = "#ffffff";
    gframe.buildStage('canvas',true);
    gframe.preload(SpaceHero,true);
    gframe.startFPS();
};
var ENEMY_TIME = 120,
    BULLET_TIME = 40,
    DIFFICULTY = 2;
var enemys,
    nextEnemy,
    timeToEnemy,
    nextBullet,
    bullets;
class SpaceHero extends gframe.Game {
    static loadItem = [{
        id: "all",
        src: "spacehero/all.json",
        type: "spritesheet"
    }];
    constructor() {
        super();
        let title = new createjs.Sprite(queue.getResult("all"), "title");
        this.titleScreen.addChild(title);
        title.x = 100;
        title.y = 100;
        this.instructionScreen.title.text = "方向：w,a,s,d\n攻击：小键盘4";
    }
    /**建立游戏元素游戏初始化
     * 在构造函数内建立
     */
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0, 0, null);
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.placeElements();
    }
    newLevel() {
        this.scoreboard.update("score",this.score);
        this.scoreboard.update("level",this.level);
        enemys = [];
        bullets = [];
        nextEnemy = nextBullet = 0;
        timeToEnemy = ENEMY_TIME;

    }
    waitComplete() {
        this.player = new Ship();
        this.player.setPos(stage.width / 2, stage.height - this.player.rect.height / 2);
        stage.addChild(this.player);

    }
    runGame() {
        //飞船
        this.player.act();
        if (nextBullet <= 0) {
            if (keys.attack) {
                nextBullet = BULLET_TIME;
                let bullet = gframe.Game.getActor(bullets, Bullet);
                bullet.speed.angle = -Math.PI / 2;
                bullet.setPos(this.player.x, this.player.y)
                stage.addChild(bullet);
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
            let enemy = gframe.Game.getActor(enemys, Enemy);
            stage.addChild(enemy);
            enemy.activate();
            enemy.floatOnScreen(stage.width, stage.height);
            nextEnemy = timeToEnemy + timeToEnemy * Math.random();
        } else {
            nextEnemy--;
        }
        for (const enemy of enemys) {
            if (enemy.active) {
                enemy.act();
                // enemy.setPos(200,200);
            }
        }
        //飞船与敌机矩形碰撞
        if (this.player.image.currentAnimation=="heroIdle"&&this.player.hitActors(enemys,this.rect,true)) {
            this.player.image.gotoAndPlay("heroHit");
        }
    }
}


class Ship extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.vx = 2.5;
        this.init(50, 40);
        this.setSpriteData(queue.getResult("all"), "heroIdle", 0.7);
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
        let rect = this.rect.clone();
        rect.x += this.speed.x;
        rect.y += this.speed.y;
        if (!this.hitBounds(rect)) {
            this.plus(this.speed.x, this.speed.y);
        }
    }
}

class Enemy extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.setSpriteData(queue.getResult("all"), "enemy1Idle", 1);
    }
    activate() {
        this.speed.length = Math.random() * 2 + 2;
        this.speed.angle = Math.random() * Math.PI / 2 + Math.PI / 4;
    }
    floatOnScreen(width, height) {
        //上下进入
        this.y = -this.getBounds().height / 2;
        if (this.speed.x > 0) {
            this.x = Math.random() * width * 0.5;
        } else {
            this.x = Math.random() * width * 0.5 + 0.5 * width;
        }
        this.setPos(this.x, this.y);
    }
}
class Bullet extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.speed.length = 5;
        this.setSpriteData(queue.getResult("all"), "bullet");
        this.image.paused = true;
        this.edgeBehavior=Actor.RECYCLE;
    }
}
