import { DrawnIsoBox, DrawnIsoTile, Point3D } from "../../classes/3DClass.js";
import { GridsMapGame } from "../../classes/GridsMapGame.js";
import { pressed, stage } from "../../classes/gframe.js";

var box,speed = 5;
export class MotionTest extends GridsMapGame {
    constructor() {
        super("移动测试");
        this.keyboard=true;
    }
    waitComplete() {
        stage.addChild(this);
        this.container.x =stage.width / 2;
        this.y = 100;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                let tile = new DrawnIsoTile(20, "#cccccc");
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.addChildToFloor(tile);
            }
        }
        box = new DrawnIsoBox(20, "#ff0000", 20);
        box.xpos = 100;
        box.zpos = 100;
        this.addChildToWorld(box);
    }
    runGame() {
        box.vx = 0;
        box.vz = 0;
        switch (pressed[pressed.length - 1]) {
            case "up":
                box.vz = -speed
                break;
            case "down":
                box.vz = speed
                break;
            case "right":
                box.vx = speed
                break;
            case "left":
                box.vx = -speed
                break;
        }
        box.xpos += box.vx;
        box.ypos += box.vy;
        box.zpos += box.vz;
    }

}