import { AStar } from "../../classes/Astar.js";
import { Node, Game } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var player, numCols = 30, numRows = 30, step = 20, astar,
    path = [], index = 0;
export class AstarMove extends Game {
    static backgroundColor = "#555"
    constructor() {
        super("AstarMove", numCols * step, numRows * step, step, step);
        this.x = stage.width - this.width >> 1;
        this.y = stage.height - this.height >> 1;
        this.createGrid(step)
        astar = new AStar(this,this.nodes,step);
    }
    waitComplete() {
        // makePlayer
        player = new CirActor(Math.random() * numCols * step, Math.random() * numRows * step);
        player.drawSpriteData(16, "#ff0000")
        player.speed.length = 2;
        this.addChild(player);
        //makeGrid
        for (let i = 0; i < 200; i++) {
            this.setNodeType(Math.floor(Math.random() * numCols), Math.floor(Math.random() * numRows), Node.NOWALKABLE);
        }
        astar.drawGrid();

        this.addEventListener("click", (e) => {
            let xpos = Math.floor(e.localX / step);
            let ypos = Math.floor(e.localY / step);
            astar.setEndNode(xpos, ypos);
            xpos = Math.floor(player.x / step);
            ypos = Math.floor(player.y / step);
            astar.setStartNode(xpos, ypos);
            astar.drawGrid();
            this.findPath();
        });
    }
    findPath() {
        if (astar.findPath()) {
            path = astar.path;
            index = 0;
        }
    }
    runGame() {
        if (index < path.length) {
            let targetX = path[index].x * step + step / 2;
            let targetY = path[index].y * step + step / 2;
            let dx = targetX - player.x;
            let dy = targetY - player.y;
            player.speed.angle = Math.atan2(dy, dx);
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) {
                index++
            } else {
                player.act();
            }

        }
    }
}