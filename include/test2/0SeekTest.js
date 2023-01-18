(function () {
    "use strict";
    //游戏变量;
    var vehicle;
    class VehiclSeek extends Game {
        constructor() {
            super();

            this.titleScreen.setText("机车追寻测试");
        }
        waitComplete() {
            vehicle=new SteeredActor();
            stage.addChild(vehicle);
        }
        runGame() {
            vehicle.seek(new Vector(stage.mouseX,stage.mouseY));
            vehicle.act()
        }

    }
    window.VehiclSeek = VehiclSeek;
})();