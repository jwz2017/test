window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.adapt();
    g.preload(Colordrop);
    // FPS.startFPS(stage);
};
(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "score",
        LEVEL = "level",
        colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ewe0ee"];
    var slots, shapes;
    class Colordrop extends Game {
        constructor() {
            super();
            this.titleScreen.setText("Colordrop");
            
            slots = [];
            shapes = [];
            for (let i = 0; i < colors.length; i++) {
                //slot
                const slot = new createjs.Shape();
                slot.com=slot.graphics.setStrokeDash([7,3]).command;
                slot.graphics.beginStroke(colors[i]).beginFill("#fff").drawRect(0, 0, 100, 100);
                slot.regX = slot.regY = 50;
                slot.key = i;
                slot.y = 150;
                slot.x = (i * 130) + 100;
                slots.push(slot);
                //shape
                const shape = new createjs.Shape();
                shape.graphics.beginFill(colors[i]).drawRect(0, 0, 100, 100);
                shape.regX = shape.regY = 50;
                shape.key = i;
                shapes.push(shape);
            }
        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard(0, 0);
            this.scoreBoard.createTextElement(SCORE, '0', 20, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 14);
        }
        newGame() {
            score = 0;
            this.scoreBoard.update(SCORE, score);

        }
        newLevel() {
            this.scoreBoard.update(LEVEL, this.level);
        }
        waitComplete() {
            stage.addChild(this.scoreBoard);
            //Array随机排序
            utils.randomArray(shapes);

            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];
                const slot = slots[i];
                stage.addChild(slot);
                shape.y = shape.homeY = 390;
                shape.x = shape.homeX = (i * 130) + 100;
                stage.addChild(shape);

                shape.addEventListener("pressmove", function (e) {
                    stage.setChildIndex(shape, stage.numChildren - 1);
                    shape.x = e.stageX;
                    shape.y = e.stageY;
                });
                shape.addEventListener("pressup", (e) => {
                    const slot = slots[shape.key];
                    const pt = slot.globalToLocal(stage.mouseX, stage.mouseY);
                    console.log(pt.x,stage.mouseX);
                    if (slot.hitTest(pt.x, pt.y)) {
                        shape.removeAllEventListeners("pressmove");
                        shape.removeAllEventListeners("pressup");
                        score += 1;
                        this.updateScoreBoard(SCORE, score);

                        createjs.Tween.get(shape).to({
                            x: slot.x,
                            y: slot.y
                        }, 200, createjs.Ease.QuadOut).call(()=> {
                            if (score == 5) {
                                this.clear();
                                this.levelUp=true;
                            }
                        }, null, this);
                    } else {
                        createjs.Tween.get(shape).to({
                            x: shape.homeX,
                            y: shape.homeY
                        }, 200, createjs.Ease.QuadOut);
                    }

                });

            }
        }
        runGame() {
            for (const i of slots) {
                i.com.offset++
            }
        }
        clear() {
            shapes.forEach((element, item) => {

                if (shapes[item].hasEventListener("pressmove")) {
                    shapes[item].removeAllEventListeners();
                    console.log("remove");
                }
            });
        }

    }
    Colordrop.loaded = false;
    Colordrop.loadItem = null;
    window.Colordrop = Colordrop;
})();


