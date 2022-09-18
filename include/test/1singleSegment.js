(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    
    class SingleSegment extends Game {
        constructor() {
            super();
            this.titleScreen.setText("SingleSegment");
        }
        waitComplete() {
            this.a=new Actor();
            this.a.setSize(50,100);
            this.a.setReg(25,50)
            this.a.setPos();
            stage.addChild(this.a);
            console.log(this.a.hit);
        }
        runGame() {

        }

    }
    SingleSegment.loadItem = null;
    SingleSegment.loaderbar=null;;
    window.SingleSegment = SingleSegment;

    class Bullet extends HitActor{
            constructor(xpos,ypos){
                super(xpos,ypos);
                
            }
    
        }
})();

