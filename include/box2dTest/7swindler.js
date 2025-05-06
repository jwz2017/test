import { Box2dGame } from "../../classes/Game.js";
var player,joint,line,callBack,rayStart,rayEnd;
export class Swindler extends Box2dGame {
    constructor() {
        super("关节碰撞");

        EasyBody.createBox(190,150,30,50,0);
        EasyBody.createBox(230,200,30,30,0);
        //player
        player=EasyBody.createBox(30,200,20,20);
        player.SetUserData(USER_DATA_PLAYER);
        player.SetSleepingAllowed(false);

        joint=EasyWorld.createRevoluteJoint({
            bodyAX:200,
            bodyAY:50,
            bodyB:player,
        })

        
        line=new PivotLine1(joint.GetBodyA().GetPosition(),player.GetPosition());
        rayStart=line.m_start;
        rayEnd=line.m_end;

        callBack=new Box2D.JSRayCastCallback();
        callBack.ReportFixture=(fixture, point, normal, fraction)=>{
            var p = Box2D.wrapPointer(point, b2Vec2)
            var f = Box2D.wrapPointer(fixture, b2Fixture)
            
            
            if(f.GetBody().GetUserData()==USER_DATA_PLAYER) return -1;

            this.updateJoint(p);
            rayStart=p;
            line.addPivot(p);
            

            return 0;
        }

    }
    updateJoint(point){
        world.DestroyJoint(joint);
        joint=EasyWorld.createRevoluteJoint({
            bodyAX:point.x*PTM,
            bodyAY:point.y*PTM,
            anchor:point,
            bodyB:player
        })
    }
    runGame(e) {
        super.runGame(e);

        // line.setEnd(player.GetPosition());
        // rayEnd=line.m_end;

        world.RayCast(callBack,rayStart,rayEnd);
        world.RayCast(callBack,rayEnd,rayStart);
    }


}


class PivotLine1 {
    constructor(start,end) {
        this.m_start=start;
        this.m_end=end;
        this.pivots=[];
    }
    addPivot(v){
        this.pivots.push(v);
    }
    setEnd(v){
        this.m_end=v;
    }
    getVertices(){
        let vertices=[this.m_start];
        this.pivots.forEach(element => {
            vertices.push(element);
        });
        vertices.push(this.m_end);
        return vertices;
    }
}