import { DrawnIsoBox, DrawnIsoTile, IsoWorld, Point3D } from "../../classes/3DClass.js";
import { gframe, pressed, stage } from "../../classes/gframe.js";

var world, box,speed = 5;
export class MotionTest extends gframe.Game {
    constructor() {
        super("移动测试");
        gframe.keyboard=true;
    }
    waitComplete() {
        world = new IsoWorld();
        world.x =stage.width / 2;
        world.y = 100;
        stage.addChild(world);

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                let tile = new DrawnIsoTile(20, "#cccccc");
                tile.position = new Point3D(i * 20, 0, j * 20);
                world.addChildToFloor(tile);
            }
        }
        box = new DrawnIsoBox(20, "#ff0000", 20);
        box.xpos = 200;
        box.zpos = 200;
        world.addChildToWorld(box);
    }
    runGame() {
        box.vx = 0;
        box.vz = 0;
        switch (pressed[pressed.length - 1]) {
            case "up":
                box.vx = -speed
                break;
            case "down":
                box.vx = speed
                break;
            case "right":
                box.vz = -speed
                break;
            case "left":
                box.vz = speed
                break;
        }
        box.xpos += box.vx;
        box.ypos += box.vy;
        box.zpos += box.vz;
    }

}