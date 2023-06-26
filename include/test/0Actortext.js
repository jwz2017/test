
(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    
    class ActorTest extends Game {
    //static loadItem = null;
    //static loadId = null;
        constructor() {
            super("ActorTest");
        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        init() {
            this.rect1=new Actor(300,400);
            this.rect1.init(200,80);
            this.rect2=new Actor(500,100);
            this.rect2.init(200,50);

            // stage.on("stagemousemove",(e)=>{
            stage.on("stagemousemove",(e)=>{
                this.rect2.x=e.stageX;
                this.rect2.y=e.stageY;
                this.rect2.updatePos();
            })
        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard();
            this.scoreBoard.createTextElement(SCORE, '0', 20, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 14);
        }
        newGame() {
            score=0;
            this.scoreBoard.update(SCORE,score);

        }
        newLevel() {
            this.scoreBoard.update(LEVEL, this.level);
            
        }
        waitComplete() {
            let a=new Actor();
            a.init(100,100);
            a.setSize(0.8,0.5)
            a.setReg(-50,-80);
            stage.addChild(this.scoreBoard,a,this.rect1,this.rect2);

            
        }
        runGame() {
            //测试矩形碰撞
            if (this.rect1.hitRect(this.rect2)) {
                this.rect1.color="#f00";
            }else{
                this.rect1.color="#555";
            }
            //测试hittest
            let p=this.rect2.globalToLocal(this.rect1.pos.x,this.rect1.pos.y)
            if (this.rect2.hitTest(p.x,p.y)) {
                this.rect2.color="#0f0";
            }else{
                this.rect2.color="#555"
            }
            this.rect1.drawShape(this.rect1.size.x,this.rect1.size.y);
            this.rect2.drawShape(this.rect2.size.x,this.rect2.size.y);
        }
        clear() {
            
        }

    }
    window.ActorTest = ActorTest;
})();