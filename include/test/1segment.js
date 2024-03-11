import { Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";
import { Slider, mc } from "../../classes/mc.js";
import { Segment } from "../../classes/shape.js";

var segment0, segment1, slider0, slider1;
export class SingleSegment extends Game {
    constructor() {
        super("关节运动");
    }
    waitComplete() {
        segment0 = new Segment(200, 150,100,20);
        let p=segment0.getPin();
        segment1 = new Segment(0,0,100,20);
        segment1.x=p.x;
        segment1.y=p.y;
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


