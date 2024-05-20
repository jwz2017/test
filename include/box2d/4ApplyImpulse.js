import { stage, gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
//游戏变量;
var bird, impulse;
export class ApplyImpulse extends Game {
    constructor() {
        super("ApplyImpulse");
        gframe.buildWorld(true, 5);
        
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
       
        bird = EasyBody.createBox(20, 350, 20, 20);
        bird.SetLinearVelocity(new b2Vec2(4, -6));

        impulse = new b2Vec2();
        impulse.Set(bird.GetMass() * 5, -bird.GetMass() * 10);

        this.trail=new Trail(this.container,bird);

        stage.on("stagemousedown", () => {
            bird.ApplyLinearImpulse(impulse, bird.GetPosition());
            var bullet = EasyBody.createCircle(bird.GetPosition().x * PTM, bird.GetPosition().y * PTM + 20, 5);
            var bulletImpulse = new b2Vec2(0, bullet.GetMass() * 20);
            bullet.ApplyLinearImpulse(bulletImpulse, bullet.GetPosition());
        })
    }
    runGame() {
        this.trail.update();
    }

}
