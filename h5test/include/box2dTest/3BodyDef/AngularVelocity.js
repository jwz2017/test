import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,angleSpeed,flag=false;
export class AngularVelocity extends AbstractDemo {
    constructor() {
        super("按下 W 键变化角速度值");
    }
    ready(){
        b1=EasyBody.createBox(250,200,80,80);
        angleSpeed=5/180*Math.PI*PTM;
        b1.SetAngularVelocity(angleSpeed);
        game.editValue(Math.round(b1.GetAngularVelocity()))
    }
    onKeyDown(c){
        if(c=="reset"){
            flag=!flag;
            if(flag){
                b1.SetAngularVelocity(-angleSpeed);
            }else{
                b1.SetAngularVelocity(angleSpeed);
            }
            game.editValue(Math.round(b1.GetAngularVelocity()))
        }
    }
}