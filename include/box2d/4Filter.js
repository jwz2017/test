import {gframe } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";

//游戏变量;
var b1,b2,b3;
export class Filter extends Game {
    constructor() {
        super("碰撞删选");
        gframe.buildWorld(true);
        b1=EasyBody.createBox(250,600,200,50,0);
        b2=EasyBody.createBox(250,400,80,30);
        b3=EasyBody.createCircle(250,340,20);

        let rectFilter=new b2Filter();
        rectFilter.categoryBits=1;
        rectFilter.maskBits=2;
        b2.GetFixtureList().SetFilterData(rectFilter);
        let circleFilter=new b2Filter();
        circleFilter.categoryBits=3;
        circleFilter.maskBits=4;
        b3.GetFixtureList().SetFilterData(circleFilter);
        let vsFilter=new b2Filter();
        // vsFilter.categoryBits=2;
        // vsFilter.maskBits=1;
        vsFilter.categoryBits=rectFilter.maskBits|circleFilter.maskBits;
        vsFilter.maskBits=rectFilter.categoryBits|circleFilter.categoryBits;
        b1.GetFixtureList().SetFilterData(vsFilter);
    }

}
