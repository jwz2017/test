import { CirActor, Vector } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var ball, tx, ty, tz, vpX, vpY,
    easing = .1, fl = 250;
export class Easing3d extends gframe.Game {
    constructor() {
        super("3d缓动");
    }
    waitComplete() {
        vpX =stage.width / 2;
        vpY = stage.height / 2;
        ball = new CirActor();
        ball.pos = new Vector(0, 0);
        ball.init(50, 50);
        ball.pos.z = 0;
        ball.speed.z = 0;
        tx = Math.random() * 500 - 250;
        ty = Math.random() * 500 - 250;
        tz = Math.random() * 500;
        stage.addChild(ball);
    }
    runGame() {
        var dx = tx - ball.pos.x;
        var dy = ty - ball.pos.y;
        var dz = tz - ball.pos.z;
        ball.pos.x += dx * easing;
        ball.pos.y += dy * easing;
        ball.pos.z += dz * easing;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1) {
            tx = Math.random() * 500 - 250;
            ty = Math.random() * 500 - 250;
            tz = Math.random() * 500;
        }
        if (ball.pos.z > -fl) {
            var scale = fl / (fl + ball.pos.z);
            ball.scale = scale;
            ball.x = vpX + ball.pos.x * scale;
            ball.y = vpY + ball.pos.y * scale;
            ball.visible = true;
        } else {
            ball.visible = false;
        }
    }

}