(function () {
    "use strict";
    //游戏变量;
    var balls, vpX, vpY,
        numBalls = 20,
        fl = 250,
        top = -200,
        bottom = 200,
        left = -200,
        right = 200,
        front = 200,
        back = -200;
    class Collision3D extends Game {
        constructor() {
            super();
            this.titleScreen.setText("3D碰撞检测");
        }
        waitComplete() {
            balls = [];
            vpX = width / 2;
            vpY = height / 2;
            for (let i = 0; i < numBalls; i++) {
                const ball = new Barrage();
                ball.setSize(30, 30);
                ball.pos.x = Math.random() * 400 - 200;
                ball.pos.y = Math.random() * 400 - 200;
                ball.pos.z = Math.random() * 400 - 200;
                ball.speed.x = Math.random() * 10 - 5;
                ball.speed.y = Math.random() * 10 - 5;
                ball.speed.z = Math.random() * 10 - 5;
                balls.push(ball);
                stage.addChild(ball);
            }
        }
        runGame() {
            for (let i = 0; i < numBalls; i++) {
                const ball = balls[i];
                this.move(ball);
            }
            //碰撞检测
            for (let i = 0; i < numBalls - 1; i++) {
                const ballA = balls[i];
                for (let j = i + 1; j < numBalls; j++) {
                    const ballB = balls[j];
                    let dx = ballA.pos.x - ballB.pos.x;
                    let dy = ballA.pos.y - ballB.pos.y;
                    let dz = ballA.pos.z - ballB.pos.z;
                    let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < ballA.hit + ballB.hit) {
                        ballA.color = ballB.color = "#00f";
                        ballA.drawShape(ballA.size.x, ballA.size.y);
                        ballB.drawShape(ballB.size.x, ballB.size.y);
                    }
                }
            }
            stage.sortChildren(function (a, b) {
                return b.pos.z - a.pos.z;
            })
        }
        move(ball) {
            ball.pos.x += ball.speed.x;
            ball.pos.y += ball.speed.y;
            ball.pos.z += ball.speed.z;
            if (ball.pos.x + ball.hit > right) {
                ball.pos.x = right - ball.hit;
                ball.speed.x *= -1;
            } else if (ball.pos.x - ball.hit < left) {
                ball.pos.x = left + ball.hit;
                ball.speed.x *= -1;
            }
            if (ball.pos.y + ball.hit > bottom) {
                ball.pos.y = bottom - ball.hit;
                ball.speed.y *= -1;
            } else if (ball.pos.y - ball.hit < top) {
                ball.pos.y = top + ball.hit;
                ball.speed.y *= -1;
            }
            if (ball.pos.z + ball.hit > front) {
                ball.pos.z = front - ball.hit;
                ball.speed.z *= -1;
            } else if (ball.pos.z - ball.hit < back) {
                ball.pos.z = back + ball.hit;
                ball.speed.z *= -1;
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
    window.Collision3D = Collision3D;
})();