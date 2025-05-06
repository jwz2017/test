import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1, f1, shapeIndex = 0;
var shapeList = ["rect", "circle", "triangle", "regular"];
export class Shape extends AbstractDemo {
    constructor() {
        super("shape的修改需要获取b2Shape对象之后进行，\n但不能修改Shape的类型");
    }
    ready() {
        b1 = EasyBody.createBox(250, 250, 40, 30);
        f1 = b1.GetFixtureList();
        game.editValue("rect");
    }
    reset() {
        if (++shapeIndex > 3) shapeIndex = 0;
        game.update();
        switch (shapeList[shapeIndex]) {
            case "rect":
                b1 = EasyBody.createBox(250, 250, 40, 30);
                break;
            case "circle":
                b1 = EasyBody.createCircle(250, 200, 20);
                break;
            case "triangle":
                b1 = EasyBody.createRegular(250, 200, 20, 3);
                EasyBody.createFan(200,200,50,40);
                break;
            case "regular":
                b1 = EasyBody.createRegular(250, 200, 30);
                EasyBody.createSemiCicle(300,200,80,40)
                break;
        }
    }
    onKeyDown(c) {
        if (c == "reset") {
            this.reset();
            game.editValue(shapeList[shapeIndex])
        }
    }
}