import { Node } from "./Game.js";
import { game } from "./gframe.js";
import { checkPixelCollision } from "./hit/hitTest.js";
//向量角色类**************************************************************************
class Vector {
  //计算两条线段的焦点  null为不相交
  static getCrossPoint(a1, a2, b1, b2) {
    let va = new Vector(a2.x - a1.x, a2.y - a1.y);

    let a1b1 = new Vector(b1.x - a1.x, b1.y - a1.y);
    let a1b2 = new Vector(b2.x - a1.x, b2.y - a1.y);
    if (va.crossProd(a1b1) * va.crossProd(a1b2) > 0) return;

    let vb = new Vector(b2.x - b1.x, b2.y - b1.y);
    let b1a1 = new Vector(a1.x - b1.x, a1.y - b1.y);
    let b1a2 = new Vector(a2.x - b1.x, a2.y - b1.y);
    if (vb.crossProd(b1a1) * vb.crossProd(b1a2) > 0) return;

    let lenA = b1a1.crossProd(va);
    let lenB = vb.crossProd(va);
    let ratio = lenA / lenB;
    va.setValues(b1.x, b1.y)
    va.add(vb.mul(ratio));
    return va;
  }
  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }
  static sub(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }
  static mul(v, val) {
    return new Vector(v.x * val, v.y * val);
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
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  mul(val) {
    this.x *= val;
    this.y *= val;
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
  //外积 >0:v2与v1夹角0——180，v2在左侧
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
  //创建元素
  static getActor(A) {
    let a = A || this;
    a.array = a.array || [];
    let len = a.array.length, i = 0;
    while (i <= len) {
      let b = a.array[i];
      if (!b) {
        a.array[i] = new a();
        break;
      } else if (!b.parent) {
        break;
      } else {
        i++;
      }
    }
    return a.array[i];
  };
  constructor(width=0, height=0) {
    super();
    this.mouseChildren = false;
    if (width) this.setBounds(-width / 2, -height / 2, width, height);
    this._rect = new createjs.Rectangle(0, 0, width, height);
    this.edgeBehavior = null;
    this.speed = new Vector(0, 0);
    //摩檫力
    this.friction = 1;
    //质量
    this.mass = 1;
    this.bounce = -1;
    this.maxSpeed = 5;
    this._maxHp = 1;
    this.hp = this._maxHp;
    this._color = "rgb(64,64,64)";
  }

  init(xpos, ypos) {
    this.setTransform();
    this.setPos(xpos, ypos);
    this.hp = this._maxHp;
  }
  setSpriteData(spriteSheet, animation, { imageScale = 1, rotation = 0, offsetX = 0, offsetY = 0, isdraw=true} = {}) {
    //显示辅助矩形
    if (this.image && !isdraw) this.removeChild(this.image);
    if (spriteSheet instanceof createjs.SpriteSheet) {
      this.image = new createjs.Sprite(spriteSheet, animation);
    } else {
      this.image = new createjs.Bitmap(spriteSheet);
    }
    this.image.scale = imageScale;
    this.image.rotation = rotation;
    let b = this.image.getTransformedBounds();
    this.image.x = -b.x - b.width / 2;
    this.image.y = -b.y - b.height / 2;
    this.addChild(this.image);
    this.image.x += offsetX;
    this.image.y += offsetY;
    this._setRect();
  }
  drawSpriteData(width, height, color) {
    this._hit = null;
    this._color = color || this._color;
    if (!(this.image instanceof createjs.Shape)) {
      this.image = new createjs.Shape();
      this.addChild(this.image);
    }
    this.drawShape(width, height);
    this.image.setBounds(-width / 2, -height / 2, width, height);

    this._setRect();
  }
  _setRect() {
    let bounds = this.getBounds();
    this._rect.width = bounds.width;
    this._rect.height = bounds.height;
    this.x = this._rect.x + bounds.width / 2;
    this.y = this._rect.y + bounds.height / 2;
    this._setHit();
  }
  _setHit() {
    this._hit = this._hit || Math.sqrt(this._rect.width * this._rect.width + this._rect.height * this._rect.height) / 2;
  }
  drawShape(width, height) {
    this.image.graphics.clear().beginFill(this._color).drawRect(-width / 2, -height / 2, width, height);
  }


  get rect() {
    return this._rect;
  }
  get color() {
    return this._color;
  }
  set color(val) {
    this._color = val;
    if (this.image instanceof createjs.Shape) {
      let b = this.image.getBounds();
      this.drawShape(b.width, b.height);
    }
  }
  get hit() {
    return this._hit * this.scale;
  }
  set hit(val) {
    this._hit = val;
  }
  get scale() {
    return super.scale;
  }
  set scale(val) {
    super.scale = val;
    this.updateRect();
  }
  get maxHp() {
    return this._maxHp;
  }
  set maxHp(val) {
    this._maxHp = val;
    if (this.hp > this._maxHp) this.hp = this._maxHp;
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
  setRotation(ang) {
    this.rotation = ang;
    this.updateRect();
  }
  recycle() {
    if (this.parent) this.parent.removeChild(this);
    this.hp = 0;
  }
  act() {
    this.speed.truncate(this.maxSpeed);
    this.speed.mul(this.friction);
    this.plus(this.speed.x, this.speed.y);
    if (this.edgeBehavior) this.checkBounds(game.contentSize);
  }
  /**
 * 与其它元素碰撞
 * @param {*} actors 
 * @param {rectangle} actorRect=this.rect
 * @param {boolean} pixlContainer 可用game.container
 * @param {0} alphaThreshold 象素透明度
 * @returns 
 */
  hitActors(array, actorRect = null, pixlContainer = null, alphaThreshold = 0) {
    let rect = actorRect || this.rect;
    for (var i = 0; i < array.length; i++) {
      var other = array[i];
      if (other == this || other.hp<=0) {
        continue;
      }
      let hit = this.hitActor(other, rect, pixlContainer, alphaThreshold);
      if (hit) return hit;
    }
  }
  hitActor(other, actorRect = null, pixlContainer = null, alphaThreshold = 0) {
    let rect = actorRect || this.rect;
    if (!pixlContainer || (other.image instanceof createjs.Shape) || (this.image instanceof createjs.Shape)) {
      if (rect.intersects(other.rect)) return other;
    } else {
      let r = rect.intersection(other.rect);
      if (r) {
        let p = pixlContainer.localToGlobal(r.x, r.y);
        r.x = p.x;
        r.y = p.y;
        if (checkPixelCollision(this.image, other.image, r, alphaThreshold)) {
          return other
        }
      }
    }
  }
  hitRActors(array) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      if (element == this || element.hp<=0) {
        continue;
      }
      let hit = this.hitRadius(element);
      if (hit) return element;
    }
  }
  /**
   * 两个球体碰撞或球与点的碰撞
   * @param {*} obj1 
   * @param {*} obj2
   * @returns 
   */
  hitRadius(obj2) {
    let otherHit = obj2.hit || 0;
    if (this.x - this.hit > obj2.x + otherHit) {
      return;
    }
    if (this.x + this.hit < obj2.x - otherHit) {
      return;
    }
    if (this.y - this.hit > obj2.y + otherHit) {
      return;
    }
    if (this.y + this.hit < obj2.y - otherHit) {
      return
    }
    return this.hit + otherHit > Math.sqrt(Math.pow(this.x - obj2.x, 2) + Math.pow(this.y - obj2.y, 2));
  }

  checkBounds(containerSize, noBottom) {
    if (this.edgeBehavior == "wrap") {
      this.placeInBounds(containerSize);
    } else if (this.edgeBehavior == "bounce") {
      this.rebounds(containerSize, noBottom);
    } else if (this.edgeBehavior == "recycle") {
      if (this.outOfBounds(containerSize)) {
        this.recycle();
      }
    }
  }
  /**
   * 检测是否与边界碰撞
   * @param {thisRect} rect 矩形形状
   * @param {Rectangle} containerSize 容器rect
   * @returns bool
   */
  hitBounds(rect = this.rect, containerSize = game.contentSize) {
    return rect.x < containerSize.x || rect.x + rect.width > containerSize.width || rect.y < containerSize.y || rect.y + rect.height > containerSize.height;
  }

  /**
   * 检测是否出地图边界
   * @param {game.contentSize} containerSize 
   * @returns bool
   */
  outOfBounds(containerSize = game.contentSize) {
    return this.x + this.width < containerSize.x || this.x > containerSize.width || this.y + this.height < containerSize.y || this.y > containerSize.height;
  }

  /**
   * 屏幕反弹
   * @param {rectangle} containerSize 
   * @param {false} noBottom  有无底板
   */
  rebounds(containerSize, noBottom) {
    let rect = this.rect,
      s = containerSize;
    if (rect.x < containerSize.x) {
      this.speed.x *= this.bounce;
      rect.x = 0;
      this.x = rect.width / 2;
    } else if (rect.x + rect.width > s.width) {
      this.speed.x *= this.bounce;
      rect.x = s.width - rect.width;
      this.x = s.width - rect.width / 2;
    }
    if (rect.y < s.y) {
      this.speed.y *= this.bounce;
      rect.y = 0;
      this.y = rect.height / 2;
    } else if (rect.y + rect.height > s.height && !noBottom) {
      this.speed.y *= this.bounce;
      rect.y = s.height - rect.height;
      this.y = s.height - rect.height / 2;
    }
  }
  /**
   * 屏幕环绕
   * @param {rectangle} containerSize 
   */
  placeInBounds(containerSize) {
    let s = containerSize;
    let rect = this.rect;
    if (rect.x + rect.width < s.x) {
      rect.x = s.width;
      this.x = s.width + rect.width / 2;
    } else if (rect.x > s.width) {
      rect.x = -rect.width;
      this.x = -rect.width / 2;
    }
    if (rect.y + rect.height < s.y) {
      rect.y = s.height;
      this.y = s.height + rect.height / 2;
    } else if (rect.y > s.height) {
      rect.y = -rect.height;
      this.y = -rect.height / 2;
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
  constructor(radius) {
    super(radius * 2, radius * 2);
  }
  drawShape(width) {
    let radius = width / 2
    this.image.graphics.clear().beginRadialGradientFill(["#c9c9c9", this._color], [0, 1], radius / 3, -radius / 3, 0, radius / 6, -radius / 6, radius).drawCircle(0, 0, radius);
  }
  drawSpriteData(width, color) {
    super.drawSpriteData(width, width, color)
  }
  _setHit() {
    this._hit = this._hit || this.rect.width / 2;
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
  constructor(width, height) {
    super(width, height);
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
  }
}
//斜面反弹类
class BounceActor extends Actor {
  constructor(width, height) {
    super(width, height);
    this.name = "angleBounce";
    this.cos = 1;
    this.sin = 0;
  }
  setRotation(val) {
    super.setRotation(val);
    let angle = this.rotation * Math.PI / 180;
    this.cos = Math.cos(angle);
    this.sin = Math.sin(angle);
  }
  act() { }
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


class JumpActor extends Actor {
  /**
   * 跳跃类角色
   * @param {*} xpos 
   * @param {*} ypos 
   */
  constructor(width, height) {
    super(width, height);
    this.walkspeed = 1.2;
    this.jumpspeed = 6;
    this.gravity = 0.27;
    this.runspeed = 1.8;
    this.actIndex = 0;
    this.actStep = 30;
    this.hitMove = false;
    this.offSpeedX = 0;//载具额外速度
    this.offSpeedY = 0;
    this._oldPos = new createjs.Point();
  }
  init(xpos, ypos) {
    super.init(xpos, ypos);
    this.status = null;
  }
  moveY() {
    this.offSpeedX = 0;
    this.offSpeedY = 0;
    this.speed.y += this.gravity;
    this.checkMoveProp();
    let rect = this.rect.clone();
    rect.y += this.speed.y + this.offSpeedY;
    let node = game.hitMap(rect);
    if (node && node.type == Node.NOWALKABLE) {
      this.hitFloor(node.costMultiplier);
    } else if (this.hitMove) {
      this.hitFloor();
      this.hitMove = false
    } else {
      this.overhead();
    }
  }

  /**
   * @param {string} direction 
   * @param {{}} runkeys null
   */
  moveX(direction, runkeys) {
    this.walk(direction, runkeys);
    let rect = this.rect.clone();
    rect.x += this.speed.x + this.offSpeedX;
    let node = game.hitMap(rect, (node) => {
      this.checkHitProp(node);
    });
    if (node) {
      if (node.type == Node.DEATH) game.gameOver = true;
    } else this.plus(this.speed.x * this.friction + this.offSpeedX, 0);
  }
  //碰到死亡元素
  hitDeath() {
    game.gameOver = true;
  }
  //碰到移动木板
  hitMoveFloor(floor) {
    if (this.speed.y >= Math.max(0, this.y - floor.rect.y)) {
      this.hitMove = true;
      if (this.status != "roll") this.setPos(this.rect.x, floor.rect.y - this.rect.height);
      floor.hitRun(this);
    }
  }
  //碰撞移动元素
  checkMoveProp() {
  }
  //与不动元素碰撞
  checkHitProp() {
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
    if (this.status == "roll" || this.status == "jumpAttack") {
      return;
    }
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
      this.speed.y = this.offSpeedY;
      this.friction = floorMult;
      this.startFloorAct();
    } else this.speed.y = this.offSpeedY;
  }
  overhead() {
    if (this.idle) {
      this.status = "jump";
      this.changeAct();
    }
    this.startJumpAct();
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

  fire(Bullet) {//放子弹
    if (this.idle) {
      let bullet = Bullet.getActor();
      bullet.init();
      this.parent.addChild(bullet);
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
    }
  }

  get idle() {
    return this.status == "walk" || this.status == null || this.status == "run"
  }
}
export { Vector, Actor, CirActor, BounceActor, SteeredActor, JumpActor };