import { stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { Clipper } from "../../classes/Clipper-help.js";
var subjectBody, clipBody;
var clipTypeList, clipTypeNames, typeOfClip;
var clipText, aryIndex = 0;
var drawColor;
var intersection;
export class ClipperDemo extends Box2dGame {
    static codes={
        32:"space"//空格键换类型
    }
    constructor() {
        super("ClipperDemo",true,0);
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
        stage.addChild(clipText);
    }
    runGame(e) {
        super.runGame(e);
        intersection=this.clipper.getIntersectionShape(subjectBody.GetFixtureList(), clipBody.GetFixtureList(), typeOfClip);
    }
    onRunGameKeydown(){
        if(++aryIndex>=clipTypeList.length) aryIndex=0;
        typeOfClip=clipTypeList[aryIndex];
        clipText.text=clipTypeNames[aryIndex];
    }
    containerDebugDraw() {
        super.containerDebugDraw()
        if (intersection.length > 0) {
            intersection.forEach((verties,i) => {
                let v=Clipper.pathToVec(verties);
                if (typeOfClip == 3) {
                    drawPolygon1(v,true)
                    // debugDraw.DrawSolidPolygon(game.clipper._arrayToMalloc(i),verties.length,drawColor.a)
                } else {
                    drawPolygon1(v,false)
                    // debugDraw.DrawPolygon(game.clipper._arrayToMalloc(i),verties.length,drawColor.a)
                }
            });
        }

    }

}