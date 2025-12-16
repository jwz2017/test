import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1;
export class DemoAngle extends AbstractDemo {
    constructor() {
        super("按下W键设置随机的角度值");
    }
    ready(){
        b1=EasyBody.createPlatform(250,200,40,80,2);
        game.editValue(b1.GetAngle().toString());
    }
    onKeyDown(c){
        if(c=="reset"){
            b1.SetAwake(true);
            b1.SetTransform(b1.GetPosition(),Math.random()*Math.PI*2);
            game.editValue(Math.round(b1.GetAngle()*100)/100)
        }
    }
}