import { Point3D } from "../../classes/3DClass.js";
import { gframe, stage } from "../../classes/gframe.js";

var points, vpX, vpY, shape,
    numPoints = 4;
export class Square3D extends gframe.Game {
    constructor() {
        super("3d正方形");
    }
    waitComplete() {
        vpX = stage.width / 2;
        vpY =stage.height / 2;
        points = [];
        shape = new createjs.Shape();
        stage.addChild(shape);
        //正方形
        // numPoints=4;
        // points[0]=new Point3D(-100,-100,100);
        // points[1]=new Point3D(100,-100,100);
        // points[2]=new Point3D(100,100,100);
        // points[3]=new Point3D(-100,100,100);
        //字母E
        numPoints = 12;
        points[0] = new Point3D(-150, -250, 100);
        points[1] = new Point3D(150, -250, 100);
        points[2] = new Point3D(150, -150, 100);
        points[3] = new Point3D(-50, -150, 100);
        points[4] = new Point3D(-50, -50, 100);
        points[5] = new Point3D(50, -50, 100);
        points[6] = new Point3D(50, 50, 100);
        points[7] = new Point3D(-50, 50, 100);
        points[8] = new Point3D(-50, 150, 100);
        points[9] = new Point3D(150, 150, 100);
        points[10] = new Point3D(150, 250, 100);
        points[11] = new Point3D(-150, 250, 100);
        for (let i = 0; i < numPoints; i++) {
            points[i].setVanishingPoint(vpX, vpY);
            points[i].setCenter(0, 0, 200);
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
        shape.graphics.clear().beginStroke("#000").
            beginFill("#ffcccc").
            moveTo(points[0].screenX, points[0].screenY);
        for (let i = 1; i < numPoints; i++) {
            shape.graphics.lineTo(points[i].screenX, points[i].screenY);
        };
        shape.graphics.closePath();
        shape.graphics.endFill();

    }

}