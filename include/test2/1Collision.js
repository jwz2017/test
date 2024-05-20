import { DrawnIsoBox, DrawnIsoTile, Point3D } from "../../classes/3DClass.js";
import { Game } from "../../classes/Game.js";
import { pressed, stage } from "../../classes/gframe.js";

var box, speed = 4;
export class Collision extends Game {
    static codes = {
        65: "left",
        87: "up",
        68: "right",
        83: "down",
    }
    constructor() {
        super("碰撞测试");
    }
    waitComplete() {
        this.container.x =stage.width / 2;
        this.y = 100;

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                const tile = new DrawnIsoTile(20, "#cccccc");
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.addToFloor(tile);
            }
        }
        box = new DrawnIsoBox(20, "#ff0000", 20);
        box.xpos = 200;
        box.zpos = 200;
        this.addToPlayer(box);

        let newBox = new DrawnIsoBox(20, "#ccffcc", 20);
        newBox.xpos = 300;
        newBox.zpos = 300;
        this.addToPlayer(newBox);


    }
    runGame() {
        box.vx = 0;
        box.vz = 0;
        switch (pressed[pressed.length - 1]) {
            case "up":
                box.vx = -speed;
                break;
            case "down":
                box.vx = speed;
                break;
            case "left":
                box.vz = speed;
                break;
            case "right":
                box.vz = -speed;
                break;
        }
        let rect=box.rect.clone();
        rect.x+=box.vx;
        rect.y+=box.vz;
        if (!box.hitActors(this.playerChildren,rect)) {
            box.xpos += box.vx;
            box.ypos += box.vy;
            box.zpos += box.vz;
        }
        this.sortDepth(this.playerLayer);
    }

}