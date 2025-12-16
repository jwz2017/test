import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1, b2,vec;
export class position extends AbstractDemo {
    constructor() {
        super("按下W键，为刚体设置一个随机的坐标");
        vec=vec||new b2Vec2();
    }
    ready() {
        b1 = EasyBody.createBox(50, 200, 50, 50);
        game.editValue("b2Vec2(" + Math.round(b1.GetPosition().x) +
            "," + Math.round(b1.GetPosition().y) + ")");
        }
        reset(){
            vec.Set((Math.random()*400+50)/PTM,(Math.random()*250+50)/PTM);
            b1.SetTransform(vec,0);
            b1.SetAngularVelocity(0);
            b1.SetAwake(true);
            vec.SetZero();
            b1.SetLinearVelocity(vec);
            game.editValue("b2Vec2(" + Math.round(b1.GetPosition().x) +
                "," + Math.round(b1.GetPosition().y) + ")");
    }
    onKeyDown(c){
        if(c=="reset"){
            this.reset();
        }
    }
}