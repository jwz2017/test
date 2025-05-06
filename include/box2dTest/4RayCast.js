import { BodyDef } from "./3BodyDef.js";

export class RayCastDef extends BodyDef {
    constructor() {
        super();
        this.demoList=[
            RayCast1
        ]
    }
}



import { game, stage } from "../../classes/gframe.js";
import { AbstractDemo } from "./3BodyDef/AbstractDemo.js";
var p1, p2, tipArray, callBack, pointArray, normalArray, callIndex = 0;
var callBackString = ["0", "1", "fraction", "-1"];
export class RayCast1 extends AbstractDemo {
    constructor() {
        super("what is raycast", 0);
        p1 = p1 || new b2Vec2();
        p2 = p2 || new b2Vec2();
        callBack = new Box2D.JSRayCastCallback();
    }
    ready() {
        tipArray = [];
        pointArray = [];
        normalArray = [];
        callIndex=0;
        this.createBodies();
        this.createTip();

        this.switchCallBack(0);
        

        p2.Set(600 / PTM, 200 / PTM);
        p1.Set(100 / PTM, 200 / PTM);

        world.RayCast(callBack, p1, p2);
    }
    
    createBodies() {
        let i = 0, px, py, size, random, b;
        while (++i < 40) {
            px = Math.random() * 450 + 25;
            py = Math.random() * 350 + 25;
            size = Math.random() * 20 + 20;
            random = Math.random();
            if (random < 0.3) {
                b = EasyBody.createBox(px, py, size, size);
            } else if (random < 0.6) {
                b = EasyBody.createRegular(px, py, size, 3);
            } else {
                b = EasyBody.createCircle(px, py, size / 2);
            }
            b.SetTransform(b.GetPosition(), Math.random() * Math.PI);

        }

    }
    createTip() {
        let l;
        for (let i = 1; i < 20; i++) {
            l = new createjs.Text(i,"16px Arial");
            l.textAlign="center";
            l.textBaseline="middle"
            // game.container.addChild(l);
            game.playerLayer.addChild(l)
            tipArray.push(l);
        }
    }
    switchCallBack(i) {
        callBack.ReportFixture = this.callBackNormal;
        if (i == 3) callBack.ReportFixture = this.callBackNegative;
        game.editValue("callBack:" + callBackString[i])
    }
    callBackNormal(f1, p1, n1, fraction) {
        var p = Box2D.wrapPointer(p1, b2Vec2)
        var f = Box2D.wrapPointer(f1, b2Fixture)
        var n = Box2D.wrapPointer(n1, b2Vec2)
        pointArray.push(new createjs.Point(p.x, p.y));
        normalArray.push(new createjs.Point(n.x, n.y));

        if (callIndex == 0) return 0;
        if (callIndex == 1) return 1;
        return fraction;
    }
    callBackNegative(f1, p1, n1, fraction) {
        var p = Box2D.wrapPointer(p1, b2Vec2)
        var f = Box2D.wrapPointer(f1, b2Fixture)
        var n = Box2D.wrapPointer(n1, b2Vec2)
        if(f.GetShape().GetType()==2){
            return -1
        }else{
            pointArray[0]=new createjs.Point(p.x,p.y);
            normalArray[0]=new createjs.Point(n.x,n.y);
        }
        return fraction;
    }
    mouseEventHandle(e) {
        if (e.type == "stagemousedown") {
            p2.x = stage.mouseX / PTM;
            p2.y = stage.mouseY / PTM;

            pointArray = [];
            normalArray = [];
            tipArray.forEach(element => {
                element.alpha = 0;
            });
            world.RayCast(callBack, p1, p2);
        }
    }
    onKeyDown(c){
        if(c=="reset"){
            if(++callIndex>3) callIndex=0;
            this.switchCallBack(callIndex); 
        }
    }
    debugDraw() {
        drawCircle1(p1, 5 / PTM)
        drawSegment1(p1, p2)

        for (let i = 0; i < pointArray.length; i++) {
            const tmpPoint = pointArray[i];
            const tmpNormal = normalArray[i];

            drawCircle1(tmpPoint, 10/ PTM, false, "0,0,0")
            drawSegment1(tmpPoint,new createjs.Point(tmpPoint.x+tmpNormal.x,tmpPoint.y+tmpNormal.y));

            tipArray[i].x=tmpPoint.x*PTM;
            tipArray[i].y=tmpPoint.y*PTM;
            tipArray[i].alpha=1;
        }
    }
}