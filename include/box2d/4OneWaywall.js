import { stage, gframe, keys } from "../../classes/gframe.js";
import { Game,} from "../../classes/Game.js";
import {BoxBall } from "../../classes/actor.js";
var player, ground, platform, contactListener;
export class OneWayWall extends Game {
    static codes={
        65: "left",
        87: "up",
        68: "right",
        32: "pause",
    }
    constructor() {
        super("OneWayWall");
        gframe.buildWorld(true, 10);
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
        ground = EasyBody.createBox(250, 670, 750, 80, 0);
        ground.SetUserData(USER_DATA_GROUND);
        ground.GetFixtureList().SetRestitution(0);

        player = new BoxBall(30,30,25);
        this.addChild(player);

        platform = EasyBody.createPlatform(150, 545, 100, 10);
        platform.SetUserData(USER_DATA_PLANET);
        platform = EasyBody.createPlatform(250, 465, 100, 10, 0);
        platform.SetUserData(USER_DATA_PLANET);
        platform = EasyBody.createPlatform(350, 465, 100, 10);
        platform.SetUserData(USER_DATA_PLANET);
        platform = EasyBody.createPlatform(240, 510, 100, 10);
        platform.SetUserData(USER_DATA_PLANET);
        platform.SetTransform(platform.GetPosition(), -Math.PI / 4);

        contactListener = new BallMoveContactListener();
    }
    runGame() {
        player.act(keys)
    }

}