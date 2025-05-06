import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1,flag,f1,bodyIndex,interval=0;
export class Friction extends AbstractDemo {
    constructor() {
        super("斜坡为演示刚体，friction取值范围在0~1之间");
    }
    ready(){
        b1=EasyBody.createBox(170,340,300,10);
        EasyWorld.fixBodyAt(b1,70,300);
        f1=b1.GetFixtureList();
        f1.SetFriction(0.1);
        game.editValue(f1.GetFriction());
    }
    update(){
        if(interval>30){
            bodyIndex=EasyBody.createBox(80,50,30,20);
            bodyIndex.SetBullet(true);
            bodyIndex.SetUserData(1);
            interval=0;
        }else{
            interval++;
        }
    }
    reset(){
        bodyIndex=world.GetBodyList();
        while(bodyIndex.a){
            if(bodyIndex.GetUserData()==1){
                world.DestroyBody(bodyIndex);
            }
            bodyIndex=bodyIndex.GetNext();
        }
    }
    onKeyDown(c){
        if(c=="reset"){
            this.reset();
            flag=!flag;
            if(flag){
                f1.SetFriction(0.9);
            }else{
                f1.SetFriction(0.1);
            }
            game.editValue(f1.GetFriction());
        }
    }
}