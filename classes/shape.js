var DrawShape = {
    //画个笑脸
    drawSmile: function (g, x, y, bounds) {
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
    },

}
//柱形图标
class BarGraph extends createjs.Container {
    constructor(barData, height) {
        super();
        this.height = height || 400;
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
        var barWidth = (width - 150 - (numBars - 1) * this.barPadding) / numBars,
            barHeight = this.height - 150;

        var bg = new createjs.Shape();
        this.addChild(bg);
        // draw the "shelf" at the bottom of the graph:
        // note how the drawing instructions can be chained together.
        bg.graphics.beginStroke("#444850")
            .moveTo(40, this.height - 69.5)
            .lineTo(width - 70, this.height - 69.5)
            .endStroke()
            .beginFill("#22252B")
            .moveTo(width - 70, this.height - 70)
            .lineTo(width - 60, this.height - 80)
            .lineTo(50, this.height - 80)
            .lineTo(40, this.height - 70)
            .closePath();
        // draw the horizontal lines in the background:
        for (var i = 0; i < 9; i++) {
            bg.graphics.beginStroke(i % 2 ? "#333840" : "#444850")
                .moveTo(50, (this.height - 80 - i / 8 * barHeight | 0) + 0.5)
                .lineTo(width - 60, (this.height - 80 - i / 8 * barHeight | 0) + 0.5);
        }
        // add the graph title:
        var title = new createjs.Text("Quarterly Whatsits", "bold 24px Arial", "#FFF");
        title.textAlign = "center";
        title.x = width / 2;
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
//ship飞机
class Ship extends Actor {
    constructor(pos) {
        super(pos);
        this.bounds = 15;
        this.MAX_VELOCITY = 3 / stepWidth;
        this.TOGGLE = 60;
        this.MAX_THRUST = 2;
        this.shipFlame = new createjs.Shape();
        this.addChild(this.shipFlame);
        this.timeout = 0;
        this.thrust = 0;
        this.setSize(this.bounds / stepWidth, this.bounds * 2 / stepHeight);
        this.regX = this.image.x;
        this.regY = this.image.y;
    }
    setPos() {
        this.x = this.pos.x * stepWidth + this.bounds / 2;
        this.y = this.pos.y * stepHeight + this.bounds;
    }
    drawShape() {
        let width = this.bounds;
        var g = this.image.graphics;
        g.clear();
        g.beginStroke("#ffffff");
        // g.drawCircle(0,0,this.bounds);
        g.moveTo(0, width); //nose
        g.lineTo(width / 2, -width / 1.6); //rfin
        g.lineTo(0, -width / 5); //notch
        g.lineTo(-width / 2, -width / 1.6); //lfin
        g.closePath(); // nose
        //draw ship flame
        var o = this.shipFlame;
        o.x = this.bounds / 2;
        o.y = this.bounds - this.bounds / 1.6;

        g = o.graphics;
        g.clear();
        g.beginStroke("#FFFFFF");

        g.moveTo(width / 5, 0); //ship
        g.lineTo(width / 2.5, -width / 3.3); //rpoint
        g.lineTo(width / 5, -width / 5); //rnotch
        g.lineTo(0, -width / 2); //tip
        g.lineTo(-width / 5, -width / 5); //lnotch
        g.lineTo(-width / 2.5, -width / 3.3); //lpoint
        g.lineTo(-width / 5, -0); //ship
    }
    act() {
        var newPos = this.pos.plus(this.speed);
        this.pos = newPos;
        if (this.thrust > 0) {
            this.timeout++;
            this.shipFlame.alpha = 1;
            if (this.timeout > this.TOGGLE) {
                this.timeout = 0;
                if (this.shipFlame.scaleX == 1) {
                    this.shipFlame.scale = 0.6;
                } else {
                    this.shipFlame.scale = 1;
                }
            }
            this.thrust -= 0.5;
        } else {
            this.shipFlame.alpha = 0;
            this.thrust = 0;
        }
        if (this.outOfBounds) {
            this.placeInBounds();
        }
        this.setPos();
    }
    accelerate() {
        this.thrust += 0.2;
        if (this.thrust >= this.MAX_THRUST) {
            this.thrust = this.MAX_THRUST;
        }
        this.speed.x += Math.sin(this.rotation * (Math.PI / -180)) * this.thrust / stepWidth;
        this.speed.y += Math.cos(this.rotation * (Math.PI / -180)) * this.thrust / stepWidth;

        this.speed.x = Math.min(this.MAX_VELOCITY, Math.max(-this.MAX_VELOCITY, this.speed.x));
        this.speed.y = Math.min(this.MAX_VELOCITY, Math.max(-this.MAX_VELOCITY, this.speed.y));
    }
}
//石头
class SpaceRock extends HitActor {
    constructor(pos, size = SpaceRock.LRG_ROCK/stepWidth) {
        super(pos);
        this.setSize(size, size);
        this.activate();
    }
    setPos() {
        this.x = this.pos.x * stepWidth + this.hit ;
        this.y = this.pos.y * stepHeight + this.hit;
    }
    drawShape() {
        this.hit = this.size.x/2*stepWidth;
        this.bounds = this.size.x*stepWidth;
        this.regX = this.hit;
        this.regY = this.hit;
        let angle = 0,
            size = this.bounds / 2,
            radius = this.bounds / 2;
        this.image.graphics.clear();
        this.image.graphics.beginStroke("#ffffff");
        this.image.graphics.moveTo(0, radius);
        //draw spacerock
        while (angle < (Math.PI * 2 - .5)) {
            angle += .25 + (Math.random() * 100) / 500;
            radius = size + (size / 2 * Math.random());
            this.image.graphics.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
            // if (radius > this.bounds) {
            //     this.bounds = radius;
            // }
            this.hit = (this.hit + radius) / 2;
        }
        this.image.graphics.closePath();
        this.hit *= 1.1;
        this.size.x = this.size.y = this.hit*2 / stepWidth;
        // this.image.graphics.drawRect(-this.hit , -this.hit, this.hit*2, this.hit*2);
    }
    activate() {
        let angle = Math.random() * (Math.PI * 2);
        this.speed.x = Math.sin(angle) * (4 - this.size.x*stepWidth / 2 / 15) / stepWidth;
        this.speed.y = Math.cos(angle) * (4 - this.size.x*stepHeight / 2 / 15) / stepHeight;
        this.spin = (Math.random() + 0.2) * this.speed.x;
        this.score = Math.floor((5 - this.size.x*stepWidth / 2 / 10) * 100);
        this.active = true;
    }
    floatOnScreen(width, height) {
        if (Math.random() * (width + height) > width) {
            if (this.speed.x > 0) {
                this.pos.x =-this.size.x;
            }else{
                this.pos.x=this.size.x+width;
            }
            if(this.speed.y>0){
                this.pos.y=Math.random()*height*0.5;
            }else{
                this.pos.y=Math.random()*height*0.5+0.5*height;
            }
        }else{
            if(this.speed.y>0){
                this.pos.y=-this.size.y;
            }else{
                this.pos.y=this.size.y+height;
            }
            if(this.speed.x>0){
                this.pos.x=Math.random()*width*0.5;
            }else{
                this.pos.x=Math.random()*width*0.5+0.5*width;
            }
        }
    }
    act(){
        this.rotation+=this.spin;
        this.pos=this.pos.plus(this.speed);
        if(this.outOfBounds()){
            this.placeInBounds();
        }
        this.setPos();
    }
}
SpaceRock.LRG_ROCK = 60;
SpaceRock.MED_ROCK = 40;
SpaceRock.SML_ROCK = 20;