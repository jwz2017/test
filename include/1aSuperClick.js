import {gframe, stage } from "../classes/gframe.js";
window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(SuperClick);
    gframe.startFPS();
};
const CLICKS = "clicks",
    NEEDED = "needed",
    ACHIEVE = "achieve";
const GOOD = "#2969ab",
    BAD = "#ff0000";
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
    achieve = 0,
    balls = [];
export class SuperClick extends gframe.Game {
    constructor() {
        super("super click");
        this.maxLevel = 10;
        this.setSize(stage.width, stage.height - this.scoreboard.height);
        this.y = this.scoreboard.height;
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0, 0, false, { justifyContent: "space-between" });
        this.scoreboard.x=50;
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement(CLICKS);
        this.scoreboard.createTextElement(NEEDED);
        this.scoreboard.createTextElement(ACHIEVE);
    }
    newLevel() {
        this.scoreboard.update("score", this.score);
        this.scoreboard.update("level", this.level);
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
        this.scoreboard.update(CLICKS, clicks + "/" + numCircles);
        this.scoreboard.update(ACHIEVE, achieve);
        this.scoreboard.update(NEEDED, needed);
    }
    waitComplete(){
        stage.enableMouseOver();
        stage.addEventListener('mousedown', (e) => {
            if (createjs.Ticker.paused) {
                return;
            } else if (e.target.type === BAD) {
                this.clear(gframe.event.GAME_OVER);
            } else if (e.target.type === GOOD && e.target.first === true) {
                let ball = e.target;
                ball.clicked = true;
                ball.first = false;
                let addScore = Math.round(maxScore / ball.scale);
                clicks++;
                this.score += addScore;
                achieve = Math.round(clicks / numCircles * 100);
                this.scoreboard.update(SuperClick.SCORE, this.score);
                this.scoreboard.update(CLICKS, clicks);
                this.scoreboard.update(ACHIEVE, achieve);
                //加入分数文本
                let txt = new createjs.Text(addScore, "bold 12px,arial", "#ff0000");
                txt.textAlign = "center";
                txt.textBaseline = "middle";
                let p = this.localToGlobal(ball.x, ball.y);
                txt.x = p.x;
                txt.y = p.y;
                stage.addChild(txt);
                createjs.Tween.get(txt).to({
                    scale: 3
                }, 500).call(() => {
                    stage.removeChild(txt);
                });
            }
        })
    }
    runGame() {
        this.creatElement();
        this.moveActors();
        this.checkOver();
        this.checkLevelUp();
    }
    clear(e){
        stage.removeAllEventListeners("mousedown");
        super.clear(e);
    }
    creatElement() {
        if (this.container.children.length < maxOnScreen && numCreated < numCircles) {
            var circle;
            if (Math.random() * 100 < percentBadCircle) {
                circle = SuperClick.getActor(balls, Ball);
                circle.init(BAD)
            } else {
                circle = SuperClick.getActor(balls, Ball);
                circle.init(GOOD);
                numCreated++;
            }
            circle.x = Math.random() * (this.width - radius * 2 + radius);
            circle.y = Math.random() * (this.height - radius * 2 + radius);
            circle.scaleX = circle.scaleY = 0.5;
            this.addChild(circle);
        }
    }
    checkOver() {
        if (numCreated == numCircles && !this.hasTypeOnContainer(GOOD)) {
            console.log(numCreated,numCircles);
            this.clear(gframe.event.GAME_OVER);
        }
    }
    checkLevelUp() {
        if (achieve >= needed) {
            this.clear(gframe.event.LEVEL_UP)
        }
    }
}
class Ball extends createjs.Shape {
    /**
     * @param {[string]} color #ff0000
     * @param {[number]} radius 15
     */
    constructor(radius = 15) {
        super();
        this.cursor = "pointer";
        this.radius = radius;
    }
    init(type) {
        this.first = true;
        this.clicked = false;
        this.scale=1;
        this.alpha=1;
        if (type == GOOD) this.type = GOOD;
        else this.type = BAD;
        this._redraw();
    }
    act() {
        if(this.clicked) this.alpha-=0.01;
        else if (this.scaleX < maxscale) {
            this.scale += growSpeed;
        } else {
            this.alpha -= 0.01;
        }
        if (this.alpha < 0.1) {
            this.recycle();
        }
    }
    recycle() {
        this.parent.removeChild(this);
        this.active = false;
    }
    _redraw() {
        this.graphics.clear();
        this.graphics.setStrokeStyle(1).beginStroke('#ffffff')
        this.graphics.beginFill(this.type);
        this.graphics.drawCircle(0, 0, this.radius);
    }
}