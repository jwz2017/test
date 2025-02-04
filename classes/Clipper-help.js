import { Vector } from "./actor.js";
//图形交集
class Clipper {
    static pathToVec(path) {
        let vv = [];
        for (let i = 0, v; i < path.length; i++) {
            const element = path[i];
            v = new Vector(element.X, element.Y);
            vv.push(v);
        }
        return vv;
    }
    constructor() {
        this._clipper = new ClipperLib.Clipper();
        this._scale = 100;
        this._shape = new b2PolygonShape();
        this._paths = [];
        this._massdata = new b2MassData();
        this._buffer = Box2D._malloc(8 * 8);
        this._middlePoint = new b2Vec2();
    }
    getMiddlePoint(p1, p2) {
        let distance = Vector.sub(p2, p1);
        distance.mul(0.5);
        distance.add(p1);
        this._middlePoint.Set(distance.x, distance.y);
        return this._middlePoint;
    }
    _arrayToMalloc(j=0) {
        var offset = 0;
        for (var i = 0; i < this._paths[j].length; i++) {
            Box2D.HEAPF32[this._buffer + offset >> 2] = this._paths[j][i].X;
            Box2D.HEAPF32[this._buffer + (offset + 4) >> 2] = this._paths[j][i].Y;
            offset += 8;
        }
        return this._buffer;
    }
    getMassAndCenter(density) {
        let ptr_wrapped = Box2D.wrapPointer(this._arrayToMalloc(), Box2D.b2Vec2);
        this._shape.Set(ptr_wrapped, this._paths[0].length);
        this._shape.ComputeMass(this._massdata, density);
        return {
            mass: this._massdata.get_mass(),
            center: this._shape.get_m_centroid()
        }
    }
    //图形交集
    getIntersectionShape(fixtureA, fixtureB, clipType = 0, density = 1) {
        this._clipper.Clear();
        if (fixtureA.GetShape().GetType() != 2) return null;
        if (fixtureB.GetShape().GetType() != 2) return null;
        let polyA = Box2D.castObject(fixtureA.GetShape(), Box2D.b2PolygonShape);
        let polyB = Box2D.castObject(fixtureB.GetShape(), Box2D.b2PolygonShape);
        let subj_path = [], clip_path = [];
        let countA = polyA.get_m_count(), countB = polyB.get_m_count();
        let bodyA = fixtureA.GetBody(), bodyB = fixtureB.GetBody();
        for (let i = 0; i < countA; i++) {
            let element = polyA.GetVertex(i);
            element = bodyA.GetWorldPoint(element);
            subj_path.push({ X: element.x, Y: element.y });
        }
        ClipperLib.JS.ScaleUpPath(subj_path, this._scale)
        for (let i = 0; i < countB; i++) {
            let element = polyB.GetVertex(i);
            element = bodyB.GetWorldPoint(element);
            clip_path.push({ X: element.x, Y: element.y });
        }
        ClipperLib.JS.ScaleUpPath(clip_path, this._scale)
        this._clipper.AddPath(subj_path, 0, true);
        this._clipper.AddPath(clip_path, 1, true);
        this._paths = [];
        this._clipper.Execute(clipType, this._paths, 1, 1);
        if (this._paths.length > 0) {
            ClipperLib.JS.ScaleDownPaths(this._paths, this._scale);
        }
        return this._paths;
    }

}
//浮力管理
class WaterManager {
    constructor() {
        this.clipper = new Clipper;
        this.waters = [];
        this.fixturesInWater = [];
        this._tempForce = new b2Vec2();
    }
    addWater(waterFixture) {
        if (waterFixture.IsSensor() == false) return;
        this.fixturesInWater.push([]);
        this.waters.push(waterFixture);
    }
    addStuffIntoWater(f, water) {
        let index = this.waters.indexOf(water);
        if (index < 0) return;
        let fixtureIndex = this.fixturesInWater[index].indexOf(f);
        if (fixtureIndex == -1) {
            this.fixturesInWater[index].push(f);
        }
    }
    removeStuffFromWater(f, water) {
        let index = this.waters.indexOf(water);
        if (index < 0) return;
        let fixtureIndex = this.fixturesInWater[index].indexOf(f);
        if (fixtureIndex >= 0) {
            this.fixturesInWater[index].splice(fixtureIndex, 1);
        }
    }
    update() {
        for (let i = 0; i < this.waters.length; i++) {
            const water = this.waters[i];
            let stuffInThisWater = this.fixturesInWater[i];
            let waterDensity = water.GetDensity();
            let waterBody = water.GetBody();
            if (stuffInThisWater.length == 0) continue;

            stuffInThisWater.forEach(stuff => {
                let intersection = this.clipper.getIntersectionShape(water, stuff, 0, waterDensity);
                if (intersection.length > 0) {
                    let massAndCenter = this.clipper.getMassAndCenter(waterDensity);
                    let g = world.GetGravity()
                    this._tempForce.Set(g.x, g.y);
                    this._tempForce.op_mul(-massAndCenter.mass);
                    let stuffBody = stuff.GetBody();
                    stuffBody.ApplyForce(this._tempForce, massAndCenter.center);

                    //修正
                    let vectors = Clipper.pathToVec(intersection[0]);
                    let len = vectors.length;
                    for (let j = 0; j < len; j++) {
                        const p1 = vectors[(len - 1 + j) % len];
                        const p2 = vectors[j];
                        let edge = Vector.sub(p2, p1);
                        let middlePoint = this.clipper.getMiddlePoint(p1, p2);
                        let v = waterBody.GetLinearVelocityFromWorldPoint(middlePoint);
                        let velWater = new Vector(v.x, v.y);
                        v = stuffBody.GetLinearVelocityFromWorldPoint(middlePoint);
                        let velStuff = new Vector(v.x, v.y);
                        let velDiff = Vector.sub(velStuff, velWater);
                        this._tempForce.Set(velDiff.x, velDiff.y);
                        v = this._tempForce.Normalize();
                        velDiff.normalize();
                        if (edge.sign(velDiff) < 0) {
                            let A = Math.abs(edge.crossProd(velDiff));
                            let Fd = 0.5 * v * v * A * water.GetDensity();
                            this._tempForce.Set(velDiff.x, velDiff.y);
                            this._tempForce.op_mul(-Fd);
                            stuffBody.ApplyForce(this._tempForce, middlePoint);
                        }

                    }
                }
            });

        }
    }
}
//射线刚体分割
class BodyToSlice{
    static SIDE_RIGHT=1;
    static SIDE_LEFT=-1;
    constructor(body){
        if(body)this.setBody(body);
        this.cutInPoint=null;
        this.cutOutPoint=null;
        this.bodyPosition=new b2Vec2();
        let s=this;
        this.rayStartToEnd=new Box2D.JSRayCastCallback();
        this.rayStartToEnd.ReportFixture=function(fixture, point, normal, fraction){
            var p = Box2D.wrapPointer(point, b2Vec2)
            var f = Box2D.wrapPointer(fixture, b2Fixture)
            if(f.GetBody()==s.body){
                let pp=s.body.GetLocalPoint(p)
                s.cutInPoint=new Vector(pp.x,pp.y);
                return 0;
            }
            return -1;
        }
        this.rayEndToStart=new Box2D.JSRayCastCallback();
        this.rayEndToStart.ReportFixture=function(fixture, point, normal, fraction){
            var p = Box2D.wrapPointer(point, b2Vec2)
            var f = Box2D.wrapPointer(fixture, b2Fixture)
            if(f.GetBody()==s.body){
                let pp=s.body.GetLocalPoint(p)
                s.cutOutPoint=new Vector(pp.x,pp.y);
                return 0;
            }
            return -1;
        }
    }
    setBody(body){
        this.body=body;
        this.bodyType=body.GetType();
    }
    rayCast(startVector,endVector){
        this.cutInPoint=null;
        this.cutOutPoint=null;
        world.RayCast(this.rayStartToEnd,startVector,endVector);
        world.RayCast(this.rayEndToStart,endVector,startVector);
        if(this.cutInPoint&&this.cutOutPoint){
            if(this.sliceVertices()){
                this.slicePolygon();
            }
        }
    }
    sliceVertices(){
        let shape=this.body.GetFixtureList().GetShape();
        shape=Box2D.castObject(shape,b2PolygonShape);
        let len=shape.GetVertexCount();
        let side=0,preSide=0;
        this.leftVertices=[];
        this.rightVertices=[];
        let isInPointAppend=false,isOutPointAppend=false;
        for (let i = 0; i < len; i++) {
            let vv = shape.GetVertex(i);
            let v=new Vector(vv.x,vv.y);
            side=this._checkSide(v);
            if(side==BodyToSlice.SIDE_LEFT){
                if(preSide==BodyToSlice.SIDE_RIGHT){
                    this.leftVertices.push(this.cutInPoint);
                    this.rightVertices.push(this.cutInPoint);
                    isInPointAppend=true;
                }
                this.leftVertices.push(v);
            }else if(side==BodyToSlice.SIDE_RIGHT){
                if(preSide==BodyToSlice.SIDE_LEFT){
                    this.leftVertices.push(this.cutOutPoint);
                    this.rightVertices.push(this.cutOutPoint);
                    isOutPointAppend=true;
                }
                this.rightVertices.push(v);
            }
            preSide=side;
        }
        if(!isInPointAppend){
            this.leftVertices.push(this.cutInPoint);
            this.rightVertices.push(this.cutInPoint);
        }
        if(!isOutPointAppend){
            this.leftVertices.push(this.cutOutPoint);
            this.rightVertices.push(this.cutOutPoint);
        }
        if(this.leftVertices.length<=8&&this.rightVertices.length<=8){
            return true;
        }
    }
    slicePolygon(){
        let p=this.body.GetPosition();
        this.bodyPosition.Set(p.x,p.y);
        this._angle=this.body.GetAngle();
        world.DestroyBody(this.body);
        this.createPolygon(this.leftVertices);
        this.createPolygon(this.rightVertices);
    }
    createPolygon(vertices){
        let body=EasyBody.createPolygon(vertices);
        body.SetTransform(this.bodyPosition,this._angle);
        if(!body.GetFixtureList().TestPoint(this.bodyPosition)){
            body.SetType(2)
        }else{
            body.SetType(this.bodyType);
            this.body=body;
        }
    }
    _checkSide(point){
        let ray=new Vector(this.cutOutPoint.x-this.cutInPoint.x,this.cutOutPoint.y-this.cutInPoint.y);
        let line=new Vector(point.x-this.cutInPoint.x,point.y-this.cutInPoint.y);
        let side=ray.crossProd(line);
        if(side>0){
            return BodyToSlice.SIDE_RIGHT;
        }else{
            return BodyToSlice.SIDE_LEFT;
        }
    }
}
export { Clipper, WaterManager,BodyToSlice};