import { stage, gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
//游戏变量;
var mouseJoint, mousePoint, dragBody;
export class MouseJoint extends Game {
    constructor() {
        super("MouseJoint");
        this.x=100
        gframe.buildWorld(true);
        mousePoint = new b2Vec2(0, 0);
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
        EasyBody.createBox(200, 400, 30, 40);
    }
    waitComplete() {
        let mouseMove;
        stage.on("stagemousedown", (e) => {
            let p=this.container.globalToLocal(e.stageX, e.stageY)
            dragBody = EasyWorld.getBodyAt(p.x,p.y);
            if (dragBody) {
                mousePoint.Set(p.x / PTM, p.y / PTM);
                this.createMouseJoint(dragBody, mousePoint);

                mouseMove = stage.on("stagemousemove", (e) => {
                    let p=this.container.globalToLocal(e.stageX, e.stageY)
                    mousePoint.Set(p.x / PTM, p.y / PTM);
                    mouseJoint.SetTarget(mousePoint);
                })
            }
        });
        stage.on("stagemouseup", (e) => {
            if (mouseMove) {
                world.DestroyJoint(mouseJoint);
                mouseJoint = null;

                stage.off("stagemousemove", mouseMove);
                mouseMove = null;
            }
        })
    }
    clear() {
        stage.removeAllEventListeners();
    }
    containerDebugDraw() {
        super.containerDebugDraw();
        if (mouseJoint) {
            var p1 = mouseJoint.GetAnchorB();
            var p2 = mouseJoint.GetTarget();
            debugDraw.DrawSegment(p1.a, p2.a, new b2Color(204, 204, 204).a)
        }
    }
    createMouseJoint(bodyB, target) {
        let jointDef = new b2MouseJointDef();
        jointDef.bodyA = world.CreateBody(new b2BodyDef());
        jointDef.bodyB = bodyB;
        jointDef.target = target;
        jointDef.dampingRatio = .1;
        jointDef.frequentcHz = 1;
        jointDef.maxForce = bodyB.GetMass() * 20;
        mouseJoint=world.CreateJoint(jointDef)
        mouseJoint = Box2D.castObject(mouseJoint, Box2D.b2MouseJoint);
    }
}


