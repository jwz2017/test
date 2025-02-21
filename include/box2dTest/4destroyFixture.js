import { stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
//游戏变量;

export class DestroyFixture extends Box2dGame {
    constructor() {
        super("DestroyFixture");
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        this.body = EasyBody.createBox(stage.width / 2, stage.height / 2, 30, 30);
        EasyWorld.fixBodyAt(this.body, stage.width / 2, stage.height / 2);
        this.body.SetAngularVelocity(Math.PI / 3);
        this.addFixture();

        stage.on("stagemousedown", () => {
            var a=3;
            if (this.body.GetFixtureList()) {
                // this.body.DestroyFixture(this.body.GetFixtureList());
                EasyBody.splitsBody(this.body,()=>{
                    a--;
                    return a==2;
                })
            }
        })

    }
    addFixture() {
        var radius = 80;
        var angle = Math.PI * 2 / 8;
        for (var i = 0; i < 8; i++) {
            const circle = EasyShape.createCircle(30, Math.cos(angle * i) * radius, Math.sin(angle * i) * radius);
            this.body.CreateFixture(circle, 1);
        }
    }

}
