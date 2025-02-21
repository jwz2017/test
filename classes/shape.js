import { Actor, Vector } from "./actor.js";
//画个笑脸
function drawSmile(g, x, y, bounds) {
    //Head
    g.setStrokeStyle(Math.round(bounds / 10), 'round', 'round');
    g.beginStroke("#000");
    g.beginFill("#FC0");
    g.drawCircle(x, y, bounds); //55,53
    //Mouth
    g.beginFill(); // no fill
    g.arc(x, y, bounds / 1.5, 0, Math.PI);
    //Right eye
    g.beginStroke(); // no stroke
    g.beginFill("#000");
    g.drawCircle(x - bounds / 3, y - bounds / 3, bounds / 7);
    //Left eye
    g.drawCircle(x + bounds / 3, y - bounds / 3, bounds / 7);
};
//柱形图标
class BarGraph extends createjs.Container {
    constructor(barData,width, height=400) {
        super();
        this.width=width
        this.height = height;
        this.barValues = [];
        this.barName = [];
        barData.forEach(element => {
            this.barValues.push(element[1]);
            this.barName.push(element[0])
        });
        this.barPadding = 7
        this.bars = [];
        this.count = 0;
        this.init();
    }
    init() {
        var numBars = this.barValues.length;
        var max = Math.max(...this.barValues);
        var barWidth = (this.width - 150 - (numBars - 1) * this.barPadding) / numBars,
            barHeight = this.height - 150;

        var bg = new createjs.Shape();
        this.addChild(bg);
        // draw the "shelf" at the bottom of the graph:
        // note how the drawing instructions can be chained together.
        bg.graphics.beginStroke("#444850")
            .moveTo(40, this.height - 69.5)
            .lineTo(this.width - 70, this.height - 69.5)
            .endStroke()
            .beginFill("#22252B")
            .moveTo(this.width - 70, this.height - 70)
            .lineTo(this.width - 60, this.height - 80)
            .lineTo(50, this.height - 80)
            .lineTo(40, this.height - 70)
            .closePath();
        // draw the horizontal lines in the background:
        for (var i = 0; i < 9; i++) {
            bg.graphics.beginStroke(i % 2 ? "#333840" : "#444850")
                .moveTo(50, (this.height - 80 - i / 8 * barHeight | 0) + 0.5)
                .lineTo(this.width - 60, (this.height - 80 - i / 8 * barHeight | 0) + 0.5);
        }
        // add the graph title:
        var title = new createjs.Text("Quarterly Whatsits", "bold 24px Arial", "#FFF");
        title.textAlign = "center";
        title.x = this.width / 2;
        title.y = 20;
        this.addChild(title);
        // draw the bars:
        for (i = 0; i < numBars; i++) {
            // each bar is assembled in its own Container, to make them easier to work with:
            var bar = new createjs.Container();

            // this will determine the color of each bar, save as a property of the bar for use in drawBar:
            var hue = bar.hue = i / numBars * 360;

            // draw the front panel of the bar, this will be scaled to the right size in drawBar:
            var front = new createjs.Shape();
            front.graphics.beginLinearGradientFill(
                [createjs.Graphics.getHSL(hue, 100, 60, 0.9),
                createjs.Graphics.getHSL(hue, 100, 20, 0.75)
                ],
                [0, 1],
                0,
                -100,
                barWidth, 0).drawRect(0, -100, barWidth + 1,
                    100);
            // draw the top of the bar, this will be positioned vertically in drawBar:
            var top = new createjs.Shape();
            top.graphics.beginFill(createjs.Graphics.getHSL(hue, 100, 70, 0.9))
                .moveTo(10, -10)
                .lineTo(10 + barWidth, -10)
                .lineTo(barWidth, 0)
                .lineTo(0, 0)
                .closePath();

            // if this has the max value, we can draw the star into the top:
            if (this.barValues[i] == max) {
                top.graphics.beginFill("rgba(0,0,0,0.75)").drawPolyStar(barWidth / 2, 31, 7, 5, 0.6, -90).closePath();
            }

            // prepare the side of the bar, this will be drawn dynamically in drawBar:
            var right = new createjs.Shape();
            right.x = barWidth - 0.5;

            // create the label at the bottom of the bar:
            var label = new createjs.Text(this.barName[i], "bold 18px Arial", "#FFF");
            label.textAlign = "center";
            label.x = barWidth / 2;
            label.maxWidth = barWidth;
            label.y = 10;
            label.alpha = 0.75;

            // draw the tab that is placed under the label:
            var tab = new createjs.Shape();
            tab.graphics.beginFill(createjs.Graphics.getHSL(hue, 100, 20))
                .drawRoundRectComplex(0, 1, barWidth, 38, 0, 0, 10, 10);

            // create the value label that will be populated and positioned by drawBar:
            var value = new createjs.Text("foo", "bold 14px Arial", "#000");
            value.textAlign = "center";
            value.x = barWidth / 2;
            value.alpha = 0.75;

            // add all of the elements to the bar Container:
            bar.addChild(right, front, top, value, tab, label);
            // position the bar, and add it to the stage:
            bar.x = i * (barWidth + this.barPadding) + 60;
            bar.y = this.height - 70;

            this.addChild(bar);
            this.bars.push(bar);

            // draw the bar with an initial value of 0:
            this._drawBar(bar, 0, max, barHeight);
        }
        this.count = numBars * 10;
        var t = createjs.Ticker.on("tick", () => {
            // if we are on the last frame of animation then remove the tick listener:
            if (--this.count == 1) {
                createjs.Ticker.off("tick", t);
            }

            // animate the bars in one at a time:
            var c = this.bars.length * 10 - this.count;
            var index = c / 10 | 0;
            var bar = this.bars[index];
            this._drawBar(bar, (c % 10 + 1) / 10 * this.barValues[index], max, barHeight);
        });
    }
    _drawBar(bar, value, max, barHeight) {
        // calculate bar height:
        var h = value / max * barHeight;

        // update the value label:
        var val = bar.getChildAt(3);
        val.text = value | 0;
        val.visible = (h > 28);
        val.y = -h + 10;

        // scale the front panel, and position the top:
        bar.getChildAt(1).scaleY = h / 100;
        bar.getChildAt(2).y = -h + 0.5; // the 0.5 eliminates gaps from numerical precision issues.

        // redraw the side bar (we can't just scale it because of the angles):
        var right = bar.getChildAt(0);
        right.graphics.clear()
            .beginFill(createjs.Graphics.getHSL(bar.hue, 60, 15, 0.7))
            .moveTo(0, 0)
            .lineTo(0, -h)
            .lineTo(10, -h - 10)
            .lineTo(10, -10)
            .closePath();
    }
}
//关节
class Segment extends Actor {
    constructor(xpos, ypos,width,height) {
        super(xpos, ypos,width,height);
        this._color = "#ffffff";
        this.drawSpriteData(width,height);
    }
    drawShape(width, height) {
        this.image.graphics.clear().beginStroke("#000").beginFill(this.color).drawRoundRect(-height / 2, -height / 2, width, height, height / 2).endFill();
        this.image.setBounds(-height / 2, -height / 2, width, height);
        //绘制轴
        this.image.graphics.drawCircle(0, 0, 2).endStroke();
        this.image.graphics.beginStroke("#000").drawCircle(width - height, 0, 2);
    }
    getPin() {
        let ang = this.rotation * Math.PI / 180,
            dist = this.rect.width - this.rect.height,
            xpos = this.x + Math.cos(ang) * dist,
            ypos = this.y + Math.sin(ang) * dist;
        return new Vector(xpos, ypos);
    }
}
//树
class Tree extends createjs.Container {
    constructor(xpos, ypos) {
        super(xpos, ypos);
        this.pos = new Vector();
        this.pos.z = 0;
        this.pos.x = xpos;
        this.pos.y = ypos;
        this.drawShape();
    }
    drawShape() {
        this.image = new createjs.Shape();
        this.addChild(this.image);
        this.color = "#fff";
        let g = this.image.graphics,
            h = 140 + Math.random() * 20,
            w1 = Math.random() * 80 - 40,
            w2 = Math.random() * 60 - 30;
        g.clear().beginStroke(this.color).
            moveTo(0, 0).
            lineTo(0, -h).
            moveTo(0, -30 - Math.random() * 30).
            lineTo(w1, -100 - Math.random() * 40).
            moveTo(0, -60 - Math.random() * 40).
            lineTo(w2, -110 - Math.random() * 20);
        this.image.setBounds(Math.min(w1, w2), -h, Math.abs(w1) + Math.abs(w2), h);
        this.rect = this.getBounds();
        this.hit = Math.sqrt(this.rect.width * this.rect.width + this.rect.height * this.rect.height);
    }
}
export{drawSmile,BarGraph,Segment,Tree}
