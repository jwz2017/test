import { Node } from "./Game.js";

/**
 * astar寻路
 */
export class AStar {
  constructor(shapeParent, nodes, step) {
    // this._heuristic=this._manhattan;
    // this._heuristic=this._euclidian;
    this._heuristic = this._diagonal;
    this._straightCost = 1;
    this._diagCost = Math.SQRT2;
    this.nodes = nodes;
    this.numCols = this.nodes.length;
    this.numRows = this.nodes[0].length;
    this.step = step;
    this._shape = new createjs.Shape();
    if (shapeParent) {
      shapeParent.addChild(this._shape);
      this._shape.cache(0,0,this.numCols*step,this.numRows*step)
    }
  }
  setEndNode(x, y) {
    this._endNode = this.nodes[x][y];
  }
  setStartNode(x, y) {
    this._startNode = this.nodes[x][y];
  }
  get endNode() {
    return this._endNode;
  }
  get startNode() {
    return this._startNode;
  }
  drawGrid() {
    this._shape.graphics.clear();
    for (let i = 0; i < this.numCols; i++) {
      for (let j = 0; j < this.numRows; j++) {
        const node = this.nodes[i][j];
        this._shape.graphics.beginStroke("#000").beginFill(this._getColor(node)).drawRect(i * this.step, j * this.step, this.step, this.step).endFill();
      }
    }
    this._shape.updateCache()
  }
  /**
   * 寻路方法
   * @param {Grid} grid 
   * @returns Boolean
   */
  findPath() {
    this._open = [];
    this._closed = [];
    this._startNode.g = 0;
    this._startNode.h = this._heuristic(this._startNode);
    this._startNode.f = this._startNode.g + this._startNode.h;
    return this._search();
  }
  showVisited() {
    for (let i = 1; i < this.visited.length; i++) {
      this._shape.graphics.beginFill("#cccccc").drawRect(this.visited[i].x * this.step, this.visited[i].y * this.step, this.step, this.step).closePath();
    }
    this._shape.updateCache()
  }
  showPath() {
    for (let i = 0; i < this.path.length; i++) {
      this._shape.graphics.beginFill("#fff").drawCircle(this.path[i].x * this.step + this.step / 2, this.path[i].y * this.step + this.step / 2, this.step / 3).closePath();
    }
    this._shape.updateCache();
  }

  _getColor(node) {
    if (node.type == Node.NOWALKABLE) return "#000";
    else if (node == this._startNode) return "#666666";
    else if (node == this._endNode) return "#666666";
    else return "#ffffff";
  }
  //计算出最佳路径
  _search() {
    let node = this._startNode;
    while (node != this._endNode) {
      let startX = Math.max(0, node.x - 1);
      let endX = Math.min(this.numCols - 1, node.x + 1);
      let startY = Math.max(0, node.y - 1);
      let endY = Math.min(this.numRows - 1, node.y + 1);
      for (let i = startX; i <= endX; i++) {
        for (let j = startY; j <= endY; j++) {
          let test = this.nodes[i][j];
          if (test === node || test.type == Node.NOWALKABLE || this.nodes[node.x][test.y].type == Node.NOWALKABLE || this.nodes[test.x][node.y].type == Node.NOWALKABLE) {
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