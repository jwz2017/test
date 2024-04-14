import { Game } from "./Game.js";
import { game } from "./gframe.js";
import { checkPixelCollision } from "./hitTest.js";
//向量角色类**************************************************************************
class Vector {
  //计算两个向量角度
  static angleBetween = function (v1, v2) {
    if (!v1.isNormalized()) v1 = v1.clone().normalize();
    if (!v2.isNormalized()) v2 = v2.clone().normalize();
    return Math.acos(v1.dot(v2));
  }
  //计算两条线段的焦点  null为不相交
  static getCrossPoint(a1, a2, b1, b2) {
    let va = new Vector(a2.x - a1.x, a2.y - a1.y);
    
    let a1b1 = new Vector(b1.x - a1.x, b1.y - a1.y);
    let a1b2 = new Vector(b2.x - a1.x, b2.y - a1.y);
    if (va.crossProd(a1b1) * va.crossProd(a1b2) > 0) return null;
    
    let vb = new Vector(b2.x - b1.x, b2.y - b1.y);
    let b1a1 = new Vector(a1.x - b1.x, a1.y - b1.y);
    let b1a2 = new Vector(a2.x - b1.x, a2.y - b1.y);
    if (vb.crossProd(b1a1) * vb.crossProd(b1a2) > 0) return null;

    let lenA = b1a1.crossProd(va);
    let lenB = vb.crossProd(va);
    let ratio = lenA / lenB;
    va.setValues(b1.x,b1.y)
    va.add(vb.mul(ratio));
    return va;
  }
  static add(v1,v2){
    return new Vector(v1.x+v2.x,v1.y+v2.y);
  }
  static sub(v1,v2){
    return new Vector(v1.x-v2.x,v1.y-v2.y);
  }
  static mul(v,val){
    return new Vector(v.x*val,v.y*val);
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
    return this;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this
  }
  sub(v) {
    this.x-=v.x;
    this.y-=v.y;
    return this;
  }
  mul(val){
    this.x*=val;
    this.y*=val;
    return this
  }
  equals(v2) {
    return this.x == v2.x && this.y == v2.y;
  }
  //内积  判断>0方向相同 判断前后方向
  //v为normalize：表示在v上的映射长度  再mul(v)为映射向量
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  //外积 >0:v2与v1夹角0——180，v2在右侧
  crossProd(v2) {
    return this.x * v2.y - this.y * v2.x;
  }
  //>0:v2在右侧 0————90 右前方
  sign(v2) {
    return this.perp.dot(v2) < 0 ? -1 : 1;
  }
  //右侧法向量 mul(-1)左侧法向量
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
  constructor(xpos = 0, ypos = 0, width = 0, height = 0, IsShape = true) {
    super();
    this.mouseChildren = false;
    this._rect = new createjs.Rectangle(xpos, ypos, width, height);
    this.edgeBehavior =null;
    this.status = null;
    this.speed = new Vector(0, 0);
    this._active = true;
    //摩檫力
    this.friction = 1;
    //质量
    this.mass = 1;
    //路径
    this.pathIndex = 0;
    //进入视野距离
    this.inSightDist = 200;

    this.velocity = 1;
    this.bounce = -1;
    this.maxSpeed = 5;
    this._color = "rgb(64,64,64)";
    this.type = "actor";
    if (IsShape) {
      this.image = new createjs.Shape();
      this.drawShape(width, height);
      let b = this.image.getBounds();
      this.addChild(this.image);
      this.setBounds(b.x, b.y, b.width, b.height);
      this.x = xpos - b.x;
      this.y = ypos - b.y;
    } else if (width && height) {
      this.setBounds(-width / 2, -height / 2, width, height);
      this.x = xpos + width / 2;
      this.y = ypos + height / 2;
    }
  }
  init(width, height) {
    if (this.image instanceof createjs.Shape) {
      this.drawShape(width, height);
      let b = this.image.getBounds();
      this.setBounds(b.x, b.y, b.width, b.height);
    } else if (!this.image) {
      this.image = new createjs.Shape();
      this.addChild(this.image);
      this.drawShape(width, height);
      let b = this.image.getBounds();
      this.setBounds(b.x, b.y, b.width, b.height);
    }
    this.updateRect();
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
    if (this._rect.width == 0) {
      this.addChild(this.image);
      b = this.getBounds();
      this._rect.width = b.width;
      this._rect.height = b.height;
      this.x = this._rect.x - b.x;
      this.y = this._rect.y - b.y;
    } else {
      this.addChild(this.image);
    }
  }

  drawShape(width, height) {
    this.image.graphics.clear().beginFill(this._color).drawRect(-width / 2, -height / 2, width, height);
    this.image.setBounds(-width / 2, -height / 2, width, height);
  }

  get rect() {
    return this._rect;
  }
  get color() {
    return this._color;
  }
  get active() {
    return this._active;
  }
  set active(val) {
    this._active = val;
  }
  set color(val) {
    this._color = val;
    this.drawShape(this.rect.width, this.rect.height);
  }
  get hit() {
    if(!this._hit){
      this._hit = Math.sqrt(this._rect.width * this._rect.width + this._rect.height * this._rect.height) / 2;
      this._hit /= this.scale;
    }
    return this._hit*this.scale;
  }
  set hit(val){
    this._hit=val;
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
  setPos(xpos, ypos) {
    this._rect.x = xpos;
    this._rect.y = ypos;
    this.x = this._rect.x + this.rect.width / 2;
    this.y = this._rect.y + this.rect.height / 2;
  }
  setScale(scale) {
    this.scale = scale;
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
   * @param {0} alphaThreshold 象素透明度
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
  /**
   * 是否进入视野
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
    this.speed.mul(this.friction);
    this.plus(this.speed.x, this.speed.y);
    if(this.edgeBehavior)game._checkBounds(this);
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
  constructor(xpos, ypos, radius = 20, IsShape) {
    super(xpos, ypos, radius * 2, radius * 2, IsShape);
    this._hit=radius;
  }
  drawShape(width) {
    let radius = width / 2;
    this.image.graphics.clear().beginRadialGradientFill(["#c9c9c9", this._color], [0, 1], radius / 3, -radius / 3, 0, radius / 6, -radius / 6, radius).drawCircle(0, 0, radius);
    this.image.setBounds(-radius, -radius, width, width);
  }
}

//斜面反弹类
class BounceActor extends Actor {
  constructor(xpos, ypos, width, height, IsShape) {
    super(xpos, ypos, width, height, IsShape);
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
  act(){}
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

class SteeredActor extends Actor {
  /**
   * 转向机车类
   * @param {0} xpos 
   * @param {0} ypos 
   * @param {15} size 
   * @param {true} IsShape 
   */
  constructor(xpos, ypos, width=15,height, IsShape) {
    super(xpos, ypos, width, height, IsShape,);
    this.edgeBehavior = Actor.WRAP;
  }
  drawShape(width) {
    this._color = "#ffffff";
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
  }
}
class JumpActor extends Actor {
  /**
   * 跳跃类角色
   * @param {*} xpos 
   * @param {*} ypos 
   */
  constructor(xpos, ypos, width, height, IsShape) {
    super(xpos, ypos, width, height, IsShape);
    this.walkspeed = 1.2;
    this.jumpspeed = 6;
    this.gravity = 0.27;
    this.runspeed = 1.8;
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
  //无图片时动作测试，有图片时重写
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
   * @param {*} direction 左右方向pressed
   * @param {*} runkeys 跑动参数keys
   */
  walk(direction, runkeys = {}) {//移动
    if (this.status != "roll" && this.status != "jumpAttack") {
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
          } else {
            this.speed.x = 0;
          }
          this.scaleX = -Math.abs(this.scaleX);
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
          } else {
            this.speed.x = 0;
          }
          this.scaleX = Math.abs(this.scaleX);
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
      this.friction = floorMult;
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
  roll() {//开始滚动
    if (this.idle) {
      this.status = "roll";
      this.image.on("animationend", this.stopAct, this, true);
      this.changeAct();
      this._oldPos.setValues(this.x, this.y);
      this.speed.x = this.scaleX > 0 ? this.walkspeed : -this.walkspeed;
      this.rect.height = this.rect.height / 2;
      this.rect.y += this.rect.height;
    }
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

//box2d对象----------------方形
class BoxActor extends Actor {
  constructor(xpos, ypos, width, height, IsShape) {
    super(xpos, ypos, width, height, IsShape);
    this.createBody();
  }
  createBody() {
    this.body = EasyBody.createBox(this.x, this.y, this.rect.width, this.rect.height);
  }
  act() {
    this.update();
  }
  update() {
    this.rotation = this.body.GetAngle() * (180 / Math.PI);
    let p = this.body.GetPosition();
    this.x = p.x * PTM;
    this.y = p.y * PTM;
  }
  get active() {
    return this._active;
  }
  set active(val) {
    super.active = val;
    this.body.SetActive(val);
  }
}
//****************************球形 */
class BoxBall extends BoxActor {
  constructor(xpos, ypos, radius, IsShape) {
    super(xpos, ypos, radius * 2, radius * 2, IsShape);
    this.TROUR = 40;
    this.maxSpeed = 300 * Math.PI / 180;
  }
  createBody() {
    this.body = EasyBody.createCircle(this.x, this.y, this.rect.width / 2);
    this.body.SetSleepingAllowed(false);
    this.body.SetAngularDamping(1);
    this.impulse = new b2Vec2(0, 0);
    this.playerTorque = 0;
    this.body.isReadyToJump = false;
    this.body.SetUserData(USER_DATA_BALL);
    // this.body.GetFixtureList().SetDensity(10);
    // this.body.ResetMassData();
  }
  drawShape(width) {
    let radius = width / 2;
    this.image.graphics.clear().beginRadialGradientFill(["#c9c9c9", this._color], [0, 1], radius / 3, -radius / 3, 0, radius / 6, -radius / 6, radius).drawCircle(0, 0, radius);
    this.image.setBounds(-radius, -radius, width, width);
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
    this._limitAngleVelocity(this.body, this.maxSpeed)
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
}

class Weapon {
  /**
   * 武器
   * @param {*} Bullet 子弹类型
   * @param {40} fireStep 开火节奏
   * @param {1} fireType 开火方式，单发或散弹
   */
  constructor(Bullet, fireStep = 40, fireType = 1) {
    this._fireIndex = 0;
    this.fireStep = fireStep;
    this.fireType = fireType;
    this.setBullet(Bullet);
    this._bulletOffAngle = 10 * Math.PI / 180;
  }
  setBullet(Bullet){
    this.Bullet = Bullet;
    this.Bullet.bullets = this.Bullet.bullets || [];
  }
  /**
   * 开火
   * @param {*} attackKey 
   * @param {*} actor 
   * @param {null} parent null:=actor.parent
   */
  fire(attackKey,actor,parent) {
    if (attackKey) {
      if (this._fireIndex-- < 0) {
        this._fireIndex = this.fireStep;
        for (let i = 0; i < this.fireType; i++) {
          const bullet = Game.getActor(this.Bullet.bullets, this.Bullet, parent||actor.parent);
          this._activateBullet(i, bullet,actor);
          if (i > 0) {
            let bullet1 = Game.getActor(this.Bullet.bullets, this.Bullet, parent||actor.parent);
            this._activateBullet(-i, bullet1,actor);
          }
        }
      }
    } else {
      this._fireIndex--;
    }
  }
  _activateBullet(i, bullet,actor) {
    let angle = actor.rotation * Math.PI / 180;
    bullet.speed.angle = i * this._bulletOffAngle + angle;
    bullet.x = actor.x + Math.cos(angle) * actor.hit;
    bullet.y = actor.y + Math.sin(angle) * actor.hit;
    bullet.rotation = bullet.speed.angle * 180 / Math.PI;
    bullet.updateRect();
  }
}

class MoveManage {
  constructor() {
    //转向作用力
    this.steeringForce = new Vector();
    //作用力最大length
    this.maxForce = 0.8;
    //到达范围开始减速
    this.arrivalThreshold = 100;
    //漫游圆心距离
    this.wanderDistance = 10;
    this.wanderRadius = 5;
    this.wanderAngle = 0;
    this.wanderRange = Math.PI / 2;//漫游角度范围
    //回避距离 发现障碍物有效视野
    this.avoidDistance = 300;
    this.avoidBuffer = 20;//回避缓冲 准备避开时，自身和障碍物间的预留距离
    //路径
    // this.pathIndex = 0;
    this.pathThreshold = 20;
    //群落 进入视野距离和最小距离
    // this.inSightDist = 200;
    this.tooCloseDist = 60;
  }
  /**
   * 四方向运动
   * @param {*} actor 
   * @param {string} direction 方向
   */
  tankMove(actor, direction) {
    actor.speed.zero();
    if (direction) actor.image.paused = false;
    else actor.image.paused = true;
    switch (direction) {
      case "up":
        actor.speed.y = -actor.velocity;
        actor.rotation = -90;
        break;
      case "down":
        actor.speed.y = actor.velocity;
        actor.rotation = 90;
        break;
      case "right":
        actor.speed.x = actor.velocity;
        actor.rotation = 0;
        break;
      case "left":
        actor.speed.x = -actor.velocity;
        actor.rotation = 180;
        break;
    }
  }
  /**
   * 八方向运动
   * @param {Actor} actor 
   * @param {object} keys 键盘对象
   */
  planeMove(actor, keys) {
    let a = actor.speed;
    a.zero();
    if (keys.left) {
      a.x = -actor.velocity;
    } else if (keys.right) {
      a.x = actor.velocity;
    }
    if (keys.up) {
      a.y = -actor.velocity;
    } else if (keys.down) {
      a.y = actor.velocity;
    }
  }
  /**
   * 键盘开车
   * @param {Actor} actor 
   * @param {object} keys 键盘对象
   */
  driveCar(actor, keys) {
    if (keys.right) {
      this.steeringForce.length = actor.velocity;
      this.steeringForce.angle = 0;
    }
    if (keys.down) {
      this.steeringForce.length = actor.velocity;
      this.steeringForce.angle = Math.PI / 2;
    }
    if (keys.left) {
      this.steeringForce.length = actor.velocity;
      this.steeringForce.angle = Math.PI;
    }
    if (keys.up) {
      this.steeringForce.length = actor.velocity;
      this.steeringForce.angle = -Math.PI / 2;
    }
    this._act(actor);
  }
  /**
   * 太空飞船
   * @param {*} actor 
   */
  driveShip(actor, keys) {
    if (keys.left) {
      actor.rotation -= actor.maxSpeed;
    } else if (keys.right) {
      actor.rotation += actor.maxSpeed;
    }
    if (keys.up) {
      this.accelerate(actor);
    }
  }
  accelerate(actor) {
    this.steeringForce = actor.speed.clone().normalize();
    this.steeringForce.angle = actor.rotation * Math.PI / 180;
    this.steeringForce.mul(0.05);

    this.steeringForce.truncate(this.maxForce);
    this.steeringForce.mul(1/actor.mass);
    actor.speed.add(this.steeringForce);
    this.steeringForce.setValues(0, 0);
  }
  _act(actor) {
    this.steeringForce.truncate(this.maxForce);
    this.steeringForce.mul(1/actor.mass);
    actor.speed.add(this.steeringForce);
    this.steeringForce.setValues(0, 0);
    actor.rotation = actor.speed.angle * 180 / Math.PI;
  }
  //寻找行为 
  seek(actor, target) {
    let centerPos = new Vector(actor.x, actor.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let desiredVelocity = targetcenterPos.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity.mul(actor.maxSpeed);
    let force = desiredVelocity.sub(actor.speed);
    this.steeringForce.add(force);
    this._act(actor);
  }
  /**
   * 逃离行为
   * @param {*} actor 
   * @param {*} target 
   * @param {5} fleeSpeed 逃离速度
   */
  flee(actor, target, fleeSpeed = actor.maxSpeed) {
    let centerPos = new Vector(actor.x, actor.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let desiredVelocity = targetcenterPos.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity.mul(fleeSpeed);
    let force = desiredVelocity.sub(actor.speed);
    this.steeringForce.sub(force);
    this._act(actor);
  }
  //到达行为
  arrive(actor, targetPos) {
    let centerPos = new Vector(actor.x, actor.y);
    let desiredVelocity = Vector.sub(targetPos,centerPos)
    desiredVelocity.normalize();
    let dist = centerPos.dist(targetPos);
    if (dist > this.arrivalThreshold) {
      desiredVelocity.mul(actor.maxSpeed);
    } else {
      desiredVelocity.mul(actor.maxSpeed * dist / this.arrivalThreshold);
    }
    let force = desiredVelocity.sub(actor.speed);
    this.steeringForce.add(force);
    this._act(actor);
  }
  /**
   * 追捕行为 对预判点为目标
   * @param {Actor} actor Actor
   * @param {Actor} target Actor
   */
  pursue(actor, target) {
    let centerPos = new Vector(actor.x, actor.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let lookAheadTime = centerPos.dist(targetcenterPos) / actor.maxSpeed;
    let predictedTarget = targetcenterPos.add(Vector.mul(target.speed,lookAheadTime));
    this.seek(actor, predictedTarget);
  }
  /**
   * 躲避行为 以预判点反方向逃离
   * @param {Actor} actor actor类型
   * @param {Actor} target actor类型
   */
  evade(actor, target) {
    let centerPos = new Vector(actor.x, actor.y);
    let targetcenterPos = new Vector(target.x, target.y);
    let lookAheadTime = centerPos.dist(targetcenterPos) / actor.maxSpeed;
    let predictedTarget = targetcenterPos.add(Vector.mul(target.speed,lookAheadTime));
    this.flee(actor, predictedTarget);
  }
  /**
   * 漫游行为
   * @param {*} actor 
   */
  wander(actor) {
    let center = actor.speed.clone().normalize().mul(this.wanderDistance);
    let offset = new Vector();
    offset.length = this.wanderRadius;
    offset.angle = this.wanderAngle;
    this.wanderAngle += Math.random() * this.wanderRange - this.wanderRange * .5;
    let force = center.add(offset);
    this.steeringForce.add(force);
    this._act(actor);
  }
  /**
   * 回避行为 避开障碍物
   * @param {Actor} actor 
   * @param {Array} circles 障碍物数组
   */
  avoid(actor, circles) {
    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      const heading = actor.speed.clone().normalize();
      const centerPos = new Vector(actor.x, actor.y);
      const circlescenterPos = new Vector(circle.x, circle.y);
      //障碍物和机车间的位移向量
      const difference = circlescenterPos.sub(centerPos);
      const dotProd = difference.dot(heading);
      //如果障碍物在机车前方
      if (dotProd > 0) {
        //机车的“触角”
        let feeler = Vector.mul(heading,this.avoidDistance);
        //位移在触角上的映射
        let projection = Vector.mul(heading,dotProd);
        //障碍物离触角的距离
        let dist = Vector.sub(projection,difference).length;
        // 如果触角（在算上缓冲后）和障碍物相交 
        // 并且位移的映射的长度小于触角的长度 
        // 我们就说碰撞将要发生，需改变转向
        if (dist < circle.hit + this.avoidBuffer && projection.length < feeler.length) {
          //计算出一个转90度的力
          let force = Vector.mul(heading,actor.maxSpeed);
          force.angle += difference.sign(actor.speed) * Math.PI / 2;
          // 通过离障碍物的距离，调整力度大小，使之足够小但又能避开 
          force.mul(1 - projection.length / feeler.length);
          //叠加于转向力上
          this.steeringForce.add(force);
          //刹车————转弯的时候要放慢机车速度，离障碍物越接近，刹车越狠。
          actor.speed.mul(projection.length / feeler.length);
        }
      }
    }
    this._act(actor);
  }
  /**
   * 路径跟随
   * @param {Actor} actor 
   * @param {Array} path Vector数组
   * @param {Boolean} loop false
   */
  followPath(actor, path, loop = false) {
    let wayPoint = path[actor.pathIndex];
    let centerPos = new Vector(actor.x, actor.y);
    if (!wayPoint) return;
    if (centerPos.dist(wayPoint) < this.pathThreshold) {
      if (actor.pathIndex >= path.length - 1) {
        if (loop) {
          actor.pathIndex = 0;
        }
      } else {
        actor.pathIndex++;
      }
    }
    if (actor.pathIndex >= path.length - 1 && !loop) {
      this.arrive(actor, wayPoint);
    } else {
      this.seek(actor, wayPoint);
    }
  }
  /**
   * 群落行为
   * @param {Actor} actor 
   * @param {Array} vehicles 机车数组
   */
  flock(actor, vehicles) {
    let averageVelocity = actor.speed.clone();
    let averagePosition = new Vector(0, 0);
    let inSightCount = 0;
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      if (vehicle != actor && actor.inSight(vehicle)) {
        averageVelocity.add(vehicle.speed);
        averagePosition.x += vehicle.x;
        averagePosition.y += vehicle.y;
        if (this.tooClose(actor, vehicle)) this.flee(actor, vehicle);
        inSightCount++;
      }
    }
    if (inSightCount > 0) {
      averageVelocity.mul(1/inSightCount);
      averagePosition.mul(1/inSightCount);
      this.seek(actor, averagePosition);
      this.steeringForce.add(averageVelocity.mul(1/inSightCount));
      this._act(actor);
    }
  }

  /**
   * 是否靠太近
   * @param {SteeredActor} vehicle 
   * @returns boolen
   */
  tooClose(actor, vehicle) {
    let centerPos = new Vector(actor.x, actor.y);
    let targetcenterPos = new Vector(vehicle.x, vehicle.y);
    return centerPos.dist(targetcenterPos) < this.tooCloseDist;
  }
}
export { Vector, Actor, CirActor, BounceActor, SteeredActor, JumpActor, BoxActor, BoxBall, Weapon, MoveManage };