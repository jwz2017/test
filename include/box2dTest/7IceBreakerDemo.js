import { BodyToSlice } from "../../classes/box2d/Clipper-help.js";
import { Box2dGame } from "../../classes/Game.js";
export class IceBreaker extends Box2dGame {
    constructor() {
        super("IceBreaker");
        this.body=EasyBody.createBox(this.width/2,this.height/2,400,300,0);
        this.body.SetTransform(this.body.GetPosition(),Math.PI/4)

        this.rayCast=new BodyToSlice();
        this.rayCast.setBody(this.body);

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



