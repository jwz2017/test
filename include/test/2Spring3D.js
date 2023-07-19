(function () {
    "use strict";
    //游戏变量;
    var ball,tx,ty,tz,vpX,vpY,
    spring=0.1,friction=0.94,fl=250;
    class Spring3D extends Game {
        constructor() {
            super("3d弹性运动");
        }
        waitComplete() {
            vpX=width/2;
            vpY=height/2;
            ball=new CirActor();
            ball.init(50,50);
            ball.pos=new Point3D();
            ball.speed.z=0;
            stage.addChild(ball);
            tx=Math.random()*500-250;
            ty=Math.random()*500-250;
            tz=Math.random()*500;
            stage.addEventListener("stagemousedown",this.onDown);
        }
        runGame() {
            var dx=tx-ball.pos.x;
            var dy=ty-ball.pos.y;
            var dz=tz-ball.pos.z;
            ball.speed.x+=dx*spring;
            ball.speed.y+=dy*spring;
            ball.speed.z+=dz*spring;
            ball.pos.x+=ball.speed.x;
            ball.pos.y+=ball.speed.y;
            ball.pos.z+=ball.speed.z;
            ball.speed.x*=friction;
            ball.speed.y*=friction;
            ball.speed.z*=friction;
            if (ball.pos.z>-fl) {
                let scale=fl/(fl+ball.pos.z);
                ball.scale=scale;
                ball.x=vpX+ball.pos.x*scale;
                ball.y=vpY+ball.pos.y*scale;
                ball.visible=true;
            }else{
                ball.visible=false;
            }
        }
        onDown(){
            tx=Math.random()*500-250;
            ty=Math.random()*500-250;
            tz=Math.random()*500;
        }
    }
    window.Spring3D = Spring3D;
})();