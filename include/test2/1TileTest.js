(function () {
    "use strict";
    //游戏变量;
    var world,floor;
    class TileTest extends Game {
        constructor() {
            super("TileTest");
        }
        waitComplete() {
            world=new IsoWorld();
            world.x=width/2;
            world.y=100;

            // floor=new createjs.Container();
            // world.x=floor.x=width/2;
            // world.y=floor.y=100;
            stage.addChild(world);
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    var tile=new DrawnIsoTile(20,"#cccccc");
                    tile.position=new Point3D(i*20,0,j*20);
                    world.addChildToFloor(tile);
                }
                
            }
            world.addEventListener("mousedown",(e)=>{
                let box=new DrawnIsoBox(20,utils.parseColor(Math.random()*0xffffff,false),20);
                let pos=IsoUtils.screenToIso(world.globalToLocal(stage.mouseX,stage.mouseY));
                pos.x=Math.round(pos.x/20)*20;
                pos.y=Math.round(pos.y/20)*20;
                pos.z=Math.round(pos.z/20)*20;
                box.position=pos;
                world.addChildToWorld(box);
            });
        }
        runGame() {

        }

    }
    window.TileTest = TileTest;
})();