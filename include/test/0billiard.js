(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var ball0, ball1;
    class Billiard extends Game {
        constructor() {
            super();
            this.titleScreen.setText("单轴动量碰撞");

        }
        waitComplete() {
            ball0 = new Barrage();
            ball0.setSize(80, 80, true);
            ball0.mass = 2;
            ball0.x = 50;
            ball0.y = height / 2;
            ball0.speed.x = 1;

            ball1 = new Barrage();
            ball1.setSize(50, 50, true);
            ball1.mass = 1;
            ball1.x = 700;
            ball1.y = height / 2;
            ball1.speed.x = -1;
            stage.addChild(ball0, ball1);
        }
        runGame() {
            ball0.x+=ball0.speed.x;
            ball1.x+=ball1.speed.x;
            if (ball0.hitRadius(ball1)) {
                let vxTotal = ball0.speed.x - ball1.speed.x;
                ball0.speed.x = ((ball0.mass - ball1.mass) * ball0.speed.x +
                    2 * ball1.mass * ball1.speed.x) / (ball0.mass + ball1.mass);
                ball1.speed.x = vxTotal + ball0.speed.x;
                ball0.x += ball0.speed.x;
                ball1.x += ball1.speed.x;
            }
        }
    }
    Billiard.loadItem = null;
    Billiard.loaderbar = null;;
    window.Billiard = Billiard;
})();