import { IsoUtils, Point3D } from "../../classes/3DClass.js";
import { gframe, stage } from "../../classes/gframe.js";

export class isoTransformTest extends gframe.Game {
    constructor() {
        super("等角坐标转换测试");
    }
    waitComplete() {
        var p0 = new Point3D(0, 0, 0);
        var p1 = new Point3D(100, 0, 0);
        var p2 = new Point3D(100, 0, 100);
        var p3 = new Point3D(0, 0, 100);

        var sp0 = IsoUtils.isoToScreen(p0);
        var sp1 = IsoUtils.isoToScreen(p1);
        var sp2 = IsoUtils.isoToScreen(p2);
        var sp3 = IsoUtils.isoToScreen(p3);

        var tile = new createjs.Shape();
        tile.x = 200;
        tile.y = 200;
        stage.addChild(tile);

        tile.graphics.beginStroke("#000").
            moveTo(sp0.x, sp0.y).
            lineTo(sp1.x, sp1.y).
            lineTo(sp2.x, sp2.y).
            lineTo(sp3.x, sp3.y).
            lineTo(sp0.x, sp0.y);

    }
    runGame() {

    }

}