import {gframe, keys } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import {  BoxBall } from "../../classes/actor.js";

export class RevoluteJoint extends Game {
    constructor() {
        super("RevoluteJoint");
        gframe.buildWorld(true,20);
        
        this.createJoint();
        this.createBodies();
        this.contactListener=new BallMoveContactListener();
    }
    createJoint(){
        let bodyA=world.CreateBody(new b2BodyDef());
        let bodyB=EasyBody.createBox(250,600,250,10);
        bodyB.SetUserData(USER_DATA_GROUND);

        let anchor=new b2Vec2(250/PTM,500/PTM);
        let jointDef=new b2RevoluteJointDef();
        jointDef.Initialize(bodyA,bodyB,anchor);

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

        this.p=new BoxBall(0,0,25);
        this.p.body.SetUserData(USER_DATA_PLAYER);
        this.addChild(this.p)
    }
    runGame() {
        this.p.act(keys);
    }

}
