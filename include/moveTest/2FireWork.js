import { Game } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";
import { mc } from "../../classes/mc.js";

var balls, vpX, vpY,
    numBalls = 100,
    fl = 250,
    gravity = 0.2,
    floor = 200,
    bounce = -0.6;
export class FireWork extends Game {
    constructor() {
        super("烟火");
        balls = [];
        vpX =stage.width / 2;
        vpY = stage.height / 2;
        for (let i = 0; i < numBalls; i++) {
            const ball = new CirActor();
            ball.drawSpriteData(4)
            ball.color = mc.randomColor();
            ball.speed.x = Math.random() * 6 - 3;
            ball.speed.y = Math.random() * 6 - 6;
            ball.speed.z = Math.random() * 6 - 3;
            ball.xpos = 0;
            ball.ypos = -100;
            ball.zpos = 0;
            balls.push(ball);
            stage.addChild(ball);
        }
    }
    runGame() {
        for (let i = 0; i < numBalls; i++) {
            const ball = balls[i];
            this.move(ball)
        }
        stage.sortChildren(function (a, b) {
            return b.zpos - a.zpos;
        })
    }
    move(ball) {
        ball.speed.y += gravity;
        ball.xpos += ball.speed.x;
        ball.ypos += ball.speed.y;
        ball.zpos += ball.speed.z;
        if (ball.ypos > floor) {
            ball.ypos = floor;
            ball.speed.y *= bounce;
        }
        if (ball.zpos > -fl) {
            let scale = fl / (fl + ball.zpos);
            ball.scale = scale;
            ball.x = vpX + ball.xpos * scale;
            ball.y = vpY + ball.ypos * scale;
            ball.visible = true;
        } else {
            ball.visible = false;
        }
    }

}