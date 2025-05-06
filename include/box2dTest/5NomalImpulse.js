import { stage } from "../../classes/gframe.js";
import { Box2dGame } from "../../classes/Game.js";
import { Actor, Vector } from "../../classes/actor.js";
import { ScoreBoard } from "../../classes/screen.js";
import { ContactListener } from "../../classes/box2d/ContactListener.js";
import { BirdThrower } from "../../classes/box2d/actor/BirdThrower.js";
//游戏变量;
var bird, stone;
var birdManager, contactListener;
export class NomalImpulse extends Box2dGame {
    static STONE = 5;
    static STONELIFE = "stonelife";
    constructor() {
        super("NomalImpulse");
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        stone = EasyBody.createBox(600, 720, 20, 40);
        var rect = EasyShape.createBox(20, 40, 0, -40);
        stone.CreateFixture(rect, 3);
        rect = EasyShape.createBox(20, 40, 0, -80);
        stone.CreateFixture(rect, 3);
        rect = EasyShape.createBox(20, 40, 0, -120);
        stone.CreateFixture(rect, 3);
        stone.life = 13;
        stone.SetUserData(NomalImpulse.STONE)

        bird = EasyBody.createBox(0, 0, 20, 20);
        bird.SetUserData(USER_DATA_PLAYER);
        let a = new Actor();
        a.drawSpriteData(20, 20, "#f00");
        this.addToPlayer(a);
        bird.actor = a;

        birdManager = new BirdThrower(this, bird, 100, 600);
        birdManager.maxThrowImpulse = 7;

        contactListener = new ImpulseListener();
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(NomalImpulse.STONELIFE, stone.life);
        this.scoreboard.x = stage.width - this.scoreboard.getBounds().width >> 1;
        this.scoreboard.y = 10;
    }
    runGame(e) {
        super.runGame(e)
        birdManager.drawTrail();
        if (!bird.IsAwake() && birdManager.isBirdMoveing) {
            birdManager.reset();
        }

        this.hitResult();
    }
    hitResult() {
        if (contactListener.imp) {

            stone.life -= contactListener.imp;
            contactListener.imp = 0;
            // contactListener.vv.zero();
            this.scoreboard.update(NomalImpulse.STONELIFE, stone.life);
            if (stone.life <= 0) {
                EasyBody.splitsBody(stone, function (f) {
                    return true;
                })
            }
        }
    }

}
class ImpulseListener extends ContactListener {
    constructor() {
        super();
        this.imp = 0;
        this.vv = new Vector();
    }
    PreSolve(contact) {
        var result = this.sortByTwoBody(contact, USER_DATA_PLAYER, NomalImpulse.STONE)
        if (result) {

        }
    }
    BeginContact(contact) {
        var result = this.sortByTwoBody(contact, USER_DATA_PLAYER, NomalImpulse.STONE)
        if (result) {
            let m = new b2WorldManifold()
            contact.GetWorldManifold(m);
            let v1 = m.get_normal();

            let v = result[0].GetLinearVelocity();
            this.vv.setValues(v.x, v.y);
            
            let d = this.vv.dot(v1);
            let p = Vector.mul(v1, d);
            this.imp = this.imp || Math.round(p.length);
            console.log(this.imp);

        }
    }
}
