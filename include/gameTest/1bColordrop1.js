import { Game, Node } from "../../classes/Game.js";
import { stage, gframe, queue } from "../../classes/gframe.js";
import { getFXBitmap } from "../../classes/other.js";
import { Fps, ScoreBoard } from "../../classes/screen.js";
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas',false);
    gframe.preload(ColorDrop);
};
//游戏变量;
var space = 7;
var step = 30, numcols = 10, numrows = 15;
class ColorDrop extends Game {
    static loadItem = [{
        id: "color",
        src: "colordrop1/color.json",
        type: "spritesheet"
    }];
    static SCORE_BOARD_PLAYS = "plays";
    static SCORE_BOARD_THRESHOLD = "threshold";
    static SCORE_BOARD_LEVEL_SCORE = "levelScore";
    constructor() {
        super("魔法方块", step * numcols + (numcols + 1) * space, step * numrows + (numrows + 1) * space);
        this.fps=new Fps();
        this.instructionText= "10步内超过500分过关";
        this.maxLevel = 10;
        this.x = stage.width - this.width >> 1;
        this.y = stage.height - this.height >> 1;
        this.difficultyLevel = 7;
        // this.createGrid(numrows,numcols);
        for (let i = 0; i < numcols; i++) {
            this.nodes[i]=[]
            for (let j = 0; j < numrows; j++) {
                this.nodes[i][j]=new Node(i,j);
            }
            
        }
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard(stage.width,"space-between");
        this.scoreboard.x=50;
        this.scoreboard.createTextElement(ColorDrop.SCORE,"0");
        this.scoreboard.createTextElement(ColorDrop.LEVEL);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_PLAYS);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_THRESHOLD);
        this.scoreboard.createTextElement(ColorDrop.SCORE_BOARD_LEVEL_SCORE);
    }
    newLevel() {
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
        stage.addChild(this.fps);
        stage.enableMouseOver()
        //drawgrid
        for (let i = 0; i < numcols; i++) {
            for (let j = 0; j < numrows; j++) {
                this.createTile(i, j);
            }
        }
        //鼠标点击事件
        this.on("mousedown", e => {
            if (!this.checkForFallingTiles()) {//全部方块移动完毕
                let actor = e.target;
                let node = this.getNode(actor.col, actor.row);
                let likeNode = this.findLikeNode(node);
                //跟新分数版
                let i = 0;
                this.plays--;
                if(this.plays<=0)this.gameOver=true;
                this.scoreboard.update(ColorDrop.SCORE_BOARD_PLAYS, this.plays);
                likeNode.forEach(node => {
                    node.type = null;
                    i++;
                    let score = i * 3;
                    this.score += score;
                    this.levelScore += score;
                    if(this.levelScore>=this.threshold) this.levelUp=true;
                    this.scoreboard.update("score", this.score);
                    this.scoreboard.update(ColorDrop.SCORE_BOARD_LEVEL_SCORE, this.levelScore);
                    let tile = node.tile;
                    tile.cursor = null;
                    tile.makeBlockClicked();
                    this.addToProp(tile);
                    //设置选中节点的方块为空
                    //方块移动回收移除
                    createjs.Tween.get(tile).to({
                        alpha: 0.01,
                        y: tile.y+400
                    }, 2000).call(() => {
                        tile.parent.removeChild(tile);
                    })
                });
                //方块落下
                this.moveTileDown();
            }
        })
    }
    //创建方块
    createTile(i, j) {
        let color = Math.floor(Math.random() * this.currentLevel);
        let ypos = step * j + space * (j + 1);
        let tile = new Block(queue.getResult("color"), j, i);
        tile.gotoAndStop(color);
        tile.x = step * i + space * (i + 1);
        tile.y = -step*(numrows-j)-space*(numrows-j+1);
        let node = this.getNode(i, j);
        node.tile = tile;
        node.type = tile.currentFrame;
        this.addToPlayer(tile);
        createjs.Tween.get(tile).wait(500).to({
            y: ypos
        }, 800).call(() => {
            tile.isFalling = false;
            tile.cursor = "pointer";
        });
    }
    //检测全部方块移是否移动完毕
    checkForFallingTiles() {
        return this.playerChildren.some(function (actor) {
            return actor.isFalling == true;
        })
    }
    /**
     * 方块落下
     */
    moveTileDown() {
        for (let i = numcols - 1; i >= 0; i--) {
            let missing = 0;
            let nummiss = 0;//补位
            for (let j = numrows - 1; j >= 0; j--) {
                let node = this.getNode(i, j);
                if (node.type == null){
                    nummiss++;
                }else if (node.type != null) {
                    missing = 0;
                    for (let m = j + 1; m < numrows; m++) {
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
                        createjs.Tween.get(tile).wait(500).to({
                            y: step * tile.row + space * (tile.row + 1)
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
class Block extends createjs.Container {
    constructor(spriteSheet, row, col) {
        super();
        this.mouseChildren=false;
        this.sprite=new createjs.Sprite(spriteSheet);
        this.isFalling = true;
        this.row = row;
        this.col = col;
        this.addChild(this.sprite);
    }
    makeBlockClicked() {
        let b = this.getBounds();
        let filters = [new createjs.BlurFilter(7,7,1),new createjs.ColorFilter(0, 0, 0, 1.5, 255, 255,255, 0)];
        let fx=getFXBitmap(this.sprite,filters,0,0,b.width,b.height);
        createjs.Tween.get(fx, {loop:false}).to({alpha:0.01}, 4000);
        this.addChildAt(fx,0);
    }
    gotoAndStop(val){
        this.sprite.gotoAndStop(val);
    }
    get currentFrame(){
        return this.sprite.currentFrame;
    }
}
