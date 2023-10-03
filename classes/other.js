import { stage } from "./gframe.js";

 class SideBysideScore extends createjs.Container {
    /**
     * @param {string} label 引索也是key
     * @param {number} value 
     */
    constructor(label, val = 0, valueFont = null, offY = 0, isrect = false) {
      super();
      // this._label = new createjs.Text(label + ':', "bold " + gframe.style.SCORE_TEXT_SIZE + 'px ' + gframe.style.fontFamily, gframe.style.SCORE_TEXT_COLOR);
      this._label = new createjs.Text(label + ':', gframe.style.SCORE_TEXT_SIZE + 'px ' + gframe.style.fontFamily, gframe.style.SCORE_TEXT_COLOR);
      let font = valueFont || gframe.style.SCORE_TEXT_SIZE + 'px ' + gframe.style.fontFamily
      this._valueText = new createjs.Text(val, font, gframe.style.SCORE_TEXT_COLOR);
      this.addChild(this._label, this._valueText);
      this._valueText.x = this._label.getMeasuredWidth() + 5;
      this._valueText.y += offY;
      if (isrect) this.drawRect();
    }
    drawRect(color = "#000") {
      let b = this.getBounds();
      this.image = new createjs.Shape();
      this.image.graphics.clear().beginStroke(color).drawRect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
      this.addChild(this.image);
    }
    setSprite(spritesheet, scale, offY) {
      let t = this._label.text;
      this.removeChild(this._label);
      this._label = new createjs.BitmapText(t, spritesheet);
      this._label.scaleX = this._label.scaleY = scale;
  
      let v = this._valueText.text;
      this.removeChild(this._valueText);
      this._valueText = new createjs.BitmapText(v, spritesheet);
      this._valueText.y += offY;
      this._valueText.scaleX = this._valueText.scaleY = scale;
  
      this.addChild(this._label, this._valueText);
      this._valueText.x = this._label.getBounds().width * scale + 10;
    }
    setLabelSprite(image, scale, offY) {
      this.removeChild(this._label);
      this._label = new createjs.Bitmap(queue.getResult(image));
      this.addChild(this._label);
      this._label.scale = scale;
      this._valueText.x = this._label.getBounds().width;
      this._valueText.y += offY;
    }
    get value() {
      return this._value;
    }
    set value(val) {
      this._valueText.text = val.toString();
    }
  }
  class ScoreBoard extends createjs.Container {
    /**
     * 分数版
     * @param {*} xpos 
     * @param {*} ypos 
     * @param {*} color 分数版背景颜色
     * @param {*} w 
     * @param {*} h 
     */
    constructor(xpos = 0, ypos = 0, isbg = false) {
      super();
      this.x = xpos;
      this.y = ypos;
      this._textElements = new Map();
      this._isbg = isbg;
      if (isbg) {
        this._shape = new createjs.Shape();
        this.addChild(this._shape);
      }
    }
    _redraw() {
      this._shape.graphics.clear().beginFill(gframe.style.SCOREBOARD_COLOR).drawRect(0, 0, stage.width, this.getBounds().height);
    }
    placeElements() {
      let s = this._textElements.size;
      let spacing = stage.width / (s >= 3 ? 3 : s);
      let i = 1, j = 0;
      this._textElements.forEach(iterator => {
        if (i == 4) j++, i = 1;
        iterator.x = spacing * i - spacing / 2 - iterator.getBounds().width / 2;
        iterator.y = iterator.y || iterator.getBounds().height * 2 * j;
        i++;
      });
      this.setBounds(0, 0, stage.width, this.getBounds().height + 20);
      if (this._isbg) this._redraw();
    }
    /**
     * 创建分数版元素
     * @param {*} key 
     * @param {*} val 
     * @param {*} xpos 
     * @param {*} ypos 
     * @param {*} param4 
     */
    createTextElement(key, val = "00000", xpos = 0, ypos = 0, { spriteSheet, image, scale = 1, isrect, offY = 0, valueFont } = {}) {
      var _obj = new SideBysideScore(key, val, valueFont, offY, isrect);
      if (spriteSheet) _obj.setSprite(spriteSheet, scale, offY)
      else if (image) _obj.setLabelSprite(image, scale, offY);
      this._textElements.set(key, _obj);
      _obj.x = xpos;
      _obj.y = ypos;
      this.addChild(_obj);
    }
    getElement(key) {
      return this._textElements.get(key);
    }
    //更新分数板
    update(label, val) {
      this._textElements.get(label).value = val;
    }
    get height(){
      return this.getBounds().height;
    }
  }



  export class ShapeBackground extends createjs.Container {
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
      this.c = 0;
      this.count = 0;
      this.spin1.rotation = 0;
      this.spin2.rotation = 0;
      this.shape.rotation = 0;
      stage.autoClear = true;
    }
    updateWaitBg() {
      this.c++;
      if (this.c == 1) {
        stage.autoClear = false;
      }
      this.spin1.rotation += 10.7;
      this.spin2.rotation += -7.113;
      this.shape.rotation += 1.77;
      if (this.c > 0 && this.c <= 40) {
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
  }

  //复制对象
  export function getFXBitmap(source, filters, x, y, w, h) {
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