//Having to type 'Box2D.' in front of everything makes porting
//existing C++ code a pain in the butt. This function can be used
//to make everything in the Box2D namespace available without
//needing to do that.

//1.对象类型转换  mouseJoint = Box2D.castObject(mouseJoint, Box2D.b2MouseJoint);
//                          Box2D.wrapPointer(buffer, Box2D.b2Vec2);
//2.b2Vec2.op_add +运算 op_sub -运算 op_mul *运算 
//3.b2Vec2返回都为引用，const b2Vec2:自动更新   b2Vec2:手动执行更新
var context, world, debugDraw, PTM = 30;
var tempVec, mouseTempVec, bodyDef, fixtureDef;
const USER_DATA_PLAYER = 9999;
const USER_DATA_PLANET = 9998;
const USER_DATA_GROUND = 9997;
const USER_DATA_BALL = 9996;
const USER_DATA_WALL = 9995;
function using(ns, pattern) {
    if (pattern == undefined) {
        // import all
        for (var name in ns) {
            this[name] = ns[name];
        }
    } else {
        if (typeof (pattern) == 'string') {
            pattern = new RegExp(pattern);
        }
        // import only stuff matching given pattern
        for (var name in ns) {
            if (name.match(pattern)) {
                this[name] = ns[name];
            }
        }
    }
}
function setTempV(x,y){
    tempVec.Set(x,y);
    return tempVec;
}
function drawPolygon1(vertices, fill, color = "255,0,0") {
    context.beginPath();
    context.fillStyle = "rgba(" + color + ",0.5)";
    context.strokeStyle = "rgb(" + color + ")";
    let len = vertices.length;
    for (let i = 0; i < len; i++) {
        let vert = vertices[i];
        if (i == 0) context.moveTo(vert.x, vert.y);
        else context.lineTo(vert.x, vert.y);
    }
    context.closePath();
    if (fill)
        context.fill();
    context.stroke();
}
function drawSegment1(vert1, vert2, color = "255,0,0") {
    context.beginPath();
    context.fillStyle = "rgba(" + color + ",0.5)";
    context.strokeStyle = "rgb(" + color + ")";
    context.moveTo(vert1.x, vert1.y);
    context.lineTo(vert2.x, vert2.y);
    context.stroke();
}
/**
 * 
 * @param {*} center 
 * @param {*} radius 
 * @param {false} fill 
 * @param {"255,0,0"} color 
 */
function drawCircle1(center, radius, fill = false, color = "255,0,0") {
    context.beginPath();
    context.fillStyle = "rgba(" + color + ",0.5)";
    context.strokeStyle = "rgb(" + color + ")";
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    if (fill) context.fill();
    context.stroke();
}

// http://stackoverflow.com/questions/12792486/emscripten-bindings-how-to-create-an-accessible-c-c-array-from-javascript
function arrayToMalloc(vertices, buffer) {
    var offset = 0;
    for (var i = 0; i < vertices.length; i++) {
        Box2D.HEAPF32[buffer + offset >> 2] = vertices[i].x;
        Box2D.HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].y;
        offset += 8;
    }
    return buffer;
}

/****************************************************************
 * 
 ****************************************************************/
var EasyShape = {
    createChainShape(vertices, closedLoop) {
        var shape = new Box2D.b2ChainShape();
        var buffer = Box2D._malloc(vertices.length * 8)
        var ptr_wrapped = Box2D.wrapPointer(arrayToMalloc(vertices, buffer), Box2D.b2Vec2);
        if (closedLoop)
            shape.CreateLoop(ptr_wrapped, vertices.length);
        else shape.CreateChain(ptr_wrapped, vertices.length);

        Box2D._free(buffer);
        return shape;
    },
    //任意边形
    createPolygonShape(vertices) {
        var shape = new Box2D.b2PolygonShape();
        var buffer = Box2D._malloc(vertices.length * 8)
        var ptr_wrapped = Box2D.wrapPointer(arrayToMalloc(vertices, buffer), Box2D.b2Vec2);
        shape.Set(ptr_wrapped, vertices.length);
        Box2D._free(buffer);
        return shape;
    },
    createCircle(radius, localX = 0, localY = 0) {
        radius /= PTM;
        localX /= PTM;
        localY /= PTM;
        let circle = new b2CircleShape();
        circle.set_m_radius(radius);
        circle.m_p.Set(localX, localY);
        return circle;
    },
    /**
     * 矩形形状
     * @param {number} w 
     * @param {number} h 
     * @param {0} localX 
     * @param {0} localY 
     * @param {0} angle 
     * @returns 
     */
    createBox(w, h, localX = 0, localY = 0, angle = 0) {
        w /= PTM;
        h /= PTM;
        localX /= PTM;
        localY /= PTM;
        let box = new b2PolygonShape();
        tempVec.Set(localX, localY)
        box.SetAsBox(w / 2, h / 2, tempVec, angle);
        return box;
    },
    //梯形
    createTrapezium(tw, bw, h) {
        tw /= PTM;
        bw /= PTM;
        h /= PTM;
        let vertices = [];
        vertices.push(new createjs.Point(-tw / 2, -h / 2));
        vertices.push(new createjs.Point(tw / 2, -h / 2));
        vertices.push(new createjs.Point(bw / 2, h / 2));
        vertices.push(new createjs.Point(-bw / 2, h / 2));
        let shape = this.createPolygonShape(vertices);
        return shape;
    },
    //多边形
    createRegular(radius, verticesCount) {
        radius /= PTM;
        var angle = Math.PI * 2 / verticesCount;//每个顶点之间的角度间隔
        var vertices = [];
        //移动到第一个顶点
        for (var i = 0, vertix; i < verticesCount; i++) {
            //计算每个顶点
            vertix = new createjs.Point(radius * Math.cos(i * angle + (Math.PI - angle) / 2), radius * Math.sin(i * angle + (Math.PI - angle) / 2));
            vertices.push(vertix);
        }
        var regularShape = this.createPolygonShape(vertices);
        return regularShape;
    },
    //扇形
    createFan(radius, angleSize) {
        if (angleSize >= 180) angleSize = 180;
        radius /= PTM;
        let arcSimulateAnglePrecise = angleSize / 5;
        angleSize = angleSize / 180 * Math.PI;
        arcSimulateAnglePrecise = arcSimulateAnglePrecise * Math.PI / 180;
        var verticesList = [];
        var tempVertex = new createjs.Point();
        verticesList.push(tempVertex);

        // var verticesCount = Math.floor(Math.PI * 2 / arcSimulateAnglePrecise * angleSize / Math.PI / 2) + 1;
        for (var i = 0; i < 5; i++) {
            tempVertex = tempVertex.clone();
            tempVertex.setValues(
                radius * Math.cos(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2),
                radius * Math.sin(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2)
            );
            verticesList.push(tempVertex);
        }
        tempVertex = tempVertex.clone();
        tempVertex.setValues(
            radius * Math.cos(angleSize + (Math.PI - angleSize) / 2),
            radius * Math.sin(angleSize + (Math.PI - angleSize) / 2)
        );
        verticesList.push(tempVertex);

        var fanShape = this.createPolygonShape(verticesList);
        return fanShape;
    },
    //类似半圆（船形）
    createSemiCicle(w, h) {
        w /= PTM;
        h /= PTM;
        var arcSimulateAnglePrecise = 25.7 * Math.PI / 180;
        var r = (h * h + w * w / 4) / h / 2
        var angleSize = Math.acos((r - h) / r) * 2;
        if (angleSize < arcSimulateAnglePrecise) throw Error("the angle of semicircle is too small");
        var verticesList = [];
        var tempVertex = new createjs.Point();

        for (var i = 0; i < 7; i++) {
            tempVertex = tempVertex.clone();
            tempVertex.setValues(
                r * Math.cos(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2),
                r * Math.sin(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2) - r + h
            );
            verticesList.push(tempVertex);
        }
        tempVertex = tempVertex.clone();
        tempVertex.setValues(
            r * Math.cos(angleSize + (Math.PI - angleSize) / 2),
            r * Math.sin(angleSize + (Math.PI - angleSize) / 2) - r + h
        );
        verticesList.push(tempVertex);
        var shape = this.createPolygonShape(verticesList);
        return shape;
    },
    //边线
    createEdge(v1x, v1y, v2x, v2y) {
        var p1 = new b2Vec2(v1x / PTM, v1y / PTM);
        var p2 = new b2Vec2(v2x / PTM, v2y / PTM);
        var edge = new b2EdgeShape();
        edge.Set(p1, p2);
        Box2D._free(p1.a);
        Box2D._free(p2.a);
        return edge;
    },
    //椭圆
    createEllipse(w, h) {
        var arcSimulateAnglePrecise = 45 * Math.PI / 180;
        w /= PTM;
        h /= PTM;
        var px, py;
        var verticesList = [];
        var verticesCount = Math.floor(Math.PI * 2 / arcSimulateAnglePrecise);
        for (var i = 0; i < verticesCount; i++) {
            px = w / 2 * Math.cos(arcSimulateAnglePrecise * i);
            py = h / 2 * Math.sin(arcSimulateAnglePrecise * i);
            verticesList.push(new createjs.Point(px, py));
        }

        var shape = this.createPolygonShape(verticesList);
        return shape;
    },
    //平台
    createPlatform(w, h) {
        w /= PTM;
        h /= PTM;
        var verticesList = [];
        verticesList.push(new createjs.Point(-w / 2, -h / 2));
        verticesList.push(new createjs.Point(w / 2, -h / 2));
        verticesList.push(new createjs.Point(w / 2, h / 2));
        verticesList.push(new createjs.Point(0, h / 2 + 10 / 30));
        verticesList.push(new createjs.Point(-w / 2, h / 2));
        var shape = this.createPolygonShape(verticesList);
        return shape;
    },
    //随机多边形
    createRandomPolygonShape(radius) {
        radius /= PTM;
        var numVerts = 3.5 + Math.random() * 5;
        numVerts = numVerts | 0;
        var verts = [];
        for (var i = 0; i < numVerts; i++) {
            var angle = i / numVerts * 360.0 * 0.0174532925199432957;
            verts.push(new createjs.Point(radius * Math.sin(angle), radius * -Math.cos(angle)));
        }
        return this.createPolygonShape(verts);
    }
}

var EasyBody = {
    getEmptyBody(xpos = 0, ypos = 0, type = 0) {
        xpos /= PTM;
        ypos /= PTM;
        bodyDef.type = type;
        bodyDef.allowSleep = true;
        bodyDef.fixedRotation = false;
        bodyDef.bullet = false;
        bodyDef.position.Set(xpos, ypos);
        bodyDef.angle = 0;
        bodyDef.awake = true;
        bodyDef.angularDamping = 0;
        bodyDef.linearDamping = 0;
        bodyDef.linearVelocity.Set(0, 0);
        bodyDef.angularVelocity = 0;
        return world.CreateBody(bodyDef);
    },
    /**
    * 复制刚体属性
    * @param {*} body 
    * @returns 
    */
    getCopyBodyDef(body) {
        bodyDef.type = body.GetType();
        bodyDef.allowSleep = body.IsSleepingAllowed();
        bodyDef.angle = body.GetAngle();
        bodyDef.angularDamping = body.GetAngularDamping();
        bodyDef.angularVelocity = body.GetAngularVelocity();
        bodyDef.fixedRotation = body.IsFixedRotation();
        bodyDef.bullet = body.IsBullet();
        bodyDef.awake = body.IsAwake();
        bodyDef.linearDamping = body.GetLinearDamping();
        bodyDef.linearVelocity = body.GetLinearVelocity();
        bodyDef.position = body.GetPosition();
        return bodyDef;
    },
    _createFixtureDef() {
        fixtureDef.density = 3;
        fixtureDef.friction = 0.3;
        fixtureDef.restitution = 0.3;
    },
    createBodyFromShape(xpos, ypos, shape, type = 2) {
        this._createFixtureDef();
        fixtureDef.set_shape(shape);
        var body = this.getEmptyBody(xpos, ypos, type);
        body.CreateFixture(fixtureDef);
        Box2D._free(shape.a);
        return body;
    },
    /**
    * 创建并返回一个标准矩形刚体
    * @param x	坐标x
    * @param y	坐标y
    * @param boxWidth	宽度
    * @param boxHeight 高度
    * @param {2}type	刚体类型，b2Body中刚体类型常量之一
    * @return body
    */
    createBox(x, y, boxWidth, boxHeight, type = 2) {
        var shape = EasyShape.createBox(boxWidth, boxHeight);
        var body = this.createBodyFromShape(x, y, shape, type);
        return body;
    },
    /**
     * 
     * @param {*} v1x 
     * @param {*} v1y 
     * @param {*} v2x 
     * @param {*} v2y 
     * @param {0} type 
     * @returns 
     */
    createEdge(v1x, v1y, v2x, v2y, type = 0) {
        var shape = EasyShape.createEdge(v1x, v1y, v2x, v2y);
        var body = this.createBodyFromShape(0, 0, shape, type);
        return body;
    },
    createTrapezium(xpos, ypos, tw, bw, h, type = 2) {
        var shape = EasyShape.createTrapezium(tw, bw, h);
        var body = this.createBodyFromShape(xpos, ypos, shape, type);
        return body;
    },
    /**
     * 
     * @param {Array} points 
     * @param {false} colsedLoop 
     * @param {0} type 
     * @returns body
     */
    createChain(points, colsedLoop, type = 0) {
        for (let i = 0; i < points.length; i++) {
            points[i].x /= PTM;
            points[i].y /= PTM;
        }
        var shape = EasyShape.createChainShape(points, colsedLoop);
        var body = this.createBodyFromShape(0, 0, shape, type);
        return body;
    },
    createCircle(x, y, radius, type = 2) {
        var shape = EasyShape.createCircle(radius);
        var body = this.createBodyFromShape(x, y, shape, type);
        return body;
    },
    createSemiCicle(xpos, ypos, w, h, type = 2) {
        var shape = EasyShape.createSemiCicle(w, h);
        var body = this.createBodyFromShape(xpos, ypos, shape, type);
        return body;
    },
    createFan(xpos, ypos, radius, angle, type = 2) {
        var shape = EasyShape.createFan(radius, angle);
        var body = this.createBodyFromShape(xpos, ypos, shape, type);
        return body;
    },
    createEllipse(xpos, ypos, w, h, type = 2) {
        var shape = EasyShape.createEllipse(w, h);
        var body = this.createBodyFromShape(xpos, ypos, shape, type);
        return body;
    },
    /**
     * 创建规则形状
     * @param {*} xpos 
     * @param {*} ypos 
     * @param {*} radius 
     * @param {5} verticesCount 
     * @param {2} type 
     * @returns 
     */
    createRegular(xpos, ypos, radius, verticesCount = 5, type = 2) {
        var shape = EasyShape.createRegular(radius, verticesCount);
        var body = this.createBodyFromShape(xpos, ypos, shape, type);
        return body;
    },
    /**
     * 
     * @param {*} xpos 
     * @param {*} ypos 
     * @param {*} w 
     * @param {*} h 
     * @param {0} type 
     * @returns 
     */
    createPlatform(xpos, ypos, w, h, type = 0) {
        var shape = EasyShape.createPlatform(w, h);
        var body = this.createBodyFromShape(xpos, ypos, shape, type);
        return body;
    },
    /*
     * 根据一组顶点数据，创建多边形刚体，可以是顺时针绘制，也可以逆时针绘制，但不能出现交叉
     * @param	vertices 顶点数组，单位m
     * @return 返回一个多边形刚体
     */
    createPolygon(vertices, type = 2) {
        var shape = EasyShape.createPolygonShape(vertices);
        var body = this.createBodyFromShape(0, 0, shape, type);
        return body;
    },
    /**
     * 创建墙体
     * @param {*} x 
     * @param {*} y 
     * @param {*} w 
     * @param {*} h 
     * @param {false} topOpen 
     * @param {false} bottomOpen 
     * @param {0} type 默认静态刚体
     * @param {20} thinkness 
     * @param {true} isFullFilter 
     */
    createRectangle(x, y, w, h, topOpen = false, bottomOpen = false, type = 0, thinkness = 20, isFullFilter = true) {
        //设置filterData，让该Rectangle对所有刚体进行碰撞检测
        var fullFilter = new b2Filter();
        if (isFullFilter) {
            fullFilter.categoryBits = 0xffff;
            fullFilter.maskBits = 0xffff;
        }
        var wall;
        //top
        if (!topOpen) {
            wall = this.createBox(x + w / 2, y, w, thinkness, type);
            wall.GetFixtureList().SetFilterData(fullFilter);
            wall.SetUserData(USER_DATA_WALL)
        };
        //bottom
        if (!bottomOpen) {
            wall = this.createBox(x + w / 2, y + h, w, thinkness, type);
            wall.GetFixtureList().SetFilterData(fullFilter);
            wall.SetUserData(USER_DATA_WALL)
        }
        //left
        wall = this.createBox(x, y + h / 2, thinkness, h, type);
        wall.GetFixtureList().SetFilterData(fullFilter);
        wall.SetUserData(USER_DATA_WALL)
        //right
        wall = this.createBox(x + w, y + h / 2, thinkness, h, type);
        wall.GetFixtureList().SetFilterData(fullFilter);
        wall.SetUserData(USER_DATA_WALL)
    },
    /**
    * 分裂刚体
    * @param {*} body 
    * @param {*} callback 
    */
    splitsBody(body, callback) {
        var fixture = body.GetFixtureList();
        while (fixture.a) {
            let next = fixture.GetNext();
            if (callback(fixture)) {
                let body1 = world.CreateBody(this.getCopyBodyDef(body));
                body1.CreateFixture(fixture.GetShape(), 3);
                body.DestroyFixture(fixture);
            }
            fixture = next;
        }
    }
};
var EasyWorld = {
    //马达关节
    createMotorJoint({
        bodyA,
        bodyB,
        linearOffset,//bodyA本地坐标
        angularOffset=0,
        maxForce=100,
        maxTorque=200,
        correctionFactor=0.5,//缓动因子0---1
        collideConnected=false

    }){
        let jointDef=new b2MotorJointDef();
        jointDef.Initialize(bodyA,bodyB);
        if(linearOffset) jointDef.set_linearOffset(linearOffset);
        jointDef.set_angularOffset(angularOffset);
        jointDef.set_maxForce(maxForce*bodyB.GetMass());
        jointDef.set_maxTorque(maxTorque);
        jointDef.set_correctionFactor(correctionFactor);
        jointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2MotorJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //绳索关节
    createRopeJoint({
        bodyA,
        bodyB,
        localAnchorA,
        localAnchorB,
        maxLength=100,
        collideConnected=false
    }){
        let jointDef=new b2RopeJointDef();
        jointDef.set_bodyA(bodyA);
        jointDef.set_bodyB(bodyB);
        if(!localAnchorA)jointDef.set_localAnchorA(setTempV(0,0));
        else jointDef.set_localAnchorA(localAnchorA);
        if(!localAnchorB)jointDef.set_localAnchorB(setTempV(0,0));
        else jointDef.set_localAnchorB(localAnchorB);
        jointDef.set_maxLength(maxLength/PTM);
        jointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2RopeJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //中轴关节
    createWheelJoint({
        bodyA,
        bodyB,
        anchor,
        frequencyHz = 3,
        dampingRatio = 1,
        axis,
        localAnchorA,
        localAnchorB,
        enableMoter=false,
        maxMototorTorque = 10,
        motorSpeed = 0,
        collideConnected=false
    }){
        let jointDef=new b2WheelJointDef();
        if(!axis)axis=setTempV(0,1);
        jointDef.Initialize(bodyA,bodyB,anchor,axis);
        if(localAnchorA) jointDef.set_localAnchorA(localAnchorA);
        if(localAnchorB)jointDef.set_localAnchorB(localAnchorB);
        jointDef.set_frequencyHz(frequencyHz);
        jointDef.set_dampingRatio(dampingRatio);
        jointDef.set_enableMotor(enableMoter);
        jointDef.set_maxMotorTorque(bodyB.GetMass() * maxMototorTorque);
        jointDef.set_motorSpeed(motorSpeed);
        jointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2WheelJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //齿轮关节
    createGearJoint({
        joint1,
        joint2,
        ratio=1,
    }){
        let jointDef=new b2GearJointDef();
        jointDef.bodyA=EasyBody.getEmptyBody();
        jointDef.set_joint1(joint1);
        jointDef.set_joint2(joint2);
        jointDef.set_ratio(ratio);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2GearJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //摩擦关节
    createFrictionJoint({
        bodyA,
        bodyB,
        anchor,
        maxForce=60,
        maxTorque=10,
        localAnchorA,
        localAnchorB,
        collideConnected=true
    }){
        this.frictionJointDef=this.frictionJointDef||new b2FrictionJointDef();
        // let jointDef=new b2FrictionJointDef();
        this.frictionJointDef.Initialize(bodyA,bodyB,anchor);
        if(localAnchorA)this.frictionJointDef.set_localAnchorA(localAnchorA);
        if(localAnchorB)this.frictionJointDef.set_localAnchorB(localAnchorB);
        this.frictionJointDef.set_maxForce(maxForce*bodyB.GetMass());
        this.frictionJointDef.set_maxTorque(maxTorque);
        this.frictionJointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(this.frictionJointDef);
        joint = Box2D.castObject(joint, Box2D.b2FrictionJoint);
        // Box2D._free(this.frictionJointDef.a);
        return joint;
    },

    //滑轮关节
    createPulleyJoint({
        bodyA,
        bodyB,
        groundAnchorA,
        groundAnchorB,
        anchorA,
        anchorB,
        ratio=1,
        lengthA,
        lengthB,
        collideConnected=true
    }){
        let jointDef=new b2PulleyJointDef();
        jointDef.Initialize(bodyA,bodyB,groundAnchorA,groundAnchorB,anchorA,anchorB,ratio);
        if(lengthA)jointDef.set_lengthA(lengthA);
        if(lengthB)jointDef.set_lengthB(lengthB);
        jointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2PulleyJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //粘帖关节
    createWeldJoint({
        bodyA,
        bodyB,
        anchor,
        frequencyHz = 0,
        dampingRatio = 0,
        referenceAngle,
        collideConnected=false
    }){
        let jointDef=new b2WeldJointDef();
        jointDef.Initialize(bodyA,bodyB,anchor);
        jointDef.set_frequencyHz(frequencyHz);
        jointDef.set_dampingRatio(dampingRatio);
        if(referenceAngle)jointDef.set_referenceAngle(referenceAngle);
        jointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2WeldJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //距离关节
    createDistanceJoint({
        bodyA,
        bodyB,
        anchorA,
        anchorB,
        frequencyHz = 0,
        dampingRatio = 0,
        length,
        localAnchorA,
        localAnchorB,
        collideConnected=false
    }){
        let jointDef=new b2DistanceJointDef();
        jointDef.Initialize(bodyA,bodyB,anchorA,anchorB);
        jointDef.set_frequencyHz(frequencyHz);
        jointDef.set_dampingRatio(dampingRatio);
        if(length)jointDef.set_length(length);
        if(localAnchorA)jointDef.set_localAnchorA(localAnchorA);
        if(localAnchorB)jointDef.set_localAnchorB(localAnchorB);
        jointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2DistanceJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //旋转关节
    createRevoluteJoint({
        bodyB,
        bodyAX=0,
        bodyAY=0,
        bodyA,
        anchor,
        enableMoter=false,
        maxMototorTorque = 10,
        motorSpeed = 0,
        enableLimit,
        lowerAngle=-Math.PI/6,
        upperAngle=Math.PI/6,
        referenceAngle,
        localAnchorA,
        localAnchorB,
        collideConnected=false
    }){
        let jointDef=new b2RevoluteJointDef();
        if(!bodyA)bodyA=EasyBody.getEmptyBody(bodyAX, bodyAY);
        if(!anchor)anchor=bodyA.GetPosition();
        jointDef.Initialize(bodyA,bodyB,anchor);
        jointDef.set_enableMotor(enableMoter);
        jointDef.set_maxMotorTorque(bodyB.GetMass() * maxMototorTorque);
        jointDef.set_motorSpeed(motorSpeed);
        jointDef.set_enableLimit(enableLimit);
        jointDef.set_lowerAngle(lowerAngle);
        jointDef.set_upperAngle(upperAngle);
        if(referenceAngle)jointDef.set_referenceAngle(referenceAngle);
        if(localAnchorA)jointDef.set_localAnchorA(localAnchorA);
        if(localAnchorB)jointDef.set_localAnchorB(localAnchorB);
        jointDef.set_collideConnected(collideConnected);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2RevoluteJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //位移关节
    createPrismaticJoint({
        bodyB,
        bodyAX = 0,
        bodyAY = 0,
        bodyA,
        anchor,
        axis,
        enableMoter,
        maxMototorForce = 10,
        motorSpeed = 0,
        enableLimit,
        lowerTranslation=-50,
        upperTranslation=50,
        referenceAngle,
        localAnchorA,
        localAnchorB,
    }) {
        let jointDef = new b2PrismaticJointDef();
        if (!bodyA) bodyA = EasyBody.getEmptyBody(bodyAX, bodyAY);
        if (!anchor) anchor = bodyB.GetPosition();
        if (!axis) {
            tempVec.Set(1, 0);
            axis = tempVec;
        }
        axis.Normalize();
        jointDef.Initialize(bodyA, bodyB, anchor, axis)
        jointDef.set_enableMotor(enableMoter);
        jointDef.set_maxMotorForce(bodyB.GetMass() * maxMototorForce);
        jointDef.set_motorSpeed(motorSpeed);
        jointDef.set_enableLimit(enableLimit);
        jointDef.set_lowerTranslation(lowerTranslation/PTM);
        jointDef.set_upperTranslation(upperTranslation/PTM);
        if(referenceAngle)jointDef.set_referenceAngle(referenceAngle);
        if(localAnchorA)jointDef.set_localAnchorA(localAnchorA);
        if(localAnchorB)jointDef.set_localAnchorB(localAnchorB);

        let joint=world.CreateJoint(jointDef);
        joint = Box2D.castObject(joint, Box2D.b2PrismaticJoint);
        Box2D._free(jointDef.a);
        return joint;
    },

    //鼠标关节
    createMouseJoint({
        bodyB,
        anchorB,//全局坐标
        maxForce = 20,
        frequencyHz = 1,
        dampingRatio =0 ,
    }) {
        let mouseJointDef = new b2MouseJointDef();
        mouseJointDef.set_bodyA(EasyBody.getEmptyBody());//设置鼠标关节的一个节点为空刚体，GetGroundBody()可以理解为空刚体
        mouseJointDef.set_bodyB(bodyB);//设置鼠标关节的另一个刚体为鼠标点击的刚体
        mouseJointDef.set_target(anchorB);
        mouseJointDef.set_maxForce(maxForce * bodyB.GetMass());//设置鼠标可以施加的最大的力
        mouseJointDef.set_frequencyHz(frequencyHz)
        mouseJointDef.set_dampingRatio(dampingRatio)
        //创建鼠标关节
        let mouseJoint = world.CreateJoint(mouseJointDef);
        mouseJoint = Box2D.castObject(mouseJoint, Box2D.b2MouseJoint);
        Box2D._free(mouseJointDef.a);
        return mouseJoint;
    },

    getBodyAt(px, py) {
        px /= PTM;
        py /= PTM;
        mouseTempVec.Set(px, py);
        let returnbody = null;
        this._callback = this._callback || new Box2D.JSQueryCallback();
        this._callback.ReportFixture = function (fixture) {
            let f = Box2D.wrapPointer(fixture, b2Fixture);
            let body = f.GetBody();
            let shape = f.GetShape();
            if (shape.TestPoint(body.GetTransform(), mouseTempVec)) {
                returnbody = body;
                return false;
            }
            return true;
        }
        let ab=new b2AABB();
        let abSize = 1 / PTM;
        ab.lowerBound.Set(mouseTempVec.x - abSize, mouseTempVec.y - abSize);
        ab.upperBound.Set(mouseTempVec.x + abSize, mouseTempVec.y + abSize);
        world.QueryAABB(this._callback, ab);
        Box2D._free(ab.a);
        return returnbody;
    },

    /**
     * 开始拖拽
     * @param {*} body 
     * @param {*} mouseX 
     * @param {*} mouseY 
     * @param {20} maxForce 
     * @param {false} isStrictDrag 是否开启精确拖拽
     * @returns 
     */
    drawBodyTo(body, mouseX, mouseY, maxForce = 20, isStrictDrag = false) {
        if (body == null) return;
        if (body.GetType() != b2_dynamicBody) return;
        mouseX /= PTM;
        mouseY /= PTM;
        mouseTempVec.Set(mouseX, mouseY);
        if (isStrictDrag) {
            body.SetTransform(mouseTempVec, body.GetAngle());
        } else {
            if (!this.mouseJoint) {
                //创建鼠标关节需求
                this.mouseJoint=this.createMouseJoint({
                    bodyB: body,
                    anchorB: mouseTempVec,
                    maxForce: maxForce
                })
            }
            this.mouseJoint.SetTarget(mouseTempVec);
        }
    },
    /**
     * 删除鼠标关节
     */
    stopDragBody() {
        if (this.mouseJoint) {
            world.DestroyJoint(this.mouseJoint);
            this.mouseJoint = null;
        }
    },
    /**
     * 固定刚体
     * @param {*} body 
     * @param {*} x 
     * @param {*} y 
     * @param {0} force 
     * @param {0} motorSpeed 
     */
    fixBodyAt(body, x, y, force = 0, motorSpeed = 0) {
        x /= PTM;
        y /= PTM;
        var fixedPoint = new b2Vec2(x, y);
        var revoluteJointDef = new b2RevoluteJointDef()
        revoluteJointDef.Initialize(EasyBody.getEmptyBody(fixedPoint.x * PTM, fixedPoint.y * PTM), body, fixedPoint);
        revoluteJointDef.enableMotor = true;
        revoluteJointDef.motorSpeed = motorSpeed;
        revoluteJointDef.maxMotorTorque = force;
        world.CreateJoint(revoluteJointDef);
        Box2D._free(fixedPoint.a);
        Box2D._free(revoluteJointDef.a);
    },
    releaseBody(body) {
        if (!body) return;
        if (!body.GetJointList().a) return;
        var jointEdge = body.GetJointList();
        while (jointEdge.a) {
            world.DestroyJoint(jointEdge.joint);
            jointEdge = jointEdge.next;
        }
    }
};