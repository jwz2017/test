import { gframe, lib, stage } from "../../classes/gframe.js";
import {Box2dGame} from "../../classes/Game.js";
import { Actor } from "../../classes/actor.js";
window.onload = function () {
    Box2D().then(function (r) {
        Box2D = r;
        using(Box2D, 'b2.+');
    })
    /*************游戏入口*****/
    gframe.buildStage('canvas',false,false);
    gframe.preload(StageGL);
};
//游戏变量;
export class StageGL extends Box2dGame {
    static loadId = 'A81D833FE7C7754FB5395FF7A6EFA6E1';
    constructor() {
        super("anmate界面制作",true,0);
        this.instructionText="1:wewdsdf<br>2:ewddieiei"
        this.player = new Actor(250, 200);
        this.player.init(250,200)
        this.player.drawSpriteData(100,100);
        this.addToFloor(this.player);
        this.player1 = new Actor(350, 200);
        this.player1.init(350,200);
        this.player1.drawSpriteData(100,100)
        this.addToFloor(this.player1);
        //底线
        EasyBody.createRectangle(0, 0, this.width, this.height);
    }
    createTitleScreen(){
        this.titleScreen=new lib.Title();
        this.titleScreen.btn2.on("click",()=>{
            stage.addChild(this.instructionScreen)
        })
    }
}



