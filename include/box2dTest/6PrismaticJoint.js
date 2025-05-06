import { keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { Box2DBall } from "../../classes/box2d/actor/box2dBall.js";
import { BallMoveContactListener } from "../../classes/box2d/ContactListener.js";
var player, contactListener;
export class PrismaticJoint extends Box2dGame {
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("位移关节");
        //createBodies
        EasyBody.createBox(0, this.height / 2, 10, this.height, 0);
        EasyBody.createBox(this.width, this.height / 2, 10, this.height, 0);
        EasyBody.createBox(this.width / 2, 0, this.width, 10, 0);
        EasyBody.createBox(50, this.height - 50, 100, 100, 0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(this.width - 50, this.height - 50, 100, 100, 0).SetUserData(USER_DATA_GROUND);

        let b = EasyBody.createCircle(5, 5, 25);
        let a = new CirActor();
        a.drawSpriteData(50);
        this.addToBox2D(a);
        player = new Box2DBall(b, a);

        this.createJoint();

        contactListener = new BallMoveContactListener();
    }
    runGame(e) {
        super.runGame(e)
        player.act(keys);

        for (let index = 0; index < 1000; index++) {
            // this.createJoint();
            // EasyWorld.fixBodyAt(player,200,200);
            // EasyWorld.createMouseJoint({bodyB:player.body,anchorB:player.body.GetPosition()})
            // this.clearAfter();
        }
    }

    createJoint() {
        var car = EasyBody.createBox(200, 670, 100, 10);
        car.SetUserData(USER_DATA_GROUND)
        var shape1 = EasyShape.createBox(10, 30, -50, -10);
        car.CreateFixture(shape1, 3);
        var shape2=EasyShape.createBox(10,30,50,-10)
        car.CreateFixture(shape2, 3);
        Box2D._free(shape1.a);
        Box2D._free(shape2.a);

        let a=EasyWorld.createPrismaticJoint({
            bodyB: car,
            bodyAX: this.width / 2,
            bodyAY: 600,
            enableMoter: true,
            enableLimit:false,
            // referenceAngle:Math.PI/6,
            // localAnchorB:new b2Vec2(0,-2)

        })
        
        

    }
}
