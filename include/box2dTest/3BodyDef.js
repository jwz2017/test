import { gframe, stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { DemoActive } from "./3BodyDef/DemoActive.js";
import { AllowSleep } from "./3BodyDef/AllowSleep.js";
import { DemoAngle } from "./3BodyDef/DemoAngle.js";
import { AngularDamping } from "./3BodyDef/AngularDamping.js";
import { AngularVelocity } from "./3BodyDef/AngularVelocity.js";
import { Awake } from "./3BodyDef/Awake.js";
import { Bullet } from "./3BodyDef/Bullet.js";
import { FixedRotation } from "./3BodyDef/FixedRotation.js";
import { InertiaScale } from "./3BodyDef/InertiaScale.js";
import { LinearDamping } from "./3BodyDef/LinearDamping.js";
import { linearVelocity } from "./3BodyDef/LinearVelocity.js";
import { position } from "./3BodyDef/Position.js";
import { Type } from "./3BodyDef/Type.js";
var gravity;
export class BodyDef extends Box2dGame {
    static backgroundColor = "#555"
    static codes = {
        65: "left",
        68: "right",
        87: "reset"
    }
    constructor() {
        super();
        this.demoIndex = 0;
        this.demoList = [
            DemoActive,
            AllowSleep,
            DemoAngle,
            AngularDamping,
            AngularVelocity,
            Awake,
            Bullet,
            FixedRotation,
            InertiaScale,
            LinearDamping,
            linearVelocity,
            position,
            Type
        ]
        gravity = gravity || new b2Vec2();
        EasyBody.createRectangle(0, 0, stage.width, stage.height)

        stage.addEventListener("stagemousedown",e=>{this.mouseEventHandle(e)});
        stage.addEventListener("stagemouseup",e=>{this.mouseEventHandle(e)});
        stage.addEventListener("stagemousemove",e=>{this.mouseEventHandle(e)});
    }
    mouseEventHandle(e){
        this.demo.mouseEventHandle(e);
    }
    waitComplete() {
        this.demo = new this.demoList[0]();
        gravity.Set(0, this.demo.gravity);
        world.SetGravity(gravity);
        //Text
        this.demoCounter = new createjs.Text("1/" + this.demoList.length, "40px regul", "#fff");
        this.demoCounter.set({
            x: this.width - this.demoCounter.getMeasuredWidth() - 15,
            y: this.height - this.demoCounter.getMeasuredHeight() - 15
        })

        this.title = new createjs.Text(this.demoList[0].name, gframe.style.scoreFont, "#fff");
        this.title.x = 50;
        this.title.y = 20;

        let shape = new createjs.Shape();
        shape.graphics.setStrokeStyle(2).beginStroke("#fff").moveTo(0, 0).lineTo(250, 0);
        shape.y = this.title.y + this.title.getMeasuredHeight() + 10;

        let t = new createjs.Text("AD方向键切换演示属性，W键查看不同属性值效果", "16px Microsoft Yahei", "#0f0");
        t.lineHeight = 20;
        t.x = 350;
        t.y = 60;

        this.context = new createjs.Text(this.demo.context, "16px Microsoft Yahei", "#fff");
        this.context.set({
            x: t.x,
            y: t.y + t.getMeasuredHeight() + 5,
            lineHeight: 20
        });

        this.value = new createjs.Text("", gframe.style.textFont, "#f00");
        this.value.set({
            x: 50,
            y: 60
        });

        this.addChild(this.demoCounter, this.title, shape, t, this.context, this.value);
        this.demo.ready();
    }
    editValue(val) {
        this.value.text = val;
    }
    runGame(e) {
        super.runGame(e);
        this.demo.update();
    }
    onRunGameKeydown(c) {
        this.demo.onKeyDown(c);
        if (c == "left") {
            this.update();
            if (--this.demoIndex < 0) this.demoIndex = this.demoList.length - 1;
            this.demo = new this.demoList[this.demoIndex]();
            gravity.Set(0, this.demo.gravity);
            world.SetGravity(gravity);
            this.title.text = this.demoList[this.demoIndex].name;
            this.context.text = this.demo.context;
            this.demo.ready();
            this.demoCounter.text = this.demoIndex + 1 + "/" + this.demoList.length;
        } else if (c == "right") {
            this.update();
            if (++this.demoIndex >= this.demoList.length) this.demoIndex = 0;
            this.demo = new this.demoList[this.demoIndex]();
            gravity.Set(0, this.demo.gravity);
            world.SetGravity(gravity);
            this.title.text = this.demoList[this.demoIndex].name;
            this.context.text = this.demo.context;
            this.demo.ready();
            this.demoCounter.text = this.demoIndex + 1 + "/" + this.demoList.length;
        }

    }
    update() {
        gframe.clearContainer(this.container);

        var list = world.GetJointList();
        while (list.a) {
            world.DestroyJoint(list);
            list = list.GetNext();
        }
        list = world.GetBodyList();
        while (list.a) {

            if (list.GetUserData() != USER_DATA_WALL) {
                world.DestroyBody(list);
            }
            list = list.GetNext();
        }
    }
    containerDebugDraw(){
        super.containerDebugDraw();
        this.parent.demo.debugDraw();
    }
}
