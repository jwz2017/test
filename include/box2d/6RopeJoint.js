import { stage, gframe, game } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import { Vector } from "../../classes/actor.js";
//游戏变量;
var ropeJoint;
var crossPoint;
export class RopeJoint extends Game {
    constructor() {
        super("绳索关节");
        gframe.buildWorld(true);
        this.createBodies();
        this.createJoint();
    }
    waitComplete() {
        this.drawMouseMove(() => {
            if (crossPoint) {
                world.DestroyJoint(ropeJoint);
                ropeJoint = null;
                crossPoint = null;
            }

        });
    }
    createBodies() {
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
        EasyBody.createBox(0, 0, 60, 10, 1).SetTransform(new b2Vec2(200 / PTM, 300 / PTM), Math.PI / 6);
        EasyBody.createBox(80, 320, 30, 10, 1);
    }
    createJoint() {
        let bodyA = EasyBody.createCircle(200, 50, 10, 1);
        let bodyB = EasyBody.createCircle(150, 70, 20);

        let jointDef = new b2RopeJointDef();
        jointDef.set_bodyA(bodyA);
        jointDef.set_localAnchorA(new b2Vec2());
        jointDef.set_localAnchorB(new b2Vec2());
        jointDef.set_bodyB(bodyB);
        jointDef.set_maxLength(100 / PTM);
        //没有Initialize函数
        // jointDef.Initialize(bodyA,bodyB,anchorA,anchorB,maxLength);
        ropeJoint = world.CreateJoint(jointDef);
    }
    containerDebugDraw() {
        super.containerDebugDraw();
        let p=this.parent;
        if (p.isDrawing) {
            drawSegment1(p.mouseStart, p.mouseEnd, "255,255,255");
            if (ropeJoint) {
                crossPoint = Vector.getCrossPoint(p.mouseStart, p.mouseEnd, ropeJoint.GetAnchorA(), ropeJoint.GetAnchorB());
                if (crossPoint != null) {
                    drawCircle1(crossPoint, 5 / PTM, false, "255,255,255");
                }
            }
        }
    }
}
