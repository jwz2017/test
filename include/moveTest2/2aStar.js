import { AStar } from "../../classes/Astar.js";
import { Node, Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";

var step = 20, numCols = 30, numRows = 30, astar;
export class AStarTest extends Game {
    //static loadItem = null;
    constructor() {
        super("AStarTest", numCols * step, numRows * step);
        this.x = stage.width - this.width >> 1;
        this.y = stage.height - this.height >> 1;
        this.createGrid(step);
        astar = new AStar(this, this.nodes, step)
        astar.setStartNode(0, 2);
        astar.setEndNode(26, 28);
        astar.drawGrid();
        this.addEventListener("click", (e) => {
            let xpos = Math.floor(e.localX / step);
            let ypos = Math.floor(e.localY / step);
            let t = this.getNode(xpos, ypos).type == 0? Node.NOWALKABLE : 0;
            this.setNodeType(xpos, ypos, t);
            astar.drawGrid();
            this.findPath();
        });
    }
    findPath() {
        if (astar.findPath()) {
            astar.showVisited();
            astar.showPath();
        }
    }
}