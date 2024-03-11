//Having to type 'Box2D.' in front of everything makes porting
//existing C++ code a pain in the butt. This function can be used
//to make everything in the Box2D namespace available without
//needing to do that.

//对象类型转换  mouseJoint = Box2D.castObject(mouseJoint, Box2D.b2MouseJoint);
//                          Box2D.wrapPointer(buffer, Box2D.b2Vec2);
//b2Vec2.op_add +运算 op_sub -运算 op_mul *运算 
var context, world, debugDraw, PTM = 32;
const USER_DATA_PLAYER=9999;
const USER_DATA_PLANET=9998;
const USER_DATA_GROUND=9997;
const USER_DATA_BALL=9996;
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

//to replace original C++ operator =
function copyVec2(vec) {
    return new Box2D.b2Vec2(vec.get_x(), vec.get_y());
}

//to replace original C++ operator * (float)
function scaleVec2(vec, scale) {
    vec.set_x(scale * vec.get_x());
    vec.set_y(scale * vec.get_y());
}

//to replace original C++ operator *= (float)
function scaledVec2(vec, scale) {
    return new Box2D.b2Vec2(scale * vec.get_x(), scale * vec.get_y());
}
function subVec2(vec1, vec2) {
    return new b2Vec2(vec1.x - vec2.x, vec1.y - vec2.y);
}
function addVec2(vec1,vec2){
    return new b2Vec2(vec1.x+vec2.x,vec1.y+vec2.y);
}

// http://stackoverflow.com/questions/12792486/emscripten-bindings-how-to-create-an-accessible-c-c-array-from-javascript
function createChainShape(vertices, closedLoop) {
    var shape = new Box2D.b2ChainShape();
    var buffer = Box2D._malloc(vertices.length * 8);
    var offset = 0;
    for (var i = 0; i < vertices.length; i++) {
        Box2D.HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
        Box2D.HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
        offset += 8;
    }
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    if (closedLoop)
        shape.CreateLoop(ptr_wrapped, vertices.length);
    else
        shape.CreateChain(ptr_wrapped, vertices.length);
    return shape;
}
//任意边形
function createPolygonShape(vertices) {
    var shape = new Box2D.b2PolygonShape();
    var buffer = Box2D._malloc(vertices.length * 8);
    var offset = 0;
    for (var i = 0; i < vertices.length; i++) {
        Box2D.HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
        Box2D.HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
        offset += 8;
    }
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    shape.Set(ptr_wrapped, vertices.length);
    return shape;
}
//随机多边形
function createRandomPolygonShape(radius) {
    var numVerts = 3.5 + Math.random() * 5;
    numVerts = numVerts | 0;
    var verts = [];
    for (var i = 0; i < numVerts; i++) {
        var angle = i / numVerts * 360.0 * 0.0174532925199432957;
        verts.push(new b2Vec2(radius * Math.sin(angle), radius * -Math.cos(angle)));
    }
    return createPolygonShape(verts);
}
/****************************************************************
 * 
 ****************************************************************/
var EasyShape = {
    createCircle(radius, localX = 0, localY = 0) {
        radius /= PTM;
        localX /= PTM;
        localY /= PTM;
        let circle = new b2CircleShape();
        circle.set_m_radius(radius);
        circle.set_m_p(localX, localY);
        return circle;
    },
    createBox(w, h, localX = 0, localY = 0, angle = 0) {
        w /= PTM;
        h /= PTM;
        localX /= PTM;
        localY /= PTM;
        let box = new b2PolygonShape();
        box.SetAsBox(w / 2, h / 2, new b2Vec2(localX, localY), angle);
        return box;
    },
    //梯形
    createTrapezium(tw, bw, h) {
        tw /= PTM;
        bw /= PTM;
        h /= PTM;
        let vertices = [];
        vertices.push(new b2Vec2(-tw / 2, -h / 2));
        vertices.push(new b2Vec2(tw / 2, -h / 2));
        vertices.push(new b2Vec2(bw / 2, h / 2));
        vertices.push(new b2Vec2(-bw / 2, h / 2));
        let shape = createPolygonShape(vertices);
        return shape;
    },
    //多边形
    createRegular(radius, verticesCount) {
        radius /= PTM;
        var angle = Math.PI * 2 / verticesCount;//每个顶点之间的角度间隔
        var vertices = [];
        var vertix;
        //移动到第一个顶点
        for (var i = 0; i < verticesCount; i++) {
            //计算每个顶点
            vertix = new b2Vec2(radius * Math.cos(i * angle + (Math.PI - angle) / 2), radius * Math.sin(i * angle + (Math.PI - angle) / 2));
            vertices.push(vertix);
        }
        var regularShape = createPolygonShape(vertices);

        return regularShape;
    },
    //扇形
    createFan(radius, angleSize) {
        if (angleSize >= 180) angleSize = 180;
        radius /= PTM;
        let arcSimulateAnglePrecise = angleSize / 6;
        angleSize = angleSize / 180 * Math.PI;
        arcSimulateAnglePrecise = arcSimulateAnglePrecise * Math.PI / 180;
        var verticesList = [];
        var tempVertex = new b2Vec2();
        verticesList.push(tempVertex);

        // var verticesCount = Math.floor(Math.PI * 2 / arcSimulateAnglePrecise * angleSize / Math.PI / 2) + 1;
        for (var i = 0; i < 6; i++) {
            tempVertex = copyVec2(tempVertex);
            tempVertex.Set(
                radius * Math.cos(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2),
                radius * Math.sin(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2)
            );
            verticesList.push(tempVertex);
        }
        tempVertex = copyVec2(tempVertex);
        tempVertex.Set(
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
        var verticesList = new Array();
        var tempVertex = new b2Vec2();

        for (var i = 0; i < 6; i++) {
            tempVertex = copyVec2(tempVertex);
            tempVertex.Set(
                r * Math.cos(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2),
                r * Math.sin(arcSimulateAnglePrecise * i + (Math.PI - angleSize) / 2) - r + h
            );
            verticesList.push(tempVertex);
        }
        tempVertex = copyVec2(tempVertex);
        tempVertex.Set(
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
        var verticesList = new Array();
        var verticesCount = Math.floor(Math.PI * 2 / arcSimulateAnglePrecise);
        for (var i = 0; i < verticesCount; i++) {
            px = w / 2 * Math.cos(arcSimulateAnglePrecise * i);
            py = h / 2 * Math.sin(arcSimulateAnglePrecise * i);
            verticesList.push(new b2Vec2(px, py));
        }

        var shape = createPolygonShape(verticesList);
        return shape;
    },
    //平台
    createPlatform(w, h) {
        w /= PTM;
        h /= PTM;
        var verticesList = [];
        verticesList.push(new b2Vec2(-w / 2, -h / 2));
        verticesList.push(new b2Vec2(w / 2, -h / 2));
        verticesList.push(new b2Vec2(w / 2, h / 2));
        verticesList.push(new b2Vec2(0, h / 2 + 10 / 30));
        verticesList.push(new b2Vec2(-w / 2, h / 2));
        var shape = createPolygonShape(verticesList);
        return shape;
    }
}

var EasyBody = {
    getEmptyBody(xpos = 0, ypos = 0, type = 0) {
        xpos /= PTM;
        ypos /= PTM;
        let bodyDef = new b2BodyDef();
        bodyDef.type = type;
        bodyDef.position.Set(xpos, ypos);
        return world.CreateBody(bodyDef);
    },
    _getFixtureDef() {
        var fixtureDefine = new b2FixtureDef();
        fixtureDefine.density = 3;
        fixtureDefine.friction = 0.3;
        fixtureDefine.restitution = 0.3;
        return fixtureDefine;
    },
    createBodyFromShape(xpos, ypos, shape, type = 2) {
        var fixtureDefine = this._getFixtureDef();
        fixtureDefine.shape = shape;

        var body = this.getEmptyBody(xpos, ypos, type);
        body.CreateFixture(fixtureDefine);

        return body;
    },
    /**
         * 创建并返回一个标准矩形刚体
         * @param posX	坐标x
         * @param posY	坐标y
         * @param boxWidth	宽度
         * @param boxHeight 高度
         * @param type	刚体类型，b2Body中刚体类型常量之一
         * @return 
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
    createChain(points, colsedLoop, type = 0) {
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
    /*
    * 在Box2D世界中创建围绕canvas四周的静态墙体，
    * @param	world 承载所有刚体的Box2D世界
    * @param	canvas	要用静态墙体包围的舞台
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
    }
};
var mouseJoint = null;
var EasyWorld = {
    getBodyAt(px, py) {
        px /= PTM;
        py /= PTM;
        let point = new b2Vec2(px, py);
        let returnbody = null;
        var callback = new Box2D.JSQueryCallback();
        callback.ReportFixture = function (fixture) {
            let f = Box2D.wrapPointer(fixture, b2Fixture);
            let body = f.GetBody();
            let shape = f.GetShape();
            if (shape.TestPoint(body.GetTransform(), point)) {
                returnbody = body;
                return false;
            }
            return true;
        }
        let ab = new b2AABB();
        let abSize = 1 / PTM;
        ab.lowerBound.Set(point.x - abSize, point.y - abSize);
        ab.upperBound.Set(point.x + abSize, point.y + abSize);
        world.QueryAABB(callback, ab);
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
    drawBodyTo(body, mouseX, mouseY, isStrictDrag = false) {
        var mouseVector = new b2Vec2();
        if (body == null) return;
        if (body.GetType() != b2_dynamicBody) return;
        mouseX /= PTM;
        mouseY /= PTM;
        if (mouseJoint == null) {
            //创建鼠标关节需求
            var mouseJointDef = new b2MouseJointDef();
            mouseJointDef.bodyA = world.CreateBody(new b2BodyDef());//设置鼠标关节的一个节点为空刚体，GetGroundBody()可以理解为空刚体
            mouseJointDef.bodyB = body;//设置鼠标关节的另一个刚体为鼠标点击的刚体
            mouseJointDef.target.Set(mouseX, mouseY);//更新鼠标关节拖动的点
            mouseJointDef.maxForce = 1000 * body.GetMass();//设置鼠标可以施加的最大的力
            // mouseJointDef.collideConnected(true);
            //创建鼠标关节
            mouseJoint = world.CreateJoint(mouseJointDef);
            mouseJoint=Box2D.castObject(mouseJoint,Box2D.b2MouseJoint);
        }
        mouseVector.x = mouseX;
        mouseVector.y = mouseY;
        if (isStrictDrag || body.GetJointList() == null) {
            body.SetTransform(mouseVector, body.GetAngle());
        }
        mouseJoint.SetTarget(mouseVector);
    },
    stopDragBody() {
        if (mouseJoint != null) {
            world.DestroyJoint(mouseJoint);
            mouseJoint = null;
        }
    },
    fixBodyAt(body, posX, posY, force = 0) {
        posX /= PTM;
        posY /= PTM;
        var fixedPoint = new b2Vec2(posX, posY);
        var revoluteJointDef = new b2RevoluteJointDef();
        revoluteJointDef.Initialize(world.CreateBody(new b2BodyDef()), body, fixedPoint);
        revoluteJointDef.localAnchorB = body.GetLocalPoint(fixedPoint);
        revoluteJointDef.enableMotor = true;
        revoluteJointDef.motorSpeed = 0;
        revoluteJointDef.maxMotorTorque = force;
        world.CreateJoint(revoluteJointDef);
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
        this._birdPrePos = copyVec2(body.GetPosition());
    }
    update() {
        this._drawDotTo(this._bird.GetPosition())
    }
    startFromHere() {
        this.graphics.clear();
        this._birdPrePos = copyVec2(this._bird.GetPosition())
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
        this._tempBodyA = null;
        this._tempBodyB = null;
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
    PreSolve(contact,manifold) { };
    BeginContact(contact) { }
    PostSolve(contact,impulse) { };
    EndContact(contact) { }
    sortByOneBody(contact, targetA) {
        this._tempBodyA = contact.GetFixtureA().GetBody();
        this._tempBodyB = contact.GetFixtureB().GetBody();
        var userDataA = this._tempBodyA.GetUserData();
        var userDataB = this._tempBodyB.GetUserData();
        var result;
        if (userDataA == targetA) {
            result = [this._tempBodyA, this._tempBodyB];
        } else if (userDataB == targetA) {
            result = [this._tempBodyB, this._tempBodyA];
        }
        return result;
    }
    sortByTwoBody(contact, targetA, targetB) {
        var checkResult;
        this._tempBodyA = contact.GetFixtureA().GetBody();
        this._tempBodyB = contact.GetFixtureB().GetBody();
        var userDataA = this._tempBodyA.GetUserData();
        var userDataB = this._tempBodyB.GetUserData();
        if (userDataA == targetA && userDataB == targetB) {
            checkResult = [this._tempBodyA, this._tempBodyB];
        } else if (userDataB == targetA && userDataA == targetB) {
            checkResult = [this._tempBodyB, this._tempBodyA];
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
        return wm.normal;
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
        var checkResult = this.sortByOneBody(contact,USER_DATA_PLAYER);
        if (!checkResult) return;
        let player=checkResult[0];
        let another = checkResult[1];
        if (another.GetUserData() == USER_DATA_GROUND) {
            let velocity = player.GetLinearVelocity();
            if (velocity.y >= 0) {
                this.checkIsReadyToJump(contact,player);
            }
        } else if (another.GetUserData() ==USER_DATA_PLANET) {
            this.isContactWithPlatform(contact,player);
        }
    }
    EndContact(contact) {
        var checkResult = this.sortByOneBody(contact,USER_DATA_PLAYER);
        if (!checkResult) return;
        checkResult[0].isReadyToJump = false;
    }
    isContactWithPlatform(contact,player) {
        let velocity = player.GetLinearVelocity();
        if (velocity.y < 0) {
            contact.SetEnabled(false);
        } else {
            this.checkIsReadyToJump(contact,player);
        }
    }
    checkIsReadyToJump(contact,player) {
        contact.SetRestitution(0)
        let wm = new b2WorldManifold();
        contact.GetWorldManifold(wm);
        let v = wm.get_normal();
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
        this._center = copyVec2(bird.body.GetPosition());

        this._trail = new Trail(this, bird.body)
        this._dragLine = new createjs.Shape();
        this.addChild(this._dragLine);
        parent.addChild(this._trail)
        this.drawActiveSize();
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
                var impulse = copyVec2(this._distanceToCenter);
                let mass = this._bird.body.GetMass();
                impulse.Set(-impulse.x * mass * this.maxThrowImpulse, -impulse.y * mass * this.maxThrowImpulse)

                this._bird.body.ApplyLinearImpulse(impulse, this._bird.body.GetPosition());
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
/**
 * 复制刚体属性
 * @param {*} body 
 * @returns 
 */
function getDefinition(body) {
    var bd = new b2BodyDef();
    bd.type = body.GetType();
    bd.allowSleep = body.IsSleepingAllowed();
    bd.angle = body.GetAngle();
    bd.angularDamping = body.GetAngularDamping();
    bd.angularVelocity = body.GetAngularVelocity();
    bd.fixedRotation = body.IsFixedRotation();
    bd.bullet = body.IsBullet();
    bd.awake = body.IsAwake();
    bd.linearDamping = body.GetLinearDamping();
    bd.linearVelocity = body.GetLinearVelocity();
    bd.position = body.GetPosition();
    // bd.userData = body.GetUserData();
    return bd;
}
/**
 * 分裂刚体
 * @param {*} body 
 * @param {*} callback 
 */
function splits(body, callback) {
    var fixture = body.GetFixtureList();
    var next;
    while (fixture.a) {
        next = fixture.GetNext();
        if (callback(fixture)) {
            let body1 = world.CreateBody(getDefinition(body));
            body1.CreateFixture(fixture.GetShape(), 3);
            
            body.DestroyFixture(fixture);
        }
        fixture = next;
    }
}
