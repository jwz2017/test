(function () {
    "use strict";
    //游戏变量;
    var segment0,segment1,segment2,segment3,
    speedSlider,thighRangeSlider,thighBaseSlider,
    calfRangeSlider,calfOffsetSlider,gravitySlider,
    cycle=0,vx=0,vy=0;
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

            mc.style.fontSize=32;
            speedSlider=new Slider(stage,"speed",null,100,350,300,30);
            speedSlider.setMmum(0.3,0);
            speedSlider.value=0.12;
            thighRangeSlider=new Slider(stage,"tRange",null,200,350,300,30);
            thighRangeSlider.setMmum(90,0);
            thighRangeSlider.value=45;
            thighBaseSlider=new Slider(stage,"tBase",null,300,350,300,30);
            thighBaseSlider.setMmum(180,0);
            thighBaseSlider.value=90;
            calfRangeSlider=new Slider(stage,"cRange",null,400,350,300,30);
            calfRangeSlider.setMmum(90,0);
            calfRangeSlider.value=45;
            calfOffsetSlider=new Slider(stage,"cOff",null,500,350,300,30);
            calfOffsetSlider.setMmum(3.14,-3.14);
            calfOffsetSlider.value=-1.57;
            gravitySlider=new Slider(stage,"gravity",null,600,350,300,30);
            gravitySlider.setMmum(1,0);
            gravitySlider.value=0.2;
        }
        runGame() {
            this.doVelocity();
            this.walk(segment0,segment1,cycle);
            this.walk(segment2,segment3,cycle+Math.PI);
            cycle+=speedSlider.value;
            this.checkFloor(segment1);
            this.checkFloor(segment3);
            this.checkWalls();
        }
        walk(segA,segB,cyc){
            let foot=segB.getPin();
            let angleA=Math.sin(cyc)*thighRangeSlider.value+thighBaseSlider.value;
            let angleB=Math.sin(cyc+calfOffsetSlider.value)*calfRangeSlider.value+calfRangeSlider.value;
            segA.rotation=angleA;
            segB.rotation=segA.rotation+angleB;
            segB.x=segA.getPin().x;
            segB.y=segA.getPin().y;
            segB.vx=segB.getPin().x-foot.x;
            segB.vy=segB.getPin().y-foot.y;
        }
        doVelocity(){
            vy+=gravitySlider.value;
            segment0.x+=vx;
            segment0.y+=vy;
            segment2.x+=vx;
            segment2.y+=vy;
        }
        checkFloor(seg){
            let r=seg.getTransformedBounds();
            let yMax=r.y+r.height;
            if (yMax>300) {
                let dy=yMax-300;
                segment0.y-=dy;
                segment1.y-=dy;
                segment2.y-=dy;
                segment3.y-=dy;
                vx-=seg.vx;
                vy-=seg.vy;
            }
        }
        checkWalls(){
            let w=width+200;
            if (segment0.x>width+100) {
                segment0.x-=w;
                segment1.x-=w;
                segment2.x-=w;
                segment3.x-=w;
            }else if(segment0.x<-100){
                segment0.x+=w;
                segment1.x+=w;
                segment2.x+=w;
                segment3.x+=w;
            }
        }
    }
    window.SegmentWalk = SegmentWalk;
})();