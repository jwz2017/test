(function () {
    "use strict";
    //游戏变量;
    var numDots=50,friction=0.95,dots,shape;
    class Brownian extends Game {
        constructor() {
            super("布朗运动");
        }
        waitComplete() {
            shape=new createjs.Shape();
            shape.graphics.beginStroke("#00000055")
            stage.addChild(shape);
            stage.canvas.style.background="#fff";
            dots=[];
            for (let i = 0; i < numDots; i++) {
                const dot = new CirActor();
                dot.init(2,2);
                dot.x=Math.random()*width;
                dot.y=Math.random()*height;
                dots.push(dot);
                stage.addChild(dot);
            }
        }
        runGame() {
            for (let i = 0; i < numDots; i++) {
                const dot = dots[i];
                shape.graphics.moveTo(dot.x,dot.y)
                dot.speed.x+=Math.random()*0.2-0.1;
                dot.speed.y+=Math.random()*0.2-0.1;
                dot.x+=dot.speed.x;
                dot.y+=dot.speed.y;
                dot.speed.x*=friction;
                dot.speed.y*=friction;
                shape.graphics.lineTo(dot.x,dot.y);
                if (dot.outOfBounds()) {
                    dot.placeInBounds();
                }
            }
        }

    }
    window.Brownian = Brownian;
})();