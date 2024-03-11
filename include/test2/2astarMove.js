import { AStar } from "../../classes/Astar.js";
import { Game } from "../../classes/Game.js";
import { Node } from "../../classes/Node.js";
import { CirActor } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var player,numCols = 30,numRows = 30, step = 20,astar=new AStar(),
    path = [],index = 0,shape;
export class AstarMove extends Game {
    constructor() {
        super("AstarMove",numCols*step,numRows*step,step,step);
        this.x=stage.width-this.width>>1;
        this.y=stage.height-this.height>>1;
        shape = new createjs.Shape();
        this.addChild(shape);
        this.createGrid(numRows,numCols);
    }
    drawGrid() {
        shape.graphics.clear();
        for (let i = 0; i < numCols; i++) {
            for (let j = 0; j < numRows; j++) {
                const node = this.getNode(i, j);
                shape.graphics.beginFill(this.getColor(node)).drawRect(i * step, j * step, step, step);
            }

        }
    }
    getColor(node) {
        if (node.type!=Node.WALKABLE) return "#000";
        if (node == this.startNode) return "#cccccc";
        if (node == this.endNode) return "#cccccc";
        return "#ffffff";
    }
    newLevel() {
        // makePlayer
        player = new CirActor(Math.random() * numCols * step, Math.random() * numRows * step,8);
        player.color = "#ff0000"
        player.speed.length = 2;
        this.addChild(player);
        //makeGrid
        for (let i = 0; i < 200; i++) {
            this.setNodeType(Math.floor(Math.random() * numCols), Math.floor(Math.random() * numRows), Node.NOWALKABLE);
            this.drawGrid();
        }

        this.addEventListener("click", (e) => {
            let xpos = Math.floor(e.localX / step);
            let ypos = Math.floor(e.localY / step);
            this.setEndNode(xpos, ypos);
            xpos = Math.floor(player.x / step);
            ypos = Math.floor(player.y / step);
            this.setStartNode(xpos, ypos);
            this.drawGrid();
            this.findPath();
        });
    }
    findPath() {
        if (astar.findPath(this)) {
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
                // player.x+=dx*.5;
                // player.y+=dy*.5;
                player.act();
            }

        }
    }
}