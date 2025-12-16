import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,b2,vec;
export class AllowSleep extends AbstractDemo{
    constructor() {
        super("左侧矩形为演示刚体，待刚体静止时查看效果");
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(100,100,80,80);
        b1.SetSleepingAllowed(false);
        game.editValue(b1.IsSleepingAllowed().toString());
        b2=EasyBody.createBox(400,100,80,80);
    }
    reset(){
        vec.Set(100/PTM,100/PTM)
        b1.SetTransform(vec,0);

        vec.Set(400/PTM,100/PTM)
        b2.SetTransform(vec,0);
        b2.SetAwake(true);
    }
    onKeyDown(c){
        if(c=="reset"){
            b1.SetSleepingAllowed(!b1.IsSleepingAllowed());
            this.reset();
            game.editValue(b1.IsSleepingAllowed().toString())
        }
    }
}