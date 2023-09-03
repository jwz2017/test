import { DrawnIsoBox, DrawnIsoTile, Point3D } from "../../classes/3DClass.js";
import { GridsMapGame } from "../../classes/GridsMapGame.js";
import { pressed, stage } from "../../classes/gframe.js";

var world, box, speed = 4;
export class Collision extends GridsMapGame {
    constructor() {
        super("碰撞测试");
        this.keyboard=true;
    }
    waitComplete() {
        stage.addChild(this);
        this.container.x =stage.width / 2;
        this.y = 100;

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                const tile = new DrawnIsoTile(20, "#cccccc");
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.addChildToFloor(tile);
            }
        }
        box = new DrawnIsoBox(20, "#ff0000", 20);
        box.xpos = 200;
        box.zpos = 200;
        this.addChildToWorld(box);

        let newBox = new DrawnIsoBox(20, "#ccffcc", 20);
        newBox.xpos = 300;
        newBox.zpos = 300;
        this.addChildToWorld(newBox);


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
        if (!this.hitActor(box,rect)) {
            box.xpos += box.vx;
            box.ypos += box.vy;
            box.zpos += box.vz;
        }
        this.sortDepth(this.world);
    }

}