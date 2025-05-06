import { Box2dGame } from "../../../classes/Game.js";
import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1, bullet, s1, md, gray, blue, spaceCount = 1, vec;
export class LocalPosition extends AbstractDemo {
    constructor() {
        super("调整圆形的本地坐标",0)
        blue=blue||new b2Color(1,1,1);
        vec = vec || new b2Vec2();
        vec.SetZero();
        world.SetGravity(vec);
    }
    ready() {
        b1 = EasyBody.createCircle(250, 200, 50);
        b1.SetAngularVelocity(1);

        s1 = b1.GetFixtureList().GetShape();
        s1 = Box2D.castObject(s1, b2CircleShape);
        game.editValue("(" + s1.get_m_p().x * PTM + "," + s1.get_m_p().y * PTM + ")");
        Box2dGame.guiProps.drawTransforms = true;
        Box2dGame.updateWorldFromDebugDrawCheckboxes();
    }
    debugDraw(){
        drawCircle1(b1.GetPosition(),50/PTM)
    }
    reset() {
        vec.Set(250 / PTM, 200 / PTM);
        b1.SetTransform(vec, 0);
        switch (spaceCount) {
            case 1:
                vec.SetZero();
                s1.set_m_p(vec);
                b1.ResetMassData(); 
                game.editValue("(" + s1.get_m_p().x * PTM + "," + s1.get_m_p().y * PTM + ")");
                break;
            case 2:
                vec.Set(50 / PTM, 50 / PTM);
                s1.set_m_p(vec);
                game.editValue("(" + s1.get_m_p().x * PTM + "," + s1.get_m_p().y * PTM + ")");
                break;
            case 3:
                vec.Set(50 / PTM, 50 / PTM);
                s1.set_m_p(vec);
                b1.ResetMassData(); 
                game.editValue("调整质心后，(" + s1.get_m_p().x * PTM + "," + s1.get_m_p().y * PTM + ")");
        }
        b1.SetAngularVelocity(1);
    }
    onKeyDown(c) {
        if (c == "left" || c == "right") {
            Box2dGame.guiProps.drawTransforms = false;
            Box2dGame.updateWorldFromDebugDrawCheckboxes();
        }else if (c == "reset") {
            if (++spaceCount > 3) {
                spaceCount = 1;
            }
            this.reset();
        }
    }

}