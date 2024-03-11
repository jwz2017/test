import { gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import { Actor, BoxActor } from "../../classes/actor.js";
//游戏变量;
var planet, sensor, bird, contactListener;
var planetGravity = 10, birdManager;
export class Gravition extends Game {
    static SENSOR = "10";
    static GROUND = 999;
    static PLATE = 998;
    static PLAYER = 997;
    constructor() {
        super("Gravition");
        gframe.buildWorld(true, 0);
        planet = EasyBody.createCircle(500, 200, 50, 1)
        sensor = EasyBody.createCircle(500, 200, 170, 0);
        sensor.SetUserData(Gravition.SENSOR);
        sensor.GetFixtureList().SetSensor(true)
        bird = new Bird();
        bird.body.SetUserData(Gravition.PLAYER);
        this.addToPlayer(bird);

        this.thrower = new BirdThrower(this, bird, 150, 600);

        contactListener = new GraviationListener();
    }
    runGame() {
        world.ClearForces();
        this.moveActors(this.playerLayer)
        this.thrower.drawTrail()
    }

}
class Bird extends BoxActor {
    constructor(xpos, ypos) {
        super(xpos, ypos,20,20);
    }
    act() {
        if (contactListener.isBirdInSensor) {
            var force = subVec2(planet.GetPosition(), this.body.GetPosition());
            force.Normalize();
            let F = planetGravity * this.body.GetMass();
            force.Set(force.x * F, force.y * F);
            this.body.ApplyForce(force, this.body.GetPosition());
            this.body.SetLinearDamping(0.2)
        }
        this.update()
    }
}
class GraviationListener extends ContactListener {
    constructor() {
        super();
        this.isBirdInSensor = false;
    }
    BeginContact(contact) {
        var checkResult = this.sortByTwoBody(contact, Gravition.PLAYER, Gravition.SENSOR);
        if (checkResult) {
            this.isBirdInSensor = true
        }
    }
    EndContact(contact) {
        var checkResult = this.sortByTwoBody(contact, Gravition.PLAYER, Gravition.SENSOR);
        if (checkResult) {
            this.isBirdInSensor = false
        }
    }
}
