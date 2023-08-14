import { gframe, stage } from "../classes/gframe.js";
import { mc } from "../classes/mc.js";

window.onload = function () {
    gframe.init('canvas');
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

class SuperClick extends gframe.Game {
    constructor() {
        super("super click");
        this.maxLevel = 10;
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0,0,true);
        this.scoreboard.createTextElement("score");
        this.scoreboard.createTextElement("level");
        this.scoreboard.createTextElement(CLICKS);
        this.scoreboard.createTextElement(NEEDED);
        this.scoreboard.createTextElement(ACHIEVE);
        this.scoreboard.placeElements();
    }
    newLevel() {
        stage.addEventListener('mousedown', (e) => {
            if (createjs.Ticker.paused) {
                return;
            } else if (e.target.type === BAD) {
                stage.dispatchEvent(gframe.event.GAME_OVER);
            } else if (e.target.type === GOOD && e.target.first === true) {
                e.target.clicked = true;
                e.target.first = false;
            }
        })
        clicks = 0;
        achieve = 0;
        balls=[];
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
    runGame() {
        this._creatElement();
        this._update();
        this._checkBall();
        this._checkOver();
        this._checkLevelUp();
    }
    _creatElement() {
        if (balls.length < maxOnScreen && numCreated < numCircles) {
            let circle;
            if (Math.random() * 100 < percentBadCircle) {
                circle = new Ball(BAD, radius);
                circle.type = BAD;
            } else {
                circle = new Ball(GOOD, radius);
                circle.type = GOOD;
                numCreated++;
            }
            let d=this.scoreboard.getBounds().height;
            circle.x = Math.random() * (stage.width - radius * 2 + radius);
            circle.y = Math.random() * (stage.height - d- radius * 2) + d+ radius;
            circle.scaleX = circle.scaleY = 0.5;
            circle.clicked = false;
            circle.first = true;
            stage.addChild(circle);
            balls.push(circle);
        }
    }
    _update() {
        balls.forEach(function (item) {
            if (item.scaleX < maxscale) {
                item.scaleX += growSpeed;
                item.scaleY += growSpeed;
            } else {
                createjs.Tween.get(item).to({
                    alpha: 0
                }, 2000);
            }
        }, this)
    }
    _checkBall() {
        for (let i = balls.length - 1; i >= 0; i--) {
            const ball = balls[i];
            if (ball.alpha <= 0.1) {
                stage.removeChild(ball);
                balls.splice(i, 1);
            } else if (ball.clicked) {
                let addScore = Math.round(maxScore / ball.scaleX);
                clicks++;
                achieve = Math.round(clicks / numCircles * 100);
                this.scoreboard.update(ACHIEVE, achieve + "%");
                this.scoreboard.update("score", addScore+this.score);
                this.scoreboard.update(CLICKS, clicks + "/" + numCircles);
                var txt = new createjs.Text(addScore, 'bold 12px arial', '#ff0000');
                txt.textAlign = 'center';
                txt.textBaseline = 'middle';
                txt.x = ball.x;
                txt.y = ball.y;
                stage.addChild(txt);
                createjs.Tween.get(txt).to({
                    scaleX: 3,
                    scaleY: 3,
                    alpha: 0
                }, 500).call(this.remove);
                balls.splice(i, 1);
                createjs.Tween.get(ball).to({
                    alpha: 0
                }, 2000).call(this.remove);
            }
        }
    }
    _checkOver() {
        if (balls.length == 0) {
            stage.dispatchEvent(gframe.event.GAME_OVER);
        }
    }
    _checkLevelUp() {
        if (achieve >= needed) {
            stage.dispatchEvent(gframe.event.LEVEL_UP)
        }
    }
    remove() {
        stage.removeChild(this);

    }

}
class Ball extends createjs.Shape {
    /**
     * @param {[string]} color #ff0000
     * @param {[number]} radius 15
     */
    constructor(color = "#ff0000", radius = 15) {
        super();
        this.color = color;
        this.cursor = "pointer";
        this.radius = radius;
        this.vx = this.vy = 0;
        this._redraw();
        this.setBounds(-this.radius - mc.style.strokeStyle, -this.radius - mc.style.strokeStyle, 2 * this.radius + 2 * mc.style.strokeStyle, 2 * this.radius + 2 * mc.style.strokeStyle);
    }
    _redraw() {
        this.graphics.clear();
        this.graphics.setStrokeStyle(1).beginStroke('#ffffff')
        if (typeof (this.color) == "string") {
            this.graphics.beginFill(this.color);
        } else { //渐变
            this.graphics.beginRadialGradientFill(this.color, [0, 1], 7, -8, 0, 0, 0, this.radius)
        }
        this.graphics.drawCircle(0, 0, this.radius);
    }
}