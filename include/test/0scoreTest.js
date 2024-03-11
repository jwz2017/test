import { Game, ScoreBoard } from "../../classes/Game.js";
import { queue } from "../../classes/gframe.js";

//游戏变量;

export class ScoreTest extends Game{
static loadItem = [{
    id:"score",
    src:"images/score.png"
}];
//static loadId = null;
    constructor() {
        super("ScoreTest");
        
    }
    createScoreBoard() {
        Game.style.SCORE_TEXT_COLOR="#CC3399";
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(ScoreTest.SCORE,0,0,0,{titleImg:queue.getResult("score")});
        this.scoreboard.createTextElement(ScoreTest.LEVEL);
        this.scoreboard.createTextElement(ScoreTest.LIVES,this.lives,0,0,{valueType:"meter",borderFont:"2px solid #fff"});
    }
    newLevel() {
        this.scoreboard.update("score",this.score);
        this.scoreboard.update("level",this.level);
        this.scoreboard.update("lives",this.lives)
    }

}
