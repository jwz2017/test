(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var xpos,ypos,zpos,ball,vpX,vpY,
    friction=.98,fl=250,
    top=-200,bottom=200,left=-200,right=200,
    front=200,back=-200;
    class Velocity3D extends Game {
        constructor() {
            super("3d速度");
        }
        waitComplete() {
            xpos=ypos=zpos=0;
            vpX=width/2;
            vpY=height/2;
            ball=new CirActor();
            ball.speed.z=0;
            ball.init(50,50);
            stage.addChild(ball);
        }
        runGame() {
            //键盘事件
            switch (pressed[pressed.length-1]) {
                case "up":
                    ball.speed.y-=1;
                    break;
                case "down":
                    ball.speed.y+=1;
                    break;
                case "left":
                    ball.speed.x-=1;
                    break;
                case "right":
                    ball.speed.x+=1;
                    break;
            }
            if (keys.shift) {
                ball.speed.z+=1;
            }else if (keys.ctrl) {
                ball.speed.z-=1;
            }
            //移动
            xpos+=ball.speed.x;
            ypos+=ball.speed.y;
            zpos+=ball.speed.z;
            //反弹
            if (xpos+ball.hit>right) {
                xpos=right-ball.hit;
                ball.speed.x*=-1;
            }else if(xpos-ball.hit<left){
                xpos=left+ball.hit;
                ball.speed.x*=-1;
            }
            if(ypos+ball.hit>bottom){
                ypos=bottom-ball.hit;
                ball.speed.y*=-1;
            }else if(ypos-ball.hit<top){
                ypos=top+ball.hit;
                ball.speed.y*=-1;
            }
            if (zpos+ball.hit>front) {
                zpos=front-ball.hit;
                ball.speed.z*=-1;
            }else if(zpos-ball.hit<back){
                zpos=back+ball.hit;
                ball.speed.z*=-1;
            }
            ball.speed.x*=friction;
            ball.speed.y*=friction;
            ball.speed.z*=friction;
            if(zpos>-fl){
                var scale=fl/(fl+zpos);
                ball.scale=scale;
                ball.x=vpX+xpos*scale;
                ball.y=vpY+ypos*scale;
                ball.visible=true;
            }else{
                ball.visible=false;
            }

        }

    }
    window.Velocity3D = Velocity3D;
})();