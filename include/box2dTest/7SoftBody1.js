import { Box2dGame} from "../../classes/Game.js";
var anchor;
export class SoftBody1 extends Box2dGame {
    constructor() {
        super("SoftBody1");
        EasyBody.createRectangle(0,0,this.width,this.height);
        anchor=new b2Vec2();
        this.weldJointDef=new b2WeldJointDef();
        this.createSoftBody(100,200);
        // EasyBody.createRegular(200,200,50,5)
    }
    createSoftBody(x,y){
        let segmentWidth=50;
        let startBody=EasyBody.createBox(x,y,segmentWidth,20,0);
        let segmentList=[];
        segmentList.push(startBody);
        for(let i=0;i<5;i++){
            let segPosX=x+(i+1)*segmentWidth;
            let body=EasyBody.createBox(segPosX,y,segmentWidth,20);
            segmentList.push(body);
        }
        for(let j=1;j<segmentList.length;j++){
            let bodyA=segmentList[j-1];
            let bodyB=segmentList[j];
            this.weldTogether(bodyA,bodyB);
        }
    }
    weldTogether(ba, bb, frequencyHz = 20, dampingRatio = 0.2) {
        let p1=ba.GetPosition(),p2=bb.GetPosition();
        anchor.Set(p2.x-p1.x,p2.y-p1.y);
        anchor.op_mul(0.5);
        anchor.op_add(p1);
        this.weldJointDef.Initialize(ba, bb, anchor);
        this.weldJointDef.set_frequencyHz(frequencyHz);
        this.weldJointDef.set_dampingRatio(dampingRatio);
        world.CreateJoint(this.weldJointDef);
    }

}
