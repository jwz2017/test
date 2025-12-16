import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1,b2,b3,b4,flag,f1,vec;
export class Density extends AbstractDemo {
    constructor() {
        super("上面的矩形为演示刚体，density越大，\n物体的惯性也就越大",0);
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(300,200,50,50);
        b2=EasyBody.createBox(300,300,50,50);
        b3=EasyBody.createCircle(50,200,10);
        b4=EasyBody.createCircle(50,300,10);

        f1=b1.GetFixtureList();

        vec.Set(10,0)
        b3.SetLinearVelocity(vec);
        b4.SetLinearVelocity(vec);
        game.editValue(f1.GetDensity());
    }
    reset(){
        b1.SetAwake(true);
        b2.SetAwake(true);
        b3.SetAwake(true);
        b4.SetAwake(true);

        vec.Set(300/PTM,200/PTM);
        b1.SetTransform(vec,0);
        vec.Set(300/PTM,300/PTM);
        b2.SetTransform(vec,0);
        vec.Set(50/PTM,200/PTM);
        b3.SetTransform(vec,0);
        vec.Set(50/PTM,300/PTM);
        b4.SetTransform(vec,0);

        vec.SetZero();
        b1.SetLinearVelocity(vec);
        b2.SetLinearVelocity(vec);
        vec.Set(10,0);
        b3.SetLinearVelocity(vec);
        b4.SetLinearVelocity(vec);
    }
    onKeyDown(c){
        if(c=="reset"){
            this.reset();
            flag=!flag;
            if(flag){
                f1.SetDensity(100)
                b1.ResetMassData();
            }else{
                f1.SetDensity(0);
                b1.ResetMassData();
            }
            game.editValue(f1.GetDensity())
        }
    }
}