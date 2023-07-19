(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    
    class GraphicsTileTest extends Game {
    static loadItem = [{
        id:"tile_01",
        src:"images/tile_01.png"
    },{
        id:"tile_02",
        src:"images/tile_02.png"
    }];
        constructor() {
            super("GraphicsTileTest");
            
        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        init() {
            this.world=new IsoWorld();
            this.world.x=width/2;
            this.world.y=100;
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    let tile_01=new createjs.Bitmap(queue.getResult("tile_01"));
                    const tile = new GraphicTile(20,tile_01,20,10);
                    tile.position=new Point3D(i*20,0,j*20);
                    this.world.addChildToFloor(tile);
                }
            }
            this.world.addEventListener("click",()=>{
                let box=new GraphicTile(20,new createjs.Bitmap(queue.getResult("tile_02")),20,30);
                let pos=IsoUtils.screenToIso(this.world.globalToLocal(stage.mouseX,stage.mouseY));
                pos.x=Math.round(pos.x/20)*20;
                pos.y=Math.round(pos.y/20)*20;
                pos.z=Math.round(pos.z/20)*20;
                box.position=pos;
                this.world.addChildToWorld(box);
            });
        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard(0,0,null);
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
            stage.addChild(this.scoreBoard,this.world);
            
        }
        runGame() {

        }
        clear() {
            
        }

    }
    window.GraphicsTileTest = GraphicsTileTest;
})();