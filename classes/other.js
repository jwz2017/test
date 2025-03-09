import { stage } from "./gframe.js";
class ShapeBackground extends createjs.Container {
  constructor(centerX, centerY) {
    super();
    // Alpha Rectangle, applied each frame at the bottom, fading out the previous content over time.
    this.fade = new createjs.Shape(new createjs.Graphics().f("#FFF").dr(0, 0, stage.canvas.width, stage.canvas.height));
    this.fade.alpha = 0.02;
    this.shape = new createjs.Shape();
    this.shape.y = 276;
    // middle spinner:
    this.spin2 = new createjs.Container();
    this.spin2.addChild(this.shape);
    this.spin2.x = 375;
    // outside spinner:
    this.spin1 = new createjs.Container();
    this.spin1.addChild(this.spin2);
    this.spin1.x = stage.width / 2;
    this.spin1.y = stage.height / 2;
    this.c = 0;
    this.count = 0;
    this.colorOffset = Math.random() * 360;
    if (centerX) this.w = centerX;
    else this.w = Math.random() * stage.width * 0.5;
    if (centerY) this.h = centerY;
    else this.h = Math.random() * stage.height * 0.5;
    this.addChild(this.fade, this.spin1);
  }
  clearBg() {
    this.count = 0;
    this.spin1.rotation = 0;
    this.spin2.rotation = 0;
    this.shape.rotation = 0;
  }
  updateWaitBg() {
    this.spin1.rotation += 10.7;
    this.spin2.rotation += -7.113;
    this.shape.rotation += 1.77;
    let color = createjs.Graphics.getHSL(
      Math.cos((this.count++) * 0.1) * 30 + this.colorOffset,
      100,
      50,
      0.8);
    this.shape.graphics.setStrokeStyle(Math.random() * 20, "round").beginStroke(color);
    this.shape.graphics.moveTo(0, 0);
    var lastPt = this.shape.globalToLocal(this.w, this.h);
    this.shape.graphics.lineTo(lastPt.x, lastPt.y);
    // draw the new vector line to the canvas:
    stage.update()
    // then clear the shape's vector data so it isn't rendered again next tick:
    this.shape.graphics.clear();
  }
}

//复制对象
function getFXBitmap(source, filters, x, y, w, h) {
  // cache the source, so we can grab a rasterized image of it:
  source.cache(x, y, w, h);

  // create a new Bitmap, using the source's cacheCanvas:
  var bmp = new createjs.Bitmap(source.cacheCanvas);

  // add the filters, and cache to apply them
  bmp.filters = filters;
  bmp.cache(0, 0, w, h);

  // offset the bmp's registration to account for the cache offset:
  bmp.regX = -x;
  bmp.regY = -y;
  bmp.x = source.x;
  bmp.y = source.y;
  // bmp.alpha = 0;

  // uncache the source:
  source.uncache();

  return bmp;
}

class BackgroundV {
  /**
   * 背景图片
   * @param {*} parent game
   * @param {*} bitmap 
   * @param {2} num 
   * @param {1} step 
   */
  constructor(parent, bitmap, num = 2, step = 1) {
    this.bitmaps = [];
    this.step = step;
    this._gameheight = parent.height;
    this._height = bitmap.getBounds().height;
    for (let i = 0; i < num; i++) {
      this.bitmaps.push(bitmap.clone());
      this.bitmaps[i].y = i * this._height;
      parent.addChildAt(this.bitmaps[i], 0);
    }
  }
  update() {
    let len = this.bitmaps.length;
    for (let i = 0; i < this.bitmaps.length; i++) {
      let bitmap = this.bitmaps[i];
      if (bitmap.y > this._gameheight) {
        bitmap.y -= this._height * (len);
      }
      bitmap.y += this.step;
    }
  }
}
class BackgroundH {
  /**
   * 背景图片
   * @param {*} parent game
   * @param {*} bitmap 
   * @param {2} num 
   * @param {1} step 
   */
  constructor(parent, bitmap, num = 2, step = 1) {
    this.bitmaps = [];
    this.step = step;
    this._gameWidth = parent.width;
    this._width = bitmap.getBounds().width;
    for (let i = 0; i < num; i++) {
      this.bitmaps.push(bitmap.clone());
      this.bitmaps[i].x = i * this._width;
      parent.addChildAt(this.bitmaps[i], 0);
    }
  }
  update() {
    let len = this.bitmaps.length;
    for (let i = 0; i < this.bitmaps.length; i++) {
      let bitmap = this.bitmaps[i];
      if (bitmap.x > this._gameWidth) {
        bitmap.x -= this._width * (len);
      }
      bitmap.x += this.step;
    }
  }
}
export { ShapeBackground, getFXBitmap, BackgroundV, BackgroundH }