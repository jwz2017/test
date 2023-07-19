(function () {
    "use strict";
    //游戏变量;
    var vehicle;
    class WanderTest extends Game {
        constructor() {
            super("漫游行为");
        }
        waitComplete() {
            vehicle=new SteeredActor(200,200);
            vehicle.init(15);
            stage.addChild(vehicle);
            
        }
        runGame() {
            vehicle.wander();
            vehicle.act();
        }

    }
    window.WanderTest = WanderTest;
})();