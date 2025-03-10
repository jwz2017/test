import { stage,gframe, queue } from "../../classes/gframe.js";
import {Game } from "../../classes/Game.js";
import { ScaleBitmap } from "../../classes/zujian/ScaleBitmap.js";

export class ScaleBitmapTest extends Game {
    static loadItem=[{
        id:"image",
        src:"easelJs/ScaleBitmapImage.png"
    }]
    constructor() {
        super("ScaleBitmapTest");
        var rect=new createjs.Rectangle(12,12,5,10);
        var sb=new ScaleBitmap(queue.getResult("image"),rect);
        sb.setDrawSize(200,300);
        stage.addChild(sb);

        stage.on("stagemousedown",()=>{
            sb.setDrawSize(Math.random()*300+100|0,Math.random()*100+60|0);
            
        })
    }

}
