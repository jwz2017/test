import { gframe } from "../classes/gframe.js";
import { Game, ScoreBoard } from "../classes/Game.js";
import { CirActor } from "../classes/actor.js";
// import { EasyBody, EasyShape } from "../classes/EasyBody.js";
Box2D().then(function (r) {
    Box2D = r;
    using(Box2D, "b2.+");
    window.onload = function () {
        /*************游戏入口*****/
        gframe.buildStage('canvas', false);
        gframe.preload(StageGL, true);
    };
})
//游戏变量;
var a;
export class StageGL extends Game {
    constructor() {
        super("StageGL&Box2d");
        gframe.buildWorld(true);
        a = new Ball(200, 0)
        a.activate();
        this.x = 100;
        this.container.x = 100;
        this.addToPlayer(a);
        //底线
        EasyBody.createRectangle(0, 0, 750, 700);
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(StageGL.SCORE);
        this.scoreboard.createTextElement(StageGL.LEVEL);
        this.scoreboard.createTextElement(StageGL.LIVES);
    }
    newLevel() {
        this.scoreboard.update(StageGL.SCORE, this.score);
        this.scoreboard.update(StageGL.LEVEL, this.level);
        this.scoreboard.update(StageGL.LIVES, this.lives);
    }
    runGame() {
        this.moveActors(this.playerLayer);
    }
}
class Ball extends CirActor {
    constructor(xpos, ypos) {
        super(xpos, ypos, 32);
    }
    activate() {
        this.active = true;
        var bd = new b2BodyDef();
        bd.type = b2_dynamicBody;
        bd.position.Set(this.x / PTM, this.y / PTM);
        // bd.userData=new b2Color();
        this.body = world.CreateBody(bd);
        // console.log(Box2D.wrapPointer(this.body.GetUserData(), b2Color));

        // this.body=EasyBody.createBox(this.x,this.y,this.rect.width,this.rect.height);
        // this.body=EasyBody.createTrapezium(this.x,this.y,32,64,64);
        // var verts = [];
        // verts.push( new b2Vec2( 7,-1) );
        // verts.push( new b2Vec2( 8,-2) );
        // verts.push( new b2Vec2( 9, 3) );
        // verts.push( new b2Vec2( 7, 1) );
        // this.body=EasyBody.createChain(verts,false);
        // this.body=EasyBody.createCircle(this.x,this.y,this.hit)
        // this.body=EasyBody.createSemiCicle(this.x,this.y,this.rect.width,this.hit/2)
        // this.body=EasyBody.createFan(this.x,this.y,this.hit,180)
        // this.body=EasyBody.createEllipse(this.x,this.y,this.rect.width,this.hit)
        // this.body=EasyBody.createRegular(this.x,this.y,this.hit)
        // this.body=EasyBody.createPlatform(this.x,this.y,this.rect.width,this.hit,2)
        // this.body.SetActive(false)

        // var shape = new b2CircleShape();
        // shape.set_m_radius(this.hit / PTM);
        // shape.set_m_p(new b2Vec2(10/PTM,10/PTM))
        // shape.m_p.Set(10/PTM,10/PTM)

        // var shape = new b2PolygonShape();
        // shape.SetAsBox(this.hit/PTM,this.hit/PTM,new b2Vec2(10/PTM,10/PTM),0);

        // var shape=EasyShape.createTrapezium(32,64,64)
        // var shape=EasyShape.createRegular(32,6)
        // var shape=createRandomPolygonShape(32/PTM);
        // var shape=EasyShape.createFan(32,180);
        // var shape=EasyShape.createSemiCicle(64,22);
        // var shape=EasyShape.createEllipse(64,32)  
        // var shape=EasyShape.createPlatform(200,10)  
        var shape = EasyShape.createBox(64, 64)
        // var shape=EasyShape.createCircle(this.hit)

        var fd = new b2FixtureDef();
        fd.shape = shape;
        fd.restitution = 0.6
        this.body.CreateFixture(fd);
    }
    act() {
        this.rotation = this.body.GetAngle() * (180 / Math.PI);
        let p = this.body.GetPosition();
        this.x = p.x * PTM;
        this.y = p.y * PTM;
    }

}
