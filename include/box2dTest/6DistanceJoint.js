import { stage, keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { BoxBall } from "../../classes/actor.js";

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
        let jointDef=new b2DistanceJointDef();
        jointDef.Initialize(bodyA,bodyB,anchorA,anchorB);
        world.CreateJoint(jointDef);
        //位移关节
        let anchor=bodyB.GetPosition();
        bodyA=EasyBody.getEmptyBody(anchor.x*PTM,anchor.y*PTM);
        let verticalAxis=new b2Vec2(0,1);
        let verticalJointDef=new b2PrismaticJointDef();
        verticalJointDef.Initialize(bodyA,bodyB,anchor,verticalAxis);
        world.CreateJoint(verticalJointDef);
    }
    createBodies(){
        EasyBody.createRectangle(0,0,stage.width,stage.height);
        player=new BoxBall(50,100);
        player.drawSpriteData(30)
        this.addChild(player);

        EasyBody.createBox(50,200,100,20,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(500,200,100,20,0).SetUserData(USER_DATA_GROUND);

    }

}
