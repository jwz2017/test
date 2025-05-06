import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,b2,interval=0,particle,typeList=[],typeIndex,speedx=5,vec;
export class Type extends AbstractDemo {
    constructor() {
        super("b2_kinematicBody是一种可以动的静态刚体，\n可以通过SetLinearVelocity设置它的速度");
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(250,200,200,40);
        typeList=[2,1,0];
        typeIndex=0;
        game.editValue(2);
    }
    reset(){
        vec.Set(250/PTM,200/PTM);
        b1.SetTransform(vec,0);
        b1.SetAngularVelocity(0);
        vec.SetZero();
        b1.SetLinearVelocity(vec);

    }
    update(){
        if(interval>20){
            particle=EasyBody.createBox(Math.random()*100+150,30,20,20);
            particle.SetUserData(1)
            interval=0;
        }else{
            interval++;
        }
        if(typeIndex==1){
            if(b1.GetPosition().x>350/PTM||b1.GetPosition().x<150/PTM){
                speedx*=-1;
                vec.Set(speedx,0);
                b1.SetLinearVelocity(vec);
            }
        }
    }
    onKeyDown(c){
        if(c!="reset")return;
        this.reset();
        if(++typeIndex>2)typeIndex=0;
        b1.SetType(typeList[typeIndex])
        if(typeIndex==1){
            vec.Set(speedx,0);
            b1.SetLinearVelocity(vec);
        }
        game.editValue(typeList[typeIndex]);

        var indexBody=world.GetBodyList();
        while(indexBody.a){
            if(indexBody.GetUserData()==1){
                world.DestroyBody(indexBody);
            }
            indexBody=indexBody.GetNext();
        }
    }
}