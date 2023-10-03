import { GridsMapGame } from "../classes/GridsMapGame.js";
import { gframe, queue, stage } from "../classes/gframe.js";
import { mc } from "../classes/mc.js";

window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(Puzzle);
    gframe.startFPS();
};
const PUZZLE_COLUMNS = 5,
    PUZZLE_ROWS = 4,
    PUZZLE_SIZE = 150;
var selectedPieces,
    pieces;

class Puzzle extends GridsMapGame {
    static loadItem = [{
        id: "puzzle",
        src: "puzzle/mam.png"
    }];
    constructor() {
        super("拼图游戏", PUZZLE_SIZE * PUZZLE_COLUMNS, PUZZLE_SIZE * PUZZLE_ROWS, PUZZLE_SIZE, PUZZLE_SIZE, PUZZLE_COLUMNS, PUZZLE_ROWS);
        this.y = stage.height - this.height >> 1;
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard();
        this.scoreboard.createTextElement("level", 320, 14);
    }

    newGame() {
        selectedPieces = [];
        pieces = [];
    }
    newLevel() {
        this.scoreboard.update("level", this.level);
        // this.drawGrid();
        // setTimeout(() => {
        //     for (let k = 0; k < this.nodes.length; k++) {
        //         const element = this.nodes[k];
        //         mc.randomArray(element);
        //     }
        //     mc.randomArray(this.nodes);
        //     for (let i = 0; i < this.numCols; i++) {
        //         for (let j = 0; j < this.numRows; j++) {
        //             const node=this.getNode(i,j);
        //             createjs.Tween.get(node.image).to({
        //                 x:i*this.stepWidth,
        //                 y:j*this.stepHeight
        //             },200);
                    
        //         }
        //     }
        // }, 3000);
    }
    // drawGrid() {
    //     for (let i = 0; i < this.numCols; i++) {
    //         for (let j = 0; j < this.numRows; j++) {
    //             const node = this.getNode(i, j);
    //             const piece = new createjs.Bitmap(queue.getResult("puzzle"));
    //             piece.sourceRect = new createjs.Rectangle(i * this.stepWidth, j * this.stepHeight, this.stepWidth, this.stepHeight);
    //             piece.x = i * this.stepWidth;
    //             piece.y = j * this.stepHeight;
    //             node.image = piece;
    //             this.addChildToFloor(piece);
    //         }

    //     }
    // }
    waitComplete() {

        //分割图片
        let l = PUZZLE_COLUMNS * PUZZLE_ROWS;
        for (let i = 0, col = 0, row = 0; i < l; i++) {
            const piece = new createjs.Bitmap(queue.getResult("puzzle"));
            piece.sourceRect = new createjs.Rectangle(col * PUZZLE_SIZE, row * PUZZLE_SIZE, PUZZLE_SIZE, PUZZLE_SIZE);
            piece.homePoint = {
                x: col * PUZZLE_SIZE,
                y: row * PUZZLE_SIZE + 70
            };
            piece.x = piece.homePoint.x;
            piece.y = piece.homePoint.y;
            stage.addChild(piece);
            pieces[i] = piece;
            col++;
            if (col === PUZZLE_COLUMNS) {
                col = 0;
                row++;
            }
        }
        //随机排列图片
        setTimeout(() => {
            let p = [],
                _this = this,
                l, randomIndex;
            p = p.concat(pieces);
            l = p.length;
            for (let i = 0, col = 0, row = 0; i < l; i++) {
                randomIndex = Math.floor(Math.random() * p.length);
                const piece = p[randomIndex];
                p.splice(randomIndex, 1);
                createjs.Tween.get(piece).to({
                    x: col * PUZZLE_SIZE,
                    y: row * PUZZLE_SIZE + 70
                }, 200);
                piece.addEventListener('click', this.onPieceClick = function (e) {
                    _this._onPieceClick(e);
                });
                col++;
                if (col === PUZZLE_COLUMNS) {
                    col = 0;
                    row++;
                }
            }
        }, 3000);
    }
    _onPieceClick(e) {
        if (selectedPieces.length === 2) {
            return;
        }
        var piece = e.target,
            matrix = new createjs.ColorMatrix().adjustColor(15, 10, 100, 180);
        piece.filters = [new createjs.ColorMatrixFilter(matrix)];
        piece.cache(0, 0, PUZZLE_SIZE, PUZZLE_SIZE);
        stage.setChildIndex(piece, stage.numChildren - 1);
        selectedPieces.push(piece);
        if (selectedPieces.length === 2) {
            this._swapPieces();
        }

    }
    _swapPieces() {
        var piece1 = selectedPieces[0],
            piece2 = selectedPieces[1];
        createjs.Tween.get(piece1).wait(300).to({
            x: piece2.x,
            y: piece2.y
        }, 200);
        createjs.Tween.get(piece2).wait(300).to({
            x: piece1.x,
            y: piece1.y
        }, 200).call(() => {
            setTimeout(() => {
                this._evalPuzzle();
            }, 200);
        });
    }
    _evalPuzzle() {
        var win = true;
        selectedPieces[0].uncache();
        selectedPieces[1].uncache();
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            if (piece.x != piece.homePoint.x || piece.y != piece.homePoint.y) {
                win = false;
                break;
            }
        }
        if (win) {
            setTimeout(() => {
                this.clear(GFrame.event.GAME_OVER);
            }, 200);
        }
        selectedPieces = [];
    }
    clear(e) {
        pieces.forEach(element => {
            if (element) {
                element.removeEventListener('click', this.onPieceClick);
            }
        });
        super.clear(e);
    }

}