
import { stage, gframe } from "../../classes/gframe.js";
import {Actor,CirActor } from "../../classes/actor.js";
export class ActorTest extends gframe.Game{
    //static loadItem = null;
    constructor() {
        super("ActorTest");
    }
    /**建立游戏元素游戏初始化
     * 在构造函数内建立
     */
    init() {
        this.rect1 = new Actor(300, 400);
        this.rect1.init(200, 80);
        this.rect2 = new Actor(500, 100);
        this.rect2.init(200, 50);

        stage.on("stagemousemove", (e) => {
            this.rect2.x = e.stageX;
            this.rect2.y = e.stageY;
        })
    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0,0,null);
        this.scoreboard.createTextElement("score");
        this.scoreboard.placeElements();
        
    }
    waitComplete() {
        this.a = new CirActor(10, 10);
        this.a.init(100, 100);

        //代码矢量
        let shape = new createjs.Shape;
        // shape.graphics.f("#33FF33").s().p("Aq/HEQkji7AAkJQAAkIEji7QEki8GbAAQGcAAEkC8QEjC7AAEIQAAEJkjC7QkkC8mcAAQmbAAkki8g");
        // shape.x=shape.y=0;


        stage.addChild( this.a, this.rect1, this.rect2, shape);

    }
    runGame() {
        this.a.x = 100;
        //测试矩形碰撞
        let r = this.rect1.getTransformedBounds();
        if (r.intersects(this.rect2.getTransformedBounds())) {
            this.rect1.color = "#f00";
        } else {
            this.rect1.color = "#555";
        }
        //测试hittest
        let p = this.rect2.globalToLocal(r.x, r.y);
        if (this.rect2.hitTest(p.x, p.y)) {
            this.rect2.color = "#0f0";
        } else {
            this.rect2.color = "#555"
        }
        let r1 = this.rect1.getBounds(),
            r2 = this.rect2.getBounds();
        this.rect1.drawShape(r1.width, r1.height);
        this.rect2.drawShape(r2.width, r2.height);

    }
}

