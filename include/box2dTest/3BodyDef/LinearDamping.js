import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,b2,flag=false,vec;
export class LinearDamping extends AbstractDemo {
    constructor() {
        super("上面的矩形为演示刚体");
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(50,200,50,50);
        vec.Set(5,0);
        b1.SetLinearVelocity(vec)

        b2=EasyBody.createBox(50,300,50,50);
        vec.Set(5,0);
        b2.SetLinearVelocity(vec);
        game.editValue(b1.GetLinearDamping());
    }
    reset(){
        vec.Set(50/PTM,200/PTM);
        b1.SetTransform(vec,0);
        b1.SetAwake(true);
        vec.Set(5,0);
        b1.SetLinearVelocity(vec);

        vec.Set(50/PTM,300/PTM);
        b2.SetTransform(vec,0);
        b2.SetAwake(true);
        vec.Set(5,0);
        b2.SetLinearVelocity(vec);
    }
    onKeyDown(c){
        if(c!="reset")return;
        this.reset();
        flag=!flag;
        if(flag){
            b1.SetLinearDamping(.8);
        }else{
            b1.SetLinearDamping(0);
        }
        game.editValue(b1.GetLinearDamping())
    }
}