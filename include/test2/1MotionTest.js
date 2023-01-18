(function () {
    "use strict";
    //游戏变量;
    var world,box,
    speed=5;
    class MotionTest extends Game {
        constructor() {
            super();
            this.titleScreen.setText("移动测试");
        }
        waitComplete() {
            world=new IsoWorld();
            world.x=mapWidth/2;
            world.y=100;
            stage.addChild(world);

            for (let i = 0; i<20; i++) {
                for (let j = 0; j < 20; j++) {
                    let tile=new DrawnIsoTile(20,"#cccccc");
                    tile.position=new Point3D(i*20,0,j*20);
                    world.addChildToFloor(tile);
                }
            }
            box=new DrawnIsoBox(20,"#ff0000",20);
            box.xpos=200;
            box.zpos=200;
            world.addChildToWorld(box);
        }
        runGame() {
            box.vx=0;
            box.vz=0;
            switch (pressed[pressed.length-1]) {
                case "up":
                    box.vx=-speed
                    break;
                case "down":
                    box.vx=speed
                    break;
                case "right":
                    box.vz=-speed
                    break;
                case "left":
                    box.vz=speed
                    break;
            }
            box.xpos+=box.vx;
            box.ypos+=box.vy;
            box.zpos+=box.vz;
        }

    }
    window.MotionTest = MotionTest;
})();