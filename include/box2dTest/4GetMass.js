import { stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
//游戏变量;
var bird, birdVelocity, impulse, force, isApplyForce;
export class GetMass extends Box2dGame {
    constructor() {
        super("GetMass");
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        bird = EasyBody.createBox(20, 350, 20, 20);
        birdVelocity = new b2Vec2(4, -6);
        bird.SetLinearVelocity(birdVelocity);

        impulse = new b2Vec2(10, -10);
        isApplyForce=false;
        force=new b2Vec2(0,world.GetGravity().y)
        force.y = -force.y;
        force.op_mul(bird.GetMass())

        stage.on("stagemousedown", () => {
            let v=bird.GetLinearVelocity();
            impulse.Set(v.x*10,v.y);
            bird.ApplyLinearImpulse(impulse, bird.GetPosition());
            isApplyForce = true;
        })
    }
    runGame(e) {
        super.runGame(e);
        if(isApplyForce){
            bird.ApplyForce(force,bird.GetPosition());
        }

    }

}
