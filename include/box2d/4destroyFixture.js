import { gframe, stage } from "../../classes/gframe.js";
import { Game, } from "../../classes/Game.js";
//游戏变量;

export class DestroyFixture extends Game {
    constructor() {
        super("DestroyFixture");
        gframe.buildWorld(true);
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        this.body = EasyBody.createBox(stage.width / 2, stage.height / 2, 30, 30);
        EasyWorld.fixBodyAt(this.body, stage.width / 2, stage.height / 2);
        this.body.SetAngularVelocity(Math.PI / 3);


        // let a=this.body.GetFixtureList().GetShape();
        // a = Box2D.castObject(a,b2PolygonShape);
        // a.set_m_centroid(new b2Vec2(1000/PTM,10/PTM));
        // console.log(a.m_centroid);
        this.addFixture();
    }
    addFixture() {
        var radius = 80;
        var angle = Math.PI * 2 / 8;
        for (var i = 0; i < 8; i++) {
            const circle = EasyShape.createCircle(30, Math.cos(angle * i) * radius, Math.sin(angle * i) * radius);
            this.body.CreateFixture(circle, 1);
        }
    }
    waitComplete() {
        stage.on("stagemousedown", () => {
            var a=3;
            if (this.body.GetFixtureList()) {
                // this.body.DestroyFixture(this.body.GetFixtureList());
                splits(this.body,()=>{
                    a--;
                    return a==2;
                })
            }
        })

    }

}
