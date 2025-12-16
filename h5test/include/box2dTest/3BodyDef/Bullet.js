import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "./AbstractDemo.js";
var b1,b2,vec;
export class Bullet extends AbstractDemo {
    constructor() {
        super("Bullet=true时，Box2D对该刚体进行连续碰撞检测，\n左边的刚体将无法穿透中间的障碍");
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(50,200,10,10);
        vec.Set(150*PTM,0);
        b1.SetLinearVelocity(vec)
        b1.SetBullet(false);
        game.editValue(b1.IsBullet());

        b2=EasyBody.createBox(250,200,4,300);

        EasyWorld.fixBodyAt(b2,250,0);
        EasyWorld.fixBodyAt(b2,250,400);
    }
    reset(){
        vec.Set(50/PTM,200/PTM);
        b1.SetTransform(vec,0);
        b1.SetAwake(true);
        vec.Set(150*PTM,0)
        b1.SetLinearVelocity(vec);
    }
    onKeyDown(c){
        if(c=="reset"){
            this.reset();
            b1.SetBullet(!b1.IsBullet());
            game.editValue(b1.IsBullet());
        }
    }
}