import { keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { BoxBall } from "../../classes/actor.js";
//游戏变量;
var car;
var startX = 250,
    startY = 230;
var frontMotor, backMotor;
export class WheelJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("中轴关节");
        this.contentSize = {
            width: 5000,
            height: this.height
        }

        this.createGround();
        this.createCar(startX,startY);

        this.setActorScroll(car)
    }
    runGame(e) {
        super.runGame(e);
        car.act(keys);
        this.scrollView()
    }
    createGround() {
        let gapX = 800,
            gapY = 400;
        let posX = 500,
            posY = 300;
        var groundPoints = [];
        groundPoints.push(new b2Vec2(50, 100));
        groundPoints.push(new b2Vec2(50, 300));
        groundPoints.push(new b2Vec2(500, 300));
        while (posX < this.contentSize.width - 800) {
            posX += Math.random() * gapX + 100;
            posY += Math.random() * gapY - gapY / 2;
            groundPoints.push(new b2Vec2(posX, posY));
        }
        posY -= 300;
        groundPoints.push(new b2Vec2(posX, posY));
        EasyBody.createChain(groundPoints)
    }
    createCar(posX,posY) {
        let frontWheel=EasyBody.createCircle(posX+30,250,15);
        // let backWheel=EasyBody.createCircle(posX-30,250,15);
        let backWheel=new BoxBall(posX-30-15,250-15);
        backWheel.drawSpriteData(30)
        backWheel.color="#f00";
        this.addToPlayer(backWheel)
        car=backWheel;
        backWheel.body.GetFixtureList().SetFriction(1);
        let chassis=this.createChassis(posX,posY);
        

        let axis=new b2Vec2(0,1);
        let anchor=frontWheel.GetPosition();
        let jointDef=new b2WheelJointDef();
        jointDef.Initialize(chassis,frontWheel,anchor,axis);
        jointDef.set_frequencyHz(3);
        jointDef.set_dampingRatio(0.1);
        frontMotor=world.CreateJoint(jointDef);

        anchor=backWheel.body.GetPosition();
        jointDef.Initialize(chassis,backWheel.body,anchor,axis);
        jointDef.set_enableMotor(false);
        jointDef.set_maxMotorTorque(20);
        jointDef.set_motorSpeed(0);
        backMotor=world.CreateJoint(jointDef);
    }
    createChassis(posX,posY){
        let vertices=[];
        vertices.push(new b2Vec2(-1.5,-0.2));
        vertices.push(new b2Vec2(-1.15,-0.9));
        vertices.push(new b2Vec2(0,-0.9));
        vertices.push(new b2Vec2(1.5,0));
        vertices.push(new b2Vec2(1.5,0.5));
        vertices.push(new b2Vec2(-1.5,0.5));
        return EasyBody.createBodyFromShape(posX,posY,createPolygonShape(vertices));
    }

}
