import { stage, keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { BallMoveContactListener } from "../../classes/box2d/ContactListener.js";
import { Box2DBall } from "../../classes/box2d/actor/box2dBall.js";
//游戏变量;
var player;
var contactListener;
export class GearJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("齿轮关节");
        this.createBodies();
        this.createGearJoint();
    
        contactListener=new BallMoveContactListener();
    }
    runGame(e){
        super.runGame(e)
        player.act(keys);
    }
    createBodies(){
        EasyBody.createRectangle(0,0,stage.width,stage.height,false,true);
        EasyBody.createBox(25,200,50,20,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(180,200,100,20,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(stage.width-50,200,200,20,0).SetUserData(USER_DATA_GROUND);

        let b=EasyBody.createCircle(20,100,20);
        player=new Box2DBall(b);
    }
    createGearJoint(){
        let joint1=this.getRevoluteJoint(90,200);
        let joint2=this.getPrismaticJoint(500,200);

        EasyWorld.createGearJoint({
            joint1:joint1,
            joint2:joint2,
        });
    }
    getRevoluteJoint(x,y){
        let bodyB=EasyBody.createBox(x,y,70,10);
        bodyB.CreateFixture(EasyShape.createBox(10,70),3);      

        return EasyWorld.createRevoluteJoint({
            bodyB:bodyB,
            bodyAX:x,
            bodyAY:y,
            enableMoter:true,
            maxMototorTorque:5
        });
    }
    getPrismaticJoint(x,y){
        let bodyB=EasyBody.createBox(x,y,100,10);
        bodyB.CreateFixture(EasyShape.createBox(10,30,-50,-10),3);
        bodyB.CreateFixture(EasyShape.createBox(10,30,50,-10),3);
        let axis=new b2Vec2(1,0);

        return EasyWorld.createPrismaticJoint({
            bodyB:bodyB,
            bodyAX:x,
            bodyAY:y,
            axis:axis,
            
        });
    }
}
