import { stage,gframe } from "../../classes/gframe.js";
import {Game } from "../../classes/Game.js";

export class SpriteSheetMovie extends Game {
    static loadItem=[{
        src:"easelJs/huo.js",
        type:"javascript"
    }]
    constructor() {
        super("SpriteSheetMovie");
        var huo=new lib.huo();
        var builder=new createjs.SpriteSheetBuilder();
        builder.addMovieClip(huo,new createjs.Rectangle(0,0,180,160),0.5);
        builder.addEventListener("complete",()=>{
            // builder.stopAsync();
            // console.log("complete");
            var sprite=new createjs.Sprite(builder.spriteSheet)
            stage.addChild(sprite);
            sprite.play();
            
        })
        builder.buildAsync();
        
    }

}
