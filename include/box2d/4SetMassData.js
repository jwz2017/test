import { stage,gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
//游戏变量;
var body;
export class SetMassData extends Game {
    constructor() {
        super("SetMassData");
        gframe.buildWorld(true);
        EasyBody.createRectangle(0,0,stage.width,stage.height);
        this.createBody();

        var md=new b2MassData();
        body.GetMassData(md);
        md.center.Set(0,30/PTM);
        md.I=md.mass*md.center.LengthSquared()+20;
        body.SetMassData(md);

        stage.on("stagemousedown",()=>{
            var impulse=new b2Vec2(body.GetMass()*2,0);
            if(Math.random()>0.5)impulse.x*=-1;
            body.ApplyLinearImpulse(impulse,body.GetWorldPoint(new b2Vec2(0,-20/PTM)));
        })
    }
    createBody(){
        body=EasyBody.getEmptyBody(stage.width/2,stage.height/2,2);
        body.SetSleepingAllowed(false)
        var semiCircle=EasyShape.createSemiCicle(100,50);
        var vertices=[];
        vertices.push(new b2Vec2(50/PTM,0));
        vertices.push(new b2Vec2(-50/PTM,0));
        vertices.push(new b2Vec2(0,-150/PTM));
        var triangle=createPolygonShape(vertices);
        body.CreateFixture(semiCircle,1);
        body.CreateFixture(triangle,1);

    }
}
