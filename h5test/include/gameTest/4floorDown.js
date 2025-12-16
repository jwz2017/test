import { gframe, queue, game, pressed, keys } from "../../classes/gframe.js";
import { Actor, JumpActor } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
import { BackgroundV, ScoreBoard } from "../../classes/zujian/screen.js";
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas');
    gframe.preload(FloorDown);
};
//游戏变量;
var stagestep;
var step = 100, stepindex;
var player;
export class FloorDown extends Game {
    static codes = {
        65: "left",
        68: "right",
        32: "pause",
    }
    static loadItem = [{
        id: "back",
        src: "spacehero/bg.png"
    }, {
        id: "player",
        src: "../assets/jump/spriteData.json",
        type: "spritesheet"
    }];
    constructor() {
        super("是男人就下100层");
        this.instructionText = "ad:左右方向";
        let bitmap = new createjs.Bitmap(queue.getResult("back"));
        this.background = new BackgroundV(this, bitmap, 2);
        player = new Player();
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(FloorDown.LEVEL);
        this.scoreboard.createTextElement(FloorDown.LIVES);
    }
    //初始化游戏数据
    newGame() {
        stagestep = -1;
        stepindex = step;
        let f = this.addFloor(0.5);
        // player.setPos(f.x, f.y - f.rect.height / 2 - player.rect.height / 2 - 100);
        // player.hp = 3;
        player.init(f.x, f.y - f.rect.height / 2 - player.rect.height / 2 - 100)

        this.container.addChild(player);
        this.scoreboard.update(FloorDown.LIVES, this.getLives());
    }
    getLives() {
        return player.hp == 3 ? "🧡🧡🧡" : player.hp == 2 ? "🧡🧡" : player.hp == 1 ? "🧡" : "";
    }
    newLevel() {
        this.scoreboard.update(FloorDown.LEVEL, this.level);
    }
    runGame() {
        //移动背景
        this.background.update();
        //加入floor
        if (stepindex-- < 0) {
            stepindex = step;
            this.addFloor();
        }
        //移动元素
        player.act();
        this.moveContainer(this.moveChildren);

    }
    addFloor(dex) {
        let index = dex || Math.random() * 50;
        if (index < 10) {
            var f = Floor.getActor();
        } else if (index < 20) {
            var f = Floor2.getActor();
        } else if (index < 30) {
            var f = Floor3.getActor();
        } else if (index < 40) {
            var f = Floor4.getActor()
        } else if (index < 50) {
            var f = Floor5.getActor()
        }
        f.init();
        f.setPos(Math.random() * 500, 680);
        this.addToMove(f);
        return f;
    }

}

//普通地板
class Floor extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.edgeBehavior = Floor.RECYCLE;
        this._color = "#fff"
    }
    init(xpos,ypos) {
        super.init(xpos,ypos)
        this.drawSpriteData(100, 15);
        this.speed.y = stagestep;
    }
    hitRun(actor) {
        if (this.speed.y > 0) actor.setPos(actor.rect.x, actor.rect.y + this.speed.y)
    }
}
//会消失的地板
class Floor2 extends Floor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.index = 0;
        this._color = "#00ff00"
    }
    init() {
        super.init();
        this.index = 0;
    }

    hitRun(actor) {
        super.hitRun(actor);
        this.index++;
        if (this.index >= 80) {
            this.recycle();
        } else if (this.index == 40) {
            this.image.graphics.clear().beginFill("#555").drawRect(-this.rect.width / 2, -this.rect.height / 2, this.rect.width, this.rect.height);
        }
    }
}
//带地刺会扣血的地板
class Floor3 extends Floor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.hited = false;
        this._color = "#ff0000"
    }
    init() {
        super.init();
        this.hited = false;
    }
    hitRun(actor) {
        super.hitRun(actor);
        if (!this.hited) {
            this.hited = true;
            actor.hp--;
            game.scoreboard.update(FloorDown.LIVES, game.getLives());
            if (actor.hp == 0) {
                game.gameOver = true;
            }
        }
    }
}
//会弹跳的地板
class Floor4 extends Floor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this._color = "#0000ff"
    }
    hitRun(actor) {
        super.hitRun(actor);
        actor.offSpeedY -= 8;
    }
}
//滑动地板
class Floor5 extends Floor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this._color = "#ffff00";
    }
    init() {
        super.init();
        this.speedx = Math.random() > 0.5 ? 1 : -1;
    }
    hitRun(actor) {
        super.hitRun(actor);
        actor.offSpeedX = this.speedx;
    }
}


class Player extends JumpActor {
    constructor() {
        super(24, 48);
        this.maxHp=3;
        this.setSpriteData(queue.getResult("player"), "stand", { imageScale: 0.6 });
    }
    act() {
        this.moveY();
        this.moveX(pressed[pressed.length - 1], keys);
        this.rebounds(game.contentSize,true)
        if (this.rect.y >= game.height) {
            game.gameOver = true;
        }
    }
    changeAct() {
        if (!this.status) this.image.gotoAndPlay("stand");
        else {
            this.image.gotoAndPlay(this.status);
        }
    }
    //与运动元素碰撞
    checkMoveProp() {
        var actor = this.hitActors(game.moveChildren);
        if (actor) {
            this.hitMoveFloor(actor)
        }
    }
}