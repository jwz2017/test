import { Game, ScoreBoard } from "../classes/Game.js";
import { Actor, MoveManage, Weapon } from "../classes/actor.js";
import { game, gframe, keys, queue, stage } from "../classes/gframe.js";
import { BackgroundV } from "../classes/other.js";

window.onload = function () {
    gframe.buildStage('canvas',true);
    gframe.preload(SpaceHero);
};
var spriteSheet;
var timeToEnemy, enemyIdex;
var DIFFICULTY = 2;
var moveManage=new MoveManage();
class SpaceHero extends Game {
    static loadItem = [{
        id: "all",
        src: "spacehero/all.json",
        type: "spritesheet"
    }, {
        id: "back",
        src: "spacehero/bg.png"
    }];
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
        100:"attack",
        32:"pause"
    }
    constructor() {
        super(null,600);
        this.x=stage.width-this.width>>1;
        spriteSheet = queue.getResult("all");
        //游戏背景
        let bitmap=new createjs.Bitmap(queue.getResult("back"));
        this.background = new BackgroundV(this,bitmap,3);
        //标题
        this.titleText = new createjs.Sprite(queue.getResult("all"), "title");
        //介绍
        this.instructionText="方向：w,a,s,d\n攻击：小键盘4";
        //player
        this.player = new Ship();
    }
    onTitleKeydown(){
        console.log(keys.up);
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard(this.width);
        this.scoreboard.x=this.x;
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement("lives");

    }
    newGame() {
        timeToEnemy = 120;
        enemyIdex = 0;
        this.lives = 3;
        this.updateScore(SpaceHero.LIVES,this.getLives())
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        this.player.init();
        this.addToPlayer(this.player);
    }
    //移动背景
    runGame() {
        this.background.update();
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
            let enemy = SpaceHero.getActor(Enemy,this.enemyLayer);
            enemy.init();
            // enemy.setPos(300,400);
            enemyIdex = timeToEnemy + timeToEnemy * Math.random();
        }
        // enemyIdex=5;

    }
    getLives(){
       return this.lives == 3 ? "🧡🧡🧡" : this.lives == 2 ? "🧡🧡" : this.lives == 1 ? "🧡" : "";
    }
}
class Ship extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos,50,40,true);
        this.edgeBehavior = Ship.BOUNCE;
        this.setSpriteData(queue.getResult("all"), "heroIdle", 0.7, 90);
        this.setRotation(-90);
        this.hp = 5;
        this.velocity=3;
        this.weapon=new Weapon(this,PlayerBullet,20,3);
    }
    init(){
        // this.image.gotoAndPlay("herohit");
        this.hp = 5;
        this.x=stage.width/2;
        this.y=stage.height-this.rect.height;
        this.updateRect();
    }
    act() {
        moveManage.planeMove(this,keys);
        this.weapon.fire(keys.attack);
        super.act();
        //检测碰撞
        if (this.image.currentAnimation == "heroIdle") {
            let actor = this.hitActors(game.enemyChildren, this.rect, true);
            if (actor) {
                if (actor.type == "enemy") {
                    actor.recycle();
                    let explode = SpaceHero.getActor(Explode, game);
                    explode.x = actor.x;
                    explode.y = actor.y;
                } else if (actor.type == "enemybullet") {
                    actor.recycle();
                }
                this.image.gotoAndPlay("heroHit");
                this.hp--;
                if (this.hp <= 0) {
                    let ex = SpaceHero.getActor(Explode, game);
                    ex.x = this.x;
                    ex.y = this.y;
                    game.lives--
                    game.updateScore(Game.LIVES,game.getLives())
                    if (game.lives == 0) {
                        game.gameOver = true;
                    } else {
                        this.init();
                    }
                }
            }
        }
    }
    get hit(){
       return this.rect.height/2;
    }
}

class Enemy extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.edgeBehavior = Enemy.RECYCLE;
        this.type = "enemy";
        this.bulletType = 1;
        this.setSpriteData(queue.getResult("all"), "enemy1Idle", 1, -90);
        this.setRotation(90);
        this.weapon=new Weapon(this,EnemyBullet,20);
    }
    init(){
        this.hp = 5;
        this.speed.length = Math.random() * 2 + 2;
        this.speed.angle = Math.random() * Math.PI / 2 + Math.PI / 4;
        this.y = -this.rect.height / 2;
        if (this.speed.x > 0) this.x = Math.random() * game.width / 2;
        else this.x = Math.random() * game.width / 2 + game.width / 2;
        this.updateRect();
    }
    act() {
        if (Math.random() < 0.2) {
            this.weapon.fire(true);
        }
        super.act();
        let actor = this.hitActors(game.playerChildren, this.rect, true);
        if (actor) {
            if (actor.type == "playerbullet") {
                actor.recycle();
                this.hp--
                if (this.hp <= 0) {
                    game.score += 10;
                    game.scoreboard.update(SpaceHero.SCORE, game.score);
                    let explode = SpaceHero.getActor(Explode, game);
                    explode.x = this.x;
                    explode.y = this.y;
                    this.recycle();
                }
            }
        }
    }
    get hit(){
        return this.rect.height/2;
    }
}
class EnemyBullet extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.type = "enemybullet";
        this.edgeBehavior=Actor.RECYCLE;
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
        this.speed.length = 5;
        this.setSpriteData(spriteSheet, "bullet", 1, 90);
        this.image.paused = true;
    }
}
class Explode extends createjs.Sprite {
    constructor() {
        super(spriteSheet, "explosion");
        let b = this.getBounds();
        this.regX = b.width / 2 + b.x;
        this.regY = b.height / 2 + b.y;
        this.on("animationend", () => {
            this.recycle();
        })
    }
    recycle() {
        if (this.parent) {
            this.parent.removeChild(this);
            this.active=false;
        }
    }
}
