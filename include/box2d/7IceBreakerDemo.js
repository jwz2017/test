import { BodyToSlice } from "../../classes/Clipper-help.js";
import { Game } from "../../classes/Game.js";
import { gframe } from "../../classes/gframe.js";
export class IceBreaker extends Game {
    constructor() {
        super("IceBreaker");
        gframe.buildWorld(true);
        
        this.body=EasyBody.createBox(this.width/2,this.height/2,400,300,0);
        this.body.SetTransform(this.body.GetPosition(),Math.PI/4)

        this.rayCast=new BodyToSlice();
        this.rayCast.setBody(this.body);
    }
    waitComplete(){
        this.drawMouseMove(()=>{
            this.rayCast.rayCast(this.mouseStart,this.mouseEnd);
        });
    }
    containerDebugDraw(){
        super.containerDebugDraw();
        let p=this.parent;
        if(p.isDrawing){
            drawSegment1(p.mouseStart, p.mouseEnd, "255,255,255");
        }
    }
}   
