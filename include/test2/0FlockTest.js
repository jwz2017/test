(function () {
    "use strict";
    //游戏变量;
    var vehicles,numVehicles=30;
    class FlockTest extends Game {
        constructor() {
            super();
            this.titleScreen.setText("群落测试");
        }
        waitComplete() {
            vehicles=[];
            for (let i = 0; i < numVehicles; i++) {
                const vehicle =new SteeredActor();
                vehicle.pos.setValues(Math.random()*mapWidth,Math.random()*mapHeight);
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