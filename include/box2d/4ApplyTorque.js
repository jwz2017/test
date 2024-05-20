import { stage, gframe, keys } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
//游戏变量;
var ground,body;
var torque=0,TORQUE=80,SPEEDMAX=5*PTM*Math.PI/180;
export class ApplyTorque extends Game {
    static codes={
        65: "left",
        68: "right",
    }
    constructor() {
        super("ApplyTorque");
        gframe.buildWorld(true);
        EasyBody.createRectangle(0,0,stage.width,stage.height);

        ground=EasyBody.createBox(stage.width/2,stage.height-50,stage.width,100,0);
        ground.GetFixtureList().SetFriction(1);
        
        body=EasyBody.createBox(stage.width/2,500,50,50);
        body.SetSleepingAllowed(false)
    }
    runGame() {
        torque=0;
        if(keys.left)torque=-TORQUE;
        if(keys.right)torque=TORQUE;
        body.ApplyTorque(torque);
        this.limitAngularVelocity(body,SPEEDMAX);
    }
    limitAngularVelocity(body,speedMax){
        var av=body.GetAngularVelocity();
        var mav=Math.abs(av);
        if(mav>speedMax){
            av=mav/av*speedMax;
            body.SetAngularVelocity(av);
        }
    }

}
