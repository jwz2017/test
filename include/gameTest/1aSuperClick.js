import { Actor } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
import { gframe, stage } from "../../classes/gframe.js";
import { Fps,ScoreBoard } from "../../classes/screen.js";
window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(SuperClick);
};
const CLICKS = "clicks",
    NEEDED = "needed",
    ACHIEVE = "achieve";
var radius = 8,
    maxScore = 50,
    maxscale,
    growSpeed,
    maxOnScreen,
    numCircles,
    percentBadCircle,
    numCreated,
    clicks = 0,
    needed = 0,
    achieve = 0;
export class SuperClick extends Game {
    static backgroundColor = "#555";
    static codes = {
        32: "pause"
    }
    constructor() {
        super("super click");
        this.maxLevel = 10;
        this.fps=new Fps();
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard(stage.width - 50, "space-between");
        this.scoreboard.x = 50;
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement(CLICKS);
        this.scoreboard.createTextElement(NEEDED);
        this.scoreboard.createTextElement(ACHIEVE);
        let h = this.scoreboard.getBounds().height;
        this.setSize(stage.width, stage.height - h);
        this.y = h;
    }
    newLevel() {
        clicks = 0;
        achieve = 0;
        needed = 14 + this.level * 2;
        if (needed > 90) {
            needed = 90;
        }
        maxscale = (this.level < 4) ? 5 - this.level : 1.4;
        growSpeed = 0.0001 * this.level + 0.005;
        maxOnScreen = 6 * this.level;
        numCircles = this.level * 25;
        percentBadCircle = (this.level < 25) ? this.level + 9 : 40;
        numCreated = 0;
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
        this.scoreboard.update(CLICKS, clicks + "/" + numCircles);
        this.scoreboard.update(ACHIEVE, achieve);
        this.scoreboard.update(NEEDED, needed);
    }
    waitComplete() {
        stage.enableMouseOver();
        stage.addChild(this.fps);
        this.on('mousedown', (e) => {
            if (createjs.Ticker.paused) {
                return;
            } else if (e.target.type === Ball.BAD) {
                this.gameOver = true;
            } else if (e.target.type === Ball.GOOD && e.target.clicked === false) {
                let ball = e.target;
                ball.clicked = true;
                let addScore = Math.round(maxScore / ball.scale);
                clicks++;
                this.score += addScore;
                achieve = Math.round(clicks / numCircles * 100);
                this.scoreboard.update(SuperClick.SCORE, this.score);
                this.scoreboard.update(CLICKS, clicks + "/" + numCircles);
                this.scoreboard.update(ACHIEVE, achieve);
                //加入分数文本
                // let txt = new createjs.Text(addScore, "bold 12px,arial", "#ff0000");
                let txt=Actor.getActor(this.propLayer,createjs.Text);
                txt.text=addScore;
                txt.scale=1;
                txt.font="bold 12px,arial";
                txt.color="#f00";
                txt.active=true;
                txt.textAlign = "center";
                txt.textBaseline = "middle";
                txt.x = ball.x;
                txt.y = ball.y;
                // this.addToProp(txt)
                createjs.Tween.get(txt).to({
                    scale: 3
                }, 500).call(() => {
                    this.propLayer.removeChild(txt)
                    txt.active=false;
                });
            }
        })
    }
    runGame() {
        this.creatElement();
        this.moveActors(this.playerLayer);
        this.checkGame();
    }
    creatElement() {
        if (this.playerChildren.length < maxOnScreen && numCreated < numCircles) {
            var circle;
            if (Math.random() * 100 < percentBadCircle) {
                circle = Actor.getActor(this.playerLayer,Ball);
                circle.init(Ball.BAD,10,growSpeed,maxscale)
            } else {
                circle = Actor.getActor(this.playerLayer,Ball);
                circle.init(Ball.GOOD,15,growSpeed,maxscale);
                numCreated++;
            }
            circle.x = Math.random() * (this.width - radius * 2 + radius);
            circle.y = Math.random() * (this.height - radius * 2 + radius);
            circle.scale= 0.5;
        }
    }
    checkGame() {
        if (achieve >= needed) {
            this.levelUp = true;
        } else if (numCreated == numCircles && !this.hasTypeOnContainer(Ball.GOOD,this.playerLayer)) {
            this.gameOver = true;
        }
    }
}
class Ball extends createjs.Shape {
    static GOOD = "#2969ab";
    static BAD = "#ff0000";
    /**
     * @param {[string]} color #ff0000
     * @param {[number]} radius 15
     */
    constructor() {
        super();
        this.cursor = "pointer";
    }
    init(type,radius=15,growSpeed,maxScale) {
        this.clicked = false;
        this.scale = 1;
        this.alpha = 1;
        this.radius=radius;
        this.type = type;
        this.growSpeed=growSpeed;
        this.maxScale=maxScale;
        this._redraw();
    }
    act() {
        if (this.clicked) this.alpha -= 0.01;
        else if (this.scale< this.maxScale) {
            this.scale += this.growSpeed;
        } else {
            this.alpha -= 0.01;
        }
        if (this.alpha < 0.1) {
            this.recycle();
        }
    }
    recycle() {
        if (this.parent)this.parent.removeChild(this);
        this.active = false;
    }
    _redraw() {
        this.graphics.clear();
        this.graphics.setStrokeStyle(1).beginStroke('#ffffff')
        this.graphics.beginFill(this.type);
        this.graphics.drawCircle(0, 0, this.radius);
    }
}