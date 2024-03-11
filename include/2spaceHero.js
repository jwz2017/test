import { Game, ScoreBoard } from "../classes/Game.js";
import { Actor, Plane } from "../classes/actor.js";
import { game, gframe, keys, queue, stage } from "../classes/gframe.js";

window.onload = function () {
    gframe.buildStage('canvas', true);
    gframe.preload(SpaceHero, true);
};
var spriteSheet;
var timeToEnemy, enemyIdex;
var enemys = [], DIFFICULTY = 2;
var playerBullets = [], explodes = [], enemyBullets = [];
class SpaceHero extends Game {
    static loadItem = [{
        id: "all",
        src: "spacehero/all.json",
        type: "spritesheet"
    }, {
        id: "back",
        src: "spacehero/bg.png"
    }];
    constructor() {
        super();
        spriteSheet = queue.getResult("all");
        //游戏背景
        this.background = new Background("back", this);
        //标题
        let title = new createjs.Sprite(queue.getResult("all"), "title");
        this.titleScreen.addChild(title);
        title.x = 100;
        title.y = 100;
        this.instructionScreen.updateTitle("方向：w,a,s,d\n攻击：小键盘4");
        //player
        this.player = new Ship();
    }
    /**建立游戏元素游戏初始化
     * 在构造函数内建立
     */
    createScoreBoard() {
        this.scoreboard = new ScoreBoard(0, 0, null);
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement("lives");

    }
    newGame() {
        timeToEnemy = 120;
        enemyIdex = 0;
        this.lives = 3;
        this.updateLives(this.lives);
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        this.player.activate();
        this.addToPlayer(this.player);
    }
    runGame() {
        //移动背景
        this.background.run();
        //加入敌机
        this.addEnemy();
        //移动元素
        this.moveActors(this.playerLayer);
        this.moveActors(this.enemyLayer);
    }
    addEnemy() {
        if (enemyIdex-- <= 0) {
            timeToEnemy -= DIFFICULTY;
            timeToEnemy = Math.max(timeToEnemy, 10);
            let enemy = SpaceHero.getActor(enemys, Enemy);
            enemy.activate();
            this.addToEnemy(enemy);
            // enemy.setPos(300,400);
            enemyIdex = timeToEnemy + timeToEnemy * Math.random();
        }
        // enemyIdex=5;
    }
}
class Background {
    constructor(urlId, parent) {
        this.bitmap1 = new createjs.Bitmap(queue.getResult(urlId));
        this.bitmap2 = this.bitmap1.clone();
        this.bitmap2.regY = stage.height / 2;
        this.bitmap2.y = -stage.height / 2;
        this.bitmap2.scaleY = -1;
        parent.addChildAt(this.bitmap1, 0);
        parent.addChildAt(this.bitmap2, 0);
    }
    run() {
        this.bitmap1.y += 1;
        this.bitmap2.y += 1;
        if (this.bitmap1.y > stage.height) {
            this.bitmap1.y = this.bitmap2.y - stage.height / 2;
            this.bitmap2.y = this.bitmap1.y - stage.height / 2;
        }
    }
}

class Ship extends Plane {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.edgeBehavior = Ship.BOUNCE;
        this.setSpriteData(queue.getResult("all"), "heroIdle", 0.7, 90);
        this.setRotation(-90);
        this.hp = 5;
        this.hit = this.rect.height / 2;
    }
    activate() {
        this.image.gotoAndPlay("herohit")
        this.hp = 5;
        this.fireStep = 20;
        this.bulletType = 19;
        this.setPos(stage.width / 2 - this.rect.width / 2, stage.height - this.rect.height);
    }
    act() {
        this.move(keys);
        if (keys.attack) this.fire(playerBullets, PlayerBullet, game.playerLayer);
        else this.fireIndex--;
        super.act();
        //检测碰撞
        if (this.image.currentAnimation == "heroIdle") {
            let actor = this.hitActors(game.enemyChildren, this.rect, true);
            if (actor) {
                if (actor.type == "enemy") {
                    actor.recycle();
                    let explode = SpaceHero.getActor(explodes, Explode, stage);
                    explode.x = actor.x;
                    explode.y = actor.y;
                } else if (actor.type == "enemybullet") {
                    actor.recycle();
                }
                this.image.gotoAndPlay("heroHit");
                this.hp--;
                if (this.hp <= 0) {
                    let ex = SpaceHero.getActor(explodes, Explode, stage);
                    ex.x = this.x;
                    ex.y = this.y;
                    game.lives--
                    game.updateLives(game.lives);
                    if (game.lives == 0) {
                        game.gameOver = true;
                    } else {
                        this.activate();
                    }
                }
            }
        }
    }
}

class Enemy extends Plane {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.edgeBehavior = Enemy.RECYCLE;
        this.type = "enemy";
        this.bulletType = 1;
        this.setSpriteData(queue.getResult("all"), "enemy1Idle", 1, -90);
        this.setRotation(90);
        this.hit = this.rect.height / 2;
    }
    activate() {
        this.hp = 5;
        this.speed.length = Math.random() * 2 + 2;
        this.speed.angle = Math.random() * Math.PI / 2 + Math.PI / 4;
        this.y = -this.rect.height / 2;
        if (this.speed.x > 0) this.x = Math.random() * game.width / 2;
        else this.x = Math.random() * game.width / 2 + game.width / 2;
        this.updateRect();
    }
    act() {
        super.act();
        if (Math.random() < 0.2) {
            this.fire(enemyBullets, EnemyBullet, game.enemyLayer);
        }
        let actor = this.hitActors(game.playerChildren, this.rect, true);
        if (actor) {

            if (actor.type == "playerbullet") {
                actor.recycle();
                this.hp--
                if (this.hp <= 0) {
                    game.score += 10;
                    game.scoreboard.update(SpaceHero.SCORE, game.score);
                    let explode = SpaceHero.getActor(explodes, Explode, stage);
                    explode.x = this.x;
                    explode.y = this.y;
                    this.recycle();
                }
            }
        }
    }
}
class EnemyBullet extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.type = "enemybullet";
        this.speed.length = 5;
        this.setSpriteData(spriteSheet, "bullet", 1, -90);
        this.image.gotoAndStop(136);
    }

}
class PlayerBullet extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.type = "playerbullet";
        this.edgeBehavior = PlayerBullet.RECYCLE;
        this.speed.length = 10;
        this.setSpriteData(queue.getResult("all"), "bullet", 1, 90);
        this.image.paused = true;
    }
}
class Explode extends createjs.Sprite {
    constructor() {
        super(queue.getResult("all"), "explosion");
        let b = this.getBounds();
        this.regX = b.width / 2 + b.x;
        this.regY = b.height / 2 + b.y;
        this.on("animationend", () => {
            this.recycle();
        })
    }
    recycle() {
        if (this.parent) this.parent.removeChild(this);
    }
}
