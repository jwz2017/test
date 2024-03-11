import { Game } from "./Game.js";
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
  constructor(xpos = 0, ypos = 0,width=0,height=0,IsShape=true) {
    super();
    this.mouseChildren = false;
    this.hit = Math.sqrt(width*width+height*height)/2;
    this._rect = new createjs.Rectangle(xpos, ypos,width,height);
    this.edgeBehavior = Actor.RECYCLE;
    this.status = null;
    this.body = null;
    //摩檫力
    this.friction = 1;
    this.bounce = -1;
    this.speed = new Vector(0, 0);
    this.maxSpeed = 5;
    this.active = true;
    this._color = "rgb(64,64,64)";
    // this._color = "#fff";
    this.type = "actor";
    if(IsShape){
      this.image=new createjs.Shape();
      this.drawShape(width,height);
      let b=this.image.getBounds();
      this.addChild(this.image);
      this.setBounds(b.x,b.y,b.width,b.height);
      this.x=xpos-b.x;
      this.y=ypos-b.y;
    }else if(width&&height){
      this.setBounds(-width/2,-height/2,width,height);
      this.x=xpos+width/2;
      this.y=ypos+height/2;
    }
  }
  setSpriteData(spriteSheet, animation, scale = 1, rotation = 0, offsetX = 0, offsetY = 0) {
    //显示辅助矩形
    if (this.image) this.removeChild(this.image);
    this.image = new createjs.Sprite(spriteSheet, animation);
    let b = this.image.getBounds();
    if (b.x == 0) {
      this.image.regX = b.width / 2;
      this.image.regY = b.height / 2;
    }
    this.image.scale = scale;
    this.image.rotation = rotation;
    this.image.x += offsetX;
    this.image.y += offsetY;
    if (this._rect.width==0) {
      this.addChild(this.image);
      b=this.getBounds();
      this._rect.width=b.width;
      this._rect.height=b.height;
      this.x=this._rect.x-b.x;
      this.y=this._rect.y-b.y;
      this.hit=Math.sqrt(this._rect.width*this._rect.width+this._rect.height*this._rect.height)/2;
    } else {
      this.addChild(this.image);
    }
  }
  init(width,height) {
    this.hit = Math.sqrt(width*width+height*height)/2;
    if(this.image instanceof createjs.Shape){
      this.drawShape(width,height);
      let b=this.image.getBounds();
      this.setBounds(b.x,b.y,b.width,b.height);
    }else if(!this.image){
      this.image=new createjs.Shape();
      this.addChild(this.image);
      this.drawShape(width,height);
      let b=this.image.getBounds();
      this.setBounds(b.x,b.y,b.width,b.height);
    }else{
      this.setBounds(-width/2,-height/2,width,height);
    }
    this.active=true;
    this.scale=1;
    this.rotation=0;
    this.speed.setValues(0,0);
    this.status=null;
    this.updateRect();
  }
  
  drawShape(width, height) {
    this.image.graphics.clear().beginFill(this._color).drawRect(-width / 2, -height / 2, width, height);
    this.image.setBounds(-width / 2, -height / 2, width, height);
  }

  get rect() {
    return this._rect;
    // return this.getTransformedBounds();
  }
  get color() {
    return this._color;
  }
  set color(val) {
    this._color = val;
    this.drawShape(this.rect.width, this.rect.height);
  }
  updateRect() {
    this._rect.copy(this.getTransformedBounds());
  }
  plus(speedX, speedY) {
    this.x += speedX;
    this.y += speedY;
    this._rect.x += speedX;
    this._rect.y += speedY;
  }
  setPos(xpos,ypos){
    this._rect.x=xpos;
    this._rect.y=ypos;
    this.x=this._rect.x+this.rect.width/2;
    this.y=this._rect.y+this.rect.height/2;
  }
  setScale(scale) {
    this.hit=this.hit/this.scale*scale;
    this.scale=scale;
    this.updateRect();
  }
  setRotation(ang) {
    this.rotation = ang;
    this.updateRect();
  }
  recycle() {
    this.active = false;
    if (this.parent) this.parent.removeChild(this);
  }
  /**
   * 与其它元素碰撞
   * @param {*} actors 
   * @param {rectangle} rect=this.rect
   * @param {boolean} pixl=false
   * @param {number} alphaThreshold 0 
   * @returns 
   */
  hitActors(actors, rect = this.rect, pixl = false, alphaThreshold = 0) {
    for (var i = 0; i < actors.length; i++) {
      var other = actors[i];
      if (other == this || !other.active) {
        continue;
      }
      let hit = this.hitActor(other, rect, pixl, alphaThreshold);
      if (hit) return hit;
    }
  }
  hitActor(other, rect = this.rect, pixl = false, alphaThreshold = 0) {
    if (!pixl || !(other.image instanceof createjs.Sprite)) {
      if (rect.intersects(other.rect)) return other;
    } else {
      let r = rect.intersection(other.rect);
      if (r) {
        let p = game.container.localToGlobal(r.x, r.y);
        r.x = p.x;
        r.y = p.y;
        if (checkPixelCollision(this.image, other.image, r, alphaThreshold)) {
          return other
        }
      }
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
    this.speed = this.speed.times(this.friction);
    this.plus(this.speed.x, this.speed.y);
    if (this.edgeBehavior == Actor.WRAP) {
      game.placeInBounds(this);
    } else if (this.edgeBehavior == Actor.BOUNCE) {
      game.rebounds(this);
    } else if (this.edgeBehavior == Actor.RECYCLE) {
      if (game.outOfBounds(this)) {
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
    ball1.x = ball0.x + pos1.x;
    ball1.y = ball0.y + pos1.y;
    ball1.updateRect();
    ball0.x = ball0.x + pos0.x;
    ball0.y = ball0.y + pos0.y;
    ball0.updateRect();
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
  constructor(xpos, ypos,radius,IsShape) {
    super(xpos, ypos,radius*2,radius*2,IsShape);
    this.hit=radius
  }
  drawShape(width) {
    let radius = width / 2;
    this.image.graphics.clear().beginRadialGradientFill(["#c9c9c9", this._color], [0, 1], radius / 3, -radius / 3, 0, radius / 6, -radius / 6, radius).drawCircle(0, 0, radius);
    this.image.setBounds(-radius, -radius, width, width);
  }
}

//斜面反弹类
class BounceActor extends Actor {
  constructor(xpos, ypos,width,height,IsShape) {
    super(xpos, ypos,width,height,IsShape);
    this.type = "angleBounce";
    this.cos = 1;
    this.sin = 0;
  }
  setRotation(val) {
    super.setRotation(val);
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
      actor.updateRect();

      actor.speed.x = this.cos * vx2 - this.sin * vy2;
      actor.speed.y = this.cos * vy2 + this.sin * vx2;
    }
  }
}
//坦克类，四方向运动
class Tank extends Actor {
  constructor(xpos, ypos,width,height,IsShape) {
    super(xpos, ypos,width,height,IsShape);
    this.fireIndex = 0;
    this.fireStep = 40;
    this.v = 1;
  }
  move(direction) {
    this.speed.zero();
    if (direction) this.image.paused = false;
    else this.image.paused = true;
    switch (direction) {
      case "up":
        this.speed.y = -this.v;
        this.rotation = -90;
        break;
      case "down":
        this.speed.y = this.v;
        this.rotation = 90;
        break;
      case "right":
        this.speed.x = this.v;
        this.rotation = 0;
        break;
      case "left":
        this.speed.x = -this.v;
        this.rotation = 180;
        break;
    }
  }
  fire(bullets, Bullet, parent) {
    if (this.fireIndex-- < 0) {
      this.fireIndex = this.fireStep;
      let bullet = Game.getActor(bullets, Bullet);
      bullet.setRotation(this.rotation);
      let angle = this.rotation * Math.PI / 180;
      bullet.x = this.x + Math.cos(angle) * this.hit;
      bullet.y = this.y + Math.sin(angle) * this.hit;
      bullet.speed.angle = angle;
      parent.addChild(bullet);
      bullet.updateRect();
    }
  }
}
class SteeredActor extends Tank {
  /**
   * 转向机车类
   * @param {0} xpos 
   * @param {0} ypos 
   * @param {15} size 
   * @param {true} IsShape 
   */
  constructor(xpos, ypos,size=15,IsShape) {
    super(xpos, ypos,size,size,IsShape);
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
    g.beginStroke(this._color);
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
    g.beginStroke(this._color);
    g.moveTo(width / 5, 0); //ship
    g.lineTo(width / 2.5, -width / 3.3); //rpoint
    g.lineTo(width / 5, -width / 5); //rnotch
    g.lineTo(0, -width / 2); //tip
    g.lineTo(-width / 5, -width / 5); //lnotch
    g.lineTo(-width / 2.5, -width / 3.3); //lpoint
    g.lineTo(-width / 5, -0); //ship
    this.image.setBounds(-width / 2, -width / 2, width, width);
    // this.hit = width / 2;
  }
  act() {
    this.steeringForce.truncate(this.maxForce);
    this.steeringForce = this.steeringForce.divide(this.mass);
    this.speed.add(this.steeringForce);
    this.steeringForce.setValues(0, 0);
    this.rotation = this.speed.angle * 180 / Math.PI;
    super.act();
  }
  //键盘开车
  driveCar(keys, speed) {
    if (keys.right) {
      this.steeringForce.length = speed;
      this.steeringForce.angle = 0;
    }
    if (keys.down) {
      this.steeringForce.length = speed;
      this.steeringForce.angle = Math.PI / 2;
    }
    if (keys.left) {
      this.steeringForce.length = speed;
      this.steeringForce.angle = Math.PI;
    }
    if (keys.up) {
      this.steeringForce.length = speed;
      this.steeringForce.angle = -Math.PI / 2;
    }
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
class JumpActor extends Actor {
  /**
   * 跳跃类角色
   * @param {*} xpos 
   * @param {*} ypos 
   */
  constructor(xpos, ypos,width,height,IsShape) {
    super(xpos, ypos,width,height,IsShape);
    this.walkspeed = 1.2;
    this.jumpspeed = 6;
    this.gravity = 0.27;
    this.runspeed = 1.8;
    this.mult = 1;
    this.actIndex = 0;
    this.actStep = 30;
    this._oldPos = new createjs.Point();

  }
  //开始地面动作
  startFloorAct() {

  }
  //开始空中动作
  startJumpAct() {

  }
  //无图片时动作测试，有图片时需重写
  changeAct() {
    if (this.status == "attack" || this.status == "skill1" || this.status == "fire" || this.status == "roll") {
      this.actIndex = this.actStep;
      let a = this.on("tick", () => {
        if (this.actIndex-- < 0) {
          this.actIndex = this.actStep;
          this.off("tick", a);
          this.image.dispatchEvent("animationend");
        }
      })
    }
  }
  /**
   * 水平移动
   * @param {*} direction 左右方向
   * @param {*} runkeys 跑动参数
   */
  walk(direction, runkeys = {}) {//移动
    if (this.status != "roll") {
      switch (direction) {
        case "left":
          if (!this.status) {
            if (runkeys.leftRun) {
              this.speed.x = -this.runspeed;
              this.status = "run";
              this.changeAct();
              runkeys.leftRun = false;
            } else {
              this.speed.x = -this.walkspeed;
              this.status = "walk";
              this.changeAct();
            }
          } else if (this.status == "run") {
            if (this.scaleX > 0) {
              this.status = "walk";
              this.speed.x = -this.walkspeed;
              this.changeAct();
            }
          } else if (this.status == "walk") {
            this.speed.x = -this.walkspeed;
          } else if (this.status == "jump") {
            this.speed.x = -Math.abs(this.speed.x) || -this.walkspeed;
          } else if (this.status == "jumpAttack") {
            this.speed.x = this.speed.x;
          } else {
            this.speed.x = 0;
          }
          if (this.status != "jumpAttack") this.scaleX = -Math.abs(this.scaleX);
          break;
        case "right":
          if (!this.status) {
            if (runkeys.rightRun) {
              this.speed.x = this.runspeed;
              this.status = "run";
              this.changeAct();
              runkeys.rightRun = false;
            } else {
              this.speed.x = this.walkspeed;
              this.status = "walk";
              this.changeAct();
            }
          } else if (this.status == "run") {
            if (this.scaleX < 0) {
              this.status = "walk";
              this.speed.x = this.walkspeed;
              this.changeAct();
            }
          } else if (this.status == "walk") {
            this.speed.x = this.walkspeed;
          } else if (this.status == "jump") {
            this.speed.x = Math.abs(this.speed.x) || this.walkspeed
          } else if (this.status == "jumpAttack") {
            this.speed.x = this.speed.x;
          } else {
            this.speed.x = 0;
          }
          if (this.status != "jumpAttack") this.scaleX = Math.abs(this.scaleX);
          break;
        default:
          this.speed.x = 0;
          if (this.status == "walk" || this.status == "run") {
            this.status = null;
            this.changeAct();
          }
          break;
      }
    }
  }
  /**
   * 与地面碰撞
   * @param {number} floorMult=1：地板光滑程度
   */
  hitFloor(floorMult = 1) {
    if ((this.status == "jump" || this.status == "jumpAttack") && this.speed.y >= 0) {
      this.status = null;
      this.changeAct();
    }
    if (this.speed.y > 0) {
      this.speed.y = 0;
      this.mult = floorMult;
      this.startFloorAct();
    } else this.speed.y = 0;
  }
  overhead() {
    if (!this.status || this.status == "walk" || this.status == "run") {
      this.status = "jump";
      this.changeAct();
    }
    this.plus(0, this.speed.y);
  }
  //动作完毕事件函数
  stopAct() {
    if (this.status == "roll") {
      this.rect.y -= this.rect.height;
      this.rect.height *= 2;
      let node = game.hitMap(this.rect);
      if (node) {
        this.x = this._oldPos.x;
        this.y = this._oldPos.y;
        this.updateRect();
      }
    }
    this.status = null;
  }
  jump() {//跳跃
    if (this.idle) {
      this.status == "jump";
      this.speed.y = -this.jumpspeed;
      this.changeAct();
    }
  }
  attack() {//普通攻击
    if (this.idle) {
      this.status = "attack";
      this.image.on("animationend", this.stopAct, this, true);
      this.changeAct();
    }
  }
  jumpAttack() {
    if (this.status == "jump") {
      this.status = "jumpAttack";
      this.changeAct();
    }
  }
  skill1() {//技能攻击1
    if (this.idle) {
      this.status = "skill1";
      this.image.on("animationend", this.stopAct, this, true);
      this.changeAct();
    }
  }
  roll() {//开始滚动
    if (this.idle) {
      this.status = "roll";
      this.image.on("animationend", this.stopAct, this, true);
      this.changeAct();
      this._oldPos.setValues(this.x, this.y);
      this.speed.x = this.scaleX > 0 ? this.walkspeed : -this.walkspeed;
      this.rect.height /= 2;
      this.rect.y += this.rect.height;
    }
  }
  fire(bullets, Bullet, parent) {//放子弹
    if (this.idle) {
      let bullet = Game.getActor(bullets, Bullet);
      this.status = "fire";
      this.image.on("animationend", this.stopAct, this, true);
      this.changeAct();
      if (this.scaleX > 0) {
        bullet.scaleX = 1;
        bullet.speed.angle = 0;
      } else {
        bullet.scaleX = -1;
        bullet.speed.angle = Math.PI;
      }
      bullet.x = this.x;
      bullet.y = this.y;
      bullet.updateRect();
      parent.addChild(bullet);
    }
  }

  get idle() {
    return this.status == "walk" || this.status == null || this.status == "run"
  }

}
//飞机类 八方向运动
class Plane extends Actor {
  constructor(xpos, ypos,width,height,IsShape) {
    super(xpos, ypos,width,height,IsShape);
    this.v = 3;
    this.bulletType = 1;
    this.bulletOffAangle = 10 * Math.PI / 180;
    this.fireIndex = 0;
    this.fireStep = 10;
  }
  move(keys) {
    this.speed.zero();
    if (keys.left) {
      this.speed.x = -this.v;
    } else if (keys.right) {
      this.speed.x = this.v;
    }
    if (keys.up) {
      this.speed.y = -this.v;
    } else if (keys.down) {
      this.speed.y = this.v;
    }
  }
  fire(bullets, Bullet, parent) {
    if (this.fireIndex-- < 0) {
      this.fireIndex = this.fireStep;
      if (!isNaN(this.bulletType)) {
        for (let i = 0; i < this.bulletType; i++) {
          const bullet = Game.getActor(bullets, Bullet);
          this._activateBullet(i, bullet);
          parent.addChild(bullet);
          if (i > 0) {
            let bullet1 = Game.getActor(bullets, Bullet);
            this._activateBullet(-i, bullet1);
            parent.addChild(bullet1);
          }
        }
      }
    }
  }
  _activateBullet(i, bullet) {
    let angle = this.rotation * Math.PI / 180;
    bullet.speed.angle = i * this.bulletOffAangle + angle;
    bullet.x = this.x + Math.cos(angle) * this.hit;
    bullet.y = this.y + Math.sin(angle) * this.hit;
    bullet.rotation = bullet.speed.angle * 180 / Math.PI;
    bullet.updateRect();
  }
}
//box2d对象----------------球类
class BoxActor extends Actor{
  constructor(xpos, ypos,width,height,IsShape){
    super(xpos, ypos,width,height,IsShape);
    this.TROUR = 40;
    this.ASPEED = 400 * Math.PI / 180;
    this.VSPEED = 10;
    this.init();
  }
  init() {
    this.body = EasyBody.createBox(this.x, this.y, this.rect.width,this.rect.height);
  }
  act(){
    this.update();
  }
  update() {
    this.rotation = this.body.GetAngle() * (180 / Math.PI);
    let p = this.body.GetPosition();
    this.x = p.x * PTM;
    this.y = p.y * PTM;
  }
  recycle() {
    super.recycle();
    world.DestroyBody(this.body);
    this.body = null;
  }
}
class BoxBall extends CirActor {
  constructor(xpos, ypos,radius,IsShape) {
    super(xpos, ypos,radius,IsShape);
    this.TROUR = 40;
    this.ASPEED = 400 * Math.PI / 180;
    this.VSPEED = 10;
    this.init()
  }
  init() {
    this.body = EasyBody.createCircle(this.x, this.y, this.rect.width / 2);
    this.body.SetSleepingAllowed(false);
    this.body.SetAngularDamping(1);
    this.impulse = new b2Vec2(0, 0);
    this.playerTorque = 0;
    this.body.isReadyToJump = false;
  }
  act(keys) {
    this.playerTorque = 0;
    if (keys.left) this.playerTorque = -this.TROUR;
    if (keys.right) this.playerTorque = this.TROUR;
    if (keys.up) {
      if (this.body.isReadyToJump) {
        this.impulse.y = -this.body.GetMass() * 8;
        this.body.ApplyLinearImpulse(this.impulse, this.body.GetPosition());
        this.body.isReadyToJump = false;
      }
    }
    this.body.ApplyTorque(this.playerTorque);
    this._limitAngleVelocity(this.body, this.ASPEED)
    if (keys.left || keys.right) {
      let v = this.body.GetLinearVelocity();
      v.x = this.body.GetAngularVelocity() * 20 / PTM;
      this.body.SetLinearVelocity(v);
    }
    this.update();

  }
  _limitAngleVelocity(body, speedMax) {
    var av = body.GetAngularVelocity();
    if (Math.abs(av) > speedMax) {
      av = Math.abs(av) / av * speedMax;
      body.SetAngularVelocity(av);
    }
  }
  update() {
    this.rotation = this.body.GetAngle() * (180 / Math.PI);
    let p = this.body.GetPosition();
    this.x = p.x * PTM;
    this.y = p.y * PTM;
  }
  recycle() {
    super.recycle();
    world.DestroyBody(this.body);
    this.body = null;
  }
}
export { Vector, Actor, CirActor, BounceActor, SteeredActor, JumpActor, Tank, Plane,BoxActor,BoxBall };