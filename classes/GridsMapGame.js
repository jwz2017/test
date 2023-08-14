import { gframe } from "./gframe.js";
/**
 * *******网格游戏类 **************************************************
 */
class GridsMapGame extends gframe.Game {
  constructor(titleText,width,height, stepWidth, stepHeight, numCols = 0, numRows = 0) {
    super(titleText, width, height);
    this.stepWidth = stepWidth;
    this.stepHeight = stepHeight;
    this.width = width;
    this.height = height;
    this._floor = new createjs.Container();
    this._world = new createjs.Container();
    this.addChild(this._floor);
    this.addChild(this._world);
    this._numCols = numCols;
    this._numRows = numRows;
    this._nodes = [];
    this._mapleft = 0;
    this._maptop = 0;
    this._mapright = this.width;
    this._mapbottom = this.height;

    //a star
    this._startNode = null;
    this._endNode = null;
    if (this._numCols) {
      for (let i = 0; i < this._numCols; i++) {
        this._nodes[i] = [];
        for (let j = 0; j < this._numRows; j++) {
          this._nodes[i][j] = new Node(i, j);
        }
      }
    }
  }
  createGridMap(plan, actorChars, drawGrid, isIso = false) {
    this._floor.removeAllChildren();
    this._world.removeAllChildren();
    this._nodes = [];
    this._numCols = plan[0].length;
    this._numRows = plan.length;
    for (let y = 0; y < this._numRows; y++) {
      const line = plan[y];
      this._nodes[y] = [];
      for (let x = 0; x < this._numCols; x++) {
        const ch = line[x],
          Act = actorChars[ch];
        this._nodes[y][x] = new Node(x, y);
        if (Act) {
          let a = new Act(x * this.stepWidth, y * this.stepHeight, ch);
          this.addChildToWorld(a);
          if (a.type === "player") {
            this.player = a;
          }
        }
        drawGrid(ch, this._nodes[y][x]);
      }
    }
    //等角地图深度排序
    if (isIso) {
      this.sortDepth();
    }
    //设置地图大小
    if (isIso) {
      let w1 = this._numCols * this.stepWidth + this._numRows * this.stepHeight;
      this.contentSize = {
        width: w1,
        height: w1 / 2
      }
      this._floor.x = this.contentSize.width / 2;
      this._floor.y = this.stepHeight;
      this._world.x = this.contentSize.width / 2;
      this._world.y = this.stepHeight;
    } else {
      this.contentSize = {
        width: this._numCols * this.stepWidth,
        height: this._numRows * this.stepHeight
      }
    }
  }
  addChildToFloor(child) {
    this._floor.addChild(child);
  }
  addChildToWorld(child) {
    this._world.addChild(child);
  }
  sortDepth(container = this._floor) {
    container.sortChildren(function (a, b) {
      return a.depth - b.depth;
    });
  }

  //屏幕滚动
  scrollPlayerIntoView() {
    let marginw = this.width / 3;
    let marginh = this.height / 3;
    //this viewpot
    this._mapleft = -this.scrollX;
    this._mapright = this._mapleft + this.width;
    this._maptop = -this.scrollY;
    this._mapbottom = this._maptop + this.height;
    if (this.player.x < this._mapleft + marginw) {
      this.scrollX = -this.player.x + marginw;
    } else if (this.player.x > this._mapright - marginw) {
      this.scrollX = -this.player.x - marginw + this.width;
    }
    if (this.player.y < this._maptop + marginh) {
      this.scrollY = Math.floor(-this.player.y + marginh);
    } else if (this.player.y > this._mapbottom - marginh) {
      this.scrollY = Math.floor(-this.player.y - marginh + this.height);
    }
  }
  /**检测是否出屏幕
   * 
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns boolean
   */
  outOfWin(actor) {
    let rect = actor.rect;
    return rect.x + rect.width < this._mapleft || rect.x > this._mapright || rect.y + rect.height < this._maptop || rect.y > this._mapbottom;
  }
  hasTypeOnWorld(actorType) {
    return this._world.children.some(function (actor) {
      return actor.type == actorType;
    })
  }
  hasTypeOnFloor(actorType) {
    return this._floor.children.some(function (actor) {
      return actor.type == actorType;
    })
  }
  moveActors() {
    let actor = this._world.getChildAt(this._world.numChildren - 1)
    while (actor) {
      actor.act();
      let index = this._world.getChildIndex(actor);
      actor = this._world.getChildAt(index - 1);
    }
  }
  hitActor(actor, rect = actor.rect) {
    let l = this._world.numChildren;
    for (var i = 0; i < l; i++) {
      var other = this._world.getChildAt(i);
      if (other == actor) {
        continue;
      }
      if (rect.intersects(other.rect)) {
        return other;
      }
    }
  }
  //检测地图与元素碰撞
  hitMap(rect1) {
    let x1 = rect1.x / this.stepWidth,
      y1 = rect1.y / this.stepHeight,
      w1 = rect1.width / this.stepWidth,
      h1 = rect1.height / this.stepHeight;
    var xStart = Math.floor(x1);
    var xEnd = Math.ceil(x1 + w1);
    var yStart = Math.floor(y1);
    var yEnd = Math.ceil(y1 + h1);
    let node;
    if (xStart < 0 || xEnd > this._nodes[0].length || yStart < 0) {
      node = new Node();
      node.walkable = false;
      return node;
    } else if (yEnd > this._nodes.length) {
      node = new Node();
      node.walkable = false;
      node.death = true;
      return node;
    }
    for (var y = yStart; y < yEnd; y++) {
      for (var x = xStart; x < xEnd; x++) {
        node = this._nodes[y][x];
        if (!node.walkable) {
          return node;
        }
      }
    }
  }
  //a star*************8
  getNode(x, y) {
    return this._nodes[x][y]
  }
  setEndNode(x, y) {
    this._endNode = this._nodes[x][y];
  }
  setStartNode(x, y) {
    this._startNode = this._nodes[x][y];
  }
  setWalkable(x, y, value) {
    this._nodes[x][y].walkable = value;
  }
  get endNode() {
    return this._endNode;
  }
  get startNode() {
    return this._startNode;
  }
  get numCols() {
    return this._numCols;
  }
  get numRows() {
    return this._numRows;
  }
}
/**
 * 网格节点
 */
class Node {
  constructor(xpos, ypos) {
    this.x = xpos;
    this.y = ypos;
    this.walkable = true;
    this.death = false;
    this.costMultiplier = 1;
    this.f;
    this.g;
    this.h;
    this.parent;
  }
}
class AStar {
  constructor() {
    this._open = [];
    this._closed = [];
    this._grid = null;
    this._endNode = null;
    this._startNode = null;
    this._path = [];
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
          if (test === node || !test.walkable || !this._grid.getNode(node.x, test.y).walkable || !this._grid.getNode(test.x, node.y).walkable) {
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
export { GridsMapGame, AStar };