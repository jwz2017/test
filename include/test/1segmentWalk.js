(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var segment0,segment1,segment2,segment3,
    speedSlider,thighRangeSlider,thighBaseSlider,
    calfRangeSlider,calfOffsetSlider,
    cycle=0;
    class SegmentWalk extends Game {
        constructor() {
            super();
            this.titleScreen.setText("关节行走");
            
        }
        waitComplete() {
            segment0=new Segment();
            segment0.setSize(100,30);
            segment0.x=400;
            segment0.y=100;
            segment1=new Segment();
            segment1.setSize(100,20);
            segment1.x=segment0.getPin().x;
            segment1.y=segment0.getPin().y;
            segment2=new Segment();
            segment2.setSize(100,30);
            segment2.x=400;
            segment2.y=100;
            segment3=new Segment();
            segment3.setSize(100,20);
            segment3.x=segment2.getPin().x;
            segment3.y=segment2.getPin().y;
            stage.addChild(segment0,segment1,segment2,segment3);

            mc.style.fontSize=12;
            speedSlider=new Slider(stage,"speed",null,10,25,200,15);
            speedSlider.setMmum(0.3,0);
            speedSlider.value=0.12;
            thighRangeSlider=new Slider(stage,"tRange",null,50,25,200,15);
            thighRangeSlider.setMmum(90,0);
            thighRangeSlider.value=45;
            thighBaseSlider=new Slider(stage,"tBase",null,90,25,200,15);
            thighBaseSlider.setMmum(180,0);
            thighBaseSlider.value=90;
            calfRangeSlider=new Slider(stage,"cRange",null,130,25,200,15);
            calfRangeSlider.setMmum(90,0);
            calfRangeSlider.value=45;
            calfOffsetSlider=new Slider(stage,"cOff",null,170,25,200,15);
            calfOffsetSlider.setMmum(3.14,-3.14);
            calfOffsetSlider.value=-1.57;
        }
        runGame() {
            this.walk(segment0,segment1,cycle);
            this.walk(segment2,segment3,cycle+Math.PI);
            cycle+=speedSlider.value;
        }
        walk(segA,segB,cyc){
            let angleA=Math.sin(cyc)*thighRangeSlider.value+thighBaseSlider.value;
            let angleB=Math.sin(cyc+calfOffsetSlider.value)*calfRangeSlider.value+calfRangeSlider.value;
            segA.rotation=angleA;
            segB.rotation=segA.rotation+angleB;
            segB.x=segA.getPin().x;
            segB.y=segA.getPin().y;
        }

    }
    SegmentWalk.loadItem = null;
    SegmentWalk.loaderbar=null;;
    window.SegmentWalk = SegmentWalk;
})();