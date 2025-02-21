import { stage, keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { BoxBall } from "../../classes/actor.js";
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

        player=new BoxBall(30,100);
        player.drawSpriteData(40)
        this.addToPlayer(player);
    }
    createGearJoint(){
        let joint1=this.getRevoluteJoint(90,200);
        let joint2=this.getPrismaticJoint(500,200);

        let jointDef=new b2GearJointDef();
        jointDef.joint1=joint1;
        jointDef.joint2=joint2;
        jointDef.bodyA=EasyBody.getEmptyBody();
        world.CreateJoint(jointDef);
    }
    getRevoluteJoint(x,y){
        let bodyA=EasyBody.getEmptyBody(x,y);
        let bodyB=EasyBody.createBox(x,y,70,10);
        bodyB.CreateFixture(EasyShape.createBox(10,70),3);      
        let anchor=bodyB.GetPosition();

        let revoluteJointDef=new b2RevoluteJointDef();
        revoluteJointDef.Initialize(bodyA,bodyB,anchor);
        revoluteJointDef.set_enableMotor(true);
        revoluteJointDef.set_motorSpeed(0);
        revoluteJointDef.set_maxMotorTorque(10);
        return world.CreateJoint(revoluteJointDef);
    }
    getPrismaticJoint(x,y){
        let bodyA=EasyBody.getEmptyBody(x,y);
        let bodyB=EasyBody.createBox(x,y,100,10);
        bodyB.CreateFixture(EasyShape.createBox(10,30,-50,-10),3);
        bodyB.CreateFixture(EasyShape.createBox(10,30,50,-10),3);
        let anchor=new b2Vec2(x/PTM,(y-50)/PTM);
        let axis=new b2Vec2(1,0);

        let jointDef=new b2PrismaticJointDef();
        jointDef.Initialize(bodyA,bodyB,anchor,axis);
        return world.CreateJoint(jointDef);
    }
}
