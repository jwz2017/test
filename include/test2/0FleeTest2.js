(function () {
    "use strict";
    //游戏变量;
    var vehicleA,vehicleB,vehicleC;
    class FleeTest2 extends Game {
        constructor() {
            super();
            this.titleScreen.setText("逃离测试2");
        }
        waitComplete() {
            vehicleA=new SteeredActor(200,200);
            vehicleA.edgeBehavior=Actor.BOUNCE;

            vehicleB=new SteeredActor(400,200);
            vehicleB.edgeBehavior=Actor.BOUNCE;

            vehicleC=new SteeredActor(300,260);
            vehicleC.edgeBehavior=Actor.BOUNCE;
            stage.addChild(vehicleA,vehicleB,vehicleC);
        }
        runGame() {
            vehicleA.seek(vehicleB.pos);
            vehicleA.flee(vehicleC.pos);

            vehicleB.seek(vehicleC.pos);
            vehicleB.flee(vehicleA.pos);

            vehicleC.seek(vehicleA.pos);
            vehicleC.flee(vehicleB.pos);
            vehicleA.act();
            vehicleB.act();
            vehicleC.act();
        }

    }
    window.FleeTest2 = FleeTest2;
})();