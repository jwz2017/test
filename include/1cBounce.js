window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.preload(Bounce);
    g.startFPS();
};
(function () {
    "use strict";
    //游戏变量;
    const SCORE = "Score",
        LEVEL = "level",
        LIVES = "lives";

    var score, lives, bricks,
        actorChars,
        stepWidth=44,
        stepHeight=30,
        colorOffse = Math.random() * 360,
        count = 0,
        plans=[
            [
                "xxxlxxxx x x   ",
                "               ",
                "  xw wxxxx xx  ",
                "               ",
                "xxxxlxx   w w  ",
                "               ",
                "x    xx        ",
                "               ",
                "xxlxxxx        ",
                "            xlx",
                "     xx        ",
                " x           xx",
                "       p       ",
                "               ",
                "               ",
                "  /            ",
                "               ",
                "               ",
                "               ",
                "               ",
                "               ",
                "               ",
                "      @        "
            ]
        ],
        container = new GridsMap(0, GFrame.style.SCOREBOARD_HEIGHT, plans[0][0].length*stepWidth, plans[0].length*stepHeight, stepWidth, stepHeight);

    class Bounce extends Game {
        constructor() {
            super("弹球06");
        }
        init() {
            this.maxLevel = plans.length;
            actorChars = {
                "@": Pandle,
                "p": Puck,
                "/": AngleBounce
            }
            container.x=width-container.width>>1;
        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard();
            this.scoreBoard.createTextElement(SCORE, '0', 10, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 300, 14);
            this.scoreBoard.createTextElement(LIVES, '5', 590, 14);
        }
        newGame() {
            score = 0;
            lives = 5;
            this.scoreBoard.update(SCORE, score);
            this.scoreBoard.update(LIVES, lives);
        }
        newLevel() {
            bricks = [];
            this.scoreBoard.update(LEVEL, this.level);
            let shap=new createjs.Shape;
            let plan = plans[this.level - 1];
            container.createGridMap(plan, actorChars, (ch,node) => {
                if (ch == "w") {
                    node.walkable=false;
                    let bg = new Actor(node.x*stepWidth, node.y*stepHeight);
                    bg.init(stepWidth,stepHeight);
                    container.addChild(bg);
                } else if (ch == "x" || ch == "l") {
                    node.walkable=false;
                    let fieldType = new Brick(node.x*stepWidth, node.y*stepHeight, ch);
                    node.brick=fieldType;
                    bricks.push(fieldType);
                    container.addChild(fieldType);
                }
            });
            shap.graphics.beginFill("#fff").drawRect(0,0,container.width,container.height);
            container.addChildToFloor(shap);
        }
        waitComplete() {
            // container.player.plus(0,stepHeight-container.player.rect.height);
            stage.addChild(container, this.scoreBoard);
        }
        runGame() {
            // console.time("a");
            let l=container.actors.length;
            for (let i = l - 1; i >= 0; i--) {
                const actor = container.actors[i];
                actor.act();
            }
            // console.timeEnd("a");
        }
        clear() {
            container.clear();
        }
    }
    window.Bounce = Bounce;

    class Pandle extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "player";
            this.color = "#555";
            this.xspeed = 7.5;
            this.init(150, 15);
        }
        act() {
            this.moveX();
        }
        moveX() {
            this.speed.x = 0;
            if (pressed[pressed.length - 1] == "left") {
                this.speed.x = -this.xspeed;
            } else if (pressed[pressed.length - 1] == "right") {
                this.speed.x = this.xspeed;
            }
            var rect=this.rect.clone();
            rect.x+=this.speed.x;
            rect.y+=this.speed.y;
            if (!container.hitMap(rect)) {
                this.plus(this.speed.x,0);
            }
        }
    }
    class Puck extends CirActor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speedlength = 7;
            this.speed.length = this.speedlength;
            this.init(15, 15);
            this.speed.angle = Math.PI / 2;
            this.combo = 0;
            this.homePos = this.rect.clone();
        }
        act() {
            this.moveX();
            this.moveY();
            var actor=this.hitActors(container.actors);
            if (actor) {
                this.hitResult(actor);
            }
        }
        moveX() {
            let rect=this.rect.clone();
            rect.x+=this.speed.x;
            var fieldType = container.hitMap(rect);
            if(!fieldType){
                this.plus(this.speed.x,0);
            }else if (fieldType.brick) {
                this.speed.x*=-1;
                this.hitBrickResult(fieldType);
            }else{
                this.combo=0;
                this.speed.x*=-1;
            }
        }
        moveY() {
            let rect=this.rect.clone();
            rect.y+=this.speed.y;
            var fieldType = container.hitMap(rect);
            if (!fieldType) {
                this.plus(0,this.speed.y);
            } else if (fieldType.death ==true) {
                if (lives > 0) {
                    this.setPos(this.homePos.x,this.homePos.y);
                    this.speed.length = this.speedlength;
                    this.speed.angle = Math.PI / 2;
                    lives--;
                    this.dispatchEvent(new ScoreUpdate(LIVES, lives));
                } else {
                    this.dispatchEvent(GFrame.event.GAME_OVER,true);
                }
            } else if (fieldType.brick) {
                this.speed.y *= -1;
                this.hitBrickResult(fieldType);
            }else{
                this.combo = 0;
                this.speed.y *= -1;
            }
        }
        hitBrickResult(fieldType1) {
            let fieldType=fieldType1.brick;
            this.combo++;
            score++;
            let rect=fieldType.rect;
            if (this.combo > 4) {
                score += (this.combo * 10);
                let combotex = new createjs.Text('combo x' + (this.combo * 10), '14px Times', '#ff0000');
                combotex.regX = combotex.getBounds().width / 2;
                combotex.regY = combotex.getBounds().height / 2;
                combotex.x = fieldType.x + rect.width / 2;
                combotex.y = fieldType.y + rect.height / 2;
                combotex.alpha = 0;
                this.parent.addChild(combotex);
                createjs.Tween.get(combotex).to({
                    alpha: 1,
                    scaleY: 2,
                    scaleX: 2,
                    y: combotex.y - 60
                }, 1000).call(() => {
                    this.parent.removeChild(combotex);
                });
            }
            this.dispatchEvent(new ScoreUpdate(SCORE, score));
            if (fieldType.type == "live") {
                lives++;
                this.dispatchEvent(new ScoreUpdate(LIVES, lives));
            }
            bricks.splice(bricks.indexOf(fieldType), 1);
            fieldType1.walkable=true;
            fieldType.parent.removeChild(fieldType);
            if (bricks.length == 0) {
                this.dispatchEvent(GFrame.event.LEVEL_UP,true);
            }
        }

        hitResult(actor) {
            let rect=this.rect;
            if (actor.type == "player") {
                let rect1=actor.rect;
                console.log(rect.y-this.y);
                this.combo = 0;
                this.speed.length = this.speedlength + Math.abs(rect.x - rect1.x - rect1.width / 2) * 0.15;
                this.speed.angle = 210 * Math.PI / 180 + (rect.x - rect1.x) / rect1.width * 120 * Math.PI / 180;
            } else if (actor.type == "angleBounce") {
                actor.hitAngleBounce(this);
            }
        }
    }
    class Brick extends Actor {
        constructor(xpos, ypos, ch) {
            super(xpos, ypos);
            if (ch == "x") {
                this.color = createjs.Graphics.getHSL(Math.cos((count++) * 0.1) * 30 + colorOffse,
                80,
                35,
                1);
                this.type = "brick";
                this.init(stepWidth,stepHeight);
            } else if (ch == "l") {
                this.color = "#595";
                this.type = "live";
                this.init(stepWidth,stepHeight);
                var text = new createjs.Text('1Up', "24px Times", '#fff');
                text.textAlign = "center";
                text.textBaseline = "middle";
                this.addChild(text);
            }
        }
    }
    class AngleBounce extends BounceActor{
            constructor(xpos,ypos){
                super(xpos,ypos);
                this.init(200,20);
            }
    
        }

})();