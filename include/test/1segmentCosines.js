(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var segment0,segment1;
    class SegmentCosines extends Game {
        constructor() {
            super();
            this.titleScreen.setText("余弦定理");
        }
        waitComplete() {
            segment0=new Segment();
            segment0.setSize(100,20);
            segment1=new Segment();
            segment1.setSize(100,20);
            segment1.x=width/2;
            segment1.y=height/2;
            stage.addChild(segment0,segment1);
        }
        runGame() {
            let dx=stage.mouseX-segment1.x,
            dy=stage.mouseY-segment1.y,
            dist=Math.sqrt(dx*dx+dy*dy),
            a=100,
            b=100,
            c=Math.min(dist,a+b),
            B=Math.acos((b*b-a*a-c*c)/(-2*a*c)),
            C=Math.acos((c*c-a*a-b*b)/(-2*a*b)),
            D=Math.atan2(dy,dx);
            //正向
            if (dx<=0) {
                var E=D+B+Math.PI+C;
                segment1.rotation=(D+B)*180/Math.PI;
                //反向
            }else{
                var E=D-B+Math.PI-C;
                segment1.rotation=(D-B)*180/Math.PI;
            }
            segment0.x=segment1.getPin().x;
            segment0.y=segment1.getPin().y;
            segment0.rotation=E*180/Math.PI;
        }

    }
    SegmentCosines.loadItem = null;
    SegmentCosines.loaderbar=null;;
    window.SegmentCosines = SegmentCosines;
})();