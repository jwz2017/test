import { stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
//游戏变量;
var ball,force,isApplyForce;
export class ApplyForce extends Box2dGame {
    constructor() {
        super("ApplyForce");
        EasyBody.createRectangle(0,0,stage.width,stage.height);

        ball=EasyBody.createCircle(20,700,10);
        ball.SetLinearVelocity(new b2Vec2(5,-10));

        force=new b2Vec2(0,0);
        force.x=-ball.GetMass()*1*PTM;
        isApplyForce=false;

        stage.on("stagemousedown",(e)=>{
            isApplyForce=true;
        },this,true)
    }
    runGame(e){
        super.runGame(e);
        if(isApplyForce){
            ball.ApplyForce(force,ball.GetWorldCenter())
        }
    }
}
