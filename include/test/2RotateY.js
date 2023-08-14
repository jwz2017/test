import { Point3D } from "../../classes/3DClass.js";
import { CirActor, Vector } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var balls, vpX, vpY,
    numBalls = 50,
    fl = 250;
export class RotateY extends gframe.Game {
    constructor() {
        super("绕Y轴旋转");
    }
    waitComplete() {
        stage.removeChild(this);
        vpX =stage.width / 2;
        vpY =stage.height / 2;
        balls = [];
        for (let i = 0; i < numBalls; i++) {
            const ball = new CirActor();
            ball.init(30, 30);
            ball.speed.z = 0;
            ball.pos = new Point3D();
            ball.pos.x = Math.random() * 200 - 100;
            ball.pos.y = Math.random() * 200 - 100;
            ball.pos.z = Math.random() * 200 - 100;
            stage.addChild(ball);
            balls.push(ball);
        }
    }
    runGame() {
        var angleY = (stage.mouseX - vpX) * 0.001;
        var angleX = (stage.mouseY - vpY) * 0.001;
        for (let i = 0; i < numBalls; i++) {
            const ball = balls[i];
            this.rotateY(ball, angleY);
            this.rotateX(ball, angleX);
            this.doPerspective(ball);
        }
        stage.sortChildren(function (a, b) {
            return b.pos.z - a.pos.z;
        })
    }
    rotateY(ball, angleY) {
        var p = this.rotate(ball.pos.x, ball.pos.z, Math.sin(angleY), Math.cos(angleY), false);
        ball.pos.x = p.x;
        ball.pos.z = p.y;
    }
    rotateX(ball, angleX) {
        var p = this.rotate(ball.pos.y, ball.pos.z, Math.sin(angleX), Math.cos(angleX), false);
        ball.pos.y = p.x;
        ball.pos.z = p.y;
    }
    doPerspective(ball) {
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
    rotate(posx, posy, sin, cos) {
        let xpos = posx * cos - posy * sin;
        let ypos = posy * cos + posx * sin;
        return new Vector(xpos, ypos);
    }

}