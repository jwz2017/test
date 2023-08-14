import { gframe, stage } from "../../classes/gframe.js";
import { Segment } from "../../classes/shape.js";

var segments, numSegments = 30;
export class SegmentDrag extends gframe.Game {
    constructor() {
        super("关节拖拽");
    }
    waitComplete() {
        segments = [];
        for (let i = 0; i < numSegments; i++) {
            const segment = new Segment();
            segment.init(50, 10);
            stage.addChild(segment);
            segments.push(segment);
        }
    }
    runGame() {
        this.drag(segments[0], stage.mouseX, stage.mouseY);
        for (let i = 1; i < numSegments; i++) {
            const segmentA = segments[i];
            const segmentB = segments[i - 1];
            this.drag(segmentA, segmentB.x, segmentB.y);
        }
    }
    drag(segment, xpos, ypos) {
        let dx = xpos - segment.x;
        let dy = ypos - segment.y;
        let angle = Math.atan2(dy, dx);
        segment.rotation = angle * 180 / Math.PI;
        let w = segment.getPin().x - segment.x;
        let h = segment.getPin().y - segment.y;
        segment.x = xpos - w;
        segment.y = ypos - h;
    }
}