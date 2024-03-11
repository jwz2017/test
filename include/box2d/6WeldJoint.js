import { stage, gframe } from "../../classes/gframe.js";
import { Game, } from "../../classes/Game.js";
//游戏变量;
var planetRadius = 60, playerSize = 20;
var planet1, planet2, player, trail;
var contactListener;
var weldJoint;
export class WeldJoint extends Game {
    constructor() {
        super("WeldJoint");
        gframe.buildWorld(true);

        planet1 = EasyBody.createCircle(120, 200, planetRadius, 1);
        planet1.SetAngularVelocity(Math.PI / 2);
        planet1.SetUserData(USER_DATA_PLANET);

        planet2 = EasyBody.createCircle(350, 250, planetRadius, 1);
        planet2.SetAngularVelocity(-Math.PI / 2);
        planet2.SetUserData(USER_DATA_PLANET);

        player = EasyBody.createBox(150, -50, playerSize, playerSize);
        player.SetUserData(USER_DATA_PLAYER);

        contactListener = new WeldContactListener();

        trail = new Trail(this.container, player);
    }
    waitComplete() {
        stage.on("stagemousedown", () => {
            if (contactListener.contactPlanet) {
                world.DestroyJoint(weldJoint);
                this.resumePlayerAndJump();
                contactListener.contactPlanet = null;
                trail.startFromHere();
            }
        })
    }
    runGame() {
        if (contactListener.isContacted) {
            contactListener.isContacted = false;
            this.attachPlayerToPlanet();
        }
        this.checkBoundary();
        if (!contactListener.contactPlanet) trail.update();
    }
    resumePlayerAndJump() {
        player.SetLinearVelocity(new b2Vec2());

        let impulse = subVec2(player.GetPosition(), contactListener.contactPlanet.GetPosition());
        impulse.Normalize();
        scaleVec2(impulse, player.GetMass() * 10);
        player.ApplyLinearImpulse(impulse, player.GetPosition());
    }
    attachPlayerToPlanet() {
        let localDistanceToAttach = playerSize / 2 + planetRadius;
        let distancePlayerToPlanet = subVec2(player.GetPosition(), contactListener.contactPlanet.GetPosition());
        distancePlayerToPlanet.Normalize();
        scaleVec2(distancePlayerToPlanet, localDistanceToAttach / PTM);
        let worldPositionOfPlayer = addVec2(contactListener.contactPlanet.GetPosition(), distancePlayerToPlanet);
        player.SetTransform(worldPositionOfPlayer, Math.atan2(distancePlayerToPlanet.y, distancePlayerToPlanet.x));

        let anchor = player.GetPosition();
        let jointDef = new b2WeldJointDef();
        jointDef.Initialize(contactListener.contactPlanet, player, anchor);
        weldJoint = world.CreateJoint(jointDef);
    }
    checkBoundary() {
        let p = player.GetPosition();
        if (p.y * PTM > 400 || p.x * PTM < -20 || p.x * PTM > 520) {
            player.SetTransform(new b2Vec2(150 / PTM, -20 / PTM), 0);
            player.SetLinearVelocity(new b2Vec2());
            player.SetAngularVelocity(0);
            trail.startFromHere();
        }
    }
}
class WeldContactListener extends ContactListener {
    constructor() {
        super();
        this.isContacted = false;
        this.contactPlanet = null;
    }
    BeginContact(contact) {
        let result = this.sortByTwoBody(contact, USER_DATA_PLAYER, USER_DATA_PLANET);
        if (result) {
            this.isContacted = true;
            this.contactPlanet = result[1]
        }
    }

}
