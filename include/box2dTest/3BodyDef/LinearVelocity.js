import { Trail } from "../../../classes/box2d/Trail.js";
import { game, stage } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1, b2, p, v, trail, p1;
export class linearVelocity extends AbstractDemo {
    constructor() {
        super("按下W键，为刚体设置一个随机的线速度");
        p = p || new b2Vec2();
        v = v || new b2Vec2();
        p1 = p1 || new b2Vec2();
    }
    ready() {
        b1 = EasyBody.createBox(50, 200, 20, 20);
        game.editValue("b2Vec2(" + Math.round(b1.GetLinearVelocity().x * 10) / 10 +
            "," + Math.round(b1.GetLinearVelocity().y * 10) / 10 + ")");
        trail = new Trail(stage, b1)
    }
    reset() {
        p.Set(50 / PTM, b1.GetPosition().y);
        b1.SetTransform(p, 0);
        b1.SetAwake(true);
        b1.SetAngularVelocity(0);
        v.SetZero();
        b1.SetLinearVelocity(v);
        trail.startFromHere();
    }
    update() {
        trail.update();
    }
    onKeyDown(c) {
        if(c=="left"||c=="right"){
            stage.removeChild(trail);
            return;
        }else if (c != "reset") return;
        this.reset();
        v.Set(Math.random() * 10, -Math.random() * 20 - 5);
        b1.SetLinearVelocity(v);
        p1.Set(b1.GetPosition().x, b1.GetPosition().y);
        game.editValue("b2Vec2(" + Math.round(b1.GetLinearVelocity().x * 10) / 10 +
            "," + Math.round(b1.GetLinearVelocity().y * 10) / 10 + ")");
    }
}