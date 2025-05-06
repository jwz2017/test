import { stage, keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { BallMoveContactListener } from "../../classes/box2d/ContactListener.js";
import { Box2DBall } from "../../classes/box2d/actor/box2dBall.js";

//游戏变量;
var player,contactListener;
export class DistanceJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("距离关节");
        this.createJoint();
        this.createBodies();

        contactListener=new BallMoveContactListener();
    }
    runGame(e){
        super.runGame(e);
        player.act(keys);
    }
    createJoint(){
        let bodyA=EasyBody.createCircle(250,250,40,1);
        bodyA.SetAngularVelocity(Math.PI/2);
        let bodyB=EasyBody.createBox(250,110,250,10);
        bodyB.SetUserData(USER_DATA_GROUND);
        //连杆关节
        let anchorA=new b2Vec2(250/PTM,210/PTM);
        let anchorB=new b2Vec2(250/PTM,110/PTM);
        EasyWorld.createDistanceJoint({
            bodyA:bodyA,
            bodyB:bodyB,
            anchorA:anchorA,
            anchorB:anchorB,
        })
        
        //位移关节
        EasyWorld.createPrismaticJoint({
            bodyB:bodyB,
            axis:setTempV(0,1)
        })
    }
    createBodies(){
        EasyBody.createRectangle(0,0,stage.width,stage.height);
        
        let b=EasyBody.createCircle(50,100,25);
        let a=new CirActor();
        a.drawSpriteData(50);
        this.addToBox2D(a);
        player=new Box2DBall(b,a);
        
        EasyBody.createBox(50,200,100,20,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(500,200,100,20,0).SetUserData(USER_DATA_GROUND);

    }

}
