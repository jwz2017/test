import { stage, gframe, queue } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import { getFXBitmap } from "../../classes/other.js";


export class FilterAnimated extends Game {
    static backgroundColor = "#fff"
    static loadItem = [{
        id: "spritesheet_grant",
        src: "easelJs/spritesheet_grant.png"
    }]
    constructor() {
        super("FilterAnimated");
        var bmp = new createjs.Bitmap(queue.getResult("spritesheet_grant"));
        bmp.set({ x: 50, y: 30 })
        bmp.sourceRect = new createjs.Rectangle(0, 0, 165, 292);
        
        // red monochrome tint effect:
        var filters = [new createjs.ColorMatrixFilter([
            0.3, 0.3, 0.3, 0, 25, // red
            0, 0, 0, 0, 0, // green
            0, 0, 0, 0, 0, // blue
            0, 0, 0, 1, 0 // alpha
        ])]
        var fx=getFXBitmap(bmp,filters,0,0,165,292);
        createjs.Tween.get(fx,{loop:true}).to({alpha:0},1000).to({alpha:1},1000);
        stage.addChild(bmp,fx);

        // glow (blur + tint):
        bmp=bmp.clone();
        bmp.x+=230;
        filters=[new createjs.BlurFilter(16,16,1),new createjs.ColorFilter(0,0,0,1,0,155,255)];
        fx=getFXBitmap(bmp,filters,0,0,165,292);
        createjs.Tween.get(fx,{loop:true}).to({alpha:0},1000).to({alpha:1},1000);
        stage.addChild(fx,bmp);

        // shadow (tint + blur + offset):
        bmp=bmp.clone();
        bmp.x+=230;
        filters=[new createjs.ColorFilter(0,0,0,0.6),new createjs.BlurFilter(8,8,1)];
        fx=getFXBitmap(bmp,filters,0,0,165,292);
        createjs.Tween.get(fx,{loop:true}).to({alpha:1,x:fx.x+12,y:fx.y+12},4000).to({alpha:0,x:fx.x,y:fx.y},4000);
        stage.addChild(fx,bmp);

        // blur:
        bmp=bmp.clone();
        bmp.set({x:50,y:342});
        filters=[new createjs.BlurFilter(16,16,2)];
        fx=getFXBitmap(bmp,filters,0,0,165,292);
        let tween=createjs.Tween.get(fx,{loop:true}).to({alpha:0},2500).to({alpha:1},2500).wait(1000);
        // we also need to counter fade the original bitmap:
        tween.on("change",()=>{
            bmp.alpha=1-Math.pow(fx.alpha,3);
        })
        stage.addChild(bmp,fx)
    }

}
