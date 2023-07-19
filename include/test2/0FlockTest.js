(function () {
    "use strict";
    //游戏变量;
    var vehicles,numVehicles=30;
    class FlockTest extends Game {
        constructor() {
            super("群落测试");
        }
        waitComplete() {
            vehicles=[];
            for (let i = 0; i < numVehicles; i++) {
                const vehicle =new SteeredActor();
                vehicle.init(15);
                vehicle.setPos(Math.random()*width,Math.random()*height);
                vehicle.speed.setValues(Math.random()*20-10,Math.random()*20-10);
                vehicle.edgeBehavior=Actor.BOUNCE;
                vehicles.push(vehicle);
                stage.addChild(vehicle);
            }
        }
        runGame() {
            for (let i = 0; i < numVehicles; i++) {
                vehicles[i].flock(vehicles);
                vehicles[i].act();
            }
        }

    }
    window.FlockTest = FlockTest;
})();