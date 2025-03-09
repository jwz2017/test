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
        for (let i = 0; i < numCols; i++) {
            this.nodes[i] = [];
            for (let j = 0; j < numRows; j++) {
                let n = this.nodes[i][j] = new Node(i, j);
                n.type = Node.WALKABLE;
            }
        }
        astar = new AStar(this, this.nodes, step)
        astar.setStartNode(0, 2);
        astar.setEndNode(26, 28);
        astar.drawGrid();
        this.addEventListener("click", (e) => {
            let xpos = Math.floor(e.localX / step);
            let ypos = Math.floor(e.localY / step);
            let t = this.getNode(xpos, ypos).type == Node.WALKABLE ? Node.NOWALKABLE : Node.WALKABLE;
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