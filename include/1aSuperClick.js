window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.adapt();
    g.preload(SuperClick);
    // FPS.startFPS(stage);
};
(function () {
    "use strict";
    //游戏变量;定义。。构造内初始化，new game初始化
    
    const SCORE = "score",
        LEVEL = "level",
        CLICKS = "clicks",
        NEEDED = "needed",
        ACHIEVE = "achieve";
    const GOOD = "#2969ab",
        BAD = "#ff0000";
    var score=0,
        radius = 8,
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

    class SuperClick extends Game {
        constructor() {
            super();
            this.maxLevel = 2;
            this.titleScreen.setText("super click");

        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        createScoreBoard() {
            GFrame.style.SCOREBOARD_HEIGHT = 100;
            this.scoreBoard = new ScoreBoard();
            GFrame.style.SCOREBOARD_COLOR="#000000";
            this.scoreBoard.createBg();
            this.scoreBoard.createTextElement(SCORE, '0', 20, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 14);
            this.scoreBoard.createTextElement(CLICKS, '0', 560, 14);
            this.scoreBoard.createTextElement(NEEDED, '0', 20, 60);
            this.scoreBoard.createTextElement(ACHIEVE, '0', 320, 60);
        }
        newGame() {
            score=0;
            this.scoreBoard.update(SCORE,score);
        }
        newLevel() {
            stage.addChild(this.scoreBoard);
            this.scoreBoard.update(LEVEL, this.level);
            stage.addEventListener('mousedown', (e) => {
                // var e = window.event;
                // console.log(e.pageX,stage.canvas.offsetLeft,stage.canvas.offsetTop);
                if (createjs.Ticker.paused) {
                    return;
                } else if (e.target.type === BAD) {
                    model.dispatchEvent(GFrame.event.GAME_OVER);
                } else if (e.target.type === GOOD && e.target.first === true) {
                    e.target.clicked = true;
                    e.target.first = false;
                }
            })
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
            this.scoreBoard.update(CLICKS, clicks + "/" + numCircles);
            this.scoreBoard.update(ACHIEVE, achieve);
            this.scoreBoard.update(NEEDED, needed);
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
                circle.x = Math.random() * (width - radius * 2 + radius);
                circle.y = Math.random() * (height - 100 - radius * 2) + 100 + radius;
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
                    score += addScore;
                    clicks++;
                    achieve = Math.round(clicks / numCircles * 100);
                    this.scoreBoard.update(ACHIEVE, achieve + "%");
                    this.scoreBoard.update(SCORE,score);
                    this.scoreBoard.update(CLICKS, clicks + "/" + numCircles);
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
                this.gameOver = true;
            }
        }
        _checkLevelUp() {
            if (achieve >= needed) {
                model.dispatchEvent(GFrame.event.LEVEL_UP)
            }
        }
        remove() {
            stage.removeChild(this);

        }
        clear() {
            super.clear();
            // stage.removeAllChildren();
            balls.splice(0, balls.length);
        }

    }
    SuperClick.loaded = false;
    SuperClick.loadItem = null;
    window.SuperClick = SuperClick;
})();
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