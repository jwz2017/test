(function () {
    "use strict";
    //游戏变量;
    var world,box,speed=4;
    class Collision extends Game {
        constructor() {
            super();
            this.titleScreen.setText("碰撞测试");
        }
        waitComplete() {
            world=new IsoWorld();
            world.x=mapWidth/2;
            world.y=100;
            stage.addChild(world);

            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    const tile=new DrawnIsoTile(20,"#cccccc");
                    tile.position=new Point3D(i*20,0,j*20);
                    world.addChildToFloor(tile);
                }
            }
            box=new DrawnIsoBox(20,"#ff0000",20);
            box.xpos=200;
            box.zpos=200;
            world.addChildToWorld(box);
            
            let newBox=new DrawnIsoBox(20,"#ccffcc",20);
            newBox.xpos=300;
            newBox.zpos=300;
            world.addChildToWorld(newBox);
            
            
        }
        runGame() {
            box.vx=0;
            box.vz=0;
            switch (pressed[pressed.length-1]) {
                case "up":
                    box.vx=-speed;
                    break;
                case "down":
                    box.vx=speed;
                    break;
                case "left":
                    box.vz=speed;
                    break;
                case "right":
                    box.vz=-speed;
                    break;
            }

            if (world.canMove(box)) {
                box.xpos+=box.vx;
                box.ypos+=box.vy;
                box.zpos+=box.vz;
            }
            world.sortDepth();
        }

    }
    window.Collision = Collision;
})();