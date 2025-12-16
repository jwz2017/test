import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,angularDamping=0.1;
export class AngularDamping extends AbstractDemo {
    constructor() {
        super("角速度阻尼值，AngularDamping的取值范围在0~1之间");
    }
    ready(){
        b1=EasyBody.createBox(250,200,80,80);
        b1.SetAngularDamping(angularDamping);
        b1.SetAngularVelocity(Math.PI/6*PTM);
        game.editValue(b1.GetAngularDamping().toString());
    }
    onKeyDown(c){
        if(c=="reset"){
            b1.SetAngularDamping(1-b1.GetAngularDamping());
            b1.SetAwake(true);
            b1.SetAngularVelocity(Math.PI/6*PTM);
            game.editValue(b1.GetAngularDamping().toString());
        }
    }
}