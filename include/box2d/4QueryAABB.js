import { stage, gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
//游戏变量;
export class QueryAABB extends Game {
    constructor() {
        super("QueryAABB");
        this.x=100;
        gframe.buildWorld(true);
        
        EasyBody.createRectangle(0, 0, stage.width, stage.height);
        this.createBodies();
    }
    createBodies() {
        EasyBody.createBox(205, 630, 30, 30);
        EasyBody.createBox(295, 635, 30, 30);
        EasyBody.createBox(250, 605, 120, 30);
        EasyBody.createBox(235, 545, 90, 30);
        
        var b = EasyBody.createBox(250, 575, 60, 30);
        b.SetUserData(-1)
        b = EasyBody.createBox(250, 500, 120, 60);
        b.SetUserData(-1);
    }
    waitComplete() {
        stage.on("stagemousedown", (e) => {
            var p = this.globalToLocal(e.stageX, e.stageY);
            let body=EasyWorld.getBodyAt(p.x,p.y);
            if(body){
                if(body.GetUserData()!=-1){
                    world.DestroyBody(body);
                }
            }
        })
    }

}
