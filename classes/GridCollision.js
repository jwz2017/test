import { stage } from "./gframe.js";
//网格碰撞检测
export class GridCollision {
  constructor(width, height, gridSize) {
    this._width = width;
    this._height = height;
    this._gridSize = gridSize;
    this._numCols = Math.ceil(this._width / this._gridSize);
    this._numRows = Math.ceil(this._height / this._gridSize);
    this._numCells = this._numCols * this._numRows;
  }
  drawGrid() {
    let shape = new createjs.Shape();
    stage.addChildAt(shape, 0);
    shape.graphics.beginStroke("#555");
    for (let i = 0; i <= this._width; i += this._gridSize) {
      shape.graphics.moveTo(i, 0);
      shape.graphics.lineTo(i, this._height);
    }
    for (let i = 0; i <= this._height; i += this._gridSize) {
      shape.graphics.moveTo(0, i);
      shape.graphics.lineTo(this._width, i);
    }
  }
  /**
   * 
   * @param {*} objects 
   */
  check(objects) {
    let numObjects = objects.length;
    this._grid = new Array(this._numCells);
    this._checks = [];
    for (let i = 0; i < numObjects; i++) {
      const obj = objects[i];
      const index = Math.floor(obj.y / this._gridSize) * this._numCols + Math.floor(obj.x / this._gridSize);
      if (!this._grid[index]) {
        this._grid[index] = [];
      }
      this._grid[index].push(obj);
    }
    this.checkGrid();
  }
  checkGrid() {
    for (let i = 0; i < this._numCols; i++) {
      for (let j = 0; j < this._numRows; j++) {
        this.checkOneCell(i, j);
        this.checkTwoCells(i, j, i + 1, j);
        this.checkTwoCells(i, j, i - 1, j + 1);
        this.checkTwoCells(i, j, i, j + 1);
        this.checkTwoCells(i, j, i + 1, j + 1);
      }

    }
  }
  checkOneCell(x, y) {
    let cell = this._grid[y * this._numCols + x];
    if (!cell) {
      return;
    }
    let cellLength = cell.length;
    for (let i = 0; i < cellLength - 1; i++) {
      const objA = cell[i];
      for (let j = i + 1; j < cellLength; j++) {
        const objB = cell[j];
        this._checks.push(objA, objB);
      }

    }
  }
  checkTwoCells(x1, y1, x2, y2) {
    if (x2 >= this._numCols || x2 < 0 || y2 >= this._numRows) {
      return;
    }
    let cellA = this._grid[y1 * this._numCols + x1];
    let cellB = this._grid[y2 * this._numCols + x2];
    if (!cellA || !cellB) {
      return;
    }
    let cellALength = cellA.length;
    let cellBLength = cellB.length;
    for (let i = 0; i < cellALength; i++) {
      const objA = cellA[i];
      for (let j = 0; j < cellBLength; j++) {
        const objB = cellB[j];
        this._checks.push(objA, objB);
      }

    }
  }
  get checks() {
    return this._checks;
  }
}