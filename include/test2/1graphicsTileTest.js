import { GraphicTile, IsoUtils, Point3D } from "../../classes/3DClass.js";
import { Game } from "../../classes/Game.js";
import { gframe, queue, stage } from "../../classes/gframe.js";

export class GraphicsTileTest extends Game {
    static loadItem = [{
        id: "tile_01",
        src: "images/tile_01.png"
    }, {
        id: "tile_02",
        src: "images/tile_02.png"
    }];
    constructor() {
        super("GraphicsTileTest");
        this.container.x = stage.width / 2;
        this.container.y=10;
    }
    waitComplete() {
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                let tile_01 = new createjs.Bitmap(queue.getResult("tile_01"));
                const tile = new GraphicTile(20, tile_01, 20, 10);
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.addToFloor(tile);
            }
        }
        this.floorLayer.addEventListener("click", () => {
            let box = new GraphicTile(20, new createjs.Bitmap(queue.getResult("tile_02")), 20, 30);
            let pos = IsoUtils.screenToIso(this.playerLayer.globalToLocal(stage.mouseX, stage.mouseY));
            pos.x = Math.round(pos.x / 20) * 20;
            pos.y = Math.round(pos.y / 20) * 20;
            pos.z = Math.round(pos.z / 20) * 20;
            box.position = pos;
            this.addToPlayer(box);
            this.sortDepth(this.playerLayer);
        });
    }
}