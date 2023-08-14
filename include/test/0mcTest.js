import { gframe,stage } from "../../classes/gframe.js";
import { mc,PushButton,CheckBox,RadioButton,Slider,ScrollContainer } from "../../classes/mc.js";
export class Mctest extends gframe.Game {
    constructor() {
        super("mc组件测试");
        this.instructionScreen.text = "游戏介绍";
    }
    waitComplete() {
        super.waitComplete();
        /**
        * 颜色parseColor
        */
        console.log(mc.parseColor(0xffffff, true));//转换为数字
        console.log(mc.parseColor("#ffffff", true));//转换为数字

        console.log(mc.parseColor(0xffffff));//转换为string
        //B:randomColor随机颜色
        console.log(mc.randomColor());
        
        /**
         * drawPoints绘制图形
         */
        this.shape = new createjs.Shape();
        this.shape.graphics.beginFill("#333");
        //先平移再旋转
        var mat = new createjs.Matrix2D().translate(400, 200).rotate(90);
        var points = [
            [0, -25],
            [25, 25],
            [-25, 25],
            [0, -25]
        ];
        mc.drawPoints(this.shape.graphics, mat, points);
        //D:Array随机排序
        mc.randomArray(points);
        stage.addChild(this.shape);

        // ----------------mc.style.darkStyle();//黑色主题------------------------
        this.scorecontainer = new ScrollContainer(stage, 0, 0, 600, 750, 800, 1400);
        //Rect RoundRect Circle Star Arrow
        this.button = new PushButton(this.scorecontainer, "ok", null, 50, 50);
        this.button1 = new PushButton(this.scorecontainer, "ok", null, 50, 100, 200, 40, new mc.RoundRect(20));
        this.button2 = new PushButton(this.scorecontainer, "ok", null, 50, 150, 60, 60, new mc.Circle());
        this.button3 = new PushButton(this.scorecontainer, "ok", null, 100, 200, 80, 80, new mc.Star(6, 2.5, 30));
        this.button4 = new PushButton(this.scorecontainer, "ok", null, 200, 200, 80, 40, new mc.Ellipse());
        this.button5 = new PushButton(this.scorecontainer, "ok1", null, 650, 300, 80, 80, new mc.Arrow(45));
        mc.style.fontSize = 24;
        this.checkbox = new CheckBox(this.scorecontainer, "黑色", () => {
            console.log(this.checkbox.selected);
        }, false, 50, 700, 40, 40, new mc.Circle);
        this.checkbox1 = new CheckBox(this.scorecontainer, "黑色", () => {
            console.log(this.checkbox1.selected);
        }, false, 50, 750, 40, 40, new mc.Rect);
        this.checkbox2 = new CheckBox(this.scorecontainer, "黑色", () => {
            console.log(this.checkbox2.selected);
        }, false, 50, 800, 40, 40, new mc.Star);
        //RadioButton单选框  Rect RoundRect Circle Star
        var radiobutton1 = new RadioButton(this.scorecontainer, "白色", handle, true, 450, 800, 40, 40);
        var radiobutton2 = new RadioButton(this.scorecontainer, "蓝色", handle, false, 450, 850, 40, 40);
        var radiobutton3 = new RadioButton(this.scorecontainer, "红色", handle, false, 450, 900, 40, 40);

        function handle() {
            switch (RadioButton.selectedButton) {
                case radiobutton1:
                    console.log("白色");

                    break;
                case radiobutton2:
                    console.log("蓝色");
                    break;
                case radiobutton3:
                    console.log("红色");
                    break;

                default:
                    break;
            }
        }
        //slider  Rect RoundRect
        this.slider = new Slider(this.scorecontainer, "分数", () => {
            console.log(this.slider.value);
        }, 50, 1000, 230, 24, new mc.Rect, true);
        this.slider1 = new Slider(this.scorecontainer, "分数", () => {
            console.log(this.slider1.value);
        }, 200, 1000, 230, 24, new mc.RoundRect(12), false);
    }
}