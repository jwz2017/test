import { stage, gframe, queue } from "../classes/gframe.js";
import { GridsMapGame } from "../classes/GridsMapGame.js";
window.onload = function () {
    /*************游戏入口*****/
    //gframe.loaderBar=null;
    gframe.buildStage('canvas');
    gframe.preload(ColorDrop);
    gframe.startFPS();
};
//游戏变量;
var space = 7;
class ColorDrop extends GridsMapGame {
    static loadItem = [{
        id: "color",
        src: "colordrop1/color.json",
        type: "spritesheet"
    }];
    //static loadId = null;
    static SCORE_BOARD_PLAYS = "plays";
    static SCORE_BOARD_THRESHOLD = "threshold";
    static SCORE_BOARD_LEVEL_SCORE = "levelScore";
    constructor() {
        gframe.style.TITLE_TEXT_COLOR = "#fff";
        stage.canvas.style.background = "#000";
        var step = 30, numcols = 15, numrows = 15;
        super("魔法方块", step * numcols + (numcols + 1) * space, step * numrows + (numrows + 1) * space, step, step, numcols, numrows);
        this.instructionScreen.title.text = "10步内超过500分过关";
        this.maxLevel = 10;
        this.x = stage.width - this.width >> 1;
        this.y = stage.height - this.height >> 1;
        this.difficultyLevel = 7;
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0,0,false,{justifyContent:"space-between"});
        this.scoreboard.createTextElement(ColorDrop.SCORE);
        this.scoreboard.createTextElement(ColorDrop.LEVEL);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_PLAYS);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_THRESHOLD);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_LEVEL_SCORE);
        this.scoreboard.placeElements();
    }
    newLevel() {
        this.scoreboard.update("score",this.score);
        this.scoreboard.update("level",this.level);
        this.plays = 10;//点击步数
        this.threshold = 500;//过关分数
        this.levelScore = 0;//每关获得的分数
        this.scoreboard.update(ColorDrop.SCORE_BOARD_PLAYS, this.plays);
        this.scoreboard.update(ColorDrop.SCORE_BOARD_THRESHOLD, this.threshold);
        this.scoreboard.update(ColorDrop.SCORE_BOARD_LEVEL_SCORE, this.levelScore);
        if (this.level > this.difficultyLevel) {
            this.currentLevel = this.difficultyLevel;
        } else if (this.level < 3) {
            this.currentLevel = 3;
        } else this.currentLevel = this.level;
    }

    waitComplete() {
        stage.enableMouseOver();
        //drawgrid
        for (let i = 0; i < this.numCols; i++) {
            for (let j = 0; j < this.numRows; j++) {
                this.createTile(i, j);
            }
        }
        //鼠标点击事件
        this.floor.on("mousedown", e => {
            if (!this.checkForFallingTiles()) {//全部方块移动完毕
                let actor = e.target;
                let node = this.getNode(actor.col, actor.row);
                let likeNode = this.findLikeNode(node);
                //跟新分数版
                let i = 0;
                this.plays--;
                this.scoreboard.update(ColorDrop.SCORE_BOARD_PLAYS, this.plays);
                likeNode.forEach(node => {
                    node.type = null;
                    i++;
                    let score = i * 3;
                    this.score += score;
                    this.levelScore += score;
                    this.scoreboard.update("score", this.score);
                    this.scoreboard.update(ColorDrop.SCORE_BOARD_LEVEL_SCORE, this.levelScore);
                    let tile = node.tile;
                    tile.cursor = null;
                    tile.makeBlockClicked();
                    this.addChildToWorld(tile);
                    //设置选中节点的方块为空
                    //方块移动回收移除
                    createjs.Tween.get(tile).to({
                        alpha: 0.1,
                        y: this.height
                    }, 2000).call(() => {
                        tile.parent.removeChild(tile);
                    })
                });
                //方块落下
                this.moveTileDown();
                //检测游戏是否结束或升级
                if (this.levelScore >= this.threshold) {
                    this.clear(gframe.event.LEVEL_UP);
                    this.floor.removeAllEventListeners("mousedown");
                }
                else if (this.plays <= 0){
                    this.clear(gframe.event.GAME_OVER);
                    this.floor.removeAllEventListeners("mousedown");
                } 
            }
        })
    }
    //创建方块
    createTile(i, j) {
        let color = Math.floor(Math.random() * this.currentLevel);
        let ypos = this.stepHeight * j + space * (j + 1);
        let tile = new Block(queue.getResult("color"), j, i);
        tile.gotoAndStop(color);
        tile.x = this.stepWidth * i + space * (i + 1);
        tile.y = -this.stepHeight;
        let node = this.getNode(i, j);
        node.tile = tile;
        node.type = tile.currentFrame;
        this.addChildToFloor(tile);
        createjs.Tween.get(tile).to({
            y: ypos
        }, ypos * 2).call(() => {
            tile.isFalling = false;
            tile.cursor = "pointer";
        });
    }
    //检测全部方块移是否移动完毕
    checkForFallingTiles() {
        return this.floor.children.some(function (actor) {
            return actor.isFalling == true;
        })
    }
    /**
     * 方块落下
     */
    moveTileDown() {
        for (let i = this.numCols - 1; i >= 0; i--) {
            let missing = 0;
            let nummiss = 0;//补位
            for (let j = this.numRows - 1; j >= 0; j--) {
                let node = this.getNode(i, j);
                if (node.type == null){
                    nummiss++;
                } 
                else if (node.type != null) {
                    missing = 0;
                    for (let m = j + 1; m < this.numRows; m++) {
                        if (this.getNode(i, m).type == null) {
                            missing++;
                        }
                    };
                    if (missing > 0) {
                        node.type = null;
                        let tile = node.tile;
                        tile.row = j + missing;
                        tile.col = i;
                        tile.isFalling = true;
                        node = this.getNode(i, tile.row);
                        node.tile = tile;
                        node.type = tile.currentFrame;
                        createjs.Tween.get(tile).to({
                            y: this.stepWidth * tile.row + space * (tile.row + 1)
                        }, 300).call(() => {
                            tile.isFalling = false;
                        });
                    }
                }
            }
            //补充方块
            for (let n = nummiss - 1; n >= 0; n--) {
                this.createTile(i, n);
            }

        }
    }
}
/**
 * 方块类
 */
class Block extends createjs.Sprite {
    constructor(spriteSheet, row, col) {
        super(spriteSheet);
        this.isFalling = true;
        this.row = row;
        this.col = col;
    }
    makeBlockClicked() {
        this.filters = [new createjs.ColorFilter(0.5, 0.5, 0.5, 1, 0, 0, 0, 0)];
        let b = this.getBounds();
        this.cache(b.x, b.y, b.width, b.height);
    }
}
