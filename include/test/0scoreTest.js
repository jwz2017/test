import { Game, ScoreBoard } from "../../classes/Game.js";
import { queue, stage } from "../../classes/gframe.js";

//游戏变量;

export class ScoreTest extends Game{
static loadItem = [{
    id:"score",
    src:"images/score.png"
}];
    constructor() {
        super("ScoreTest");
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(ScoreTest.SCORE,"0",null,null,{titleImg:queue.getResult("score")});
        this.scoreboard.createTextElement(ScoreTest.LEVEL,1);
        this.scoreboard.createTextElement(ScoreTest.LIVES,4,null,null,{valueType:"meter",borderFont:"2px solid #fff"});
    }
}
