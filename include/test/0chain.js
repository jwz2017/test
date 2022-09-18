
(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var chainShape,balls;
    class Chain extends Game {
        constructor() {
            super();
            this.titleScreen.setText("链式运动");
            
        }
        waitComplete() {
            balls=[];
            chainShape=new createjs.Shape();
            stage.addChild(chainShape);
            for (let i = 0; i < 7; i++) {
                const ball = new Barrage();
                ball.setSize(20,20);
                stage.addChild(ball);    
                balls.push(ball);      
            }
        }
        runGame() {
            let g=chainShape.graphics;
            g.clear();
            g.setStrokeStyle(2).beginStroke('#000000').moveTo(stage.mouseX,stage.mouseY);
            this.moveBall(balls[0],stage.mouseX,stage.mouseY);
            g.lineTo(balls[0].x,balls[0].y);
            for (let i = 1; i < balls.length; i++) {
                const ballA = balls[i-1],
                ballB=balls[i];
                this.moveBall(ballB,ballA.x,ballA.y);
                g.lineTo(ballB.x,ballB.y);
                
            }
        }
        moveBall(ball,targetX,targetY){
            ball.speed.x+=(targetX-ball.x)*0.1;//缓动弹力系数
            ball.speed.y+=(targetY-ball.y)*0.1;
            ball.speed.y+=5;//重力
            ball.speed.x*=0.75;//摩檫力
            ball.speed.y*=0.75;
            ball.x+=ball.speed.x;
            ball.y+=ball.speed.y;
        }

    }
    Chain.loadItem = null;
    Chain.loaderbar=null;;
    window.Chain = Chain;
})();