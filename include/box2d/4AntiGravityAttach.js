import { gframe, stage } from "../../classes/gframe.js";
import { Game, } from "../../classes/Game.js";
import { Vector } from "../../classes/actor.js";
var planet1, planet2, player, planetRadius = 60, playerSize = 20;
var isPlayerJumping = false;
var localVectorPlayerOnPlant;
export class AniGravityAttach extends Game {
    static PLANET = 2;
    static PLAYER = 1;
    constructor() {
        super("AniGravityAttach");
        gframe.buildWorld(true);

        planet1 = EasyBody.createCircle(120, 400, planetRadius, 1);
        planet1.SetAngularVelocity(Math.PI / 2);
        planet1.SetUserData(AniGravityAttach.PLANET);

        planet2 = EasyBody.createCircle(350, 450, planetRadius, 1);
        planet2.SetAngularVelocity(-Math.PI / 2);
        planet2.SetUserData(AniGravityAttach.PLANET);

        player = EasyBody.createBox(150, -50, playerSize, playerSize);
        player.SetUserData(AniGravityAttach.PLAYER);

        this.contactListener = new Listen();

        this.trail = new Trail(this.container, player);
    }
    waitComplete() {
        stage.on("stagemousedown", () => {
            let p = this.contactListener.contactedPlanet;
            if (p != null) {
                p.DestroyFixture(p.GetFixtureList());
                this.playerJump(p);
                this.contactListener.contactedPlanet = null;
            }
        })
    }
    runGame() {
        world.ClearForces();
        if (this.contactListener.isContacted) {
            this.attachPlayerToPlanet(this.contactListener.contactedPlanet);
            this.contactListener.isContacted = false;
            isPlayerJumping = false;
        }
        if (isPlayerJumping) this.trail.update();

    }
    attachPlayerToPlanet(plant) {
        var localDistanceToAttach = playerSize / 2 + planetRadius;
        var distancePlayerToPlanet = subVec2(player.GetPosition(), plant.GetPosition());
        localVectorPlayerOnPlant = plant.GetLocalVector(distancePlayerToPlanet);
        localVectorPlayerOnPlant.Normalize();
        scaleVec2(localVectorPlayerOnPlant, localDistanceToAttach);

        var v = new Vector(0, 0);
        v.setValues(localVectorPlayerOnPlant.x, localVectorPlayerOnPlant.y);
        let shape = EasyShape.createBox(20, 20, v.x, v.y, v.angle)
        plant.CreateFixture(shape, 3);
        plant.GetFixtureList().SetUserData(AniGravityAttach.PLANET);

        player.SetActive(false);
        player.SetTransform(new b2Vec2(-2, -2), 0);
    }
    playerJump(p) {
        scaleVec2(localVectorPlayerOnPlant, 1 / PTM)
        let playerPosition = p.GetWorldPoint(localVectorPlayerOnPlant);
        let playerVector = p.GetWorldVector(localVectorPlayerOnPlant);
        let v = new Vector(0, 0);
        v.setValues(playerVector.x, playerVector.y);

        player.SetTransform(playerPosition, v.angle);
        player.SetLinearVelocity(new b2Vec2(0, 0));
        player.SetActive(true)
        isPlayerJumping = true;
        this.trail.startFromHere();

        var impulse = copyVec2(playerVector);
        impulse.Normalize();
        scaleVec2(impulse, player.GetMass() * 10);
        player.ApplyLinearImpulse(impulse, player.GetPosition());
    }
}
class Listen extends ContactListener {
    constructor() {
        super();
        this.contactedPlanet = null;
        this.isContacted = false
    }
    BeginContact(contact) {
        let result = this.sortByTwoBody(contact, AniGravityAttach.PLAYER, AniGravityAttach.PLANET);
        if (result) {
            this.contactedPlanet = result[1];
            this.isContacted = true;
        }
    }
}
