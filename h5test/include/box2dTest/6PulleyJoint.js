import { keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { BallMoveContactListener } from "../../classes/box2d/ContactListener.js";
import { Box2DBall } from "../../classes/box2d/actor/box2dBall.js";
//游戏变量;
var contactListener;
var player;
export class PulleyJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("滑轮关节");
        this.createJoint();
        this.createBodies();
        contactListener=new BallMoveContactListener();
    }
   
    runGame(e) {
        super.runGame(e);
        player.act(keys)
    }
    createJoint(){
        let bodyA=EasyBody.createBox(200,270,100,10);
        bodyA.SetUserData(USER_DATA_GROUND)
        bodyA.SetFixedRotation(true);//固定物体角度
        bodyA.GetFixtureList().SetDensity(30);
        bodyA.ResetMassData();
        let bodyB=EasyBody.createBox(300,270,100,10);
        bodyB.SetUserData(USER_DATA_GROUND);
        bodyB.SetFixedRotation(true);
        bodyB.GetFixtureList().SetDensity(30);
        bodyB.ResetMassData();

        let anchorA=bodyA.GetPosition(),
        anchorB=bodyB.GetPosition(),
        groundA=new b2Vec2(200/PTM,100/PTM),
        groundB=new b2Vec2(300/PTM,100/PTM);

        EasyWorld.createPulleyJoint({
            bodyA:bodyA,
            bodyB:bodyB,
            groundAnchorA:groundA,
            groundAnchorB:groundB,
            anchorA:anchorA,
            anchorB:anchorB,
            
        })
    }
    createBodies(){
        EasyBody.createRectangle(0,0,this.width,this.height,false,true)
        EasyBody.createBox(50,350,100,20,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(500,150,100,20,0).SetUserData(USER_DATA_GROUND);

        let b=EasyBody.createCircle(50,100,20);
        let a=new CirActor();
        a.drawSpriteData(40);
        this.addToBox2D();
        player=new Box2DBall(b);
    }

}
