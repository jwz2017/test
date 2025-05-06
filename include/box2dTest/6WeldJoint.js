import { stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { Vector } from "../../classes/actor.js";
import { ContactListener } from "../../classes/box2d/ContactListener.js";
import { Trail } from "../../classes/box2d/Trail.js";
//游戏变量;
var planetRadius = 60, playerSize = 20;
var planet1, planet2, player, trail;
var contactListener;
var weldJoint;
export class WeldJoint extends Box2dGame {
    constructor() {
        super("粘贴关节");
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
        this.tempV = new b2Vec2();

        stage.on("stagemousedown", () => {
            if (contactListener.contactPlanet) {
                world.DestroyJoint(weldJoint);
                this.resumePlayerAndJump();
                contactListener.contactPlanet = null;
                trail.startFromHere();
            }
        })
    }
    runGame(e) {
        super.runGame(e);
        if (contactListener.isContacted) {
            contactListener.isContacted = false;
            this.attachPlayerToPlanet();
        }
        this.checkBoundary();
        if (!contactListener.contactPlanet) trail.update();
    }
    resumePlayerAndJump() {
        this.tempV.SetZero()
        player.SetLinearVelocity(this.tempV);

        let impulse = Vector.sub(player.GetPosition(), contactListener.contactPlanet.GetPosition());
        impulse.normalize();
        impulse.mul(player.GetMass() * 10)
        this.tempV.Set(impulse.x, impulse.y)
        player.ApplyLinearImpulse(this.tempV, player.GetPosition());
    }
    attachPlayerToPlanet() {
        let localDistanceToAttach = playerSize / 2 + planetRadius;
        let distancePlayerToPlanet = Vector.sub(player.GetPosition(), contactListener.contactPlanet.GetPosition());
        distancePlayerToPlanet.normalize();
        distancePlayerToPlanet.mul(localDistanceToAttach / PTM)
        let angle = distancePlayerToPlanet.angle;
        distancePlayerToPlanet.add(contactListener.contactPlanet.GetPosition());
        this.tempV.Set(distancePlayerToPlanet.x, distancePlayerToPlanet.y)
        player.SetTransform(this.tempV, angle);

        weldJoint=EasyWorld.createWeldJoint({
            bodyA:contactListener.contactPlanet,
            bodyB:player,
            anchor:this.tempV,
        })
    }
    checkBoundary() {
        let p = player.GetPosition();
        if (p.y * PTM > 400 || p.x * PTM < -20 || p.x * PTM > 520) {
            this.tempV.Set(150 / PTM, -20 / PTM)
            player.SetTransform(this.tempV, 0);
            this.tempV.SetZero();
            player.SetLinearVelocity(this.tempV);
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
