export class Weapon extends createjs.Container {
  /**
   * 武器
   * @param {*} actor 武器拥有者
   * @param {*} Bullet 子弹类型
   * @param {40} fireStep 开火节奏
   * @param {1} fireType 开火方式，单发或散弹max=19
   */
  constructor(parent,Bullet, fireStep = 40, fireType = 1) {
    super();
    parent.addChild(this);
    this.x=parent.hit||0;
    this._fireIndex = 0;
    this.fireStep = fireStep;
    this.fireType = fireType;
    this.Bullet = Bullet;
    this.bulletPosX=0;
    this.bulletPosY=0;
    this._bulletOffAngle = 10 * Math.PI / 180;
  }
  /**
   * 开火
   * @param {boolean} attackKey 
   */
  fire(attackKey,parent) {
    let p=parent||this.parent.parent;
    if (attackKey) {
      if (this._fireIndex-- < 0) {
        this._fireIndex = this.fireStep;
        for (let i = 0; i < this.fireType; i++) {
          const bullet = this.Bullet.getActor();
          bullet.init();
          p.addChild(bullet);
          this._activateBullet(i, bullet);
          if (i > 0) {
            let bullet1 = this.Bullet.getActor();
            bullet1.init();
            p.addChild(bullet1);
            this._activateBullet(-i, bullet1);
          }
        }
      }
    } else if (this._fireIndex >= 0) {
      this._fireIndex--;
    }
  }
  _activateBullet(i, bullet) {
    let p = this.localToLocal(this.bulletPosX, this.bulletPosY, bullet.parent);
    bullet.x = p.x;
    bullet.y = p.y;
    let angle = this.parent.rotation * Math.PI / 180;
    bullet.speed.angle = i * this._bulletOffAngle + angle;
    bullet.rotation = bullet.speed.angle * 180 / Math.PI;
    bullet.updateRect();
  }
}