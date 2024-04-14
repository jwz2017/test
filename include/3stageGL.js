import { gframe, keys } from "../classes/gframe.js";
import { Game, ScoreBoard } from "../classes/Game.js";
import { BoxActor, BoxBall } from "../classes/actor.js";
import { Clipper } from "../classes/Clipper-help.js";
window.onload = function () {
    Box2D().then(function (r) {
        Box2D = r;
        using(Box2D, 'b2.+');
    })
    /*************游戏入口*****/
    gframe.buildStage('canvas');
    gframe.preload(StageGL, true);
};
//游戏变量;
export class StageGL extends Game {
    constructor() {
        super("StageGL&Box2d");
        gframe.buildWorld(true,0);
        this.player = new BoxActor(250,200,100,100);
        // this.player = new BoxBall(300, 200, 50);
        this.addToPlayer(this.player);
        this.player1=new BoxActor(350,200,100,100);
        this.player1.body.GetFixtureList().SetSensor(true);
        this.addToPlayer(this.player1);
        this.player.body.SetTransform(this.player.body.GetPosition(),Math.PI/4)
        // console.log(this.player.body.GetFixtureList().GetShape().GetType());
        //底线
        EasyBody.createRectangle(0, 0, this.width, this.height);

        this.clipper=new Clipper();
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(StageGL.SCORE, "0");
        this.scoreboard.createTextElement(StageGL.LEVEL);
        this.scoreboard.createTextElement(StageGL.LIVES);
    }
    newLevel() {
        this.scoreboard.update(StageGL.LEVEL, this.level);
    }
    waitComplete() {
        let f = this.player.body.GetFixtureList();
        // let shape = Box2D.castObject(f.GetShape(), b2PolygonShape);
        // console.log(shape);
        // console.log(shape.GetVertex(0));
        // console.log(this.player.body.GetWorldPoint(shape.GetVertex(0)));
        // console.log(shape.get_m_vertices());//没有数组
        let s=this.clipper.getIntersectionShape(this.player.body.GetFixtureList(),this.player1.body.GetFixtureList());
        if(s.length>0){
            console.log(Clipper.pathToVec(s[0]),ClipperLib.JS.AreaOfPolygon(s[0]));
            // let a=EasyBody.createPolygon(Clipper.pathToVec(s));
            // a.SetTransform(new b2Vec2(0,2),0)
        }


    }
    runGame() {
        this.player.update();
    }
}



