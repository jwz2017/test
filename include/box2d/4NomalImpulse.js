import { stage, gframe, game } from "../../classes/gframe.js";
import { Game, ScoreBoard } from "../../classes/Game.js";
import { Actor, BoxActor } from "../../classes/actor.js";
//游戏变量;
var bird, stone;
var birdManager, textTip, contactListener;
export class NomalImpulse extends Game {
    static STONE = 5;
    static GROUND = 999;
    static PLATE = 998;
    static PLAYER = 997;
    static STONELIFE = "stonelife";
    constructor() {
        super("NomalImpulse");
        gframe.buildWorld(true);
        EasyBody.createRectangle(0, 0, stage.width, stage.height);

        stone = EasyBody.createBox(600, 720, 20, 40);
        var rect = EasyShape.createBox(20, 40, 0, -40);
        stone.CreateFixture(rect, 3);
        rect = EasyShape.createBox(20, 40, 0, -80);
        stone.CreateFixture(rect, 3);
        rect = EasyShape.createBox(20, 40, 0, -120);
        stone.CreateFixture(rect, 3);
        stone.life = 16;
        stone.SetUserData(NomalImpulse.STONE)

        bird = new BoxActor(0,0,20,20);
        bird.body.SetUserData(NomalImpulse.PLAYER)
        this.addToPlayer(bird);
        birdManager = new BirdThrower(this, bird, 100, 600);
        birdManager.maxThrowImpulse = 7;
        this.addChild(textTip);

        contactListener = new ImpulseListener();


    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard(0, 20, false);
        this.scoreboard.createTextElement(NomalImpulse.STONELIFE, 0);
    }
    newGame() {
        this.scoreboard.update(NomalImpulse.STONELIFE, stone.life);
    }
    runGame() {
        this.moveActors(this.playerLayer);
        birdManager.drawTrail();
        if (!bird.body.IsAwake() && birdManager.isBirdMoveing) {
            birdManager.reset();
        }
        //检测bird是否碰撞
        // let a = bird.body.GetContactList();
        // while (a.a) {
        //     if (a.contact.IsTouching()&&a.other.GetUserData()==5) {
        //         // console.log("d");
        //     }
        //     a = a.next;
        // }

        this.hitResult();
    }
    hitResult() {
        if (contactListener.isContact) {
            contactListener.isContact = false;
            stone.life += contactListener.imp;
            game.scoreboard.update(NomalImpulse.STONELIFE, stone.life);
            if (stone.life <= 0) {
                splits(stone, function (f) {
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
    }
    BeginContact(contact) {
        var result = this.sortByTwoBody(contact, NomalImpulse.PLAYER, NomalImpulse.STONE)
        if (result) {
            this.isContact = true;
            let v = result[0].GetLinearVelocity();
            let m = new b2WorldManifold()
            contact.GetWorldManifold(m);
            let v1 = m.get_normal();
            let cos = (v.x * v1.x + v.y * v1.y) / v.Length() * v1.Length();
            this.imp = v.Length() * cos * result[0].GetMass();
            this.imp = Math.floor(this.imp);
            console.log(this.imp);
        }
    }
}
