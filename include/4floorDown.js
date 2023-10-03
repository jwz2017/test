import { stage, gframe, queue, game, keys, pressed } from "../classes/gframe.js";
import { Actor } from "../classes/actor.js";
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas');
    //stage.setClearColor(0x00000000);
    gframe.preload(FloorDown, true);
    gframe.startFPS();
};
//游戏变量;
var stagestep;
var floor = [], floor2 = [],floor3=[],floor4=[],floor5=[];
var step = 100, stepindex;
var player;
export class FloorDown extends gframe.Game {
    static loadItem = [{
        id: "back",
        src: "spacehero/bg.png"
    }, {
        id: "player",
        src: "../assets/jump/spriteData.json",
        type: "spritesheet"
    }];
    //static loadId = null;
    constructor() {
        super("是男人就下100层");
        this.instructionScreen.updateTitle("ad:左右方向")
        this.background = new Background("back", this);
        player = new Player(0, 0);
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard();
        this.scoreboard.createTextElement(FloorDown.LEVEL);
        this.scoreboard.createTextElement(FloorDown.LIVES);
    }
    //初始化游戏数据
    newGame() {
        stagestep=-1;
        stepindex = step;
        let f = this.addFloor(0.5);
        player.setPos(f.x, f.y - f.rect.height / 2 - player.rect.height / 2 - 100);
        player.init(24,48);
        this.addChild(player);
        this.updateBoardLives();
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
        this.moveActors();
        
    }
    updateBoardLives(){
        this.scoreboard.update(FloorDown.LIVES,player.hp==3?"🧡🧡🧡":player.hp==2?"🧡🧡":player.hp==1?"🧡":"");
    }
    addFloor(dex) {
        let index = dex || Math.random() * 5;
        if (index < 1.2) {
            var f = FloorDown.getActor(floor, Floor);
        } else if (index < 2) {
            var f = FloorDown.getActor(floor2, Floor2);
        }else if(index<3){
            var f=FloorDown.getActor(floor3,Floor3);
        }else if(index<4){
            var f=FloorDown.getActor(floor4,Floor4)
        }else if(index<5){
            var f=FloorDown.getActor(floor5,Floor5)
        }
        f.init(100, 15);
        f.setPos(Math.random() * 500, 680);
        this.addChild(f);
        return f;
    }

}
class Background {
    constructor(urlId, parent) {
        this.bitmap1 = new createjs.Bitmap(queue.getResult(urlId));
        this.bitmap2 = this.bitmap1.clone();
        this.bitmap2.y = stage.height;
        parent.addChildAt(this.bitmap1, 0);
        parent.addChildAt(this.bitmap2, 0);
    }
    run() {
        this.bitmap1.y += stagestep;
        this.bitmap2.y += stagestep;
        if (this.bitmap1.y < -stage.height) {
            this.bitmap1.y = this.bitmap2.y;
            this.bitmap2.y = this.bitmap1.y + stage.height;
            game.level++;
            game.scoreboard.update(FloorDown.LEVEL,game.level);
            stagestep-=0.1;
        }
    }

}
//普通地板
class Floor extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.edgeBehavior = Floor.RECYCLE;
        this.color = "#fff";
    }
    init(w,h){
        super.init(w,h);
        this.speed.y=stagestep;
    }
    act() {
        super.act();
    }
    hitRun(actor) {
        actor.plus(0, this.speed.y);
    }
}
//会消失的地板
class Floor2 extends Floor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.color="#00ff00"
        this.index = 0;
    }
    init(width, height) {
        super.init(width, height);
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
class Floor3 extends Floor{
    constructor(xpos,ypos){
        super(xpos,ypos);
        this.color="#ff0000";
        this.hit=false;
    }
    init(width,height){
        super.init(width,height);
        this.hit=false;
    }
    hitRun(actor){
        super.hitRun(actor);
        if(!this.hit){
            this.hit=true;
            actor.hp--;
            game.updateBoardLives()
            if(actor.hp==0){
                game.clear(gframe.event.GAME_OVER);
            }
        }
    }
}
//会弹跳的地板
class Floor4 extends Floor{
    constructor(xpos,ypos){
        super(xpos,ypos);
        this.color="#0000ff";    
    }
    hitRun(actor){
        super.hitRun(actor);
        actor.speed.y=-8;
    }
}
//滑动地板
class Floor5 extends Floor{
    constructor(xpos,ypos){
        super(xpos,ypos);
        this.color="#ffff00";
    }
    init(width,height){
        super.init(width,height);
        this.speedx=Math.random()>0.5?1:-1;
    }
    hitRun(actor){
        super.hitRun(actor);
        actor.plus(this.speedx,0);
    }
}
class Player extends Actor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.gravity = 0.27;
        this.walkspeed = 1.8;
    }
    init(width,height){
        super.init(width,height);
        this.hp=3;
        this.status=null;
        this._acting=this.stop;
        this.setSpriteData(queue.getResult("player"), "stand", 0.6);
    }
    act() {
        this.moveY();
        this.moveX();
        this._acting();
        let rect = this.rect;
        if (rect.x < 0) {
            rect.x = 0;
            this.x = rect.width / 2;
        } else if (rect.x + rect.width > game.width) {
            rect.x = game.width - rect.width;
            this.x = game.width - rect.width / 2;
        }
        if (rect.y < 0) {
            rect.y = 0;
            this.y = rect.height / 2;
        }
    }
    stop() {

    }
    moveY() {
        this.speed.y += this.gravity;
        if (this.rect.y >= game.height) {
            game.clear(gframe.event.GAME_OVER);
            return;
        }
        let rect = this.rect.clone();
        rect.y += this.speed.y;
        let other = this.hitActors(game.container.children, rect)
        if (other && this.speed.y > this.rect.y + this.rect.height / 2 - other.rect.y) {
            if (this.status == "jump") {
                this.status = null;
                this.image.gotoAndPlay("stand")
            }
            this.speed.y = 0;
            other.hitRun(this);
            this.setPos(this.rect.x, other.rect.y - this.rect.height);
        } else {
            if (this.status != "jump") {
                this.status = "jump";
                this.image.gotoAndPlay("jump");
            }
            this.plus(0, this.speed.y)
        }
    }
    moveX() {
        switch (pressed[pressed.length - 1]) {
            case "left":
                this.speed.x = -this.walkspeed;
                this.scaleX = -1;
                if (!this.status) {
                    this.image.gotoAndPlay("walk");
                    this.status = "walk";
                }
                break;
            case "right":
                this.speed.x = this.walkspeed;
                this.scaleX = 1;
                if (!this.status) {
                    this.image.gotoAndPlay("walk");
                    this.status = "walk";
                }
                break;
            default:
                this.speed.x = 0;
                if (this.status == "walk") {
                    this.status = null;
                    this.image.gotoAndPlay("stand");
                }
                break;
        }
        this.plus(this.speed.x, 0);
    }
}
