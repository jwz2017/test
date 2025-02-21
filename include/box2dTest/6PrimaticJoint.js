import { keys } from "../../classes/gframe.js";
import { Box2dGame} from "../../classes/Game.js";
import {BoxBall } from "../../classes/actor.js";
var player,contactListener;
export class PrimaticJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("位移关节");
        //createBodies
        EasyBody.createBox(0,this.height/2,10,this.height,0);
        EasyBody.createBox(this.width-5,this.height/2,10,this.height,0);
        EasyBody.createBox(this.width/2,0,this.width,10,0);
        EasyBody.createBox(50,this.height-50,100,100,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(this.width-50,this.height-50,100,100,0).SetUserData(USER_DATA_GROUND);
        player=new BoxBall();
        player.drawSpriteData(50)
        this.addChild(player)
        this.createJoint();
        
        contactListener=new BallMoveContactListener();
    }
    runGame(e){
        super.runGame(e)
        player.act(keys);
    }

    createJoint() {
        var car=EasyBody.createBox(200,670,100,10);
        car.SetUserData(USER_DATA_GROUND)
        var shape=EasyShape.createBox(10,30,-50,-10);
        car.CreateFixture(shape,3);
        shape=EasyShape.createBox(10,30,50,-10);
        car.CreateFixture(shape,3);
        
        var bodyA=EasyBody.getEmptyBody(this.width/2,600);
        var anchor=bodyA.GetPosition();
        var axis=new b2Vec2(1,0);
        axis.Normalize();

        var jointDef=new b2PrismaticJointDef();
        jointDef.Initialize(bodyA,car,anchor,axis);
        jointDef.enableMotor=true;
        jointDef.maxMotorForce=car.GetMass()*10;
        jointDef.motorSpeed=0;
        world.CreateJoint(jointDef);
    }
}
