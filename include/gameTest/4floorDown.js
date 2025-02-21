import { stage, gframe, queue, game, pressed, keys } from "../../classes/gframe.js";
import { Actor, JumpActor } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
import { ScoreBoard } from "../../classes/screen.js";
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
        32:"pause",
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
        this.instructionText="ad:左右方向";
        this.background = new Background("back", this);
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
        player.setPos(f.x, f.y - f.rect.height / 2 - player.rect.height / 2 - 100);
        player.hp=3;
        this.addToPlayer(player);
        this.scoreboard.update(FloorDown.LIVES,this.getLives());
    }
    getLives(){
        return player.hp == 3 ? "🧡🧡🧡" : player.hp == 2 ? "🧡🧡" : player.hp == 1 ? "🧡" : "";
     }
    newLevel() {
        this.scoreboard.update(FloorDown.LEVEL, this.level);
    }
    runGame() {
        //移动背景
        this.background.run();
        //加入floor
        if (stepindex-- < 0) {
            stepindex = step;
            this.addFloor();
        }
        //移动元素
        this.moveActors(this.playerLayer);
        this.moveActors(this.enemyLayer)

    }
    addFloor(dex) {
        let index = dex || Math.random() * 5;
        if (index < 1.2) {
            var f = Floor.getActor();
        } else if (index < 2) {
            var f = Floor2.getActor();
        } else if (index < 3) {
            var f = Floor3.getActor();
        } else if (index < 4) {
            var f = Floor4.getActor()
        } else if (index < 5) {
            var f = Floor5.getActor()
        }
        f.init();
        f.setPos(Math.random() * 500, 680);
        this.addToEnemy(f);
        return f;
    }

}
class Background {
    constructor(urlId, parent) {
        this.bitmap1 = new createjs.Bitmap(queue.getResult(urlId));
        this.bitmap2 = this.bitmap1.clone();
        this.bitmap2.regY = stage.height / 2;
        this.bitmap2.y = stage.height * 3 / 2;
        this.bitmap2.scaleY = -1;
        parent.addChildAt(this.bitmap1, 0);
        parent.addChildAt(this.bitmap2, 0);
    }
    run() {
        this.bitmap1.y += stagestep;
        this.bitmap2.y += stagestep;
        if (this.bitmap1.y < -stage.height) {
            this.bitmap1.y = this.bitmap2.y - stage.height / 2;
            this.bitmap2.y = this.bitmap1.y + stage.height * 3 / 2;
            game.level++;
            game.scoreboard.update(FloorDown.LEVEL, game.level);
            stagestep -= 0.1;
        }
    }

}
//普通地板
class Floor extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.edgeBehavior = Floor.RECYCLE;
        this._color="#fff"
    }
    init() {
        this.drawSpriteData(100,15);
        this.speed.y = stagestep;
    }
    hitRun(actor) {
        actor.plus(0, this.speed.y);
    }
}
//会消失的地板
class Floor2 extends Floor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.index = 0;
        this._color="#00ff00"
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
        this._color="#ff0000"
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
            game.scoreboard.update(FloorDown.LIVES,game.getLives());
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
        this._color="#0000ff"
    }
    hitRun(actor) {
        super.hitRun(actor);
        actor.speed.y = -8;
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
        actor.plus(this.speedx, 0);
    }
}
class Player extends JumpActor {
    constructor(xpos, ypos) {
        super(xpos, ypos,24,48);
        this.setSpriteData(queue.getResult("player"), "stand",{imageScale:0.6});
    }
    init() {
        this.hp = 3;
        this.status = null;
    }
    act() {
        this.moveY();
        this.moveX();
        game.rebounds(this,true);
    }
    changeAct() {
        if (!this.status) this.image.gotoAndPlay("stand");
        else {
            this.image.gotoAndPlay(this.status);
        }
    }
    moveY() {
        this.speed.y += this.gravity;
        if (this.rect.y >= game.height) {
            game.gameOver = true;
        }
        let other = game.hitActors(this,game.enemyChildren, this.rect)
        if (other && this.speed.y >= Math.max(0, this.y - other.rect.y)) {
            this.setPos(this.rect.x, other.rect.y - this.rect.height);
            this.hitFloor();
            other.hitRun(this);
        } else {
            this.overhead();
        }
    }
    moveX() {
        this.walk(pressed[pressed.length - 1], keys)
        this.plus(this.speed.x, 0);
    }
}