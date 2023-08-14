import { SteeredActor, Vector } from "../../classes/actor.js";
import { gframe, stage } from "../../classes/gframe.js";

var vehicle, path, shape;
export class PathTest extends gframe.Game {
    constructor() {
        super("路径跟随");
    }
    waitComplete() {
        shape = new createjs.Shape();
        vehicle = new SteeredActor();
        vehicle.init(15);
        stage.addChild(shape, vehicle);

        path = [];
        stage.addEventListener("stagemousedown", (e) => {
            this.mouseDown(e)
        });
    }
    runGame() {
        vehicle.followPath(path, true);
        vehicle.act();
    }
    mouseDown(e) {
        shape.graphics.setStrokeStyle(1).beginStroke("#fff");
        if (path.length == 0) {
            shape.graphics.moveTo(stage.mouseX, stage.mouseY);
        }
        shape.graphics.
            lineTo(stage.mouseX, stage.mouseY).
            drawCircle(stage.mouseX, stage.mouseY, 10).
            endStroke();
        moveTo(stage.mouseX, stage.mouseY);
        path.push(new Vector(stage.mouseX, stage.mouseY));

    }

}