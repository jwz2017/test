import { Game } from "../../classes/Game.js";
import { MoveManage, SteeredActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";

var vehicle, path, shape;
var moveManage=new MoveManage();
export class PathTest extends Game {
    constructor() {
        super("路径跟随");
    }
    waitComplete() {
        shape = new createjs.Shape();
        vehicle = new SteeredActor();
        stage.addChild(shape, vehicle);

        path = [];
        stage.addEventListener("stagemousedown", (e) => {
            this.mouseDown(e)
        });
    }
    runGame() {
        moveManage.followPath(vehicle,path, true);
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