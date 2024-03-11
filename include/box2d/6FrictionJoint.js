import { stage, gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";

//游戏变量;
var player, contactListener1;
export class FrictionJoint extends Game {
    constructor() {
        super("FrictionJoint");
        gframe.buildWorld(true, 0);
    }
    waitComplete() {
        player = EasyBody.createBox(100, 300, 40, 40);
        player.SetUserData(USER_DATA_PLAYER);

        this.createBodies();
        contactListener1 = new FrictionJointContactListener();
        //dragBody
        this.dragBody();


        
    }
    runGame() {
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
            // let ball = EasyBody.createBox(posX, posY, bodySize*2,bodySize*2);
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
    }
    PreSolve(contact,manifold) {
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
        let jointDef = new b2FrictionJointDef();
        // jointDef.BodyA=player;
        // jointDef.BodyB=bodyB;
        jointDef.collideConnected = true
        jointDef.localAnchorA = new b2Vec2();
        jointDef.localAnchorB = new b2Vec2();
        jointDef.maxForce = bodyB.GetMass() * 60;
        jointDef.maxTorque = 10;
        jointDef.Initialize(player, bodyB, anchor);
        world.CreateJoint(jointDef);
    }
    destroyFrictionJointWith(bodyB) {
        let tempJointEdge = bodyB.GetJointList();
        // if(tempJointEdge.a){;
        world.DestroyJoint(tempJointEdge.joint)
        // }
    }
}
