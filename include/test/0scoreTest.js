import { stage,gframe, game, queue } from "../../classes/gframe.js";

//游戏变量;

export class ScoreTest extends gframe.Game {
static loadItem = [{
    id:"score",
    src:"images/score.png"
}];
//static loadId = null;
    constructor() {
        super("ScoreTest");
        
    }
    createScoreBoard() {
        gframe.style.SCORE_TEXT_COLOR="#CC3399";
        this.scoreboard = new gframe.ScoreBoard();
        this.scoreboard.createTextElement(ScoreTest.SCORE,0,0,0,{image:"assets/images/score.png"});
        this.scoreboard.createTextElement(ScoreTest.LEVEL);
    }
    newLevel() {
        this.lives=6;
        this.scoreboard.update("score",this.score);
        this.scoreboard.update("level",this.level);
    }

}
