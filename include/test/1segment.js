import { gframe, stage } from "../../classes/gframe.js";
import { Slider, mc } from "../../classes/mc.js";
import { Segment } from "../../classes/shape.js";

var segment0, segment1, slider0, slider1;
export class SingleSegment extends gframe.Game {
    constructor() {
        super("关节运动");
    }
    waitComplete() {
        segment0 = new Segment(200, 150);
        segment0.init(100, 20);
        segment1 = new Segment();
        segment1.init(100, 20);
        segment1.x = segment0.getPin().x;
        segment1.y = segment0.getPin().y;
        stage.addChild(segment0, segment1);
        //slider
        mc.style.fontSize = 18;
        slider0 = new Slider(stage, "rot0", this.change, 500, 100, 120, 20);
        slider0.setMmum(360, 0);
        slider1 = new Slider(stage, "rot1", this.change, 550, 100, 120, 20)
        slider1.setMmum(0, -160);
    }
    change() {
        //测试
        segment0.rotation = slider0.value;
        segment1.rotation = segment0.rotation + slider1.value;
        segment1.x = segment0.getPin().x;
        segment1.y = segment0.getPin().y;
    }
}


