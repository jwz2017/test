window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    GFrame.style.TITLE_TEXT_COLOR="#ffffff";
    var g = new GFrame('canvas');
    g.adapt();
    var loader = new createjs.FontLoader({
        src: ["assets/fonts/regul-book.woff",
            "assets/fonts/regul-bold.woff"
        ]
    });
    loader.on("complete", () => {
        g.preload(SpaceHero);
        g.startFPS();
    }, null, true);
    loader.load();
};
(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";

    class SpaceHero extends Game {
        constructor() {
            super();
            this.titleScreen.setTitleSprite(queue.getResult("all"),"title");

        }
        /**建立游戏元素游戏初始化
         * 在构造函数内建立
         */
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard();
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
            this.player=new HeroShip(new Vector(width/2,height-100));

            stage.addChild(this.player,this.scoreBoard);
        }
        runGame() {

        }
        clear() {
            // this.container.removeAllChildren();

        }

    }
    SpaceHero.loadItem = [{
        id:"all",
        src:"spacehero/all.json",
        type:"spritesheet"
    }];
    SpaceHero.loaderbar = null;
    window.SpaceHero = SpaceHero;

    class HeroShip extends HitActor{
            constructor(pos){
                super(pos);
                this.setSize(100,100);
                this.setSpriteData(queue.getResult("all"),"heroIdle");
            }
            
    
        }
})();