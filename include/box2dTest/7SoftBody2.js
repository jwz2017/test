import { keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { BoxBall } from "../../classes/actor.js";
var contactListener;
var anchor;
export class SoftBody2 extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("SoftBody2");
        EasyBody.createRectangle(0, 0, this.width, this.height);
        EasyBody.createBox(250, 250, 300, 20, 0).SetUserData(USER_DATA_GROUND);
        this.ball = new BoxBall(120, 100);
        this.ball.drawSpriteData(40)
        this.addToPlayer(this.ball);
        contactListener = new BallMoveContactListener();
        
        this.weldJointDef=new b2WeldJointDef();
        anchor=new b2Vec2();
        this.createSoftCircle(250, 100, 50);
    }
    runGame(e) {
        super.runGame(e);
        this.ball.act(keys);
    }
    createSoftCircle(x, y, radius) {
        let segmentCount = 20;
        let segmentWidth = Math.PI * radius * 2 / segmentCount;
        let segmentList = [];
        let angle = 0;
        for (let i = 0; i < segmentCount; i++) {
            angle = Math.PI * 2 * i / segmentCount;
            let segmentPosX = x + radius * Math.sin(angle);
            let segmentPosY = y + radius * Math.cos(angle);
            let body = EasyBody.createBox(segmentPosX, segmentPosY, segmentWidth, 10);
            body.SetTransform(body.GetPosition(), -angle);
            segmentList.push(body);
        }
        let len = segmentList.length;
        for (let j = 0; j < len; j++) {
            let bodyA = segmentList[(len - 1 + j) % len];
            let bodyB = segmentList[j];
            this.weldTogether(bodyA, bodyB, 10, 0.5);
        }
    }
    weldTogether(ba, bb, frequencyHz = 20, dampingRatio = 0.2) {
        let p1=ba.GetPosition(),p2=bb.GetPosition();
        anchor.Set(p2.x-p1.x,p2.y-p1.y);
        anchor.op_mul(0.5);
        anchor.op_add(p1);
        this.weldJointDef.Initialize(ba, bb, anchor);
        this.weldJointDef.set_frequencyHz(frequencyHz);
        this.weldJointDef.set_dampingRatio(dampingRatio);
        world.CreateJoint(this.weldJointDef);
    }
}