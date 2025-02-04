import { stage,gframe, queue } from "../../classes/gframe.js";
import {LoaderBar,Game, ScoreBoard } from "../../classes/Game.js";
window.onload = function () {
    //  Box2D().then(function (r) {
    //      Box2D = r;
    //      using(Box2D, 'b2.+');
    //  });
    /*************游戏入口*****/
     gframe.buildStage('canvas',false,false,"../assets/");
     //stage.setClearColor(0x00000000);
     gframe.preload(AlphaMaskFilter,true);
};
//class GameLoaderBar extends LoaderBar {
    //constructor() {
        //super();
    //}
//}
var drawingCanvas,image,maskFilter;
export class AlphaMaskFilter extends Game {
    static backgroundColor="#555"
    //static loadFontItem=null
    //static LoaderBar=GameLoaderBar
    //static loadBarItem=null
    //static loadItem=null
    //static loadId=null
    static loadItem=[{
        id:"flowers",
        src:"../assets/easelJs/flowers.jpg"
    }]
    constructor() {
        super("AlphaMaskFilter",true);
        //gframe.createPannel();
        //gframe.buildWorld(true);
        image=new createjs.Bitmap(queue.getResult("flowers"));
        image.scale=this.width/image.getBounds().width;
        drawingCanvas=new createjs.Shape();
        drawingCanvas.graphics.beginStroke("rgba(255,250,0,0.5)").beginFill("#000").moveTo(0,0).drawCircle(0,0,400)
        drawingCanvas.cache(0,0,100,100)
        // console.log(image.getBounds().height*image.scale-300);
        maskFilter=new createjs.AlphaMaskFilter(drawingCanvas.cacheCanvas)
        console.log(drawingCanvas.cacheCanvas);
        image.filters=[maskFilter];
        stage.addChild(image);
        // image.cache(0,0,image.getBounds().width,image.getBounds().height)
        image.cache(0,0,400,400)
    }
    createScoreBoard() {
        //this.scoreboard = new ScoreBoard();
        //this.scoreboard.createTextElement(AlphaMaskFilter.SCORE);
        //this.scoreboard.createTextElement(AlphaMaskFilter.LEVEL);
        //this.scoreboard.createTextElement(AlphaMaskFilter.LIVES);
    }
    //初始化游戏数据
    newGame() {

    }
    newLevel() {
        //this.scoreboard.update(AlphaMaskFilter.SCORE,this.score);
        //this.scoreboard.update(AlphaMaskFilter.LEVEL,this.level);
        //this.scoreboard.update(AlphaMaskFilter.LIVES,this.lives);
    }
    waitComplete() {
    
    }
    runGame() {

    }

}
