import { Box2dGame } from "../../classes/Game.js";
import { Actor } from "../../classes/actor.js";
import { ContactListener } from "../../classes/box2d/ContactListener.js";
import { BirdThrower } from "../../classes/box2d/actor/BirdThrower.js";
//游戏变量;
var planet, sensor, bird, contactListener;
var planetGravity = 10;
export class Gravition extends Box2dGame {
    static SENSOR = 1;
    constructor() {
        super("Gravition", true, 0);
        EasyBody.createRectangle(0,0,this.width,this.height)
        this.force=new b2Vec2();
        planet = EasyBody.createCircle(500, 200, 50, 1)
        sensor = EasyBody.createCircle(500, 200, 170, 0);
        sensor.SetUserData(Gravition.SENSOR);
        sensor.GetFixtureList().SetSensor(true)

        bird = EasyBody.createBox(0, 0, 20, 20);
        bird.SetUserData(USER_DATA_PLAYER);
        let a = new Actor();
        a.drawSpriteData(20, 20, "#f00");
        this.addToPlayer(a);
        bird.actor = a;

        this.thrower = new BirdThrower(this.container, bird, 150, 600);

        contactListener = new GraviationListener();

    }
    runGame(e) {
        super.runGame(e)
        if (contactListener.isBirdInSensor) {
            let p1 = planet.GetPosition();
            let p2 = bird.GetPosition();
            this.force.Set(p1.x - p2.x, p1.y - p2.y)
            this.force.Normalize();
            let F = planetGravity * bird.GetMass();
            this.force.op_mul(F);
            
            bird.ApplyForce(this.force, bird.GetPosition());
            bird.SetLinearDamping(0.2)
        }
        this.thrower.drawTrail()
    }

}
class GraviationListener extends ContactListener {
    constructor() {
        super();
        this.isBirdInSensor = false;
    }
    BeginContact(contact) {
        var checkResult = this.sortByTwoBody(contact,USER_DATA_PLAYER, Gravition.SENSOR);
        if (checkResult) {
            this.isBirdInSensor = true
        }
    }
    EndContact(contact) {
        var checkResult = this.sortByTwoBody(contact, USER_DATA_PLAYER, Gravition.SENSOR);
        if (checkResult) {
            this.isBirdInSensor = false
        }
    }
}
