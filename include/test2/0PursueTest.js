(function () {
    "use strict";
    //游戏变量;
    var seeker,pursuer,target;
    class VehiclPursue extends Game {
        constructor() {
            super("机车追捕");
        }
        waitComplete() {
            seeker=new SteeredActor(400,0);
            seeker.init(15);
            pursuer=new SteeredActor(400,0);
            pursuer.init(15);
            target=new CirActor(200,300);
            target.init(30,30);
            target.edgeBehavior=Actor.WRAP;
            target.speed.length=15;
            stage.addChild(seeker,pursuer,target);
            
        }
        runGame() {
            seeker.seek(target);
            seeker.act();

            pursuer.pursue(target);
            pursuer.act();

            target.act();

        }

    }
    window.VehiclPursue = VehiclPursue;
})();