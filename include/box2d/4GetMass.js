import { stage, gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
//游戏变量;
var bird, birdVelocity, impulse, force, isApplyForce;
export class GetMass extends Game {
    constructor() {
        super("GetMass");
        gframe.buildWorld(true);
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        bird = EasyBody.createBox(20, 350, 20, 20);
        birdVelocity = new b2Vec2(4, -6);
        bird.SetLinearVelocity(birdVelocity);

        impulse = new b2Vec2(10, -10);
        isApplyForce=false;
        force=copyVec2(world.GetGravity());
        force.y = -force.y;
        scaleVec2(force,bird.GetMass())
    }
    waitComplete() {
        stage.on("stagemousedown", () => {
            impulse=scaledVec2(bird.GetLinearVelocity(),10)
            bird.ApplyLinearImpulse(impulse, bird.GetPosition());
            isApplyForce = true;
        })
    }
    runGame() {
        world.ClearForces();
        if(isApplyForce){
            bird.ApplyForce(force,bird.GetPosition());
        }

    }

}
