//Having to type 'Box2D.' in front of everything makes porting
//existing C++ code a pain in the butt. This function can be used
//to make everything in the Box2D namespace available without
//needing to do that.

//1.对象类型转换  mouseJoint = Box2D.castObject(mouseJoint, Box2D.b2MouseJoint);
//                          Box2D.wrapPointer(buffer, Box2D.b2Vec2);
//2.b2Vec2.op_add +运算 op_sub -运算 op_mul *运算 
//3.b2Vec2返回都为引用，const b2Vec2:自动更新   b2Vec2:手动执行更新
var context, world, debugDraw, PTM = 32;
const USER_DATA_PLAYER = 9999;
const USER_DATA_PLANET = 9998;
const USER_DATA_GROUND = 9997;
const USER_DATA_BALL = 9996;
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
function createChainShape(vertices, closedLoop) {
    var shape = new Box2D.b2ChainShape();
    var buffer = Box2D._malloc(vertices.length * 8)
    var ptr_wrapped = Box2D.wrapPointer(arrayToMalloc(vertices, buffer), Box2D.b2Vec2);
    if (closedLoop)
        shape.CreateLoop(ptr_wrapped, vertices.length);
    else shape.CreateChain(ptr_wrapped, vertices.length);
    return shape;
}
//任意边形
function createPolygonShape(vertices) {
    var shape = new Box2D.b2PolygonShape();
    var buffer = Box2D._malloc(vertices.length * 8)
    var ptr_wrapped = Box2D.wrapPointer(arrayToMalloc(vertices, buffer), Box2D.b2Vec2);
    shape.Set(ptr_wrapped, vertices.length);
    return shape;
}

/****************************************************************
 * 
 ****************************************************************/
var EasyShape = {
    _tempV: null,
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
        this._tempV = this._tempV || new b2Vec2();
        this._tempV.Set(localX, localY)
        box.SetAsBox(w / 2, h / 2, this._tempV, angle);
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
        let shape = createPolygonShape(vertices);
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
        var regularShape = createPolygonShape(vertices);
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

        var fanShape = createPolygonShape(verticesList);
        return fanShape;
    },
    //类似半圆（船形）
    createSemiCicle(w, h) {
        w /= PTM;
        h /= PTM;
        var arcSimulateAnglePrecise = 30 * Math.PI / 180;
        var r = (h * h + w * w / 4) / h / 2
        var angleSize = Math.acos((r - h) / r) * 2;
        if (angleSize < arcSimulateAnglePrecise) throw Error("the angle of semicircle is too small");
        var verticesList = [];
        var tempVertex = new createjs.Point();

        for (var i = 0; i < 6; i++) {
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
        var shape = createPolygonShape(verticesList);
        return shape;
    },
    //边线
    createEdge(v1x, v1y, v2x, v2y) {
        var p1 = new b2Vec2(v1x / PTM, v1y / PTM);
        var p2 = new b2Vec2(v2x / PTM, v2y / PTM);
        var edge = new b2EdgeShape();
        edge.Set(p1, p2);
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

        var shape = createPolygonShape(verticesList);
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
        var shape = createPolygonShape(verticesList);
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
        return createPolygonShape(verts);
    }
}

var EasyBody = {
    bodyDef: null, fixtureDef: null,
    getEmptyBody(xpos = 0, ypos = 0, type = 0) {
        xpos /= PTM;
        ypos /= PTM;
        this.bodyDef = this.bodyDef || new b2BodyDef();
        this.bodyDef.type = type;
        this.bodyDef.allowSleep = true;
        this.bodyDef.fixedRotation = false;
        this.bodyDef.bullet = false;
        this.bodyDef.position.Set(xpos, ypos);
        this.bodyDef.angle = 0;
        this.bodyDef.awake = true;
        this.bodyDef.angularDamping = 0;
        this.bodyDef.linearDamping = 0;
        this.bodyDef.linearVelocity.Set(0, 0);
        this.bodyDef.angularVelocity = 0;
        return world.CreateBody(this.bodyDef);
    },
    /**
    * 复制刚体属性
    * @param {*} body 
    * @returns 
    */
    getCopyBodyDef(body) {
        this.bodyDef = this.bodyDef || new b2BodyDef();
        this.bodyDef.type = body.GetType();
        this.bodyDef.allowSleep = body.IsSleepingAllowed();
        this.bodyDef.angle = body.GetAngle();
        this.bodyDef.angularDamping = body.GetAngularDamping();
        this.bodyDef.angularVelocity = body.GetAngularVelocity();
        this.bodyDef.fixedRotation = body.IsFixedRotation();
        this.bodyDef.bullet = body.IsBullet();
        this.bodyDef.awake = body.IsAwake();
        this.bodyDef.linearDamping = body.GetLinearDamping();
        this.bodyDef.linearVelocity = body.GetLinearVelocity();
        this.bodyDef.position = body.GetPosition();
        return this.bodyDef;
    },
    _createFixtureDef() {
        this.fixtureDef = this.fixtureDef || new b2FixtureDef();
        this.fixtureDef.density = 3;
        this.fixtureDef.friction = 0.3;
        this.fixtureDef.restitution = 0.3;
    },
    createBodyFromShape(xpos, ypos, shape, type = 2) {
        this._createFixtureDef();
        this.fixtureDef.shape = shape;
        var body = this.getEmptyBody(xpos, ypos, type);
        body.CreateFixture(this.fixtureDef);
        return body;
    },
    /**
    * 创建并返回一个标准矩形刚体
    * @param posX	坐标x
    * @param posY	坐标y
    * @param boxWidth	宽度
    * @param boxHeight 高度
    * @param {2}type	刚体类型，b2Body中刚体类型常量之一
    * @return body
    */
    createBox(posX, posY, boxWidth, boxHeight, type = 2) {
        var shape = EasyShape.createBox(boxWidth, boxHeight);
        var body = this.createBodyFromShape(posX, posY, shape, type);
        return body;
    },
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
        var shape = createChainShape(points, colsedLoop);
        var body = this.createBodyFromShape(0, 0, shape, type);
        return body;
    },
    createCircle(posX, posY, radius, type = 2) {
        var shape = EasyShape.createCircle(radius);
        var body = this.createBodyFromShape(posX, posY, shape, type);
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
    createRegular(xpos, ypos, radius, verticesCount = 5, type = 2) {
        var shape = EasyShape.createRegular(radius, verticesCount);
        var body = this.createBodyFromShape(xpos, ypos, shape, type);
        return body;
    },
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
        var shape = createPolygonShape(vertices);
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
        };
        //bottom
        if (!bottomOpen) {
            wall = this.createBox(x + w / 2, y + h, w, thinkness, type);
            wall.GetFixtureList().SetFilterData(fullFilter);
        }
        //left
        wall = this.createBox(x, y + h / 2, thinkness, h, type);
        wall.GetFixtureList().SetFilterData(fullFilter);
        //right
        wall = this.createBox(x + w, y + h / 2, thinkness, h, type);
        wall.GetFixtureList().SetFilterData(fullFilter);
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
    mouseJoint: null,
    _point: null,
    _callback: null,
    _ab: null,
    _mouseJointDef: null,
    _fixedPoint: null,
    _revoluteJointDef: null,
    getBodyAt(px, py) {
        px /= PTM;
        py /= PTM;
        this._point = this._point || new b2Vec2();
        this._point.Set(px, py);
        let returnbody = null;
        this._callback = this._callback || new Box2D.JSQueryCallback();
        let t = this;
        this._callback.ReportFixture = function (fixture) {
            let f = Box2D.wrapPointer(fixture, b2Fixture);
            let body = f.GetBody();
            let shape = f.GetShape();
            if (shape.TestPoint(body.GetTransform(), t._point)) {
                returnbody = body;
                return false;
            }
            return true;
        }
        this._ab = this._ab || new b2AABB();
        let abSize = 1 / PTM;
        this._ab.lowerBound.Set(this._point.x - abSize, this._point.y - abSize);
        this._ab.upperBound.Set(this._point.x + abSize, this._point.y + abSize);
        world.QueryAABB(this._callback, this._ab);
        return returnbody;
    },
    /**
     * 开始拖拽
     * @param {*} body 
     * @param {*} mouseX 
     * @param {*} mouseY 
     * @param {false} isStrictDrag 是否开启精确拖拽
     * @returns 
     */
    drawBodyTo(body, mouseX, mouseY, maxForce = 20, isStrictDrag = false) {
        this._point = this._point || new b2Vec2();
        if (body == null) return;
        if (body.GetType() != b2_dynamicBody) return;
        mouseX /= PTM;
        mouseY /= PTM;
        if (isStrictDrag) {
            body.SetTransform(this._point, body.GetAngle());
        } else {
            if (this.mouseJoint == null) {
                //创建鼠标关节需求
                this._mouseJointDef = this._mouseJointDef || new b2MouseJointDef();
                this._mouseJointDef.bodyA = EasyBody.getEmptyBody();//设置鼠标关节的一个节点为空刚体，GetGroundBody()可以理解为空刚体
                this._mouseJointDef.bodyB = body;//设置鼠标关节的另一个刚体为鼠标点击的刚体
                this._mouseJointDef.target.Set(mouseX, mouseY);//更新鼠标关节拖动的点
                this._mouseJointDef.maxForce = maxForce * body.GetMass();//设置鼠标可以施加的最大的力
                // mouseJointDef.collideConnected(true);
                //创建鼠标关节
                this.mouseJoint = world.CreateJoint(this._mouseJointDef);
                this.mouseJoint = Box2D.castObject(this.mouseJoint, Box2D.b2MouseJoint);
            }
            this._point.x = mouseX;
            this._point.y = mouseY;
            this.mouseJoint.SetTarget(this._point);
        }
        this._point.x = mouseX;
        this._point.y = mouseY;
    },
    stopDragBody() {
        if (this.mouseJoint != null) {
            world.DestroyJoint(this.mouseJoint);
            this.mouseJoint = null;
        }
    },
    fixBodyAt(body, posX, posY, force = 0, motorSpeed = 0) {
        posX /= PTM;
        posY /= PTM;
        this._fixedPoint = this._fixedPoint || new b2Vec2();
        this._fixedPoint.Set(posX, posY);
        this._revoluteJointDef = this._revoluteJointDef || new b2RevoluteJointDef();
        this._revoluteJointDef.Initialize(EasyBody.getEmptyBody(this._fixedPoint.x * PTM, this._fixedPoint.y * PTM), body, this._fixedPoint);
        this._revoluteJointDef.enableMotor = true;
        this._revoluteJointDef.motorSpeed = motorSpeed;
        this._revoluteJointDef.maxMotorTorque = force;
        world.CreateJoint(this._revoluteJointDef);
    },
    releaseBody(body) {
        if (body == null) return;
        if (body.GetJointList() == null) return;
        var jointEdge = body.GetJointList();
        while (jointEdge.a) {
            world.DestroyJoint(jointEdge.joint);
            jointEdge = jointEdge.next;
        }
    }
};
//刚体轨迹
class Trail extends createjs.Shape {
    constructor(parent, body, dotDistance = 20) {
        super();
        parent.addChild(this);
        this.trailDistance = dotDistance;
        this.trailColor = "rgba(255,255,255,0.5)";
        this._dotSize = 1;
        this._bird = body;
        let p = body.GetPosition();
        this._birdPrePos = new createjs.Point(p.x, p.y);
    }
    update() {
        this._drawDotTo(this._bird.GetPosition())
    }
    startFromHere() {
        this.graphics.clear();
        let p = this._bird.GetPosition();
        this._birdPrePos.setValues(p.x, p.y);
    }
    _drawDotTo(birdCurPos) {
        this.graphics.setStrokeStyle(1).beginStroke(this.trailColor);
        let dx = birdCurPos.x - this._birdPrePos.x;
        let dy = birdCurPos.y - this._birdPrePos.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var distanceVec;
        while (distance > this.trailDistance / PTM) {
            distanceVec = new createjs.Point(birdCurPos.x - this._birdPrePos.x, birdCurPos.y - this._birdPrePos.y);
            let a = this.trailDistance / PTM / distance;
            distanceVec.setValues(distanceVec.x * a, distanceVec.y * a);
            this._birdPrePos.x += distanceVec.x;
            this._birdPrePos.y += distanceVec.y;
            this._dotSize = Math.random() > 0.5 ? 2 : 1;
            this.graphics.drawCircle(this._birdPrePos.x * PTM, this._birdPrePos.y * PTM, this._dotSize);
            let dx = birdCurPos.x - this._birdPrePos.x;
            let dy = birdCurPos.y - this._birdPrePos.y;
            distance = Math.sqrt(dx * dx + dy * dy);
        }
    }
}
/**
 * 碰撞侦听
 */
class ContactListener {
    constructor() {
        this.contactListener = new Box2D.JSContactListener();
        world.SetContactListener(this.contactListener);
        this.contactListener.PreSolve = (contactPtr, b2ManifoldPtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            var manifold = Box2D.wrapPointer(b2ManifoldPtr, b2Manifold);
            this.PreSolve(contact, manifold);
        }
        this.contactListener.BeginContact = (contactPtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            this.BeginContact(contact);
        }
        this.contactListener.PostSolve = (contactPtr, b2ContactImpulsePtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            var impulse = Box2D.wrapPointer(b2ContactImpulsePtr, b2ContactImpulse);
            this.PostSolve(contact, impulse);
        }
        this.contactListener.EndContact = (contactPtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            this.EndContact(contact);
        }
    }
    PreSolve(contact, manifold) { };
    BeginContact(contact) { }
    PostSolve(contact, impulse) { };
    EndContact(contact) { }
    /**
     * 查找目标对象
     * @param {*} contact 
     * @param {number} targetA 
     * @returns 
     */
    sortByOneBody(contact, targetA) {
        let _tempBodyA = contact.GetFixtureA().GetBody();
        let _tempBodyB = contact.GetFixtureB().GetBody();
        var userDataA = _tempBodyA.GetUserData();
        var userDataB = _tempBodyB.GetUserData();
        var result;
        if (userDataA == targetA) {
            result = [_tempBodyA, _tempBodyB];
        } else if (userDataB == targetA) {
            result = [_tempBodyB, _tempBodyA];
        }
        return result;
    }
    sortByOneFixture(contact, userData) {
        let tempFA = contact.GetFixtureA();
        let tempFB = contact.GetFixtureB();
        let userDataA = tempFA.GetUserData();
        let userDataB = tempFB.GetUserData();
        let result;
        if (userDataA == userData) {
            result = [tempFA, tempFB]
        } else if (userDataB == userData) {
            result = [tempFB, tempFA];
        }
        return result;
    }
    sortByTwoBody(contact, targetA, targetB) {
        var checkResult;
        let _tempBodyA = contact.GetFixtureA().GetBody();
        let _tempBodyB = contact.GetFixtureB().GetBody();
        var userDataA = _tempBodyA.GetUserData();
        var userDataB = _tempBodyB.GetUserData();
        if (userDataA == targetA && userDataB == targetB) {
            checkResult = [_tempBodyA, _tempBodyB];
        } else if (userDataB == targetA && userDataA == targetB) {
            checkResult = [_tempBodyB, _tempBodyA];
        }
        return checkResult;
    }
    getContactPoint(contact) {
        var wm = new b2WorldManifold();
        contact.GetWorldManifold(wm);
        return wm.points;
    }
    getContactNomal(contact) {
        var wm = new b2WorldManifold();
        contact.GetWorldManifold(wm);
        return wm.get_normal();
    }
    getContactPoint(contact) {
        let wm = new b2WorldManifold();
        contact.GetWorldManifold(wm);
        return wm.points;
    }
}
class BallMoveContactListener extends ContactListener {
    constructor() {
        super()
    }
    PreSolve(contact) {
        var checkResult = this.sortByOneBody(contact, USER_DATA_BALL);
        if (!checkResult) return;
        let player = checkResult[0];
        let another = checkResult[1];
        if (another.GetUserData() == USER_DATA_GROUND) {
            let velocity = player.GetLinearVelocity();
            if (velocity.y >= 0) {
                this.checkIsReadyToJump(contact, player);
            }
        } else if (another.GetUserData() == USER_DATA_PLANET) {
            this.isContactWithPlatform(contact, player);
        }
    }
    EndContact(contact) {
        var checkResult = this.sortByOneBody(contact, USER_DATA_BALL);
        if (!checkResult) return;
        checkResult[0].isReadyToJump = false;
    }
    isContactWithPlatform(contact, player) {
        let velocity = player.GetLinearVelocity();
        if (velocity.y < 0) {
            contact.SetEnabled(false);
        } else {
            this.checkIsReadyToJump(contact, player);
        }
    }
    checkIsReadyToJump(contact, player) {
        contact.SetRestitution(0)
        let v = this.getContactNomal(contact);
        let contactAngle = Math.atan2(v.y, v.x);
        if (contactAngle < -Math.PI / 4 && contactAngle > -Math.PI * 3 / 4) player.isReadyToJump = true;
    }
}
//弹弓
class BirdThrower extends createjs.Container {
    constructor(parent, bird, posX, posY) {
        super();
        parent.addChild(this);
        this.x = posX;
        this.y = posY;
        this._isBirdPressed = false;
        this.isBirdMoveing = false;
        this.maxThrowImpulse = 4;
        this._bird = bird;
        this._bird.body.SetTransform(new b2Vec2(posX / PTM, posY / PTM), 0)
        this._bird.body.SetActive(false);

        this._mousePoint = new b2Vec2();
        this._activeSize = 70;
        this._distanceToCenter = new b2Vec2();
        let p = bird.body.GetPosition();
        this._center = new createjs.Point(p.x, p.y);

        this._trail = new Trail(this, bird.body)
        this._dragLine = new createjs.Shape();
        this.addChild(this._dragLine);
        parent.addChild(this._trail)
        this.drawActiveSize();

        this.impulse = new b2Vec2();

        this.addEvent();
    }
    addEvent() {
        this._bird.on("mousedown", (e) => {
            if (this.isBirdMoveing) return;
            this._bird.body.SetActive(false);
            this._mousePoint.x = e.stageX / PTM;
            this._mousePoint.y = e.stageY / PTM;
            this._isBirdPressed = (e.target == this._bird);
        });
        this._bird.on("pressup", () => {
            if (this._isBirdPressed) {
                this._isBirdPressed = false;
                this._bird.body.SetActive(true);
                // var impulse = copyVec2(this._distanceToCenter);
                this.impulse.Set(this._distanceToCenter.x, this._distanceToCenter.y);
                let mass = this._bird.body.GetMass();
                this.impulse.Set(-this.impulse.x * mass * this.maxThrowImpulse, -this.impulse.y * mass * this.maxThrowImpulse)

                this._bird.body.ApplyLinearImpulse(this.impulse, this._bird.body.GetPosition());
                this.isBirdMoveing = true;
                this._trail.startFromHere();
                this._dragLine.graphics.clear();
                this.drawActiveSize();
            }
        });
        this._bird.on("pressmove", (e) => {
            this._mousePoint.x = e.stageX / PTM;
            this._mousePoint.y = e.stageY / PTM;
            if (this._isBirdPressed) {
                let dx = this._mousePoint.x - this._center.x;
                let dy = this._mousePoint.y - this._center.y;
                this._distanceToCenter.Set(dx, dy);
                if (this._distanceToCenter.Length() * PTM >= this._activeSize) {
                    let a = this._activeSize / PTM / this._distanceToCenter.Length()
                    this._distanceToCenter.Set(this._distanceToCenter.x * a, this._distanceToCenter.y * a);
                    let dx = this._distanceToCenter.x + this._center.x;
                    let dy = this._distanceToCenter.y + this._center.y;
                    this._mousePoint.Set(dx, dy)
                }
                this._bird.body.SetTransform(this._mousePoint, 0);

                this._dragLine.graphics.clear().setStrokeStyle(1).beginStroke("#fff").moveTo(0, 0).lineTo(this._mousePoint.x * PTM - this.x, this._mousePoint.y * PTM - this.y);
                this.drawActiveSize();
            }
        })
    }
    drawActiveSize() {
        let a = this._dragLine.graphics;
        a.setStrokeStyle(2).beginStroke("#555").moveTo(0, 0).lineTo(0, this._activeSize);
        a.setStrokeStyle(1).drawCircle(0, 0, 5);
        a.setStrokeStyle(1).beginStroke("rgba(255,0,0,0.4)").drawCircle(0, 0, this._activeSize);
        a.beginFill("#000").drawEllipse(-10, this._activeSize, 20, 5).endFill();
    }
    drawTrail() {
        if (this.isBirdMoveing) {
            this._trail.update();
        }
    }
    SetActiveSize(val) {
        this._activeSize = val;
        this.drawActiveSize();
    }
    reset() {
        this.isBirdMoveing = false;
        this._bird.body.SetLinearVelocity(new b2Vec2(0, 0));
        this._bird.body.SetAngularVelocity(0);
        this._bird.body.SetTransform(new b2Vec2(this.x / PTM, this.y / PTM), 0);
        this._bird.body.SetActive(false);
    }
}
