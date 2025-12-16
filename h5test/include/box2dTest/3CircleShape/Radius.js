import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1,s1;
export class Radius extends AbstractDemo {
    constructor() {
        super("调整圆形的半径大小");
    }
    ready(){
        b1=EasyBody.createCircle(250,100,30);
        s1=b1.GetFixtureList().GetShape();
        game.editValue(Math.round(s1.get_m_radius()*10)/10)
    }
    reset(){
        b1.SetAwake(true);
        s1.set_m_radius((Math.random()*30+30)/PTM);
    }
    onKeyDown(c){
        if(c=="reset"){
            this.reset();
            game.editValue((Math.round(s1.get_m_radius()*10)/10))
        }
    }
}