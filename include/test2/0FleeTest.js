(function () {
    "use strict";
    //游戏变量;
    var vehicle;
    class VehiclFlee extends Game {
        constructor() {
            super("机车逃离测试");
        }
        waitComplete() {
            vehicle=new SteeredActor(200,200);
            vehicle.speed.zero();
            vehicle.edgeBehavior=Actor.BOUNCE;
            stage.addChild(vehicle);
        }
        runGame() {
            vehicle.flee(new Vector(stage.mouseX,stage.mouseY));
            vehicle.act()
        }

    }
    window.VehiclFlee = VehiclFlee;
})();