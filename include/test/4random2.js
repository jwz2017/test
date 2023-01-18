(function () {
    "use strict";
    //游戏变量;
    var numDots=300,iterations=6;
    class Random2 extends Game {
        constructor() {
            super();
            this.titleScreen.setText("偏向分布");
        }
        waitComplete() {
            for (let i = 0; i < numDots; i++) {
                const dot = new Barrage();
                dot.setSize(2,2);
                stage.addChild(dot);
                var xpos=0;
                for (let j = 0; j < iterations; j++) {
                    xpos+=Math.random()*width;
                }
                dot.x=xpos/iterations;
                // let x1=Math.random()*width;
                // let x2=Math.random()*width;
                // dot.x=(x1+x2)/2;
                var ypos=0;
                for (let j = 0; j < iterations; j++) {
                    ypos+=Math.random()*height;
                    
                }
                dot.y=ypos/iterations;
                // dot.y=height/2+Math.random()*50-25;
            }
        }
        runGame() {

        }

    }
    window.Random2 = Random2;
})();