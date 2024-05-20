import { stage,gframe } from "../../classes/gframe.js";
import { Game} from "../../classes/Game.js";
//游戏变量;
var motorJoint;
var bodyAtMouse;
export class MotorJoint extends Game {
    constructor() {
        super("马达关节");
        gframe.buildWorld(true,20);
        this.createbodies();
        this.createJoint();

        stage.on("stagemousedown",(e)=>{
            bodyAtMouse=EasyWorld.getBodyAt(e.stageX,e.stageY);
            if(bodyAtMouse){
                let bodyA=motorJoint.GetBodyA();
                let linearOffset=bodyA.GetLocalPoint(bodyAtMouse.GetPosition());
                let angularOffset=bodyAtMouse.GetAngle()-bodyA.GetAngle();
                motorJoint.SetLinearOffset(linearOffset);
                motorJoint.SetAngularOffset(angularOffset);
            }
        })
    }
    createbodies(){
        EasyBody.createRectangle(0,0,stage.width,stage.height);
        for(let i=0;i<5;i++){
            let posX=Math.random()*400+50;
            let posY=Math.random()*300+50;
            let angle=Math.random()*Math.PI*2;
            let body=EasyBody.createBox(posX,posY,40,20,1);
            body.SetTransform(body.GetPosition(),angle);
        }
    }
    createJoint(){
        let bodyA=EasyBody.getEmptyBody();
        let bodyB=EasyBody.createBox(250,200,100,20);
        bodyB.GetFixtureList().SetSensor(true);

        let jointDef=new b2MotorJointDef();
        jointDef.Initialize(bodyA,bodyB);
        jointDef.set_angularOffset(0);
        // jointDef.set_linearOffset(bodyA.GetLocalPoint(anchor));
        jointDef.set_maxForce(500);
        jointDef.set_maxTorque(200);
        jointDef.set_correctionFactor(0.50);
        motorJoint=world.CreateJoint(jointDef);
        motorJoint=Box2D.castObject(motorJoint,b2MotorJoint);
    }
}
