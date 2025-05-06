import { ContactListener } from "../../../classes/box2d/ContactListener.js";
import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1, b2, contactListener1, f1, vec;
export class IsSensor extends AbstractDemo {
    constructor() {
        super("isSensor=true时，刚体只检测但不参与碰撞");
        contactListener1 = contactListener1 || new SensorContact();
        this.p = new createjs.Point(250 / PTM, 250 / PTM);
        vec = vec || new b2Vec2();
    }
    ready() {
        b1 = EasyBody.createCircle(250, 250, 50, 0);
        b2 = EasyBody.createBox(245, 100, 50, 50);

        f1 = b1.GetFixtureList();

        game.editValue("false");
    }
    debugDraw() {
        if (contactListener1.isSensorContacted) {
            drawCircle1(this.p, 50 / PTM);
        }
    }
    reset() {
        b2.SetAwake(true);
        vec.Set(245 / PTM, 100 / PTM);
        b2.SetTransform(vec, 0);
        b2.SetAngularVelocity(0);
        vec.SetZero();
        b2.SetLinearVelocity(vec);
    }
    onKeyDown(c) {
        if (c = "reset") {
            this.reset();
            f1.SetSensor(!f1.IsSensor());
            game.editValue(f1.IsSensor());
        }
    }
}

class SensorContact extends ContactListener {
    constructor() {
        super();
        this.isSensorContacted = false;
    }
    BeginContact(contact) {
        if (contact.GetFixtureA().IsSensor() || contact.GetFixtureB().IsSensor()) {
            this.isSensorContacted = true;
        }
    }
    EndContact(contact) {
        this.isSensorContacted = false;
    }
}