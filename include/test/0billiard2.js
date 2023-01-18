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
            ball0.edgeBehavior=Actor.BOUNCE;
            ball0.setSize(300,300);
            ball0.mass=2;
            ball0.pos.setValues(300,300);
            ball0.speed.x=Math.random()*10-5;
            ball0.speed.y=Math.random()*10-5;
            
            ball1=new Barrage();
            ball1.edgeBehavior=Actor.BOUNCE;
            ball1.setSize(180,180);
            ball1.mass=1;
            ball1.pos.setValues(300,300);
            ball1.speed.x=Math.random()*10-5;
            ball1.speed.y=Math.random()*10-5;
            stage.addChild(ball0,ball1);
        }
        runGame() {
           ball0.act();
           ball1.act();
            if (ball0.hitRadius(ball1)) {
                this.billiardCollision(ball0,ball1);
            }
        }

    }
    Billiard2.loadItem = null;
    Billiard2.loaderbar=null;;
    window.Billiard2 = Billiard2;
})();