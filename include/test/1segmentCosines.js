import { Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";
import { Segment } from "../../classes/shape.js";

var segment0, segment1;
export class SegmentCosines extends Game {
    constructor() {
        super("余弦定理");
        segment0 = new Segment(0,0,100,20);
        segment1 = new Segment(0,0,100,20);
        segment1.x = stage.width / 2;
        segment1.y = stage.height / 2;
        stage.addChild(segment0, segment1);
    }
    runGame() {
        let dx = stage.mouseX - segment1.x,
            dy = stage.mouseY - segment1.y,
            dist = Math.sqrt(dx * dx + dy * dy),
            a = 100,
            b = 100,
            c = Math.min(dist, a + b),
            B = Math.acos((b * b - a * a - c * c) / (-2 * a * c)),
            C = Math.acos((c * c - a * a - b * b) / (-2 * a * b)),
            D = Math.atan2(dy, dx);
        //正向
        if (dx <= 0) {
            var E = D + B + Math.PI + C;
            segment1.rotation = (D + B) * 180 / Math.PI;
            //反向
        } else {
            var E = D - B + Math.PI - C;
            segment1.rotation = (D - B) * 180 / Math.PI;
        }
        segment0.x = segment1.getPin().x;
        segment0.y = segment1.getPin().y;
        segment0.rotation = E * 180 / Math.PI;
    }

}