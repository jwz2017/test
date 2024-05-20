import { stage, gframe, game } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import { Clipper } from "../../classes/Clipper-help.js";
var subjectBody, clipBody;
var clipTypeList, clipTypeNames, typeOfClip;
var clipText, aryIndex = 0;
var drawColor;
var intersection;
var buffer;
export class ClipperDemo extends Game {
    static codes={
        32:"down"//空格键换类型
    }
    constructor() {
        super("ClipperDemo");
        gframe.buildWorld(true, 0);

        EasyBody.createRectangle(0, 0, this.width, this.height);
        subjectBody = EasyBody.createRegular(250, 200, 80, 3, 0);
        subjectBody.GetFixtureList().SetSensor(true);
        clipBody = EasyBody.createBox(100, 100, 200,50 );
        clipBody.SetUserData(USER_DATA_PLAYER);

        clipTypeList = [
            ClipperLib.ClipType.ctIntersection,
            ClipperLib.ClipType.ctUnion,
            ClipperLib.ClipType.ctDifference,
            ClipperLib.ClipType.ctXor
        ];
        clipTypeNames = [
            "ClipperLib.ClipType.ctIntersection",
            "ClipperLib.ClipType.ctUnion",
            "ClipperLib.ClipType.ctDifference",
            "ClipperLib.ClipType.ctXor"
        ];
        typeOfClip = ClipperLib.ClipType.ctIntersection;

        clipText = new createjs.Text(clipTypeNames[aryIndex], "bold 22px regul", "#fff");
        clipText.x = stage.width - clipText.getMeasuredWidth() >> 1;
        clipText.y = 20;

        this.dragBody(USER_DATA_PLAYER,null,true);

        this.clipper = new Clipper();
        drawColor=new b2Color(1,0,0);
        // buffer=Box2D._malloc();
        // this.buffer=Box2D._malloc();
        stage.addChild(clipText);
    }
    runGame() {
        intersection=this.clipper.getIntersectionShape(subjectBody.GetFixtureList(), clipBody.GetFixtureList(), typeOfClip);
        // if(this.clipper.paths.length>0)Clipper.arrayToBox2D(this.clipper.paths[0],buffer);
    }
    onRunGameKeydown(){
        if(++aryIndex>=clipTypeList.length) aryIndex=0;
        typeOfClip=clipTypeList[aryIndex];
        clipText.text=clipTypeNames[aryIndex];
    }
    containerDebugDraw() {
        super.containerDebugDraw()
        if (intersection.length > 0) {
            intersection.forEach(verties => {
                let v=Clipper.pathToVec(verties);
                // Clipper.arrayToBox2D(verties,game.clipper._buffer);
                if (typeOfClip == 3) {
                    drawPolygon1(v,true)
                    // debugDraw.DrawSolidPolygon(game.clipper._buffer,verties.length,drawColor.a)
                } else {
                    drawPolygon1(v,false)
                    // debugDraw.DrawPolygon(game.clipper._buffer,verties.length,drawColor.a)
                }
            });
        }

    }

}