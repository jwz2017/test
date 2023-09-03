import { game } from "./gframe.js";
import { checkPixelCollision } from "./hitTest.js";
//向量角色类**************************************************************************
class Vector {
  static angleBetween = function (v1, v2) {
    if (!v1.isNormalized()) v1 = v1.clone().normalize();
    if (!v2.isNormalized()) v2 = v2.clone().normalize();
    return Math.acos(v1.dot(v2));
  }
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  zero() {
    this.x = this.y = 0;
    return this;
  }
  setValues(x, y) {
    this.x = x;
    this.y = y;
  }
  add(other) {
    this.x += other.x;
    this.y += other.y;
  }
  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y)
  }
  times(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
  divide(val) {
    return new Vector(this.x / val, this.y / val);
  }
  equals(v2) {
    return this.x == v2.x && this.y == v2.y;
  }
  //内积
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  //外积
  crossProd(v2) {
    return this.x * v2.y - this.y * v2.x;
  }
  //判断在左还是右-1左，1右
  sign(v2) {
    return this.perp.dot(v2) < 0 ? -1 : 1;
  }
  get perp() {
    return new Vector(-this.y, this.x);
  }
  dist(v2) {
    return Math.sqrt(this.distQT(v2));
  }
  distQT(v2) {
    let dx = v2.x - this.x;
    let dy = v2.y - this.y;
    return dx * dx + dy * dy;
  }
  //坐标旋转
  rotate(angle, reverse = false) {
    let cos = Math.cos(angle),
      sin = Math.sin(angle);
    if (reverse) {
      var x1 = this.x * cos + this.y * sin;
      var y1 = this.y * cos - this.x * sin;
    } else {
      var x1 = this.x * cos - this.y * sin;
      var y1 = this.y * cos + this.x * sin;
    }
    this.x = x1;
    this.y = y1;
  }
  clone() {
    return new Vector(this.x, this.y);
  }
  get length() {
    return Math.sqrt(this.lengthSQ);
  }
  set length(val) {
    let a = this.angle;
    this.x = Math.cos(a) * val;
    this.y = Math.sin(a) * val;
  }
  get lengthSQ() {
    return this.x * this.x + this.y * this.y;
  }
  set angle(val) {
    let len = this.length;
    this.x = Math.cos(val) * len;
    this.y = Math.sin(val) * len;
  }
  get angle() {
    return Math.atan2(this.y, this.x);
  }
  truncate(max) {
    this.length = Math.min(max, this.length);
    return this;
  }
  normalize() {
    if (this.length == 0) {
      this.x = 1;
      return this;
    }
    let len = this.length;
    this.x /= len;
    this.y /= len;
    return this;
  }
  isNormalized() {
    return this.length == 1;
  }
}
class Actor extends createjs.Container {
  static WRAP = "wrap";
  static BOUNCE = "bounce";
  static RECYCLE = "recycle";
  constructor(xpos = 0, ypos = 0) {
    super();
    this._rect=new createjs.Rectangle(xpos,ypos);
    this.edgeBehavior = null;
    this.speed = new Vector(0, 0);
    this.maxSpeed = 10;
    this.active = true;
    this.color = "rgb(64,64,64)";
    this.type="actor";
    this._image=new createjs.Shape();
  }
  init(width, height) {
    this.setBounds(null);
    this.removeAllChildren();
    this.scale = 1;
    this.hit=0;
    this.image=this._image;
    this.drawShape(width, height);
    this.addChild(this.image);
    let b = this.getBounds();
    this.setBounds(b.x, b.y, b.width, b.height);
    this._update(b);
  }
  _update(b) {
    this._rect.width=b.width;
    this._rect.height=b.height;
    this.x=this._rect.x-b.x;
    this.y=this._rect.y-b.y;
    if (!this.hit) this.hit = Math.sqrt(this._rect.width * this._rect.width + this._rect.height * this._rect.height) / 2;
  }

  drawShape(width, height) {
    this.image.graphics.clear().beginFill(this.color).drawRect(-width / 2, -height / 2, width, height);
    this.image.setBounds(-width / 2, -height / 2, width, height);
  }

  setSpriteData(spriteSheet, animation, scale = 1, rotation = 0) {
    //显示辅助矩形
    if(this.image)this.removeChild(this.image);
    this.image = new createjs.Sprite(spriteSheet, animation);
    let b = this.image.getBounds();
    if (b.x == 0) {
      this.image.regX = b.width / 2;
      this.image.regY = b.height / 2;
    }
    this.image.scale = scale;
    this.image.rotation = rotation;
    b=this.getBounds();
    if (!b) {
      this.addChild(this.image);
      b=this.getBounds();
      this._update(b);
    } else {
      this.addChild(this.image);
    }
  }
  get rect() {
    return this._rect;
    // return this.getTransformedBounds();
  }
  setPos(x, y) {
    this.x = x;
    this.y = y;
    this._rect.copy(this.getTransformedBounds());
  }
  plus(speedX, speedY) {
    this.x += speedX;
    this.y += speedY;
    this._rect.x += speedX;
    this._rect.y += speedY;
  }
  setSize(scaleX, scaleY) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this._rect.copy(this.getTransformedBounds());
    this.hit = Math.sqrt(this._rect.width * this._rect.width + this._rect.height * this._rect.height) / 2;
  }
  setReg(regX, regY) {
    this.regX = regX;
    this.regY = regY;
    this._rect.copy(this.getTransformedBounds());
  }
  recycle() {
    this.active = false;
    if(this.parent)this.parent.removeChild(this);
  }
  //检测 元素之间是否碰撞
  hitActors(actors, rect = this.rect,pixl=false) {
    for (var i = 0; i < actors.length; i++) {
      var other = actors[i];
      if (other == this || !other.active) {
        continue;
      }
      if (rect.intersects(other.rect)) {
        if(!pixl)return other;
        else if (checkPixelCollision(this.image,other.image)){
          return other;
        }
      }
    }
  }
  /**检测是否碰撞屏幕
   * 
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns boolean
   */
  hitBounds(rect = this.rect, mapWidth = game.width, mapHeight = game.height) {
    return rect.x < 0 || rect.x + rect.width > mapWidth || rect.y < 0 || rect.y + rect.height > mapHeight;

  }
  /**检测是否出边界
 * 
 * @param {*} x this.x
 * @param {*} y this.y
 * @returns boolean
 */
  outOfBounds(rect = this.rect) {
    return rect.x + rect.width < 0 || rect.x > game.width || rect.y + rect.height < 0 || rect.y > game.height;
  }
  /**屏幕反弹
   * 
   * @param {*} bounce -1
   */
  rebounds(bounce = -1, mapWidth = game.width, mapHeight = game.height) {
    let rect = this.rect;
    if (rect.x < 0) {
      this.speed.x *= bounce;
      rect.x = 0;
      this.x = rect.width / 2;
    } else if (rect.x + rect.width > mapWidth) {
      this.speed.x *= bounce;
      rect.x = mapWidth - rect.width;
      this.x = mapWidth - rect.width / 2;
    }
    if (rect.y < 0) {
      this.speed.y *= bounce;
      rect.y = 0;
      this.y = rect.height / 2;
    } else if (rect.y + rect.height > mapHeight) {
      this.speed.y *= bounce;
      rect.y = mapHeight - rect.height;
      this.y = mapHeight - rect.height / 2;
    }
  }

  //屏幕环绕
  placeInBounds(mapWidth = game.width, mapHeight = game.height) {
    let rect = this.rect;
    if (rect.x + rect.width < 0) {
      rect.x = mapWidth;
      this.x = mapWidth + rect.width / 2;
    } else if (rect.x > mapWidth) {
      rect.x = -rect.width;
      this.x = -rect.width / 2;
    }
    if (rect.y + rect.height < 0) {
      rect.y = mapHeight;
      this.y = mapHeight + rect.height / 2;
    } else if (rect.y > mapHeight) {
      rect.y = -rect.height;
      this.y = -rect.height / 2;
    }
  }
  /**两个球体碰撞或球与点的碰撞
   * 
   * @param {*} other 设置null为与点的碰撞
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns 
   */
  hitRadius(other, otherX = other.x, otherY = other.y, x = this.x, y = this.y) {
    let otherHit = other ? other.hit : 0;
    if (x - this.hit > otherX + otherHit) {
      return;
    }
    if (x + this.hit < otherX - otherHit) {
      return;
    }
    if (y - this.hit > otherY + otherHit) {
      return;
    }
    if (y + this.hit < otherY - otherHit) {
      return
    }
    return this.hitWRadius(otherHit, otherX, otherY, x, y);
  }
  hitWRadius(otherHit, otherX, otherY, x = this.x, y = this.y) {
    return this.hit + otherHit > Math.sqrt(Math.pow(Math.abs(x - otherX), 2) + Math.pow(Math.abs(y - otherY), 2));
  }

  act() {
    this.speed.truncate(this.maxSpeed);
    this.plus(this.speed.x, this.speed.y);
    if (this.edgeBehavior == Actor.WRAP) {
      this.placeInBounds();
    } else if (this.edgeBehavior == Actor.BOUNCE) {
      this.rebounds();
    } else if (this.edgeBehavior == Actor.RECYCLE) {
      if (this.outOfBounds()) {
        this.recycle();
      }
    }
  }
}

class CirActor extends Actor {
  //动量守恒碰撞
  static billiardCollision(ball0, ball1) {
    let dx = ball1.x - ball0.x,
      dy = ball1.y - ball0.y,
      angle = Math.atan2(dy, dx);
    //设置ball0的位置为原点
    let pos0 = new Vector(0, 0);
    //旋转ball1的位置
    let pos1 = new Vector(dx, dy);
    pos1.rotate(angle, true);
    //旋转ball0的速度
    let vel0 = new Vector(ball0.speed.x, ball0.speed.y);
    vel0.rotate(angle, true);
    //旋转ball1的速度
    let vel1 = new Vector(ball1.speed.x, ball1.speed.y);
    vel1.rotate(angle, true);
    //碰撞的作用力
    let vxTotal = vel0.x - vel1.x;
    vel0.x = ((ball0.mass - ball1.mass) * vel0.x + 2 * ball1.mass * vel1.x) / (ball0.mass + ball1.mass);
    vel1.x = vxTotal + vel0.x;
    //更新位置，避免两球重叠
    let absV = Math.abs(vel0.x) + Math.abs(vel1.x);
    let overlap = (ball0.hit + ball1.hit) - Math.abs(pos0.x - pos1.x);
    pos0.x += vel0.x / absV * overlap;
    pos1.x += vel1.x / absV * overlap;
    //将位置旋转回来
    pos0.rotate(angle, false);
    pos1.rotate(angle, false);
    //将位置调整为屏幕的实际位置
    ball1.setPos(ball0.x + pos1.x, ball0.y + pos1.y);
    ball0.setPos(ball0.x + pos0.x, ball0.y + pos0.y);
    //将速度旋转回来
    vel0.rotate(angle, false);
    vel1.rotate(angle, false);
    ball0.speed.setValues(vel0.x, vel0.y);
    ball1.speed.setValues(vel1.x, vel1.y);
  };
  /**
   * 球形角色类
   * @param {*} xpos 
   * @param {*} ypos 
   */
  constructor(xpos, ypos) {
    super(xpos, ypos);
  }
  init(size) {
    super.init(size);
  }
  drawShape(size) {
    let radius = size / 2;
    this.image.graphics.clear().beginRadialGradientFill(["#c9c9c9", this.color], [0, 1], radius / 3, -radius / 3, 0, radius / 6, -radius / 6, radius).drawCircle(0, 0, radius);
    this.image.setBounds(-radius, -radius, size, size);
    this.hit = radius;
  }
  setSize(scale) {
    this.hit /= this.scale;
    this.scale=scale;
    this._rect.copy(this.getTransformedBounds());
    this.hit *= scale;
  }
}

//斜面反弹类
class BounceActor extends Actor {
  constructor(xpos, ypos) {
    super(xpos, ypos);
    this.type = "angleBounce";
    this.cos = 1;
    this.sin = 0;
  }
  init(width, rotation) {
    super.init(width, 2);
    this.setBounds(null);
    this.setRotation(rotation);
  }
  setRotation(val) {
    this.rotation=val;
    this._rect.copy(this.getTransformedBounds());
    let angle = this.rotation * Math.PI / 180;
    this.cos = Math.cos(angle);
    this.sin = Math.sin(angle);
  }
  //斜面反弹
  hitAngleBounce(actor) {
    let x1 = actor.x - this.x,
      y1 = actor.y - this.y,
      //反向旋转y,vy
      y2 = this.cos * y1 - this.sin * x1,
      vy2 = this.cos * actor.speed.y - this.sin * actor.speed.x;
    if (y2 > -actor.hit && y2 < vy2) {
      y2 = -actor.hit;
      vy2 *= -1;
      //反向旋转x,vx
      let x2 = this.cos * x1 + this.sin * y1,
        vx2 = this.cos * actor.speed.x + this.sin * actor.speed.y;
      //将一切旋转回去
      actor.x = this.x + this.cos * x2 - this.sin * y2;
      actor.y = this.y + this.cos * y2 + this.sin * x2;
      actor.setPos(actor.x, actor.y);
      actor.speed.x = this.cos * vx2 - this.sin * vy2;
      actor.speed.y = this.cos * vy2 + this.sin * vx2;
    }
  }
}

class SteeredActor extends Actor {
  /**
   * 转向机车类
   * @param {*} xpos 
   * @param {*} ypos 
   */
  constructor(xpos, ypos) {
    super(xpos, ypos);
    this.edgeBehavior = Actor.WRAP;
    //转向作用力
    this.steeringForce = new Vector();
    //到达范围开始减速
    this.arrivalThreshold = 100;
    //漫游圆心距离
    this.wanderDistance = 10;
    this.wanderRadius = 5;
    this.wanderAngle = 0;
    //漫游角度范围
    this.wanderRange = Math.PI / 2;
    //回避距离 发现障碍物有效视野
    this.avoidDistance = 300;
    //回避缓冲 准备避开时，自身和障碍物间的预留距离
    this.avoidBuffer = 20;
    //路径
    this.pathIndex = 0;
    this.pathThreshold = 20;
    //群落 进入视野距离和最小距离
    this.inSightDist = 200;
    this.tooCloseDist = 60;
    //质量
    this.mass = 1;
    //作用力最大length
    this.maxForce = 1;
    // this.drawShape(15);
    this.color = "#ffffff";
  }
  drawShape(width) {
    this.shipFlame = new createjs.Shape();
    this.addChild(this.shipFlame);
    var g = this.image.graphics;
    g.clear();
    g.beginStroke(this.color);
    g.moveTo(0, width); //nose
    g.lineTo(width / 2, -width / 1.6); //rfin
    g.lineTo(0, -width / 5); //notch
    g.lineTo(-width / 2, -width / 1.6); //lfin
    g.closePath(); // nose
    //draw ship flame
    this.shipFlame.rotation = -90;
    this.image.rotation = -90;
    this.shipFlame.x = -width / 1.6;
    this.shipFlame.alpha = 0;
    g = this.shipFlame.graphics;
    g.clear();
    g.beginStroke(this.color);
    g.moveTo(width / 5, 0); //ship
    g.lineTo(width / 2.5, -width / 3.3); //rpoint
    g.lineTo(width / 5, -width / 5); //rnotch
    g.lineTo(0, -width / 2); //tip
    g.lineTo(-width / 5, -width / 5); //lnotch
    g.lineTo(-width / 2.5, -width / 3.3); //lpoint
    g.lineTo(-width / 5, -0); //ship
    this.setBounds(-width, -width / 2, width, width * 2);
    this.hit = width - 2;
  }
  act() {
    this.steeringForce.truncate(this.maxForce);
    this.steeringForce = this.steeringForce.divide(this.mass);
    this.speed.add(this.steeringForce);
    this.steeringForce.setValues(0, 0);
    this.rotation = this.speed.angle * 180 / Math.PI;
    super.act();
  }
  //寻找行为 
  seek(target) {
    let centerPos = new Vector(this.x, this.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let desiredVelocity = targetcenterPos.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity = desiredVelocity.times(this.maxSpeed);
    let force = desiredVelocity.sub(this.speed);
    this.steeringForce.add(force);
  }
  //避开行为 以目标点反向逃离
  flee(target) {
    let centerPos = new Vector(this.x, this.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let desiredVelocity = targetcenterPos.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity = desiredVelocity.times(this.maxSpeed);
    let force = desiredVelocity.sub(this.speed);
    this.steeringForce = this.steeringForce.sub(force);

  }
  //到达行为
  arrive(targetPos) {
    let centerPos = new Vector(this.x, this.y);
    let desiredVelocity = targetPos.sub(centerPos);
    desiredVelocity.normalize();
    let dist = centerPos.dist(targetPos);
    if (dist > this.arrivalThreshold) {
      desiredVelocity = desiredVelocity.times(this.maxSpeed);
    } else {
      desiredVelocity = desiredVelocity.times(this.maxSpeed * dist / this.arrivalThreshold);
    }
    let force = desiredVelocity.sub(this.speed);
    this.steeringForce.add(force);
  }
  /**
   * 追捕行为 对预判点为目标
   * @param {Actor} target Actor
   */
  pursue(target) {
    let centerPos = new Vector(this.x, this.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let lookAheadTime = centerPos.dist(targetcenterPos) / this.maxSpeed;
    let predictedTarget = targetcenterPos.plus(target.speed.times(lookAheadTime));
    this.seek(predictedTarget);
  }
  /**
   * 躲避行为 以预判点反方向逃离
   * @param {Actor} target actor类型
   */
  evade(target) {
    let centerPos = new Vector(this.x, this.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let lookAheadTime = centerPos.dist(targetcenterPos) / this.maxSpeed;
    let predictedTarget = targetcenterPos.plus(target.speed.times(lookAheadTime));
    this.flee(predictedTarget);
  }
  /**
   * 漫游行为
   */
  wander() {
    let center = this.speed.clone().normalize().times(this.wanderDistance);
    let offset = new Vector();
    offset.length = this.wanderRadius;
    offset.angle = this.wanderAngle;
    this.wanderAngle += Math.random() * this.wanderRange - this.wanderRange * .5;
    let force = center.plus(offset);
    this.steeringForce.add(force);
  }
  /**
   * 回避行为 避开障碍物
   * @param {Array} circles 障碍物数组
   */
  avoid(circles) {
    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      const heading = this.speed.clone().normalize();
      const centerPos = new Vector(this.x, this.y);
      const circlescenterPos = new Vector(circle.x, circle.y);
      //障碍物和机车间的位移向量
      const difference = circlescenterPos.sub(centerPos);
      const dotProd = difference.dot(heading);
      //如果障碍物在机车前方
      if (dotProd > 0) {
        //机车的“触角”
        let feeler = heading.times(this.avoidDistance);
        //位移在触角上的映射
        let projection = heading.times(dotProd);
        //障碍物离触角的距离
        let dist = projection.sub(difference).length;
        // 如果触角（在算上缓冲后）和障碍物相交 
        // 并且位移的映射的长度小于触角的长度 
        // 我们就说碰撞将要发生，需改变转向
        if (dist < circle.hit + this.avoidBuffer && projection.length < feeler.length) {
          //计算出一个转90度的力
          let force = heading.times(this.maxSpeed);
          force.angle += difference.sign(this.speed) * Math.PI / 2;
          // 通过离障碍物的距离，调整力度大小，使之足够小但又能避开 
          force = force.times(1 - projection.length / feeler.length);
          //叠加于转向力上
          this.steeringForce.add(force);
          //刹车————转弯的时候要放慢机车速度，离障碍物越接近，刹车越狠。
          this.speed = this.speed.times(projection.length / feeler.length);
        }
      }
    }
  }
  /**
   * 路径跟随
   * @param {Array} path Vector数组
   * @param {Boolean} loop false
   */
  followPath(path, loop = false) {
    let wayPoint = path[this.pathIndex];
    let centerPos = new Vector(this.x, this.y);
    if (!wayPoint) return;
    if (centerPos.dist(wayPoint) < this.pathThreshold) {
      if (this.pathIndex >= path.length - 1) {
        if (loop) {
          this.pathIndex = 0;
        }
      } else {
        this.pathIndex++;
      }
    }
    if (this.pathIndex >= path.length - 1 && !loop) {
      this.arrive(wayPoint);
    } else {
      this.seek(wayPoint);
    }
  }
  /**
   * 群落行为
   * @param {Array} vehicles 机车数组
   */
  flock(vehicles) {
    let averageVelocity = this.speed.clone();
    let averagePosition = new Vector(0, 0);
    let inSightCount = 0;
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      if (vehicle != this && this.inSight(vehicle)) {
        averageVelocity.add(vehicle.speed);
        averagePosition.x += vehicle.x;
        averagePosition.y += vehicle.y;
        if (this.tooClose(vehicle)) this.flee(vehicle);
        inSightCount++;
      }
    }
    if (inSightCount > 0) {
      averageVelocity = averageVelocity.divide(inSightCount);
      averagePosition = averagePosition.divide(inSightCount);
      this.seek(averagePosition);
      this.steeringForce.add(averageVelocity.divide(inSightCount));
    }
  }
  /**
   * 进入视野
   * @param {SteeredActor} vehicle 
   * @returns boolen
   */
  inSight(vehicle) {
    let centerPos = new Vector(this.x, this.y);
    let targetcenterPos = new Vector(vehicle.x, vehicle.y);
    if (centerPos.dist(targetcenterPos) > this.inSightDist) return false;
    let heading = this.speed.clone().normalize();
    let difference = targetcenterPos.sub(centerPos);
    let dotProd = difference.dot(heading);
    if (dotProd < 0) return false;
    return true
  }
  /**
   * 是否靠太近
   * @param {SteeredActor} vehicle 
   * @returns boolen
   */
  tooClose(vehicle) {
    let centerPos = new Vector(this.x, this.y);
    let targetcenterPos = new Vector(vehicle.x, vehicle.y);
    return centerPos.dist(targetcenterPos) < this.tooCloseDist;
  }
}
export { Vector, Actor, CirActor, BounceActor, SteeredActor };