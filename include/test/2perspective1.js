(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var ball, xpos, ypos, zpos, vpX, vpY,
        fl = 250;
    class Perspective1 extends Game {
        constructor() {
            super("透视1");
        }
        waitComplete() {
            xpos=ypos=zpos=0;
            vpX=width/2;
            vpY=height/2;

            ball=new CirActor();
            ball.init(50,50);
            stage.addChild(ball);
        }
        runGame() {
            if (keys.up) {
                zpos+=5;
            }else if (keys.down) {
                zpos-=5;
            }
            if (zpos>-fl) {
                xpos=stage.mouseX-vpX;
                ypos=stage.mouseY-vpY;
                let scale=fl/(fl+zpos);
                ball.scale=scale;
                ball.x=vpX+xpos*scale;
                ball.y=vpY+ypos*scale;
                ball.visible=true;
            }else{
                ball.visible=false;
            }

        }

    }
    window.Perspective1 = Perspective1;
})();