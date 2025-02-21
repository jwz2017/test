import { Box2dGame } from "../../classes/Game.js";
import { WaterManager } from "../../classes/Clipper-help.js";
var waterManager;
export class WaterDome extends Box2dGame {
    static WATER=100;
    constructor() {
        super("WaterDome");
        EasyBody.createRectangle(0,0,this.width,this.height);
        this.createStuff();
        this.createWater();
        this.listener=new WaterDomeListener(waterManager);
        this.dragBody();
    }
    runGame(e) {
        super.runGame(e);
        waterManager.update();
    }
    createStuff(){
        EasyBody.createBox(200,100,60,40);
        EasyBody.createFan(300,100,60,60);
        EasyBody.createRegular(250,100,30,3);
    }
    createWater(){
        let body=EasyBody.createBox(this.width/2,300,400,200);
        let water=body.GetFixtureList();
        water.SetSensor(true);
        water.SetDensity(4.5);
        water.SetUserData(WaterDome.WATER);
        body.CreateFixture(EasyShape.createBox(10,200,-200,0),1);
        body.CreateFixture(EasyShape.createBox(10,200,200,0),1);
        EasyWorld.fixBodyAt(body,this.width/2,20,2000,-2)

        let body2=EasyBody.createBox(this.width/2,680,this.width,150,0)
        let water2=body2.GetFixtureList();
        water2.SetSensor(true);
        water2.SetDensity(5);
        water2.SetUserData(WaterDome.WATER);

        waterManager=new WaterManager();
        waterManager.addWater(water);
        waterManager.addWater(water2);

    }
}
class WaterDomeListener extends ContactListener{
    constructor(waterManager){
        super();
        this.waterManager=waterManager;    
    }
    BeginContact(contact){
        let result=this.sortByOneFixture(contact,WaterDome.WATER);
        if (result) {
            waterManager.addStuffIntoWater(result[1],result[0]);
        }
    }
    EndContact(contact){
        let result=this.sortByOneFixture(contact,WaterDome.WATER);
        if(result){
            waterManager.removeStuffFromWater(result[1],result[0]);
        }
    }
}
