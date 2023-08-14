import { DrawnIsoBox, DrawnIsoTile, GraphicTile } from "../../classes/3DClass.js";
import { GridsMapGame } from "../../classes/GridsMapGame.js";
import { gframe, queue, stage } from "../../classes/gframe.js";
import { mc } from "../../classes/mc.js";

var size = 20,
    plan = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 1, 0, 3, 2, 2, 3, 0, 0, 0, 0],
        [0, 1, 0, 3, 2, 2, 3, 0, 0, 0, 0],
        [0, 1, 0, 3, 3, 3, 3, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
export class MapTest extends GridsMapGame {
    static loadItem = [{
        id: "tile_01",
        src: "images/tile_01.png"
    }, {
        id: "tile_02",
        src: "images/tile_02.png"
    }];
    constructor() {
        super("MapTest", 750, 350, size, size);
        this.y = 100;
    }
    waitComplete(){
        stage.addChild(this);
    }
    newLevel() {
        this.createGridMap(plan, {}, (ch, node) => {
            let a;
            if (ch == "0") {
                a = new GraphicTile(size, new createjs.Bitmap(queue.getResult("tile_01")), size, size / 2);
            } else if (ch == "1") {
                node.walkable = false;
                a = new GraphicTile(size, new createjs.Bitmap(queue.getResult("tile_02")), size, size * 1.5);
            } else if (ch == "3") {
                a = new DrawnIsoTile(size, "#cccccc");
            } else if (ch == "2") {
                node.walkable = false;
                a = new DrawnIsoBox(size, mc.parseColor(Math.random() * 0xffffff, false), size);
            }
            a.xpos = node.x * size;
            a.zpos = node.y * size;
            this.addChildToFloor(a);
        }, true)
    }

}