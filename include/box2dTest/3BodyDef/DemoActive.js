import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";

var b1,b2,vec;
export class DemoActive extends AbstractDemo{
    constructor() {
        super("下面的矩形是演示刚体，Active=false时，刚体将不参\n与任何的物理模拟");
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(250,300,80,80);
        b1.SetActive(false);
        b1.SetAngularVelocity(1);
        EasyWorld.fixBodyAt(b1,250,300);
        
        b2=EasyBody.createBox(250,100,40,40);
        game.editValue("false")
    }
    reset(){
        vec.Set(250/PTM,300/PTM);
        b1.SetTransform(vec,0);
        b1.SetAngularVelocity(0);
        game.editValue(b1.IsActive().toString())

        vec.Set(250/PTM,100/PTM);
        b2.SetTransform(vec,0);

        b2.SetAngularVelocity(0);
        b2.SetLinearVelocity(vec.SetZero())
        b2.SetAwake(true);
        
    }
    onKeyDown(c){
        if(c=="reset"){
            b1.SetActive(!b1.IsActive());
            this.reset();
        }
    }
}