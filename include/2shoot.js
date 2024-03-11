import { Game, ScoreBoard } from "../classes/Game.js";
import { Actor, CirActor, Vector } from "../classes/actor.js";
import { game, gframe, lib, queue, stage } from "../classes/gframe.js";

window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(Shoot);
};
const NUMENEMY = "plane",
    SHOTS = "shots";
var crosshairs, spriteSheet;
var playerBullets = [],
    numPlayerBullets,//玩家弹药量
    exployeds = [],
    //船只
    ships=[],//出场船只数组
    shipStore=3,
    //敌机
    enemys=[],
    enemyFrameCount,
    enemyWaveDely,
    enemyWaveChance,
    enemyWaveMax,
    maxEnemys,
    numEnemy;
class Shoot extends Game {
    static loadItem = [{
        id: "shoot",
        src: "shoot/shoot.json"
    }];
    static loadId = 'DB0F6E8AA40CA64BB67AC23B3362E66C';
    constructor() {
        super("射击游戏");
        this.keyboard=true;
        spriteSheet = new createjs.SpriteSheet(queue.getResult("shoot"));
        //十字光标
        crosshairs = new lib.Cross();
        crosshairs.scale = 0.7;
        this.maxLevel = 50;
        // enemys = [];
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement(NUMENEMY);
        this.scoreboard.createTextElement(SHOTS);
    }
    newGame() {
        //初始化船只仓库
        shipStore=3;
        this.level=20;
    }
    newLevel() {
        this.scoreboard.update("score",this.score);
        this.scoreboard.update("level",this.level);
        numPlayerBullets = 10 + this.level * 6;
        this.scoreboard.update(SHOTS, numPlayerBullets);
        //初始化出场船只
        for (let i = 0; i <shipStore; i++) {
            Shoot.getActor(ships,Ship);
        }
        maxEnemys = 10 + this.level * 5;
        this.scoreboard.update(NUMENEMY, maxEnemys);
        numEnemy = 0;
        enemyFrameCount = 0;
        enemyWaveDely = 100 - this.level * 2;
        enemyWaveChance = 50 + this.level * 2;
        enemyWaveMax = this.level + 1;
    }
    waitComplete() {
        stage.addChild(crosshairs);
        //隐藏鼠标stage.enableMouseOver必须false
        stage.canvas.style.cursor = "none";
        //鼠标点击发射子弹
        stage.on("stagemousedown", (e) => {
            if (numPlayerBullets <= 0) return;
            let shoot = Game.getActor(playerBullets, Shot);
            numPlayerBullets--;
            this.scoreboard.update(SHOTS, numPlayerBullets)
            stage.addChild(shoot);
            let startPoint = new Vector(stage.width / 2, stage.height);
            let endPoint = new Vector(e.stageX, e.stageY);
            let dis = startPoint.dist(endPoint);
            shoot.x = startPoint.x;
            shoot.y = startPoint.y;
            createjs.Tween.get(shoot).to({
                x: e.stageX,
                y: e.stageY
            }, dis / shoot.speed.length).call(() => {
                shoot.recycle();
                let exploy = Game.getActor(exployeds, Exploy);
                exploy.x=shoot.x;
                exploy.y=shoot.y;
                exploy.updateRect();
                stage.addChild(exploy);
                exploy.image.gotoAndPlay("exployed");
            });
        });
        //放置船队位置
        this.placeShip();
    }
    runGame() {
        //光标位置
        crosshairs.x = stage.mouseX;
        crosshairs.y = stage.mouseY;

        //创建敌机
        this.createEnemy()
        //渲染敌机
        for (const enemy of enemys) {
            if(enemy.active) enemy.act();
        }
        //爆炸
        for (const exploy of exployeds) {
            if (exploy.active) exploy.act();
        }
        //检测是否过关
        let isenemy = enemys.some(function (enemy) {
            return enemy.active == true;
        });
        if (numEnemy == maxEnemys && !isenemy) {
            this.levelUp=true;
        }
    }
    
    placeShip() {
        let l = ships.length;
        let spacing = stage.width / shipStore;
        let j=0;
        for (let i = 0; i < l; i++) {
            const ship = ships[i];
            if(ship.active){
                ship.x = spacing * (j + 1) - spacing / 2;
                ship.y = stage.height - ship.rect.height / 2;
                ship.updateRect();
                stage.addChild(ship);
                j++;
            }
        }
    }
    createEnemy() {
        enemyFrameCount++;
        if (enemyFrameCount >= enemyWaveDely && numEnemy < maxEnemys) {
            let chance = Math.floor(Math.random() * 100) + 1;
            let enemiesToCreate = 1;
            if (chance <= enemyWaveChance) {
                enemiesToCreate = Math.floor(Math.random() * enemyWaveMax) + 1;
            }
            if (enemiesToCreate > maxEnemys - numEnemy) {
                enemiesToCreate = maxEnemys - numEnemy;
            }
            for (let i = 0; i < enemiesToCreate; i++) {
                let enemy = Game.getActor(enemys, Enemy);
                enemy.x = Math.random() * (stage.width - enemy.rect.width) + enemy.rect.width / 2;
                enemy.y = -enemy.rect.height / 2;
                enemy.updateRect();
                stage.addChild(enemy);
                numEnemy++;
                this.scoreboard.update(NUMENEMY, maxEnemys - numEnemy);
            }
            enemyFrameCount = 0;
        }
    }
    clear(){
        super.clear();
        stage.removeAllEventListeners("stagemousedown");
    }

}
//玩家子弹
class Shot extends CirActor {
    constructor() {
        super(0,0,0,false);
        this.speed.length = 0.5;
        this.setSpriteData(spriteSheet, "bullet1");
    }
}
//子弹爆炸
class Exploy extends CirActor {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.setSpriteData(spriteSheet, "exployed");
        this.hit = 54;
        this.multiple = 0;

    }
    act() {
        if (this.image.paused) {
            this.recycle();
            this.multiple = 0;
        } else {
            let o = this.hitActors(enemys,this.rect,true);
            if (o) {
                this.multiple++;
               game.score += 10 * this.multiple;
                game.scoreboard.update("score",game.score);
                o.recycle();
            }
        }
    }
}
//船
class Ship extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.setSpriteData(spriteSheet, "ship", 1, 90);
    }
}
//敌机
class Enemy extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos,0,0,false);
        this.setSpriteData(spriteSheet, "enemy1", 1);
        this.speed.y = 3;
        this.edgeBehavior = Actor.RECYCLE;
    }
    act() {
        super.act();
        let ob = this.hitActors(ships);
        if (ob) {
            ob.recycle();
            shipStore--;
            if (shipStore== 0) {
                game.gameOver=true;
            }
            this.recycle();
        }
    }
}