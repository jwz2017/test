import { Light, Point3D, Triangle } from "../../classes/3DClass.js";
import { Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";

var points, triangles, vpX, vpY, shape, light,
    color = "#ffcccc";
export class Triangles extends Game{
    constructor() {
        super("三角绘制");
    }
    waitComplete() {
        light = new Light();
        shape = new createjs.Shape();
        stage.addChild(shape);
        points = [];
        triangles = [];
        vpX = stage.width / 2;
        vpY = stage.height / 2;
        points[0] = new Point3D(-50, -250, -50);
        points[1] = new Point3D(50, -250, -50);
        points[2] = new Point3D(200, 250, -50);
        points[3] = new Point3D(100, 250, -50);
        points[4] = new Point3D(50, 100, -50);
        points[5] = new Point3D(-50, 100, -50);
        points[6] = new Point3D(-100, 250, -50);
        points[7] = new Point3D(-200, 250, -50);
        points[8] = new Point3D(0, -150, -50);
        points[9] = new Point3D(50, 0, -50);
        points[10] = new Point3D(-50, 0, -50);
        points[11] = new Point3D(-50, -250, 50);
        points[12] = new Point3D(50, -250, 50);
        points[13] = new Point3D(200, 250, 50);
        points[14] = new Point3D(100, 250, 50);
        points[15] = new Point3D(50, 100, 50);
        points[16] = new Point3D(-50, 100, 50);
        points[17] = new Point3D(-100, 250, 50);
        points[18] = new Point3D(-200, 250, 50);
        points[19] = new Point3D(0, -150, 50);
        points[20] = new Point3D(50, 0, 50);
        points[21] = new Point3D(-50, 0, 50);
        for (let i = 0; i < points.length; i++) {
            points[i].setVanishingPoint(vpX, vpY);
            points[i].setCenter(0, 0, 200);
        }
        triangles[0] = new Triangle(points[0], points[1], points[8], "#6666cc");
        triangles[1] = new Triangle(points[1], points[9], points[8], "#6666cc");
        triangles[2] = new Triangle(points[1], points[2], points[9], "#6666cc");
        triangles[3] = new Triangle(points[2], points[4], points[9], "#6666cc");
        triangles[4] = new Triangle(points[2], points[3], points[4], "#6666cc");
        triangles[5] = new Triangle(points[4], points[5], points[9], "#6666cc");
        triangles[6] = new Triangle(points[9], points[5], points[10], "#6666cc");
        triangles[7] = new Triangle(points[5], points[6], points[7], "#6666cc");
        triangles[8] = new Triangle(points[5], points[7], points[10], "#6666cc");
        triangles[9] = new Triangle(points[0], points[10], points[7], "#6666cc");
        triangles[10] = new Triangle(points[0], points[8], points[10], "#6666cc");
        triangles[11] = new Triangle(points[11], points[19], points[12], "#cc6666");
        triangles[12] = new Triangle(points[12], points[19], points[20], "#cc6666");
        triangles[13] = new Triangle(points[12], points[20], points[13], "#cc6666");
        triangles[14] = new Triangle(points[13], points[20], points[15], "#cc6666");
        triangles[15] = new Triangle(points[13], points[15], points[14], "#cc6666");
        triangles[16] = new Triangle(points[15], points[20], points[16], "#cc6666");
        triangles[17] = new Triangle(points[20], points[21], points[16], "#cc6666");
        triangles[18] = new Triangle(points[16], points[18], points[17], "#cc6666");
        triangles[19] = new Triangle(points[16], points[21], points[18], "#cc6666");
        triangles[20] = new Triangle(points[11], points[18], points[21], "#cc6666");
        triangles[21] = new Triangle(points[11], points[21], points[19], "#cc6666");
        triangles[22] = new Triangle(points[0], points[11], points[1], "#cccc66");
        triangles[23] = new Triangle(points[11], points[12], points[1], "#cccc66");
        triangles[24] = new Triangle(points[1], points[12], points[2], "#cccc66");
        triangles[25] = new Triangle(points[12], points[13], points[2], "#cccc66");
        triangles[26] = new Triangle(points[3], points[2], points[14], "#cccc66");
        triangles[27] = new Triangle(points[2], points[13], points[14], "#cccc66");
        triangles[28] = new Triangle(points[4], points[3], points[15], "#cccc66");
        triangles[29] = new Triangle(points[3], points[14], points[15], "#cccc66");
        triangles[30] = new Triangle(points[5], points[4], points[16], "#cccc66");
        triangles[31] = new Triangle(points[4], points[15], points[16], "#cccc66");
        triangles[32] = new Triangle(points[6], points[5], points[17], "#cccc66");
        triangles[33] = new Triangle(points[5], points[16], points[17], "#cccc66");
        triangles[34] = new Triangle(points[7], points[6], points[18], "#cccc66");
        triangles[35] = new Triangle(points[6], points[17], points[18], "#cccc66");
        triangles[36] = new Triangle(points[0], points[7], points[11], "#cccc66");
        triangles[37] = new Triangle(points[7], points[18], points[11], "#cccc66");
        triangles[38] = new Triangle(points[8], points[9], points[19], "#cccc66");
        triangles[39] = new Triangle(points[9], points[20], points[19], "#cccc66");
        triangles[40] = new Triangle(points[9], points[10], points[20], "#cccc66");
        triangles[41] = new Triangle(points[10], points[21], points[20], "#cccc66");
        triangles[42] = new Triangle(points[10], points[8], points[21], "#cccc66");
        triangles[43] = new Triangle(points[8], points[19], points[21], "#cccc66");
        for (let i = 0; i < triangles.length; i++) {
            triangles[i].light = light;
        }
    }
    runGame() {
        let angleX = (stage.mouseY - vpY) * .001;
        let angleY = (stage.mouseX - vpX) * .001;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point.rotateX(angleX);
            point.rotateY(angleY);
        }
        triangles.sort(function (a, b) {
            return b.depth - a.depth;
        });
        shape.graphics.clear();
        for (let i = 0; i < triangles.length; i++) {
            triangles[i].draw(shape.graphics)
        }
    }

}