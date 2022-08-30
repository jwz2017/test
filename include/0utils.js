(function () {
    "use strict";
    //游戏变量;定义。。构造内初始化，new game初始化
    class Utils extends Game {
        constructor() {
            super();
            this.titleScreen.setText("工具类使用")
            this.instructionScreen.setText("1:颜色parseColor\r2:drawPoints绘制图形");
        }
        waitComplete() {
             /**
             * 颜色parseColor
             */
              console.log(utils.parseColor(0xffffff,true));//转换为数字
              console.log(utils.parseColor("#ffffff",true));//转换为数字
  
              console.log(utils.parseColor(0xffffff));//转换为string
              //B:randomColor随机颜色
              console.log(utils.randomColor());
  
              /**
               * drawPoints绘制图形
               */
              this.shape=new createjs.Shape();
              this.shape.graphics.beginFill("#333");
              //先平移再旋转
              var mat = new createjs.Matrix2D().translate(200, 200).rotate(180);
              var points = [
                  [0, -25],
                  [25, 25],
                  [-25, 25],
                  [0, -25]
              ];
              utils.drawPoints(this.shape.graphics, mat, points);
              //D:Array随机排序
              utils.randomArray(points);
            stage.addChild(this.shape);
        }
        runGame() {

        }
        clear() {
            super.clear();
        }

    }
    window.Utils = Utils;
})();