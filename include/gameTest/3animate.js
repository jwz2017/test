import { gframe, lib, stage } from "../../classes/gframe.js";
import {Box2dGame} from "../../classes/Game.js";
import { BoxActor } from "../../classes/actor.js";
import { Clipper } from "../../classes/Clipper-help.js";
import { PushButton, mc } from "../../classes/mc.js";
import { BasicScreen } from "../../classes/screen.js";
window.onload = function () {
    Box2D().then(function (r) {
        Box2D = r;
        using(Box2D, 'b2.+');
    })
    /*************游戏入口*****/
    gframe.buildStage('canvas',false,false);
    gframe.preload(StageGL);
};
//游戏变量;
export class StageGL extends Box2dGame {
    static loadId = 'A81D833FE7C7754FB5395FF7A6EFA6E1';
    constructor() {
        super("anmate界面制作",true,0);
        this.instructionText="1:wewdsdf<br>2:ewddieiei"
        this.player = new BoxActor(250, 200);
        this.player.drawSpriteData(100,100);
        this.addToPlayer(this.player);
        this.player1 = new BoxActor(350, 200);
        this.player1.drawSpriteData(100,100)
        this.player1.body.GetFixtureList().SetSensor(true);
        this.addToPlayer(this.player1);
        this.player.body.SetTransform(this.player.body.GetPosition(), Math.PI / 4)
        this.player.update();
        // console.log(this.player.body.GetFixtureList().GetShape().GetType());
        //底线
        EasyBody.createRectangle(0, 0, this.width, this.height);

        this.clipper = new Clipper();
    }
    createTitleScreen(){
        this.titleScreen=new lib.Title();
        this.titleScreen.btn2.on("click",()=>{
            stage.addChild(this.instructionScreen)
        })
    }
    waitComplete() {
        let f = this.player.body.GetFixtureList();
        // let shape = Box2D.castObject(f.GetShape(), b2PolygonShape);
        // console.log(shape);
        // console.log(shape.GetVertex(0));
        // console.log(this.player.body.GetWorldPoint(shape.GetVertex(0)));
        // console.log(shape.get_m_vertices());//没有数组
        let s = this.clipper.getIntersectionShape(this.player.body.GetFixtureList(), this.player1.body.GetFixtureList());
        if (s.length > 0) {
            console.log(Clipper.pathToVec(s[0]), ClipperLib.JS.AreaOfPolygon(s[0]));
            // let a=EasyBody.createPolygon(Clipper.pathToVec(s));
            // a.SetTransform(new b2Vec2(0,2),0)
        }
    }
}



