import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,flag=false,interval=0,md,particle;
export class InertiaScale extends AbstractDemo {
    constructor() {
        super("InertiaScale的设置要通过b2MassData.I来设置，\nInertiaScale越大，刚体旋转的惯性越大");
        md=md||new b2MassData();
    }
    ready(){
        b1=EasyBody.createBox(250,200,80,80);
        b1.SetAngularVelocity(5/180*Math.PI*PTM);
        EasyWorld.fixBodyAt(b1,250,200);

        md.I=10;
        b1.SetMassData(md);
        game.editValue("10");
    }
    update(){
        if(interval>20){
            particle=EasyBody.createBox(210,30,20,20);
            particle.SetUserData(1);
            interval=0;
        }else interval++;
    }
    onKeyDown(c){
        if(c!="reset")return;
        flag=!flag;
        if(flag){
            md.I=100;
            game.editValue("100")
        }else{
            md.I=10;
            game.editValue("10")
        }
        let indexBody=world.GetBodyList();
        while(indexBody.a){
            if(indexBody.GetUserData()==1){
                world.DestroyBody(indexBody);
            }
            indexBody=indexBody.GetNext();
        }
        console.log("刚体数量" + world.GetBodyCount());
        b1.SetAngularVelocity(5/180*Math.PI*PTM);
        b1.SetMassData(md);
    }
}