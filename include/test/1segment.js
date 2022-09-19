(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var segment0,segment1,slider0,slider1,cycle=0;
    class SingleSegment extends Game {
        constructor() {
            super();
            this.titleScreen.setText("关节运动");
        }
        waitComplete() {
            segment0=new Segment(200,150);
            segment0.setSize(100,20);
            segment1=new Segment();
            segment1.setSize(100,20);
            segment1.x=segment0.getPin().x;
            segment1.y=segment0.getPin().y;
            stage.addChild(segment0,segment1);
            //slider
            mc.style.fontSize=18;
            slider0=new Slider(stage,"rot0",this.change,500,100,120,20);
            slider0.setMmum(360,0);
            slider1=new Slider(stage,"rot1",this.change,550,100,120,20)
            slider1.setMmum(0,-160);
        }
        runGame() {
            //行走
            // cycle+=.05;
            // var angle0=Math.sin(cycle)*45+90;
            // var angle1=Math.sin(cycle)*45+45;
            // segment0.rotation=angle0;
            // segment1.rotation=segment0.rotation+angle1;
            // segment1.x=segment0.getPin().x;
            // segment1.y=segment0.getPin().y;
        }
        change(){
            //测试
            segment0.rotation=slider0.value;
            segment1.rotation=segment0.rotation+slider1.value;
            segment1.x=segment0.getPin().x;
            segment1.y=segment0.getPin().y;
        }

    }
    SingleSegment.loadItem = null;
    SingleSegment.loaderbar=null;;
    window.SingleSegment = SingleSegment;
})();

