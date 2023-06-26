(function () {
    "use strict";
    //游戏变量;
    var numDots=300,maxRadius=50;
    class Random extends Game {
        constructor() {
            super("平均圆形分布");
        }
        waitComplete() {
            for (let i = 0; i < numDots; i++) {
                const dot = new CirActor();
                dot.init(2,2);
                stage.addChild(dot);
                let radius=Math.sqrt(Math.random()) *maxRadius;
                let angle=Math.random()*Math.PI*2;
                dot.x=width/2+Math.cos(angle)*radius;
                dot.y=height/2+Math.sin(angle)*radius;
            }
        }
        runGame() {

        }

    }
    window.Random = Random;
})();