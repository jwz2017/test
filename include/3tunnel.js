import { stage, gframe, keys, game } from "../classes/gframe.js";
import { Actor, SteeredActor } from "../classes/actor.js";
import { mc } from "../classes/mc.js";
import { Game, ScoreBoard } from "../classes/Game.js";
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas');
    gframe.preload(Tunnel, true);
};
//游戏变量;
var player,gravity=0.15,playerSpeed=0.3;
//障碍物
var obstacleDelay = 30,
    obstacleTick=81,
    obstacleColor=["#ffffff","#ff0000","#00ff00","#0000ff","#00ffff","#ffff00","#ffaaff","#aaff99","#cc6600"],
    obstacleHeightMax = 80,
    obstacleWidthMax=40,
    obstacleWidthMin=20,
    obstacleHeightMin=60,
    obstacleHeightLimit=160,
    obstacleHeightIncrease=20,
    obstacleSpeed = 1,
    obstacleSpeedMax=4,
    obstacles=[],
    //中心障碍物几率
    centerFrequency=0.15,
    centerHeight=10,
    centerWidth=15;
//分数版
var startTime,time=0,levelTime=10;
export class Tunnel extends Game {
    static TIME = "time";
    //static loadItem = null;
    //static loadId = null;
    constructor() {
        super("隧道惊魂", stage.width, 380);
        this.instructionText="w:向上";
        this.y = stage.height - this.height >> 1;
        //创建飞船
        player = new SteeredActor();
        this.addChild(player)
        //背景框架
        this.background = new createjs.Shape();
        this.background.graphics.setStrokeStyle(2).beginStroke("#fff").moveTo(0, 0).lineTo(this.width, 0)
        .moveTo(0, this.height).lineTo(this.width, this.height);
        this.background.cache(0, 0, this.width, this.height)
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(Tunnel.TIME,0,300,0);
    }
    newLevel() {
        this.scoreboard.update(Tunnel.TIME,0);
        player.x=this.width/2;
        player.y=this.height/2;
        player.updateRect();
        player.speed.zero();
    }
    waitComplete() {
        startTime=createjs.Ticker.getTime(true);
    }
    runGame() {
        //时间更新
        time=((createjs.Ticker.getTime(true)-startTime)/1000).toFixed(3);
        this.scoreboard.update(Tunnel.TIME,time);
        this.level=(time/levelTime|0)+1;
        this.level=Math.min(this.level,obstacleColor.length);
        //飞船
        if(keys.up){
            player.speed.y+=gravity-playerSpeed;
        }else player.speed.y+=gravity;
        player.plus(0,player.speed.y);
        if(this.hitBounds(player.rect)) this.gameOver=true;
        //障碍物
        this.moveActors(this.playerLayer);
        obstacleTick++;
        if(obstacleTick>obstacleDelay){
            obstacleTick=0;
            let obstacle=Tunnel.getActor(obstacles,Obstacle);
            if(Math.random()<centerFrequency){
                obstacle.init(centerWidth,centerHeight);
                obstacle.setPos(this.width,this.height/2+Math.random()*100-50);
                
            }else {
                let w=mc.getRandom(obstacleWidthMin,obstacleWidthMax),
                h=mc.getRandom(obstacleHeightMin,obstacleHeightMax);
                h=Math.min(h+(this.level-1)*obstacleHeightIncrease,obstacleHeightLimit);
                obstacle.init(w,h);
                if (mc.getRandom(0,1)<0.5) obstacle.setPos(this.width,0);
                else obstacle.setPos(this.width,this.height-obstacle.rect.height);
            }
            obstacle.color=obstacleColor[this.level-1];
            this.addToPlayer(obstacle);
        }
        let speed=Math.min(obstacleSpeedMax,obstacleSpeed+this.level);
        this.playerChildren.forEach(element => {
            element.speed.x=-speed;
        });
    }
}
class Obstacle extends Actor{
    constructor(xpos,ypos){
        super(xpos,ypos);
    }
    act(){
        this.plus(this.speed.x,0);
        if(this.rect.x<-this.rect.width) {
            this.recycle();
        }
        if(this.rect.intersects(player.rect)){
            game.gameOver=true;
        }
    }
}
