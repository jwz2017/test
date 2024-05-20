import { Game } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var balls, vpX, vpY, numBalls = 50, fl = 250,
    top = -100, bottom = 100, left = -100, right = 100,
    front = 100, back = -100;
export class MultiBounce3D extends Game {
    constructor() {
        super("多球反弹");
        balls = [];
        vpX = stage.width / 2;
        vpY =stage.height / 2;
        for (let i = 0; i < numBalls; i++) {
            const ball = new CirActor(0,0,15);
            ball.speed.x = Math.random() * 10 - 5;
            ball.speed.y = Math.random() * 10 - 5;
            ball.speed.z = Math.random() * 10 - 5;
            ball.xpos = 0;
            ball.ypos = 0;
            ball.zpos = 0;
            balls.push(ball);
            stage.addChild(ball);
        }
    }
    runGame() {
        for (let i = 0; i < numBalls; i++) {
            const ball = balls[i];
            this.move(ball);
        }
        stage.sortChildren(function (obj1, obj2) {
            return obj2.zpos - obj1.zpos;
        })
    }
    move(ball) {
        ball.xpos += ball.speed.x;
        ball.ypos += ball.speed.y;
        ball.zpos += ball.speed.z;
        //反弹
        if (ball.xpos + ball.hit > right) {
            ball.xpos = right - ball.hit;
            ball.speed.x *= -1;
        } else if (ball.xpos - ball.hit < left) {
            ball.xpos = left + ball.hit;
            ball.speed.x *= -1;
        }
        if (ball.ypos + ball.hit > bottom) {
            ball.ypos = bottom - ball.hit;
            ball.speed.y *= -1;
        } else if (ball.ypos - ball.hit < top) {
            ball.ypos = top + ball.hit;
            ball.speed.y *= -1;
        }
        if (ball.zpos + ball.hit > front) {
            ball.zpos = front - ball.hit;
            ball.speed.z *= -1;
        } else if (ball.zpos - ball.hit < back) {
            ball.zpos = back + ball.hit;
            ball.speed.z *= -1;
        }
        if (ball.zpos > -fl) {
            var scale = fl / (fl + ball.zpos);
            ball.scale = scale;
            ball.x = vpX + ball.xpos * scale;
            ball.y = vpY + ball.ypos * scale;
            ball.visible = true;
        } else {
            ball.visible = false;
        }
    }
}