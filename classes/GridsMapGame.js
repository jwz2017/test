import { gframe } from "./gframe.js";
/**
 * *******网格游戏类 **************************************************
 */
class GridsMapGame extends gframe.Game {
  constructor(titleText, width, height, stepWidth, stepHeight, numCols = 0, numRows = 0,{titleSoundId,backSoundId}={}) {
    super(titleText, width, height,{titleSoundId:titleSoundId,backSoundId:backSoundId});
    this.stepWidth = stepWidth;
    this.stepHeight = stepHeight;
    this._floor = new createjs.Container();
    this._world = new createjs.Container();
    this.addChild(this._floor);
    this.addChild(this._world);
    this._numCols = numCols;
    this._numRows = numRows;
    this.nodes = [];
    this._mapleft = 0;
    this._maptop = 0;
    this._mapright = this.width;
    this._mapbottom = this.height;
    this._tempNode=new Node();
    //a star
    this._startNode = null;
    this._endNode = null;
    //建立网格
    if (this._numCols) {
      for (let i = 0; i < this._numCols; i++) {
        this.nodes[i] = [];
        for (let j = 0; j < this._numRows; j++) {
          this.nodes[i][j] = new Node(i, j);
        }
      }
    }
  }
  createGridMap(plan, actorChars, drawGrid, isIso = false) {
    this.nodes = [];
    this._numCols = plan[0].length;
    this._numRows = plan.length;
    for (let y = 0; y < this._numRows; y++) {
      const line = plan[y];
      this.nodes[y] = [];
      for (let x = 0; x < this._numCols; x++) {
        const ch = line[x],
          Act = actorChars[ch];
        this.nodes[y][x] = new Node(x, y);
        if (Act) {
          let a = new Act(x * this.stepWidth, y * this.stepHeight, ch);
          this.addChildToWorld(a);
          if (a.type === "player") {
            this.player = a;
          }
        }
        drawGrid(ch, this.nodes[y][x]);
      }
    }
    if (isIso) {
      //等角地图深度排序
      this.sortDepth();
      //设置地图大小
      let w1 = this._numCols * this.stepWidth + this._numRows * this.stepHeight;
      this.contentSize = {
        width: w1,
        height: w1 / 2
      }
      this.container.x=this.width/2;
      this.container.y=this.stepHeight/2;
      this._floor.cache(-this.contentSize.width/2,-this.stepHeight/2,this.contentSize.width,this.contentSize.height);
    } else {
      this.contentSize = {
        width: this._numCols * this.stepWidth,
        height: this._numRows * this.stepHeight
      }
      this._floor.cache(0, 0, this.contentSize.width, this.contentSize.height)
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
  scrollPlayerIntoView(actor) {
    let a=this.getActorScroll(actor);
    this.scrollX=a.scrollX;
    this.scrollY=a.scrollY;
  }
  getActorScroll(actor){
    let marginw = this.width / 3;
    let marginh = this.height / 3;
    let scrollX=this.scrollX,scrollY=this.scrollY;
    //this viewpot
    this._mapleft = -scrollX;
    this._mapright = this._mapleft + this.width;
    this._maptop = -scrollY;
    this._mapbottom = this._maptop + this.height;
    if (actor.x < this._mapleft + marginw) {
      scrollX = -actor.x + marginw;
    } else if (actor.x > this._mapright - marginw) {
      scrollX = -actor.x - marginw + this.width;
    }
    if (actor.y < this._maptop + marginh) {
      scrollY = Math.floor(-actor.y + marginh);
    } else if (actor.y > this._mapbottom - marginh) {
      scrollY = Math.floor(-actor.y - marginh + this.height);
    }
    return {scrollX,scrollY};
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
  hasTypeOnContainer(actorType,container=this._world) {
    return container.children.some(function (actor) {
      return actor.type == actorType;
    })
  }
  moveActors(layer = this._world) {
    let actor = layer.getChildAt(layer.numChildren - 1)
    while (actor) {
      actor.act();
      let index = layer.getChildIndex(actor);
      actor = layer.getChildAt(index - 1);
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
    if (xStart < 0 || xEnd > this.nodes[0].length || yStart < 0) {
      this._tempNode.type = Node.NOWALKABLE;
      return this._tempNode;
    } else if (yEnd > this.nodes.length) {
      this._tempNode.type = Node.DEATH;
      return this._tempNode;
    }
    for (var y = yStart; y < yEnd; y++) {
      for (var x = xStart; x < xEnd; x++) {
        let node = this.nodes[y][x];
        if (node.type!=Node.WALKABLE) {
          return node;
        }
      }
    }
  }
  /**
   * 寻找周围相似节点
   * @param {*} node 
   * @returns 
   */
  findLikeNode(node) {
    let nodesToCheck = [], nodesMatched = [], nodesTested = [];
    let typeToMatch = node.type;
    nodesToCheck.push(node);
    // let rowList = [-1, 0, 1, -1, 1, -1, 0, 1],
    //     colList = [-1, -1, -1, 0, 0, 1, 1, 1];
    let rowList = [0, -1, 1, 0];
    let colList = [-1, 0, 0, 1];
    while (nodesToCheck.length > 0) {
      let tempNode = nodesToCheck.pop();
      if (tempNode.type == typeToMatch) {
        nodesMatched.push(tempNode);
      }
      let tempNode2;
      for (let i = 0; i < colList.length; i++) {
        if (tempNode.x + colList[i] >= 0 && (tempNode.x + colList[i]) < this.numCols
          && tempNode.y + rowList[i] >= 0 && (tempNode.y + rowList[i]) < this.numRows) {
          tempNode2 = this.getNode(tempNode.x + colList[i], tempNode.y + rowList[i]);
          if (tempNode2 && tempNode2.type == typeToMatch && nodesToCheck.indexOf(tempNode2) == -1
            && nodesTested.indexOf(tempNode2) == -1) {
            nodesToCheck.push(tempNode2);
          }
        }
      }
      nodesTested.push(tempNode);
    }
    return nodesMatched;
  }
  
  //a star*************8
  getNode(x, y) {
    return this.nodes[x][y]
  }
  setEndNode(x, y) {
    this._endNode = this.nodes[x][y];
  }
  setStartNode(x, y) {
    this._startNode = this.nodes[x][y];
  }
  setNodeType(x, y, value) {
    this.nodes[x][y].type = value;
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
  get world() {
    return this._world;
  }
  get floor() {
    return this._floor;
  }
  _clear() {
    // this._floor.uncache();
    super._clear();
    this._floor.removeAllChildren();
    this._world.removeAllChildren();
  }
}
/**
 * 网格节点
 */
class Node {
  static WALKABLE="walkable";
  static NOWALKABLE="nowalkable";
  static DEATH="death";
  constructor(xpos, ypos) {
    this.x = xpos;
    this.y = ypos;
    this.type = Node.WALKABLE;
    this.costMultiplier = 1;
    this.f;
    this.g;
    this.h;
    this.parent;
  }
}
/**
 * astar寻路
 */
class AStar {
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
          if (test === node || test.type!=Node.WALKABLE || this._grid.getNode(node.x, test.y).type!=Node.WALKABLE || this._grid.getNode(test.x, node.y).type!=Node.WALKABLE) {
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

export { GridsMapGame,Node, AStar };