import { Box2dGame } from "../../classes/Game.js";
import { BoxActor } from "../../classes/actor.js";
//游戏变量;
var planet, sensor, bird, contactListener;
var planetGravity = 10;
export class Gravition extends Box2dGame {
    static SENSOR = "10";
    static GROUND = 999;
    static PLATE = 998;
    static PLAYER = 997;
    constructor() {
        super("Gravition",true,0);
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
    runGame(e) {
        super.runGame(e)
        this.moveActors(this.playerLayer)
        this.thrower.drawTrail()
    }
    
}
class Bird extends BoxActor {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this._color="#f00"
        this.drawSpriteData(20,20)
        this.force=new b2Vec2();
    }
    act() {
        if (contactListener.isBirdInSensor) {
            let p1=planet.GetPosition();
            let p2=this.body.GetPosition();
            this.force.Set(p1.x-p2.x,p1.y-p2.y)
            this.force.Normalize();
            let F = planetGravity * this.body.GetMass();
            this.force.op_mul(F);
            this.body.ApplyForce(this.force, this.body.GetPosition());
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
