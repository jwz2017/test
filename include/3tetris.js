import { stage, gframe, keys, pressed } from "../classes/gframe.js";
import { Actor } from "../classes/actor.js";
import { Game, ScoreBoard } from "../classes/Game.js";
window.onload = function () {
    /*************游戏入口*****/
    gframe.buildStage('canvas',true);
    gframe.preload(Tetris, true);
};
//游戏变量;
var sheet;
var map;
var step = 30;
var nextBox, nowBox, pointBox = new createjs.Point();
var nextLayer = new createjs.Container(), nextLayerLIst = [];
var speedIndex = 0, speed = 30,maxSpeed=10;
export class Tetris extends Game {
    static LINES="lines";
    constructor() {
        super("俄罗斯方块", 300, 600, step, step);
        this.lines=0;
        this.instructionText="w:旋转<br>asd:方向";
        this.x=stage.width-this.width>>1;
        this.y=50;
        //创建方块spritesheet
        let square = new createjs.Container();
        let shape = square.addChild(new createjs.Shape());
        let color="#555";
        let builder = new createjs.SpriteSheetBuilder();
        square.bounds = new createjs.Rectangle(-step/2, -step/2, step, step);
        for (let i = 0; i < 4; i++) {
            builder.addFrame(square, null, 1, function (target, data) {
                switch (data) {
                    case 1:
                        color="#00ff00";
                        break;
                    case 2:
                        color="#0000ff";
                        break;
                    case 3:
                        color="#ffff00";
                        break;
                }
                shape.graphics.clear().setStrokeStyle(1).beginStroke("#555").beginFill(color).drawRect(-step/2,-step/2,step,step);
            }, i);
        }
        sheet = builder.build();
        //nextLayer预览界面
        nextLayer.x = 600;
        nextLayer.y = 100;
        for (let i = 0, sprite; i < 4; i++) {
            let list = []
            for (let j = 0; j < 4; j++) {
                sprite = new createjs.Sprite(sheet);
                sprite.x = j * step;
                sprite.y = i * step;
                nextLayer.addChild(sprite);
                list[j] = sprite;
            }
            nextLayerLIst.push(list);
        }

    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(Tetris.SCORE,0,600,250);
        this.scoreboard.createTextElement(Tetris.LEVEL,1,600,300);
        this.scoreboard.createTextElement(Tetris.LINES,0,600,350);
    }
    //初始化游戏数据
    newGame() {
        map=[];
        for (let i = 0; i <19; i++) {
            const element = new Array(10).fill(0);
            map.push(element);
        }
        speedIndex = 0;
        this.createGridMap(map,(ch, node) => {
            switch (ch) {
                case 0:
                    node.actor = new Actor(node.x * step, node.y * step);
                    node.actor.setSpriteData(sheet);
                    this.addToPlayer(node.actor);
                    break;
            }
        })
        this.lines=0;
        this.scoreboard.update(Tetris.SCORE,this.score);
        this.scoreboard.update(Tetris.LINES,this.lines);
    }
    newLevel(){
        this.scoreboard.update(Tetris.LEVEL,this.level);
    }
    waitComplete() {
        stage.addChild(nextLayer);
        this.getNewBox();
        this.plusBox();
    }
    runGame() {
        // return;
        this.minusBox();
        let key = pressed[pressed.length - 1];
        if (key && keys.stepindex-- <= 0) {
            keys.stepindex = keys.step;
            switch (key) {
                case "left":
                    if (this.checkPlus(-1, 0)) {
                        pointBox.x -= 1;
                    }
                    break;
                case "right":
                    if (this.checkPlus(1, 0)) {
                        pointBox.x += 1;
                    }
                    break;
                case "down":
                    if (this.checkPlus(0, 1)) {
                        pointBox.y += 1;
                    }
                    if (this.checkPlus(0, 1)) {
                        pointBox.y += 1;
                    }
                    if (this.checkPlus(0, 1)) {
                        pointBox.y += 1;
                    }
                    if (this.checkPlus(0, 1)) {
                        pointBox.y += 1;
                    }
                    break;
                case "up":
                    this.changeBox();
                    break;
            }
        }
        if (speedIndex++ > speed) {
            speedIndex = 0;
            if (this.checkPlus(0, 1)) {
                pointBox.y++;
            } else {
                this.plusBox();
                this.removeBox();
                if (pointBox.y < 0) {
                    this.gameOver=true;
                }
                this.getNewBox();
            }
        }
        this.plusBox();
    }
    //更新新方块
    getNewBox() {
        pointBox.x = 3;
        pointBox.y = -2;
        if (!nextBox) {
            nextBox = Box.getBox();
        }
        nowBox = nextBox;
        nextBox = Box.getBox();
        for (let i = 0; i < nextBox.length; i++) {
            for (let j = 0; j < nextBox[0].length; j++) {
                nextLayerLIst[i][j].gotoAndStop(nextBox[i][j]);
            }

        }
    }
    //添加方块
    plusBox() {
        for (let i = 0; i < nowBox.length; i++) {
            for (let j = 0; j < nowBox[i].length; j++) {
                if (i + pointBox.y < 0 || i + pointBox.y >= map.length || j + pointBox.x < 0 || j + pointBox.x >= map[0].length) {
                    continue;
                }
                map[i + pointBox.y][j + pointBox.x] += nowBox[i][j];
                this.nodes[i + pointBox.y][j + pointBox.x].actor.image.gotoAndStop(map[i + pointBox.y][j + pointBox.x]);
            }

        }
    }
    //移除方块
    minusBox() {
        for (let i = 0; i < nowBox.length; i++) {
            for (let j = 0; j < nowBox[i].length; j++) {
                if (i + pointBox.y < 0 || i + pointBox.y >= map.length || j + pointBox.x < 0 || j + pointBox.x >= map[0].length) {
                    continue;
                }
                map[i + pointBox.y][j + pointBox.x] -= nowBox[i][j];
                this.nodes[i + pointBox.y][j + pointBox.x].actor.image.gotoAndStop(map[i + pointBox.y][j + pointBox.x]);
            }

        }
    }
    //判断是否可以移动
    checkPlus(nx, ny) {
        for (let i = 0; i < nowBox.length; i++) {
            for (let j = 0; j < nowBox.length; j++) {
                if (i + pointBox.y + ny < 0) {
                    continue;
                } else if (i + pointBox.y + ny >= map.length || j + pointBox.x + nx < 0 || j + pointBox.x + nx >= map[0].length) {
                    if (nowBox[i][j] == 0) {
                        continue;
                    } else {
                        return false;
                    }
                }
                if (nowBox[i][j] > 0 && map[i + pointBox.y + ny][j + pointBox.x + nx] > 0) {
                    return false;
                }
            }

        }
        return true;
    }
    //旋转方块
    changeBox() {
        var saveBox = nowBox;
        nowBox = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        for (let i = 0; i < saveBox.length; i++) {
            for (let j = 0; j < saveBox[i].length; j++) {
                nowBox[i][j] = saveBox[3 - j][i];
            }
        }
        if (!this.checkPlus(0, 0)) {
            nowBox = saveBox;
        }
    }
    //消除行
    moveLine(line) {
        for (let i = line; i > 1; i--) {
            for (let j = 0; j < map[0].length; j++) {
                map[i][j] = map[i - 1][j];
                this.nodes[i][j].actor.image.gotoAndStop(this.nodes[i - 1][j].actor.image.currentFrame)
            }
        }
        for (let j = 0; j < map[0].length; j++) {
            map[0][j] = 0;
            this.nodes[0][j].actor.image.gotoAndStop(0);

        }
    }
    //消除方块所在行
    removeBox() {
        var count = 0;
        for (let i = pointBox.y; i < pointBox.y + 4; i++) {
            if (i < 0 || i >= map.length) {
                continue;
            }
            for (let j = 0; j < map[0].length; j++) {
                if (map[i][j] == 0) {
                    break;
                }
                if (j == map[0].length - 1) {
                    this.moveLine(i);
                    count++;
                }
            }
        }
        if(count==0)return;
        this.lines+=count;
        this.scoreboard.update(Tetris.LINES,this.lines);
        if (count==1) {
            this.score+=1;
        }else if(count==2){
            this.score+=3;
        }else if(count==3){
            this.score+=6;
        }else if(count==4){
            this.score+=10;
        }
        this.scoreboard.update(Tetris.SCORE,this.score);
        if(this.lines/100>=this.level){
            this.level++;
            this.scoreboard.update(Tetris.LEVEL,this.level);
            speed--;
            speed=Math.max(maxSpeed,speed);
        }
    }
}
//方块类
class Box {
    static getBox() {
        let b = new Box();
        let num = 7 * Math.random();
        let index = num | 0;
        let result = [];
        let colorIndex = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < 4; i++) {
            const child = [];
            for (let j = 0; j < 4; j++) {
                child[j] = b.box[index][i][j] * colorIndex;
            }
            result[i] = child;
        }
        return result;
    }
    constructor() {
        this.box1 = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ];
        this.box2 = [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ];
        this.box3 = [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ];
        this.box4 = [
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ];
        this.box5 = [
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0]
        ];
        this.box6 = [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0]
        ];
        this.box7 = [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0]
        ];
        this.box = [this.box1, this.box2, this.box3, this.box4, this.box5, this.box6, this.box7]
    }
}
