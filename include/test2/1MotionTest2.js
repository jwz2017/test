import { DrawnIsoBox, DrawnIsoTile, Point3D } from "../../classes/3DClass.js";
import { Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";

var box, shadow, filter,
    gravity = 2, friction = 0.95, bounce = -0.9;
export class MotionTest2 extends Game {
    constructor() {
        super("移动测试2");
    }
    waitComplete() {
        this.container.x =stage.width / 2;
        this.y = 100;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                let tile = new DrawnIsoTile(20, "#cccccc");
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.addToFloor(tile);
            }
        }
        box = new DrawnIsoBox(20, "#ff0000", 20);
        box.xpos = 200;
        box.zpos = 200;
        this.addToPlayer(box);

        shadow = new DrawnIsoTile(20, 0);
        shadow.alpha = .5;
        this.addToFloor(shadow);

        filter = new createjs.BlurFilter();
        this.floorLayer.addEventListener("mousedown", () => {
            box.vx = Math.random() * 20 - 10;
            box.vy = -Math.random() * 40;
            box.vz = Math.random() * 20 - 10;
        });
    }
    runGame() {
        box.vy += 2;
        box.xpos += box.vx;
        box.ypos += box.vy;
        box.zpos += box.vz;
        if (box.xpos > 380) {
            box.xpos = 380;
            box.vz *= -.8;
        } else if (box.xpos < 0) {
            box.xpos = 0;
            box.vx *= bounce;
        }
        if (box.zpos > 380) {
            box.zpos = 380;
            box.vz *= bounce;
        } else if (box.zpos < 0) {
            box.zpos = 0;
            box.vz *= bounce;
        }
        if (box.ypos > 0) {
            box.ypos = 0;
            box.vy *= bounce;
        }
        box.vx *= friction;
        box.vz *= friction;
        box.vz *= friction;

        shadow.x = box.xpos;
        shadow.z = box.zpos;
        filter.blurX = filter.blurY = -box.y * .25;
        shadow.filters = [filter];
    }

}