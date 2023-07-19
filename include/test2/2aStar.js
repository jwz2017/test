(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var step = 20,
        grid,
        shape;
        
    class AStarTest extends Game {
        //static loadItem = null;
        //static loadId = null;
        constructor() {
            super("AStarTest");

        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        init() {
            shape = new createjs.Shape;
            grid = new GridsMap(75, 75, 750, height, step, step, 30, 30);
        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard(0, 0, null);
            this.scoreBoard.createTextElement(SCORE, '0', 20, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 14);
        }
        newGame() {
            score = 0;
            this.scoreBoard.update(SCORE, score);

        }
        newLevel() {
            this.scoreBoard.update(LEVEL, this.level);
            this.drawGrid();
            grid.addChild(shape);
            grid.addEventListener("click", (e) => {
                let xpos=Math.floor(e.localX/step);
                let ypos=Math.floor(e.localY/step);
                grid.setWalkable(xpos,ypos,!grid.getNode(xpos,ypos).walkable);
                this.drawGrid();
                this.findPath();
            });
        }
        waitComplete() {
            stage.addChild(this.scoreBoard, grid);
            grid.setStartNode(0,2);
            grid.setEndNode(26,28);

        }
        runGame() {

        }
        clear() {

        }
        drawGrid() {
            shape.graphics.clear();
            for (let i = 0; i < grid.numCols; i++) {
                for (let j = 0; j < grid.numRows; j++) {
                    const node = grid.getNode(i, j);
                    shape.graphics.beginStroke("#000").beginFill(this.getColor(node)).drawRect(i * step, j * step, step, step);
                }
            }
        }
        getColor(node){
            if (!node.walkable) return "#000";
            if(node==grid.startNode) return "#666666";
            if(node==grid.endNode) return "#666666";
            return "#ffffff";
        }
        findPath(){
            let astar=new AStar();
            if (astar.findPath(grid)) {
                this.showVisited(astar);
                this.showPath(astar);
            }
        }
        showVisited(astar){
            let visited=astar.visited;
            for (let i = 0; i < visited.length; i++) {
                shape.graphics.beginFill("#cccccc").drawRect(visited[i].x*step,visited[i].y*step,step,step);
            }
        }
        showPath(astar){
            let path=astar.path;
            for (let i = 0; i < path.length; i++) {
                shape.graphics.setStrokeStyle(0).beginFill("#fff").drawCircle(path[i].x*step+step/2,path[i].y*step+step/2,step/3);
                
            }
        }

    }
    window.AStarTest = AStarTest;
})();