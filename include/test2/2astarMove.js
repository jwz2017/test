(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var player,
    numCols=30,
    numRows=30,
    step=20,
    path=[],
    index=0,
    grid,
    shape;
    class AstarMove extends Game {
    //static loadItem = null;
    //static loadId = null;
        constructor() {
            super("AstarMove");
            
        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        init() {
            shape=new createjs.Shape();
            grid=new GridsMap(75,75,750,height,step,step,numCols,numRows);
            grid.addChild(shape);
            

        }
        drawGrid(){
            shape.graphics.clear();
            for (let i = 0; i < numCols; i++) {
                for (let j = 0; j < numRows; j++) {
                    const node=grid.getNode(i,j);
                    shape.graphics.beginFill(this.getColor(node)).drawRect(i*step,j*step,step,step);
                }
                
            }
        }
        getColor(node){
            if(!node.walkable) return "#000";
            if(node==grid.startNode) return "#cccccc";
            if(node==grid.endNode) return "#cccccc";
            return "#ffffff";
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
            // makePlayer
            player=new CirActor(Math.random()*numCols*step,Math.random()*numRows*step);
            player.color="#ff0000"
            player.init(15,15);
            player.speed.length=2;
            grid.addChild(player);
            //makeGrid
            for (let i = 0; i < 200; i++) {
                grid.setWalkable(Math.floor(Math.random()*numCols),Math.floor(Math.random()*numRows),false);
                this.drawGrid();
            }

            grid.addEventListener("click",(e)=>{
                let xpos=Math.floor(e.localX/step);
                let ypos=Math.floor(e.localY/step);
                grid.setEndNode(xpos,ypos);
                xpos=Math.floor(player.x/step);
                ypos=Math.floor(player.y/step);
                grid.setStartNode(xpos,ypos);
                this.drawGrid();
                this.findPath();
            });
        }
        findPath(){
            let astar=new AStar();
            if (astar.findPath(grid)) {
                path=astar.path;
                index=0;
            }
        }
        waitComplete() {
            stage.addChild(this.scoreBoard,grid);
            
        }
        runGame() {
            if (index<path.length) {
                let targetX=path[index].x*step+step/2;
                let targetY=path[index].y*step+step/2;
                let dx=targetX-player.x;
                let dy=targetY-player.y;
                player.speed.angle=Math.atan2(dy,dx);
                let dist=Math.sqrt(dx*dx+dy*dy);
                if (dist<1) {
                    index++
                }else{
                    // player.x+=dx*.5;
                    // player.y+=dy*.5;
                    player.act();
                }
                
            }
        }
        clear() {
            
        }

    }
    window.AstarMove = AstarMove;
})();