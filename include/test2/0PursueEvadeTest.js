(function () {
    "use strict";
    //游戏变量;
    var pursuer,evader;
    class PursueEvade extends Game {
        constructor() {
            super();
            this.titleScreen.setText("追捕和躲避测试");
            
        }
        waitComplete() {
            pursuer=new SteeredActor(200,200);
            pursuer.edgeBehavior=Actor.BOUNCE;

            evader=new SteeredActor(400,300);
            evader.edgeBehavior=Actor.BOUNCE;
            stage.addChild(pursuer,evader);
        }
        runGame() {
            pursuer.pursue(evader);
            evader.evade(pursuer);
            pursuer.act();
            evader.act();
        }
    }
    window.PursueEvade = PursueEvade;
})();