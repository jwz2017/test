import { keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { BallMoveContactListener } from "../../classes/box2d/ContactListener.js";
import { Box2DBall } from "../../classes/box2d/actor/box2dBall.js";

export class RevoluteJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("旋转关节");
        this.createJoint();
        this.createBodies();
        this.contactListener=new BallMoveContactListener();
    }
    createJoint(){
        let bodyB=EasyBody.createBox(250,600,250,10);
        bodyB.SetUserData(USER_DATA_GROUND);
        EasyWorld.createRevoluteJoint({
            bodyB:bodyB,
            bodyAX:250,
            bodyAY:500,
            enableMoter:true,
            enableLimit:true,
            // localAnchorA:new b2Vec2(-2,0)
        });

    }
    createBodies(){
        EasyBody.createBox(0,this.height/2,10,this.height,0);
        EasyBody.createBox(this.width,this.height/2,10,this.height,0);
        EasyBody.createBox(this.width/2,0,this.width,10,0);

        EasyBody.createBox(50,500,100,20,0).SetUserData(USER_DATA_GROUND);
        EasyBody.createBox(this.width-50,500,100,20,0).SetUserData(USER_DATA_GROUND);

        let b=EasyBody.createCircle(5,5,25)
        let a=new CirActor();
        a.drawSpriteData(50);
        this.addToBox2D(a);
        this.p=new Box2DBall(b,a);
    }
    runGame(e) {
        super.runGame(e)
        this.p.act(keys);
    }

}
