
import { stage } from "../../classes/gframe.js";
import { Actor, CirActor } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
import { isBallInBucker } from "../../classes/hit/rayHit.js";
var rect1, rect2,ball;
export class hitTest extends Game {
    constructor() {
        super("hitTest");
        rect1 = new Actor();
        rect1.init(100, 100);
        rect1.drawSpriteData(80, 80)

        rect2 = new Actor();
        rect2.init(300, 400);
        rect2.drawSpriteData(200, 50)
        stage.on("stagemousemove", (e) => {
            rect1.setPos(e.stageX, e.stageY);
        })
        
        ball=new CirActor();
        ball.maxSpeed=10;
        ball.edgeBehavior=CirActor.BOUNCE;
        ball.init(50,400)
        ball.drawSpriteData(30);
        this.moveBall();
        
        stage.addChild(ball,rect2, rect1);
        // window.onfocus=()=>{
        //     console.log("d");
            
        // }
        window.onblur=()=>{
            console.log("d");
            
        }
    }
    runGame() {
        //球进篮筐
        ball.speed.y+=0.2;
        ball.act();
        let nextRect=ball.rect.clone();
        nextRect.x+=ball.speed.x;
        nextRect.y+=ball.speed.y;
        let a=isBallInBucker(ball.rect,nextRect,rect2.rect);
        if(a){
            console.log("d");
        }
        //测试矩形碰撞
        if (rect1.rect.intersects(rect2.rect)) {
            // let color=createjs.Graphics.getHSL(Math.random()*360,80,60);
            rect1.color = "#f00";
        } else {
            rect1.color = "#555";
        }
        //测试hittest
        let p = rect1.globalToLocal(rect2.rect.x, rect2.rect.y);
        if (rect1.hitTest(p.x, p.y)) {
            rect2.color = "#0f0";
        } else {
            rect2.color = "#555"
        }


    }
    moveBall(){
        stage.on("stagemousedown",(e)=>{
            let x1=stage.mouseX,
            y1=stage.mouseY;
            let dx=x1-ball.x,
            dy=y1-ball.y;
            let d=Math.sqrt(dx*dx+dy*dy),
            ang=Math.atan2(dy,dx);
            ball.speed.length=d;
            ball.speed.angle=ang;
        });
    }
}


