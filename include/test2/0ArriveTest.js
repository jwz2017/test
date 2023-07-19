(function () {
    "use strict";
    //游戏变量;
    var vehicle;
    class VehiclArrive extends Game {
        constructor() {
            super("机车到达");
        }
        waitComplete() {
            vehicle=new SteeredActor();
            vehicle.init(15,15);
            stage.addChild(vehicle);
        }
        runGame() {
            vehicle.arrive(new Vector(stage.mouseX,stage.mouseY));
            vehicle.act();
        }

    }
    window.VehiclArrive = VehiclArrive;
})();