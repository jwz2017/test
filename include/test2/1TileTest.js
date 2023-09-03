import { DrawnIsoBox, DrawnIsoTile, IsoUtils, Point3D } from "../../classes/3DClass.js";
import { GridsMapGame } from "../../classes/GridsMapGame.js";
import { stage } from "../../classes/gframe.js";
import { mc } from "../../classes/mc.js";

export class TileTest extends GridsMapGame {
    constructor() {
        super("TileTest");
    }
    waitComplete() {
        stage.addChild(this);
        this.container.x =stage.width / 2;
        this.y = 100;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                var tile = new DrawnIsoTile(20, "#cccccc");
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.addChildToFloor(tile);
            }

        }
        this.floor.addEventListener("mousedown", (e) => {
            let box = new DrawnIsoBox(20, mc.parseColor(Math.random() * 0xffffff, false), 20);
            let pos = IsoUtils.screenToIso(this.world.globalToLocal(stage.mouseX, stage.mouseY));
            pos.x = Math.round(pos.x / 20) * 20;
            pos.y = Math.round(pos.y / 20) * 20;
            pos.z = Math.round(pos.z / 20) * 20;
            box.position = pos;
            this.addChildToWorld(box);
        });
    }
    runGame() {

    }

}