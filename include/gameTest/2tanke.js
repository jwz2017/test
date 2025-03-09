import { Game,Node} from "../../classes/Game.js";
import { Actor, CirActor, MoveManage, Weapon } from "../../classes/actor.js";
import { game, gframe, keys, pressed, queue, stage } from "../../classes/gframe.js";
import { ScoreBoard } from "../../classes/screen.js";

window.onload = function () {
    gframe.buildStage('canvas',false);
    gframe.preload(Tanke);
};
var spriteData, spriteSheet;
var moveManage = new MoveManage();
var step = 32,
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
    ];

class Tanke extends Game {
    static loadItem = [{
        id: "tanke",
        src: "tanke/q.png"
    }];
    static backgroundColor= "#A4AB61";
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
        100:"attack",
        32:"pause"
    }
    constructor() {
        super("坦克大战", plans[0][0].length * step, plans[0].length * step);
        this.enemyBulletLayer=gframe.createrContainer(this.container);
        this.playerBulletLayer=gframe.createrContainer(this.container);
        this.x = stage.width - this.width >> 1;
        this.y = stage.height - this.height >> 1;
        this.instructionText = "方向w,a,s,d小键盘4开火攻击";
        this.playerChars = {
            "1": Player,
        };
        this.propChars = {
            "23": Live,
            "20": Bullet,
            "22": TankLive
        };
        this.enemyChars = {
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

    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        //创建网格
        let plan = plans[this.level - 1];
        this.createGridMap(plan,step,step, (ch, x,y) => {
            var tile = new createjs.Sprite(spriteSheet).set({
                x: x * step + step / 2,
                y: y * step + step / 2
            });
            if (this.playerChars[ch] || this.propChars[ch] || this.enemyChars[ch] || ch == 0) {
                tile.gotoAndStop(0);
            } else {
                this.createNode(x,y,Node.NOWALKABLE);
                tile.gotoAndStop(ch);
            }
            this.addToFloor(tile);
        });
    }
    runGame() {
        this.moveActors(this.playerLayer);
        this.moveActors(this.enemyLayer);
        this.moveActors(this.playerBulletLayer);
        this.moveActors(this.enemyBulletLayer);
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

class Player extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 0.8 * step, 0.8 * step);
        this.type = "player";
        this.setSpriteData(spriteSheet, "player",{ rotation:90});
        this.image.paused = true;
        this.rotation=-90;
        this.weapon = new Weapon(this,PlayerBullet);
        
    }
    act() {
        //移动
        moveManage.tankMove(this, pressed[pressed.length - 1])
        //开火
        this.weapon.fire(keys.attack,game.playerBulletLayer);
        //与地图碰撞
        let rect = this.rect.clone();
        rect.x += this.speed.x;
        rect.y += this.speed.y;
        let node = game.hitMap(rect,null,0,(node)=>{
            game.clearNode(node.x,node.y)
            switch (node.actor.type) {
                case "live":
                    console.log("live");
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
        });
        var actor = game.hitActors(this,game.enemyLayer.children, rect);
        if (!node && !actor) super.act();
    }
}
class Enemy extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 0.8 * step, 0.8 * step);
        this.setSpriteData(spriteSheet, "enemy",{rotation:90});
        this.rotation=90;
        this.tick = 0;
        this.key = 80;
        this.type = "enemy";
        this.image.paused = true;
        this.weapon = new Weapon(this,EnemyBullet);
    }
    act() {
        this.tick++;
        if (this.tick > Math.random() * 80 + 200) {
            this.key = Math.random() * 100;
            this.tick1 = this.tick;
            this.tick = 0;
        }
        if (this.tick1 >= 100) this.weapon.fire(true,game.enemyBulletLayer);
        if (this.key <= 10) this.key = "up";
        else if (this.key > 10 && this.key <= 40) this.key = "down";
        else if (this.key > 40 && this.key <= 65) this.key = "right";
        else if (this.key > 65) this.key = "left";

        moveManage.tankMove(this, this.key)
        let rect = this.rect.clone();
        rect.x += this.speed.x;
        rect.y += this.speed.y;
        var node = game.hitMap(rect);
        let actor = game.hitActors(this,game.playerLayer.children.concat(game.enemyLayer.children), rect);
        if (!node&&!actor) {
            // if (!actor || (actor.type != "enemy" && actor.type != "player")) {
                this.plus(this.speed.x, this.speed.y);
            // }
        } else {
            this.key = Math.random() * 100;
            this.tick = 0;
        }
    }
}
class PlayerBullet extends CirActor {
    constructor(xpos, ypos) {
        super(xpos, ypos,6);
        this.speed.length = 3;
        this.type="playerBullet";
        // this.drawSpriteData(6)
        this.setSpriteData(spriteSheet, "barrage",{imageScale:1.5})
    }
    act() {
        let node = game.hitMap(this.rect);
        if (!node) {
            let actor = game.hitActors(this,game.enemyLayer.children.concat(game.enemyBulletLayer.children));
            if (!actor) {
                super.act();
            } else {
                this.recycle();
                if(actor.type=="enemyBullet")actor.recycle();
            }
        } else {
            this.recycle();
        }
    }
}

class EnemyBullet extends CirActor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.speed.length = 3;
        this.type="enemyBullet";
        this.drawSpriteData(8)
    }
    act() {
        let node = game.hitMap(this.rect);
        if (!node) {
            let actor = game.hitActors(this,game.playerLayer.children.concat(game.playerBulletLayer.children));
            if (!actor) {
                super.act();
            } else  {
                this.recycle();
                if(actor.type=="playerBullet")actor.recycle();
            }
        } else {
            this.recycle();
        }
    }
}

class Live extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, step, step);
        this.type = "live";
        this.setSpriteData(spriteSheet, "live");
    }
}
class Bullet extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 0.3 * step, 0.7 * step);
        this.type = "bullet";
        this.plus(0.35 * step, 0.15 * step)
        this.setSpriteData(spriteSheet, "buttle");
    }
}
class TankLive extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 0.6 * step, 0.6 * step);
        this.plus(0.2 * step, 0.2 * step);
        this.setSpriteData(spriteSheet, "tanke");
        this.type = "tank";
    }
}


