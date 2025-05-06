import { stage, keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { CirActor} from "../../classes/actor.js";
import { BallMoveContactListener } from "../../classes/box2d/ContactListener.js";
import { Box2DBall } from "../../classes/box2d/actor/box2dBall.js";
//游戏变量;
var ball, closeBody;
var point1, point2, closePoint=new createjs.Point(), rayAngle = Math.PI / 2, rayLength = 500 / PTM;
var ANGLE_MAX = Math.PI * 8 / 9;
var ANGLE_MIN = Math.PI / 9;
var angle_speed = Math.PI / 200;
var contactListener;
var raycastCallback;
export class RayCast extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("RayCast");
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        let b=EasyBody.createCircle(200,400,25);
        let a=new CirActor();
        a.drawSpriteData(50)
        this.addToPlayer(a);
        ball=new Box2DBall(b,a);

        

        var ground = EasyBody.createBox(380, 650, 550, 100, 0,);
        ground.SetUserData(USER_DATA_GROUND);

        point1 = new b2Vec2(stage.width / 2 / PTM, stage.height / 2 / PTM);
        point2 = new b2Vec2();
        contactListener = new BallMoveContactListener();

        raycastCallback = new Box2D.JSRayCastCallback();
        raycastCallback.ReportFixture = function (fixture, point, normal, fraction) {
            var p = Box2D.wrapPointer(point, b2Vec2)
            var f = Box2D.wrapPointer(fixture, b2Fixture)
            closePoint.setValues(p.x,p.y);
            closeBody = f.GetBody();
            return fraction
        }

    }
    runGame(e) {
        super.runGame(e)

        this.moveRay();
        world.RayCast(raycastCallback, point1, point2);
        ball.act(keys);
    }
    moveRay() {
        if (rayAngle < ANGLE_MIN) {
            angle_speed *= -1;
            rayAngle = ANGLE_MIN;
        } else if (rayAngle > ANGLE_MAX) {
            angle_speed *= -1;
            rayAngle = ANGLE_MAX;
        }
        rayAngle += angle_speed;
        point2.x = point1.x + rayLength * Math.cos(rayAngle);
        point2.y = point1.y + rayLength * Math.sin(rayAngle);
    }
    containerDebugDraw() {
        super.containerDebugDraw();
        drawSegment1(point1,closePoint);
        if (closeBody != null && closeBody.GetUserData() == USER_DATA_BALL) {
            drawCircle1(closeBody.GetPosition(),50/PTM,false,"255,255,255")
        }
    }
}

