import { game } from "../../classes/gframe.js";
import { BodyDef } from "./3BodyDef.js";
import { AbstractDemo } from "./3BodyDef/AbstractDemo.js";

export class MouseJoint extends BodyDef {
    constructor() {
        super();
        this.demoList = [
            MouseJoint1,
            MouseJoint2
        ]
    }
}

class MouseJoint1 extends AbstractDemo {
    constructor() {
        super("鼠标关节1");
    }
    ready() {
        this.body = EasyBody.createBox(200, 400, 30, 40);
        game.dragBody();
    }
}

var player;
class MouseJoint2 extends AbstractDemo {
    constructor() {
        super("鼠标关节2")
    }
    ready() {
        EasyBody.createEdge(0, 400, game.width, 400);
        EasyBody.createCircle(250, 400, 150, 0);
        EasyBody.createCircle(100, 400, 50, 0);
        EasyBody.createCircle(400, 400, 50, 0);

        player = EasyBody.createCircle(100, 300, 20);
    }
    mouseEventHandle(e) {
        if (e.type == "stagemousedown") {
            let b = EasyWorld.getBodyAt(e.stageX, e.stageY);
            if (b && b != player) {
                EasyWorld.mouseJoint = EasyWorld.createMouseJoint({
                    bodyB: player,
                    anchorB: player.GetPosition(),
                })
                tempVec.Set(e.stageX / PTM, e.stageY / PTM)
                EasyWorld.mouseJoint.SetTarget(tempVec)
            }
        } else if (e.type == "stagemouseup") {
            EasyWorld.stopDragBody();
        }
    }
}