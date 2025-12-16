import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,b2,vec,flag=false;
export class Awake extends AbstractDemo {
    constructor() {
        super("下面的矩形为演示刚体");
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(250,300,80,80);
        b1.SetAwake(flag);
        game.editValue(b1.IsAwake());

        b2=EasyBody.createBox(250,100,80,80);
    }
    reset(){
        // b1.SetAwake(flag);
        // vec.Set(250/PTM,300/PTM)
        // b1.SetTransform(vec,0);
        // game.editValue(b1.IsAwake());
        
        // vec.Set(250/PTM,100/PTM);
        // b2.SetTransform(vec,0);
        // b2.SetAwake(true)
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