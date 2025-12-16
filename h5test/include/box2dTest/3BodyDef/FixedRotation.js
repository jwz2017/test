import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,b2,flag=false;
export class FixedRotation extends AbstractDemo {
    constructor() {
        super("FixedRotation=true时，刚体的角度将保持不变");
    }
    ready(){
        b1=EasyBody.createBox(250,100,80,80);
        b2=EasyBody.createRegular(230,300,40,3,1);
        b1.SetFixedRotation(flag);
        game.editValue(b1.IsFixedRotation());
    }
    reset(){
        game.update();
        this.ready();
    }
    onKeyDown(c){
        if(c=="reset"){
            flag=!flag;
            this.reset();
        }
    }
}