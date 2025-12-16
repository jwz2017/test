import { keys } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { Box2DBall } from "../../classes/box2d/actor/box2dBall.js";
//游戏变量;
var car;
var startX = 250,
    startY = 230;
export class WheelJoint extends Box2dGame {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("中轴关节");
        this.contentSize = {
            width: 5000,
            height: this.height
        }

        this.createGround();
        this.createCar(startX,startY);
        
        this.setActorScroll(car.body.actor)
    }
    runGame(e) {
        super.runGame(e);
        car.act(keys);
        this.scrollView()
    }
    createGround() {
        let gapX = 800,
            gapY = 400;
        let posX = 500,
            posY = 300;
        var groundPoints = [];
        groundPoints.push(new createjs.Point(50, 100));
        groundPoints.push(new createjs.Point(50, 300));
        groundPoints.push(new createjs.Point(500, 300));
        while (posX < this.contentSize.width - 800) {
            posX += Math.random() * gapX + 100;
            posY += Math.random() * gapY - gapY / 2;

            posY=Math.max(100,posY);
            posY=Math.min(this.contentSize.height-100,posY);

            groundPoints.push(new createjs.Point(posX, posY));
        }
        posY -= 300;
        groundPoints.push(new createjs.Point(posX, posY));
        EasyBody.createChain(groundPoints)
    }
    createCar(posX,posY) {
        let frontWheel=EasyBody.createCircle(posX+30,250,15);
        let backWheel=EasyBody.createCircle(posX-30,250,15);
        backWheel.GetFixtureList().SetFriction(1);
        let a=new CirActor();
        a.drawSpriteData(30,"#f00");
        this.addToBox2D(a);
        car=new Box2DBall(backWheel,a);

        let chassis=this.createChassis(posX,posY);

        EasyWorld.createWheelJoint({
            bodyA:chassis,
            bodyB:frontWheel,
            anchor:frontWheel.GetPosition(),
        });

        EasyWorld.createWheelJoint({
            bodyA:chassis,
            bodyB:backWheel,
            anchor:backWheel.GetPosition(),
        });
    }
    createChassis(posX,posY){
        let vertices=[];
        vertices.push(new createjs.Point(-1.5,-0.2));
        vertices.push(new createjs.Point(-1.15,-0.9));
        vertices.push(new createjs.Point(0,-0.9));
        vertices.push(new createjs.Point(1.5,0));
        vertices.push(new createjs.Point(1.5,0.5));
        vertices.push(new createjs.Point(-1.5,0.5));
        return EasyBody.createBodyFromShape(posX,posY,EasyShape.createPolygonShape(vertices));
    }
}