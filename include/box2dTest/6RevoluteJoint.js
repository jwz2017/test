import { keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import {  BoxBall } from "../../classes/actor.js";

export class RevoluteJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("旋转关节");
        this.createJoint();
        this.createBodies();
        this.contactListener=new BallMoveContactListener();
    }
    createJoint(){
        let bodyB=EasyBody.createBox(250,600,250,10);
        bodyB.SetUserData(USER_DATA_GROUND);

        let anchor=new b2Vec2(250/PTM,500/PTM);
        let jointDef=new b2RevoluteJointDef();
        jointDef.Initialize(EasyBody.getEmptyBody(anchor.x*PTM,anchor.y*PTM),bodyB,anchor);
        jointDef.enableLimit=true;
        jointDef.lowerAngle=-Math.PI/6;
        jointDef.upperAngle=Math.PI/6;
        jointDef.enableMotor=true;
        jointDef.maxMotorTorque=150;
        jointDef.motorSpeed=0;

        world.CreateJoint(jointDef)
    }
    createBodies(){
        EasyBody.createBox(0,this.height/2,10,this.height,0);
        EasyBody.createBox(this.width,this.height/2,10,this.height,0);
        EasyBody.createBox(this.width/2,0,this.width,10,0);

        EasyBody.createBox(50,500,100,20,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(this.width-50,500,100,20,0).SetUserData(USER_DATA_GROUND);

        this.p=new BoxBall();
        this.p.drawSpriteData(50)
        this.addChild(this.p)
    }
    runGame(e) {
        super.runGame(e)
        this.p.act(keys);
    }

}
