(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var ball0,ball1;
    class Billiard2 extends Game {
        constructor() {
            super();
            this.titleScreen.setText("动量碰撞");
        }
        waitComplete() {
            ball0=new Barrage();
            ball0.setSize(300,300);
            ball0.mass=2;
            ball0.x=width-200;
            ball0.y=height-200;
            ball0.speed.x=Math.random()*10-5;
            ball0.speed.y=Math.random()*10-5;

            ball1=new Barrage();
            ball1.setSize(180,180);
            ball1.mass=1;
            ball1.x=100;
            ball1.y=100;
            ball1.speed.x=Math.random()*10-5;
            ball1.speed.y=Math.random()*10-5;
            stage.addChild(ball0,ball1);
        }
        runGame() {
            ball0.x+=ball0.speed.x;
            ball0.y+=ball0.speed.y;
            ball1.x+=ball1.speed.x;
            ball1.y+=ball1.speed.y;
            if (ball0.hitBounds()) {
                ball0.pos.x=ball0.x-ball0.size.x/2;
                ball0.pos.y=ball0.y-ball0.size.y/2;
                ball0.rebounds();
            }
            if (ball1.hitBounds()) {
                ball1.pos.x=ball1.x-ball1.size.x/2;
                ball1.pos.y=ball1.y-ball1.size.y/2;
                ball1.rebounds();
            }
            let hitAngle=ball0.hitRadius(ball1);
            if (hitAngle) {
                this.billiardCollision(ball0,ball1);
            }
        }

    }
    Billiard2.loadItem = null;
    Billiard2.loaderbar=null;;
    window.Billiard2 = Billiard2;
})();