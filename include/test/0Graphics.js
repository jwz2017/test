import { stage,gframe } from "../../classes/gframe.js";
import { BarGraph,drawSmile} from "../../classes/shape.js";
export class Graphics extends gframe.Game {
    constructor() {
        super("绘画工具");
        this.instructionScreen.title.text = "1:画虚线\r2:画扇形\r3:画同心圆";
    }
    waitComplete() {
        super.waitComplete();
        var shape = stage.addChild(new createjs.Shape());
        //画条形图
        var data = [["a", 30], ["张芳", 32], ["c", 50], ["dd", 14], ["e", 44], ["c", 50], ["dd", 14], ["e", 44]];
        var barGraph = stage.addChild(new BarGraph(data,stage.width, 400));
        barGraph.y = 100;
        //画虚线
        this.comset = shape.graphics.setStrokeDash([9, 4]).command;
        shape.graphics.setStrokeStyle(2, 'round', 'round').beginStroke('#000').beginFill('#fc0').drawRect(10, 10, 100, 100);
        shape.graphics.setStrokeDash();
        //笑脸
        drawSmile(shape.graphics, 200, 60, 50);
        //
    }
    runGame() {
        this.comset.offset++;
    }
}