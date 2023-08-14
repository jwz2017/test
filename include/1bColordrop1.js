import { stage, gframe, queue } from "../classes/gframe.js";
import { Actor } from "../classes/actor.js";
import { GridsMapGame } from "../classes/GridsMapGame.js";
window.onload = function () {
    /*************游戏入口*****/
    //gframe.loaderBar=null;
    gframe.init('canvas');
    gframe.preload(ColorDrop);
    gframe.startFPS();
};
//游戏变量;
var plays,threshold,levelScore;
class ColorDrop extends GridsMapGame {
    static loadItem = [{
        id:"color",
        src:"colordrop1/color.json",
        type:"spritesheet"
    }];
    //static loadId = null;
    
    static SCORE_BOARD_PLAYS = "plays";
    static SCORE_BOARD_THRESHOLD = "threshold";
    static SCORE_BOARD_LEVEL_SCORE = "levelScore";
    constructor() {
        super("魔法方块",320,320,30,30,10,10);
    }
    /**建立游戏元素游戏初始化
     * 在构造函数内建立
     */
    init() {
        
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard();
        this.scoreboard.createTextElement(ColorDrop.SCORE);
        this.scoreboard.createTextElement(ColorDrop.LEVEL);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_PLAYS);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_THRESHOLD);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_LEVEL_SCORE);
        this.scoreboard.placeElements();
    }
    newLevel() {
        
    }
    waitComplete() {
        // stage.addChild(this)
    }
    runGame() {

    }
    clear() {

    }

}
