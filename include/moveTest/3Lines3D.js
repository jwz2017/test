import { Point3D } from "../../classes/3DClass.js";
import { Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";

var points, vpX, vpY, shape,
    numPoints = 50, fl = 250;
export class Lines3D extends Game {
    constructor() {
        super("3D线条");
    }
    waitComplete() {
        shape = new createjs.Shape();
        stage.addChild(shape);
        vpX = stage.width / 2;
        vpY = stage.height / 2;
        points = [];
        for (let i = 0; i < numPoints; i++) {
            const point = new Point3D(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100);
            point.setVanishingPoint(vpX, vpY);
            // point.setCenter(100,100)
            points.push(point);
        }
    }
    runGame() {
        var angleX = (stage.mouseY - vpY) * .001;
        var angleY = (stage.mouseX - vpX) * .001;
        for (let i = 0; i < numPoints; i++) {
            const point = points[i];
            point.rotateX(angleX);
            point.rotateY(angleY);
        }
        shape.graphics.clear().beginStroke("#fff").
            moveTo(points[0].screenX, points[0].screenY);
        for (let i = 1; i < numPoints; i++) {
            shape.graphics.lineTo(points[i].screenX, points[i].screenY);

        }
    }

}