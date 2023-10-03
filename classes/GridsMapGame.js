import { gframe } from "./gframe.js";
import { checkPixelCollision } from "./hitTest.js";
/**
 * *******网格游戏类 **************************************************
 */
class GridsMapGame extends gframe.Game {
  constructor(titleText, width, height, stepWidth, stepHeight, numCols = 0, numRows = 0, { titleSoundId, backSoundId } = {}) {
    super(titleText, width, height, { titleSoundId: titleSoundId, backSoundId: backSoundId });
    this.nodes = [];
    this.floor = new createjs.Container();
    this.world = new createjs.Container();
    this.floorActor = new createjs.Container();
    this.container.addChild(this.floor, this.floorActor, this.world);
    this._stepWidth = stepWidth;
    this._stepHeight = stepHeight;
    this._numCols = numCols;
    this._numRows = numRows;
    this._mapleft = 0;
    this._maptop = 0;
    this._mapright = this.width;
    this._mapbottom = this.height;
    this._tempNode = new Node(-1, -1);
    //a star
    this._startNode = null;
    this._endNode = null;
    //创建节点
    if (this._numCols) {
      for (let i = 0; i < this._numCols; i++) {
        this.nodes[i] = [];
        for (let j = 0; j < this._numRows; j++) {
          this.nodes[i][j] = new Node(i, j);
        }
      }
    }
  }
  //创建网格地图
  createGridMap(plan, actorChars, drawGrid, floorChars = {}, isIso = false) {
    this.nodes = [];
    this._numCols = plan[0].length;
    this._numRows = plan.length;
    for (let y = 0; y < this._numRows; y++) {
      const line = plan[y];
      this.nodes[y] = [];
      for (let x = 0; x < this._numCols; x++) {
        const ch = line[x],
          Act = actorChars[ch] || floorChars[ch];
        this.nodes[y][x] = new Node(x, y);
        if (Act) {
          let a = new Act(x * this._stepWidth, y * this._stepHeight, ch);
          if (Act == actorChars[ch]) {
            this.addChildToWorld(a);
            if (a.type === "player") {
              this.player = a;
            }
          } else {
            this.floorActor.addChild(a);
            this.nodes[y][x].actor = a;
          }
        }
        drawGrid(ch, this.nodes[y][x]);
      }
    }
    if (isIso) {
      //等角地图深度排序
      this.sortDepth();
      //设置地图大小
      let w1 = this._numCols * this._stepWidth + this._numRows * this._stepHeight;
      this.contentSize = {
        width: w1,
        height: w1 / 2
      }
      this.container.x = this.width / 2;
      this.container.y = this._stepHeight / 2;
      this.floor.cache(-this.contentSize.width / 2, -this._stepHeight / 2, this.contentSize.width, this.contentSize.height);
    } else {
      this.contentSize = {
        width: this._numCols * this._stepWidth,
        height: this._numRows * this._stepHeight
      }
      this.floor.cache(0, 0, this.contentSize.width, this.contentSize.height)
    }
  }
  addChildToFloor(child) {
    this.floor.addChild(child);
  }
  addChildToWorld(child) {
    this.world.addChild(child);
  }
  sortDepth(container = this.floor) {
    container.sortChildren(function (a, b) {
      return a.depth - b.depth;
    });
  }

  //屏幕滚动默认焦点游戏玩家
  scrollPlayerIntoView(actor = this.player, marginw = this.width / 3, marginh = this.height / 3) {
    let a = this.getActorScroll(actor, marginw, marginh);
    this.scrollX = a.scrollX;
    this.scrollY = a.scrollY;
  }
  //设置摄像焦点对象
  getActorScroll(actor, marginw = this.width / 2, marginh = this.height / 2) {
    let scrollX = this.scrollX, scrollY = this.scrollY;
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
    return { scrollX, scrollY };
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
  // 检测静态地图元素碰撞
  hitMap(rect1, image = null) {
    let x1 = rect1.x / this._stepWidth,
      y1 = rect1.y / this._stepHeight,
      w1 = rect1.width / this._stepWidth,
      h1 = rect1.height / this._stepHeight;
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
        if (node.type != Node.WALKABLE) {
          if (!node.actor) return node;
          else {
            if (!image || !(node.actor.image instanceof createjs.Sprite)) {
              if (rect1.intersects(node.actor.rect)) return node;
            } else {
              let r = rect1.intersection(node.actor.rect);
              if (r) {
                this._transformRect(r);
                if (checkPixelCollision(image, node.actor.image, r)) {
                  return node
                }
              }
            }
          }
        }
      }
    }
  }
  //检测地图道具元素碰撞
  hitFloorActor(rect1, image = null) {
    let x1 = rect1.x / this._stepWidth,
      y1 = rect1.y / this._stepHeight,
      w1 = rect1.width / this._stepWidth,
      h1 = rect1.height / this._stepHeight;
    var xStart = Math.floor(x1);
    var xEnd = Math.ceil(x1 + w1);
    var yStart = Math.floor(y1);
    var yEnd = Math.ceil(y1 + h1);
    for (var y = yStart; y < yEnd; y++) {
      for (var x = xStart; x < xEnd; x++) {
        let node = this.nodes[y][x];
        if (node.type == Node.WALKABLE && node.actor) {
          if (!image || !(node.actor.image instanceof createjs.Sprite)) {
            if (rect1.intersects(node.actor.rect)) return node;
          } else {
            let r = rect1.intersection(node.actor.rect);
            if (r) {
              this._transformRect(r)
              if (checkPixelCollision(image, node.actor.image, r)) {
                return node
              }
            }
          }
        }
      }
    }
  }
  _transformRect(r) {
    let p = this.container.localToGlobal(r.x, r.y);
    r.x = p.x;
    r.y = p.y;
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
    //八方位检测
    // let rowList = [-1, 0, 1, -1, 1, -1, 0, 1],
    //     colList = [-1, -1, -1, 0, 0, 1, 1, 1];
    //上下左右四方位检测
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
  _clear() {
    super._clear();
    this.floor.removeAllChildren();
    this.floorActor.removeAllChildren();
    //清除world内容元素
    let l = this.world.children.length - 1;
    for (let i = l; i >= 0; i--) {
      const element = this.world.children[i];
      if (element.active) {
        element.recycle();
      } else {
        this.world.removeChild(element);
      }
    };
    this.container.addChild(this.floor, this.floorActor, this.world);

  }
}
/**
 * 网格节点
 */
class Node {
  static WALKABLE = "walkable";
  static NOWALKABLE = "nowalkable";
  static DEATH = "death";
  constructor(xpos, ypos) {
    this.x = xpos;
    this.y = ypos;
    this.type = Node.WALKABLE;
    this.actor = null;
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
          if (test === node || test.type != Node.WALKABLE || this._grid.getNode(node.x, test.y).type != Node.WALKABLE || this._grid.getNode(test.x, node.y).type != Node.WALKABLE) {
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

export { GridsMapGame, Node, AStar };