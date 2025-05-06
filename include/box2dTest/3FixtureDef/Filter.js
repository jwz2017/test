import { game } from "../../../classes/gframe.js";
import { AbstractDemo } from "../3BodyDef/AbstractDemo.js";
var b1,b2,b3,f1,circleFilter,rectFilter,vsCircleFilter,vsRectFilter,vsBothFilter,emptyFilter;
var filterList,filterNames,filterIndex,vec;
export class Filter extends AbstractDemo{
    constructor() {
        super("filter是一个b2Filter属性，\n我们可以通过它的categoryBits和maskBits属性，\n设置碰撞筛选条件");
        rectFilter=rectFilter||new b2Filter();
        circleFilter=circleFilter||new b2Filter();
        vsCircleFilter=vsCircleFilter||new b2Filter();
        vsRectFilter=vsRectFilter||new b2Filter();
        vsBothFilter=vsBothFilter||new b2Filter();
        emptyFilter=emptyFilter||new b2Filter();
        vec=vec||new b2Vec2();
    }
    ready(){
        b1=EasyBody.createBox(250,300,200,50,0);
        b2=EasyBody.createBox(250,100,80,30);
        b3=EasyBody.createCircle(250,40,20);

        f1=b1.GetFixtureList();
        //矩形刚体的filter属性值
        rectFilter.categoryBits=2;  //二进制：0001
        rectFilter.maskBits=4;      //二进制：0010
        // rectFilter.groupIndex=1;

        //圆形刚体的filter属性值
        circleFilter.categoryBits=6;//二进制：0011
        circleFilter.maskBits=8;    //二进制：0100
        // circleFilter.groupIndex=1;
        
        //为实现碰撞，静态刚体对应圆形和矩形刚体filter所创建的filter属性
        vsCircleFilter.categoryBits=circleFilter.maskBits;
        vsCircleFilter.maskBits=circleFilter.categoryBits;

        vsRectFilter.categoryBits=rectFilter.maskBits;
        vsRectFilter.maskBits=rectFilter.categoryBits;

        vsBothFilter.categoryBits=rectFilter.maskBits|circleFilter.maskBits;
        vsBothFilter.maskBits=rectFilter.categoryBits|circleFilter.categoryBits;

        filterList=[emptyFilter,vsRectFilter,vsCircleFilter,vsBothFilter];
        filterNames=["emptyFilter","vsRectFilter","vsCircleFilter","vsBothFilter"];
        filterIndex=0;

        b2.GetFixtureList().SetFilterData(rectFilter);
        b3.GetFixtureList().SetFilterData(circleFilter);

        game.editValue("empty")

    }
    reset(){
        b2.SetAwake(true);
        b3.SetAwake(true);

        vec.Set(250/PTM,100/PTM);
        b2.SetTransform(vec,0);
        vec.Set(250/PTM,40/PTM);
        b3.SetTransform(vec,0);
    }
    onKeyDown(c){
        if(c=="reset"){
            this.reset();
            if(++filterIndex>filterList.length-1){
                filterIndex=0;
            }
            f1.SetFilterData(filterList[filterIndex]);
            game.editValue(filterNames[filterIndex]);
        }
    }
}