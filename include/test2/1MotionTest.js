import { DrawnIsoBox, DrawnIsoTile, Point3D } from "../../classes/3DClass.js";
import { Game } from "../../classes/Game.js";
import { pressed, stage } from "../../classes/gframe.js";

var box, speed = 5;
export class MotionTest extends Game {
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
    }
    constructor() {
        super("移动测试");
    }
    waitComplete() {
        this.container.x = stage.width / 2;
        this.y = 100;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                let tile = new DrawnIsoTile(20, "#cccccc");
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.addToFloor(tile);
            }
        }
        box = new DrawnIsoBox(20, "#ff0000", 20);
        box.xpos = 100;
        box.zpos = 100;
        this.addToPlayer(box);
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