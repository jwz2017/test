import { stage,gframe } from "../classes/gframe.js";
import { Actor } from "../classes/actor.js";
window.onload = function () {
    /*************游戏入口*****/
     gframe.buildStage('canvas',true);
     gframe.preload(StageGL);
     gframe.startFPS();
};
//游戏变量;

export class StageGL extends gframe.Game {
    //static loadItem = null;
    //static loadId = null;
    constructor() {
        super("StageGL");
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard();
        this.scoreboard.createTextElement(StageGL.SCORE);
        this.scoreboard.createTextElement(StageGL.LEVEL);
        this.scoreboard.createTextElement(StageGL.LIVES);
    }
    //初始化游戏数据
    newGame() {
        
    }
    newLevel() {
        this.scoreboard.update(StageGL.SCORE,this.score);
        this.scoreboard.update(StageGL.LEVEL,this.level);
        this.scoreboard.update(StageGL.LIVES,this.lives);
    }
    waitComplete() {
        
    }
    runGame() {

    }

}
