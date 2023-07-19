(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var mapContainer,
    actorChars,
    size=20,
    plan=[
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,0,0,0,0,0],
        [0,1,0,3,3,3,3,0,0,0,0],
        [0,1,0,3,2,2,3,0,0,0,0],
        [0,1,0,3,2,2,3,0,0,0,0],
        [0,1,0,3,3,3,3,0,0,0,0],
        [0,1,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0]
    ];
    class MapTest extends Game {
    static loadItem = [{
        id:"tile_01",
        src:"images/tile_01.png"
    },{
        id:"tile_02",
        src:"images/tile_02.png"
    }];
        constructor() {
            super("MapTest");
            
        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        init() {
            mapContainer=new GridsMap(0,100,750,375,size,size);
            actorChars={

            };
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
            mapContainer.createGridMap(plan,actorChars,(ch,node)=>{
                let a;
                if(ch=="0"){
                    a=new GraphicTile(size,new createjs.Bitmap(queue.getResult("tile_01")),size,size/2);
                }else if(ch=="1"){
                    node.walkable=false;
                    a=new GraphicTile(size,new createjs.Bitmap(queue.getResult("tile_02")),size,size*1.5);
                }else if(ch=="3"){
                    a=new DrawnIsoTile(size,"#cccccc");
                }else if(ch=="2"){
                    node.walkable=false;
                    a=new DrawnIsoBox(size,GFrame.parseColor(Math.random()*0xffffff,false),size);
                }
                a.xpos=node.x*size;
                a.zpos=node.y*size;
                mapContainer.addChildToFloor(a);
            },true)
        }
        waitComplete() {
            stage.addChild(this.scoreBoard,mapContainer);
            console.log(mapContainer.contentSize);
        }
        runGame() {

        }
        clear() {
            
        }

    }
    window.MapTest = MapTest;

})();