import { Light, Point3D, Triangle } from "../../classes/3DClass.js";
import { Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";

var points, triangles, vpX, vpY, shape, light;
export class Cube extends Game {
    constructor() {
        super("正方体");
    }
    waitComplete() {
        shape = new createjs.Shape();
        stage.addChild(shape);
        points = [];
        triangles = [];
        vpX = stage.width / 2;
        vpY = stage.height / 2;
        //正方体
        //前面四个角
        points[0] = new Point3D(-100, -100, -100);
        points[1] = new Point3D(100, -100, -100);
        points[2] = new Point3D(100, 100, -100);
        points[3] = new Point3D(-100, 100, -100);
        //后面四个角
        points[4] = new Point3D(-100, -100, 100);
        points[5] = new Point3D(100, -100, 100);
        points[6] = new Point3D(100, 100, 100);
        points[7] = new Point3D(-100, 100, 100);
        for (let i = 0; i < points.length; i++) {
            points[i].setVanishingPoint(vpX, vpY);
            points[i].setCenter(0, 0, 200);

        }
        //font
        triangles[0] = new Triangle(points[0], points[1], points[2], "#6666cc");
        triangles[1] = new Triangle(points[0], points[2], points[3], "#6666cc");
        //top
        triangles[2] = new Triangle(points[0], points[5], points[1], "#66cc66");
        triangles[3] = new Triangle(points[0], points[4], points[5], "#66cc66");
        //back
        triangles[4] = new Triangle(points[4], points[6], points[5], "#cc6666");
        triangles[5] = new Triangle(points[4], points[7], points[6], "#cc6666");
        //bottom
        triangles[6] = new Triangle(points[3], points[2], points[6], "#cc66cc");
        triangles[7] = new Triangle(points[3], points[6], points[7], "#cc66cc");
        //right
        triangles[8] = new Triangle(points[1], points[5], points[6], "#66cccc");
        triangles[9] = new Triangle(points[1], points[6], points[2], "#66cccc");
        //left
        triangles[10] = new Triangle(points[4], points[0], points[3], "#cccc66");
        triangles[11] = new Triangle(points[4], points[3], points[7], "#cccc66");
        for (let i = 0; i < triangles.length; i++) {
            triangles[i].light = new Light();

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