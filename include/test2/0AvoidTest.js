(function () {
    "use strict";
    //游戏变量;
    var vehicle,circles,numCircles=10;
    class AvoidTest extends Game {
        constructor() {
            super("回避绕路测试");
        }
        waitComplete() {
            circles=[];
            vehicle=new SteeredActor();
            // vehicle.maxSpeed=6;
            vehicle.edgeBehavior=Actor.BOUNCE;
            stage.addChild(vehicle);

            for (let i = 0; i < numCircles; i++) {
                const circle = new CirActor(Math.random()*width,Math.random()*height);
                let size=Math.random()*50+50;
                circle.init(size,size);
                stage.addChild(circle);
                circles.push(circle);
            }
            
        }
        runGame() {
            vehicle.wander();
            vehicle.avoid(circles);
            vehicle.act();
        }

    }
    window.AvoidTest = AvoidTest;
})();