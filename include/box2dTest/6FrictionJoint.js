import { stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";

//游戏变量;
var player, contactListener1;
export class FrictionJoint extends Box2dGame {
    constructor() {
        super("摩擦关节",true,0);
        player = EasyBody.createBox(100, 300, 40, 40);
        player.SetUserData(USER_DATA_PLAYER);
    
        this.createBodies();
        contactListener1 = new FrictionJointContactListener();
        //dragBody
        this.dragBody(USER_DATA_PLAYER,40);
    }
    runGame(e) {
        super.runGame(e);
        let contactEdge=player.GetContactList();
        while(contactEdge.a){
            if(contactEdge.contact.isBegin){
                contactListener1.createFrictionJoint(contactEdge.other);
                contactEdge.contact.isBegin=false;
            }else if(contactEdge.contact.isEnd){
                contactListener1.destroyFrictionJointWith(contactEdge.other);
                contactEdge.contact.isEnd=false;
            }
            contactEdge=contactEdge.next;

        }
    }

    createBodies() {
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
        let bodySize = 10;
        let posX, posY;
        for (let i = 0; i < 100; i++) {
            posX = Math.random() * 500 + 50;
            posY = Math.random() * 300 + 50;
            let ball = EasyBody.createCircle(posX, posY, bodySize);
            ball.SetUserData(USER_DATA_BALL);
        }
    }

}

class FrictionJointContactListener extends ContactListener {
    constructor() {
        super();
        this.bodyB = null;
        this.bodyC = null;
        this.jointDef=new b2FrictionJointDef();
        this.jointDef.collideConnected=true;
    }
    PreSolve(contact) {
        let result = this.sortByTwoBody(contact, USER_DATA_PLAYER, USER_DATA_BALL);
        if (result) {
            contact.SetEnabled(false);
        }
    }
    BeginContact(contact) {
        let result = this.sortByTwoBody(contact, USER_DATA_PLAYER, USER_DATA_BALL);
        if (result) {
            contact.isBegin = true;
        }
    }
    EndContact(contact) {
        let result = this.sortByTwoBody(contact, USER_DATA_PLAYER, USER_DATA_BALL);
        if (result) {
            contact.isEnd = true;
        }
    }
    createFrictionJoint(bodyB) {
        let anchor = bodyB.GetPosition();
        this.jointDef.maxForce = bodyB.GetMass() * 60;
        this.jointDef.maxTorque = 10;
        this.jointDef.Initialize(player, bodyB, anchor);
        world.CreateJoint(this.jointDef);
    }
    destroyFrictionJointWith(bodyB) {
        let tempJointEdge = bodyB.GetJointList();
        world.DestroyJoint(tempJointEdge.joint)
    }
}
