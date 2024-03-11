import { stage, gframe, keys } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import {  BoxBall} from "../../classes/actor.js";
//游戏变量;
var ball, closeBody;
var point1, point2, closePoint, rayAngle = Math.PI / 2, rayLength = 500 / PTM;
var ANGLE_MAX = Math.PI * 8 / 9;
var ANGLE_MIN = Math.PI / 9;
var angle_speed = Math.PI / 200;
var contactListener;
var raycastCallback;
export class RayCast extends Game {
    constructor() {
        super("RayCast");
        gframe.buildWorld(true);
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        ball = new BoxBall(200, 400,25)
        ball.body.SetUserData(USER_DATA_PLAYER);
        ball.body.GetFixtureList().SetRestitution(0);
        // ball.body.SetAwake(false)
        this.addToPlayer(ball);
        

        var ground = EasyBody.createBox(380, 650, 550, 100, 0,);
        ground.SetUserData(USER_DATA_GROUND);

        point1 = new b2Vec2(stage.width / 2 / PTM, stage.height / 2 / PTM);
        point2 = new b2Vec2();
        contactListener = new BallMoveContactListener();

        raycastCallback = new Box2D.JSRayCastCallback();
        raycastCallback.ReportFixture = function (fixture, point, normal, fraction) {
            var p = Box2D.wrapPointer(point, b2Vec2)
            var f = Box2D.wrapPointer(fixture, b2Fixture)
            closePoint = copyVec2(p);
            closeBody = f.GetBody();
            return fraction
        }
    }
    runGame() {
        world.ClearForces();

        this.moveRay();
        world.RayCast(raycastCallback, point1, point2);
        debugDraw.DrawSegment(new b2Vec2(1, 1).a, new b2Vec2(5, 5).a)

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
        debugDraw.DrawSegment(point1.a, closePoint.a, new b2Color(255, 0, 0).a);
        if (closeBody != null && closeBody.GetUserData() == USER_DATA_PLAYER) {
            debugDraw.DrawCircle(closeBody.GetPosition().a, 50 / PTM, new b2Color(255, 255, 255).a);
        }
    }
}

