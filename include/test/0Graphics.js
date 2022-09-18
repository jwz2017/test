(function () {
    "use strict";
    //游戏变量;
    class Graphics extends Game {
        constructor() {
            super();
            this.titleScreen.setText("绘画工具");
            this.instructionScreen.setText("1:画虚线\r2:画扇形\r3:画同心圆");
        }
        waitComplete() {
            var shape=stage.addChild(new createjs.Shape());
            //画条形图
            var data=[["a",30],["张芳",32],["c",50],["dd",14],["e",44],["c",50],["dd",14],["e",44]];
            var barGraph=stage.addChild(new BarGraph(data,400));
            barGraph.y=100;
            //画虚线
            this.comset=shape.graphics.setStrokeDash([9,4]).command;
            shape.graphics.setStrokeStyle(2,'round','round').beginStroke('#000').beginFill('#fc0').drawRect(10,10,100,100);
            shape.graphics.setStrokeDash();
            //笑脸
            DrawShape.drawSmile(shape.graphics,200,60,50);
            //
        }
        runGame() {
            this.comset.offset++;
        }
    }
    window.Graphics = Graphics;
})();