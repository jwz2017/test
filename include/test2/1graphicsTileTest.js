import { GraphicTile, IsoUtils, IsoWorld, Point3D } from "../../classes/3DClass.js";
import { gframe, queue, stage } from "../../classes/gframe.js";

export class GraphicsTileTest extends gframe.Game {
    static loadItem = [{
        id: "tile_01",
        src: "images/tile_01.png"
    }, {
        id: "tile_02",
        src: "images/tile_02.png"
    }];
    constructor() {
        super("GraphicsTileTest");
    }
    init() {
        this.world = new IsoWorld();
        this.world.x = stage.width / 2;
        this.world.y = 100;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                let tile_01 = new createjs.Bitmap(queue.getResult("tile_01"));
                const tile = new GraphicTile(20, tile_01, 20, 10);
                tile.position = new Point3D(i * 20, 0, j * 20);
                this.world.addChildToFloor(tile);
            }
        }
        this.world.addEventListener("click", () => {
            let box = new GraphicTile(20, new createjs.Bitmap(queue.getResult("tile_02")), 20, 30);
            let pos = IsoUtils.screenToIso(this.world.globalToLocal(stage.mouseX, stage.mouseY));
            pos.x = Math.round(pos.x / 20) * 20;
            pos.y = Math.round(pos.y / 20) * 20;
            pos.z = Math.round(pos.z / 20) * 20;
            box.position = pos;
            this.world.addChildToWorld(box);
        });
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0, 0, null);
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
    }
    waitComplete() {
        stage.addChild(this.world);
    }
}