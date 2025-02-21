import { AStar } from "../../classes/Astar.js";
import { Node,Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";

var step = 20,numcols=30,numrows=30,shape,astar=new AStar();
export class AStarTest extends Game {
    //static loadItem = null;
    constructor() {
        super("AStarTest",numcols*step,numrows*step,step,step);
        this.x=stage.width-this.width>>1;
        this.y=stage.height-this.height>>1;
        shape = new createjs.Shape();
        this.addChild(shape);
        this.createGrid(numrows,numcols);

        this.setStartNode(0, 2);
        this.setEndNode(26, 28);
        this.drawGrid();
        this.addEventListener("click", (e) => {
            let xpos = Math.floor(e.localX / step);
            let ypos = Math.floor(e.localY / step);
            let t=this.getNode(xpos,ypos).type==Node.WALKABLE?Node.NOWALKABLE:Node.WALKABLE;
            this.setNodeType(xpos, ypos, t);
            this.drawGrid();
            this.findPath();
        });
    }
    drawGrid() {
        shape.graphics.clear();
        for (let i = 0; i < this.numCols; i++) {
            for (let j = 0; j < this.numRows; j++) {
                const node = this.getNode(i, j);
                shape.graphics.beginStroke("#000").beginFill(this.getColor(node)).drawRect(i * step, j * step, step, step);
            }
        }
    }
    getColor(node) {
        if (node.type!=Node.WALKABLE) return "#000";
        if (node == this.startNode) return "#666666";
        if (node == this.endNode) return "#666666";
        return "#ffffff";
    }
    findPath() {
        if (astar.findPath(this)) {
            this.showVisited(astar);
            this.showPath(astar);
        }
    }
    showVisited(astar) {
        let visited = astar.visited;
        for (let i = 0; i < visited.length; i++) {
            shape.graphics.beginFill("#cccccc").drawRect(visited[i].x * step, visited[i].y * step, step, step);
        }
    }
    showPath(astar) {
        let path = astar.path;
        for (let i = 0; i < path.length; i++) {
            shape.graphics.beginFill("#fff").drawCircle(path[i].x * step + step / 2, path[i].y * step + step / 2, step / 3);

        }
    }

}