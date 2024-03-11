import { Node } from "./Node.js";
/**
 * astar寻路
 */
export class AStar {
    constructor() {
      // this._heuristic=this._manhattan;
      // this._heuristic=this._euclidian;
      this._heuristic = this._diagonal;
      this._straightCost = 1;
      this._diagCost = Math.SQRT2;
    }
    /**
     * 寻路方法
     * @param {Grid} grid 
     * @returns Boolean
     */
    findPath(grid) {
      this._grid = grid;
      this._open = [];
      this._closed = [];
      this._startNode = this._grid.startNode;
      this._endNode = this._grid.endNode;
      this._startNode.g = 0;
      this._startNode.h = this._heuristic(this._startNode);
      this._startNode.f = this._startNode.g + this._startNode.h;
      return this.search();
    }
    //计算出最佳路径
    search() {
      let node = this._startNode;
      while (node != this._endNode) {
        let startX = Math.max(0, node.x - 1);
        let endX = Math.min(this._grid.numCols - 1, node.x + 1);
        let startY = Math.max(0, node.y - 1);
        let endY = Math.min(this._grid.numRows - 1, node.y + 1);
        for (let i = startX; i <= endX; i++) {
          for (let j = startY; j <= endY; j++) {
            let test = this._grid.getNode(i, j);
            if (test === node || test.type !=Node.WALKABLE || this._grid.getNode(node.x, test.y).type != Node.WALKABLE || this._grid.getNode(test.x, node.y).type != Node.WALKABLE) {
              continue;
            }
            let cost = this._straightCost;
            if (!((node.x == test.x) || (node.y == test.y))) {
              cost = this._diagCost;
            }
            let g = node.g + cost * test.costMultiplier;
            let h = this._heuristic(test);
            let f = g + h;
            if (this._open.includes(test) || this._closed.includes(test)) {
              if (test.f > f) {
                test.f = f;
                test.g = g;
                test.h = h;
                test.parent = node;
              }
            } else {
              test.f = f;
              test.g = g;
              test.h = h;
              test.parent = node;
              this._open.push(test);
            }
          }
        }
        this._closed.push(node);
        if (this._open.length === 0) {
          console.log("no path found");
          return false;
        }
        this._open.sort((a, b) => {
          return a.f - b.f;
        })
        node = this._open.shift();
      }
      this._buildPath();
      return true;
    }
    _buildPath() {
      this._path = [];
      let node = this._endNode;
      this._path.push(node);
      while (node != this._startNode) {
        node = node.parent;
        this._path.unshift(node);
      }
    }
    _manhattan(node) {
      return Math.abs(node.x - this._endNode.x) * this._straightCost + Math.abs(node.y + this._endNode.y) * this._straightCost;
    }
    _euclidian(node) {
      let dx = node.x - this._endNode.x;
      let dy = node.y - this._endNode.y;
      return Math.sqrt(dx * dx + dy * dy) * this._straightCost;
    }
    _diagonal(node) {
      let dx = Math.abs(node.x - this._endNode.x);
      let dy = Math.abs(node.y - this._endNode.y);
      let diag = Math.min(dx, dy);
      let straight = dx + dy;
      return this._diagCost * diag + this._straightCost * (straight - 2 * diag);
    }
    get visited() {
      return this._closed.concat(this._open);
    }
    get path() {
      return this._path;
    }
  }