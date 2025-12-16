import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1,flag,f1,bodyIndex,interval=0;
export class Restitution extends AbstractDemo {
    constructor() {
        super("斜坡为演示刚体，Restitution取值范围在0~1之间,\n值越大弹性越好");
    }
    ready(){
        b1=EasyBody.createBox(180,300,300,10);
        EasyWorld.fixBodyAt(b1,20,250);
        f1=b1.GetFixtureList();
        f1.SetRestitution(0.1);
        game.editValue(f1.GetRestitution());
    }
    update(){
        if(interval>30){
            bodyIndex=EasyBody.createBox(80,50,20,20);
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
                f1.SetRestitution(0.9)
            }else{
                f1.SetRestitution(0.1)
            }
            game.editValue(f1.GetRestitution());
        }
    }
}