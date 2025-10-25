//---------------------------------------------------Graphics---------------------------------------------------------------
class Rect extends createjs.Graphics {
  constructor() {
    super();
  }
  //border
  drawBorderUp() {
    this.beginFill(mc.style.borderColor).drawShape(0, 0, this.width, this.height);
  }
  drawBorderDown() {
    this.beginFill(mc.style.shadowColor).drawShape(0, 0, this.width, this.height);
  }
  //face
  drawFaceDown(color = mc.style.buttonDownColor) {
    this.beginFill(color).drawShape(1.5, 1.5, this.width - 1.5, this.height - 1.5);
  }
  drawFaceUp() {
    this.beginFill(mc.style.buttonUpColor).drawShape(1, 1, this.width - 2, this.height - 2);
  }
  drawFaceOver() {
    this.beginFill(mc.style.buttonOverColor).drawShape(1, 1, this.width - 2, this.height - 2);
  }
  //selected
  drawSelected() {
    this.beginFill(mc.style.highlightColor).drawShape(2, 2, this.width - 4, this.height - 4);
    this.beginFill(mc.style.shadowColor).drawShape(3, 3, this.width - 5, this.height - 5);
    this.beginFill(mc.style.buttonDownColor).drawShape(3, 3, this.width - 6, this.height - 6);
  }
  //handle
  drawHandle(x, y, w) {
    this.beginFill(mc.style.highlightColor).drawShape(x + 1, y + 1, w - 2, w - 2);
    this.beginFill(mc.style.shadowColor).drawShape(x + 2, y + 2, w - 2, w - 2);
    this.beginFill(mc.style.buttonDownColor).drawShape(x + 2, y + 2, w - 3, w - 3);
  }
  drawShape(x, y, width, height) {
    this.drawRect(x, y, width, height)
  }
}

//圆形
class Circle extends Rect {
  constructor() {
    super();
  }
  // drawFaceDown(color=mc.style.buttonDownColor) {
  //   this.beginFill(color).drawShape(1.5, 1.5, this.width - 2);
  // }
  drawShape(x, y, width) {
    var r = width / 2;
    this.drawCircle(r + x, r + y, r);
  }
}

//圆角矩形
class RoundRect extends Rect {
  constructor(radius = 5) {
    super();
    this._radius = radius;
  }
  drawShape(x, y, width, height) {
    this.drawRoundRect(x, y, width, height, this._radius);
  }
}

class Star extends Rect {
  constructor(sides = 4, pointSize = 0.6, angle = -90) {
    super();
    this._sides = sides;
    this._pointSize = pointSize;
    this._angle = angle;
  }
  drawShape(x, y, width) {
    const r = width / 2;
    this.drawPolyStar(r + x, r + y, r, this._sides, this._pointSize, this._angle);
  }
}
class Ellipse extends Rect {
  constructor() {
    super();
  }
  drawShape(x, y, width, height) {
    this.drawEllipse(x, y, width, height);
  }
}
//自定义
class Arrow extends Rect {
  /**
   *  箭头绘制
   * @param {number} rot =0，箭头角度
   */
  constructor(rot = 0) {
    super();
    this._arrowRotation = rot;
  }
  drawShape(x, y, width, height) {
    const mat = new createjs.Matrix2D().translate(width / 2, height / 2).rotate(this._arrowRotation);
    mc.drawPoints(this, mat, this._getPoints(width, height));
  }
  _getPoints(width, height) {
    return [
      [-width / 2, -height / 4],
      [0, -height / 4],
      [0, -height / 2],
      [width / 2, 0],
      [0, height / 2],
      [0, height / 4],
      [-width / 2, height / 4]
    ];
  }
}
//---------------------------------------------------图形按钮类-----------------------------------------------------------
class PushButtonShape extends createjs.Shape {
  constructor(parent, handle, width = 200, height = 40, GClass = new Rect) {
    super()
    this.graphics = GClass;
    if (parent) parent.addChild(this);
    this._handler = handle;
    //状态
    this.cursor = "pointer"; //手型
    this._down = false;
    this._over = false;
    this._selected = false; //选择状态
    this.toggle = false; // 设置是否开关状态
    this._enable = true;
    //鼠标事件
    this.on("mouseover", e => {
      this._over = true;
      this.redraw();
    })
    this.on("mouseout", this._onMouseOut);
    this.on("mousedown", this._onMouseDown);
    this.on("pressup", this._onPressUp);
    this.setSize(width, height);
  }
  _onMouseDown(e) {
    this._down = true;
    this.redraw();
  }
  _onMouseOut(e) {
    this._down = this._selected;
    this._over = false;
    this.redraw();
  }
  _onPressUp(e) {
    if (this._over && this._down && this.toggle) {
      this._selected = !this._selected;
    }
    if (this._handler && e.target.hitTest(e.localX, e.localY)) {
      this._handler();
    }
    this._down = this._selected;
    this.redraw();
  }
  redraw() {
    this.graphics.clear();
    //drawborder
    if (this._down) {
      this.graphics.drawBorderDown();
    } else {
      this.graphics.drawBorderUp();
    }
    //drawFace
    if (this._down) {
      this.graphics.drawFaceDown();
    } else if (this._over) {
      this.graphics.drawFaceOver();
    } else {
      this.graphics.drawFaceUp();
    }
  }

  get enable() {
    return this.mouseEnabled;
  }

  set enable(enable) {
    this.mouseEnabled = enable;
  }

  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get selected() {
    return this._selected;
  }
  set selected(val) {
    if (this._selected != val) {
      this._selected = val;
      this.redraw();
    }
  }

  setSize(width, height) {
    this._width = width;
    this._height = height;
    this.graphics.width = width;
    this.graphics.height = height;
    this.setBounds(0, 0, this._width, this._height);
    this.redraw();
  }
}
// 带三角的pushbuttonShape类
class ArrowButtonShape extends PushButtonShape {
  constructor(parent, handle, width = 40, height = 40, arrowRotation = 0, GClass) {
    super(parent, handle, width, height, GClass)
    this.arrowHeight = height / 4;
    this.arrowRotation = arrowRotation;
  }
  redraw() {
    super.redraw();
    //绘制三角形
    if (this._down) {
      this.graphics.beginFill(mc.style.buttonUpColor);
    } else {
      this.graphics.beginFill(mc.style.shadowColor);

    }
    const mat = new createjs.Matrix2D().translate(this._width / 2, this._height / 2).rotate(this._arrowRotation);
    mc.drawPoints(this.graphics, mat, [
      [0, -this.arrowHeight / 2 - 1],
      [this.arrowHeight, this.arrowHeight / 2 - 1],
      [-this.arrowHeight, this.arrowHeight / 2 - 1],
      [0, -this.arrowHeight / 2 - 1]
    ]);
  }
  get arrowRotation() {
    return this._arrowRotation;
  }
  set arrowRotation(val) {
    this._arrowRotation = val;
    this.redraw();
  }

}
//checkBoxShape类
class CheckBoxShape extends PushButtonShape {
  /**
   * 
   * @param {Container} parent 容器
   * @param {Function} handle 点击事件
   * @param {boolen} selected =false选择状态
   * @param {number} width =15 宽度
   * @param {*} height 
   * @param {*} GClass 
   */
  constructor(parent, handle, selected = false, width = 15, height = 15, GClass) {
    super(parent, handle, width, height, GClass);
    this._selected = selected;
    this.toggle = true;
    this.setSize(width, height);
  }
  _onMouseDown(e) {
    this._down = true;
  }
  redraw() {
    this.graphics.clear();
    this.graphics.drawBorderDown();
    if (this._over) this.graphics.drawFaceOver();
    else {
      this.graphics.drawFaceDown(mc.style.buttonUpColor);
    }
    //绘制选择状态
    if (this._selected) {
      this.graphics.drawSelected();
    }
  }
}
//sliderShape类
class SliderShape extends PushButtonShape {
  constructor(parent, handle, sliderWidth = 120, sliderHeight = 10, GClass, isVSlider = true) {
    super(parent, handle, sliderWidth, sliderHeight, GClass);
    this._isVSlider = isVSlider;

    this.valueLabel = new createjs.Text("0");

    this._handlePos = 0;
    this._px = this._isVSlider ? 0 : 1;
    this._py = this._isVSlider ? 1 : 0;

    this._value = 0;
    this._precision = 2; //小数点位数
    this._continuous = true; //是否持续执行函数
    this._minimum = 0;
    this._maximum = 100;
    this._draging = false;
    this.on('pressmove', e => {
      this._press(e);
      this._calculateValue();
      if (this._handler && this._continuous) {
        this._handler();
      }
    });
    this.setSize(sliderWidth, sliderHeight);
  }
  _onMouseDown(e) {
    this._down = true;
  }
  _onMouseOut(e) {
    this._over = false;
    this.redraw();
  }
  _onPressUp(e) {
    this._down = false;
    this._press(e);
    this._calculateValue();
    if (this._handler) {
      this._handler(this);
    }
  }
  _press(e) {
    const p = [e.localY, e.localX],
      mousePos = p[this._px];
    this._handlePos = mousePos - this._sliderHeight / 2;
    this._handlePos = Math.min(this._handlePos, this._sliderWidth - this._sliderHeight);
    this._handlePos = Math.max(this._handlePos, 0);
  }
  _calculateValue() {
    const range = this._maximum - this._minimum,
      h = this._sliderWidth - this._sliderHeight,
      d = [h - this._handlePos, this._handlePos],
      mult = Math.pow(10, this._precision);
    this._value = this._minimum + d[this._px] / h * range;
    this._value = Math.min(this._value, this._maximum);
    this._value = Math.max(this._value, this._minimum);
    this.value = Math.round(this._value * mult) / mult;
  }
  _calculateHandle() {
    const range = this._maximum - this._minimum,
      percent = (this._value - this._minimum) / range,
      pts = [1 - percent, percent],
      h = this._sliderWidth - this._sliderHeight;
    this._handlePos = h * pts[this._px];
  }
  redraw() {
    const VHPos = [0, this._handlePos],
      posX = VHPos[this._px],
      posY = VHPos[this._py];
    this.graphics.clear();
    //drawborder
    this.graphics.drawBorderDown();
    if (this._over || this._down) {
      this.graphics.drawFaceOver();
    } else {
      this.graphics.drawFaceDown(mc.style.buttonUpColor);
    }
    //drawhandle
    this.graphics.drawHandle(posX, posY, this._sliderHeight);
  }
  get value() {
    return this._value;
  }
  set value(val) {
    this._value = val;
    this.valueLabel.text = val;
    this._calculateHandle();
    this.redraw();
  }
  setSize(sliderWidth, sliderHeight) {
    this._sliderWidth = sliderWidth;
    this._sliderHeight = sliderHeight;
    this._width = this._isVSlider ? sliderHeight : sliderWidth;
    this._height = this._isVSlider ? sliderWidth : sliderHeight;
    this.setBounds(0, 0, this._width, this._height);
    this._calculateHandle();
    this.graphics.width = this._width;
    this.graphics.height = this._height;
    this.redraw();
  }
  setMmum(max, min) {
    this._maximum = max;
    this._minimum = min;
    this._value = Math.max(this._value, min);
    this.value = Math.min(this._value, max);
  }
  get continuous() {
    return this._continuous;
  }
  set continuous(bool) {
    this._continuous = bool;
  }
  get precision() {
    return this._precision;
  }
  set precision(val) {
    this._precision = val;
  }
}
//-------------------------------------------------组件类--------------------------------------------------------------
class Component extends createjs.Container {
  constructor(parent, x = 0, y = 0) {
    super();
    if (parent) {
      parent.addChild(this);
    }
    this.x = x;
    this.y = y;
  }
  /**
   * 创建label
   * @param {string} text 文本内容
   * @param {string} val 对齐方式 可选：mc.style.CENTER:mc.style.CENTER_LEFT
   */
  _createLabel(text, val) {
    let label = new createjs.Text();
    label.font = mc.style.fontSize + "px " + mc.style.fontFamily;
    label.color = mc.style.labelColor;
    switch (val) {
      case mc.style.CENTER_MIDDLE:
        label.textAlign = "center";
        label.textBaseline = "middle";
        break;
      case mc.style.LEFT_MIDDLE:
        label.textBaseline = "middle";
        break;
      case mc.style.CENTER_BOTTOM:
        label.textAlign = "center";
        label.textBaseline = "bottom";
        break;
      case mc.style.RIGHT_MIDDLE:
        label.textAlign = "right";
        label.textBaseline = "middle";
        break;
      case mc.style.CENTER_TOP:
        label.textAlign = "center";
        break;
      default:
        break;
    }
    label.text = text;
    this.addChild(label);
    return label;
  }
  _positionLabel() {
    //override
  }
  setSize(width, height) {
    this.shape.setSize(width, height);
    this._positionLabel();
  }
}
//pushButton类
class PushButton extends Component {
  /**
   * [pushButton类]
   * @param {[object]} parent  [option:父级容器]
   * @param {[string]} label  [option:按钮标签文本]
   * @param {[Function]} handler =null [option:点击事件]
   * @param {[number]} x =0 [option:x坐标]
   * @param {[number]} y =0 [option:y坐标]
   * @param {[number]} width =200 [长度]
   * @param {[number]} height =40 [高度]
   * @param {[Graphics]} GClass  图形类
   */
  constructor(parent, label, handle, x, y, width=60, height=20, GClass=new Rect) {
    super(parent, x, y);
    this.mouseChildren=false;
    //addChildren
    this.shape = new createjs.Shape();
    this.addChild(this.shape);
    this._label = this._createLabel(label, mc.style.CENTER_MIDDLE);
    this.shape.graphics = GClass;
    if (parent) parent.addChild(this);
    this._handler = handle;
    //状态
    this.cursor = "pointer"; //手型
    this._down = false;
    this._over = false;
    this._selected = false; //选择状态
    this.toggle = false; // 设置是否开关状态
    this._enable = true;
    //鼠标事件
    this.on("mouseover", e => {
      this._over = true;
      this.redraw();
    })
    this.on("mouseout", this._onMouseOut);
    this.on("mousedown", this._onMouseDown);
    this.on("pressup", this._onPressUp);
    this.setSize(width, height);
    this._positionLabel();
  }
  _positionLabel() {
    this._label.x = this.width / 2;
    this._label.y = this.height / 2;
  }
  _onMouseDown(e) {
    this._down = true;
    this.redraw();
  }
  _onMouseOut(e) {
    this._down = this._selected;
    this._over = false;
    this.redraw();
  }
  _onPressUp(e) {
    if (this._over && this._down && this.toggle) {
      this._selected = !this._selected;
    }
    if (this._handler && e.target.hitTest(e.localX, e.localY)) {
      this._handler();
    }
    this._down = this._selected;
    this.redraw();
  }
  redraw() {
    this.shape.graphics.clear();
    //drawborder
    if (this._down) {
      this.shape.graphics.drawBorderDown();
    } else {
      this.shape.graphics.drawBorderUp();
    }
    //drawFace
    if (this._down) {
      this.shape.graphics.drawFaceDown();
    } else if (this._over) {
      this.shape.graphics.drawFaceOver();
    } else {
      this.shape.graphics.drawFaceUp();
    }
  }
  get enable() {
    return this.mouseEnabled;
  }

  set enable(enable) {
    this.mouseEnabled = enable;
  }

  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get selected() {
    return this._selected;
  }
  set selected(val) {
    if (this._selected != val) {
      this._selected = val;
      this.redraw();
    }
  }

  setSize(width, height) {
    this._width = width;
    this._height = height;
    this.shape.graphics.width = width;
    this.shape.graphics.height = height;
    this.setBounds(0, 0, this._width, this._height);
    this.redraw();
  }
}
// checkBox类
class CheckBox extends Component {
  /**
   * [CheckBox类]
   * @param {[object]} parent  [option:父级容器]
   * @param {[string]} label  [option:按钮标签文本]
   * @param {[Function]} handler =null [option:点击事件]
   * @param {boolen} selected =false 是否选择状态
   * @param {[number]} x =0 [option:x坐标]
   * @param {[number]} y =0 [option:y坐标]
   * @param {number} width=15 [长度]
   * @param {[number]} height =15 [高度]
   * @param {Graphics} GClass  图形类
   */
  constructor(parent, label, handler, selected, x, y, width, height, GClass) {
    super(parent, x, y);
    //addChildren
    this.shape = new CheckBoxShape(this, handler, selected, width, height, GClass);
    this._label = this._createLabel(label, mc.style.LEFT_MIDDLE);
    this._positionLabel();
  }

  _positionLabel() {
    this._label.x = this.shape.width + 8;
    this._label.y = this.shape.height / 2;
  }
  get selected() {
    return this.shape.selected;
  }
  set selected(val) {
    this.shape.selected = val;
  }
}
//单选框
class RadioButton extends CheckBox {
  /**
   * [RadioButton类]
   * handler中的this指向 undefinde
   * @param {[object]} parent  [option:父级容器]
   * @param {[string]} label  [option:按钮标签文本]
   * @param {[Function]} handler =null [option:点击事件]
   * @param {boolen} selected  是否选择状态
   * @param {[number]} x =0 [option:x坐标]
   * @param {[number]} y =0 [option:y坐标]
   * @param {[number]} width =15 [长度]
   * @param {[number]} height =15 [高度]
   * @param {Class} GClass  图形类
   */
  constructor(parent, label, handler, selected, x, y, width, height, GClass) {
    super(parent, label, () => {
      if (!this.selected) {
        this._clearAll();
        RadioButton.selectedButton = this;
        this.selected = true;
        if (handler) {
          handler(this);
        }
      }
    }, selected, x, y, width, height, GClass);
    //设置开关状态关闭
    this.shape.toggle = false;
    if (this.selected) {
      this._clearAll();
      RadioButton.selectedButton = this;
    }
    RadioButton.group.push(this);
  }

  _clearAll() {
    if (RadioButton.selectedButton) {
      RadioButton.selectedButton.selected = false;
    }
  }
}
RadioButton.selectedButton = null;
RadioButton.group = [];
//slider类
class Slider extends Component {
  /**
   * [pushButton类]
   * @param {[object]} parent  [option:父级容器]
   * @param {[string]} label  [option:按钮标签文本]
   * @param {[Function]} handler =null [option:点击事件]
   * @param {[number]} x =0 [option:x坐标]
   * @param {[number]} y =0 [option:y坐标]
   * @param {[number]} sliderWidth =120 [长度]
   * @param {[number]} sliderHeight =10 [高度]
   * @param {[Graphics]} GClass  图形类
   * @param {[boolean]} isVSlider  =true,方向
   */
  constructor(parent, label, handler, x, y, sliderWidth, sliderHeight, GClass, isVSlider) {
    super(parent, x, y);
    //addChildren
    this.shape = new SliderShape(this, handler, sliderWidth, sliderHeight, GClass, isVSlider);
    this._valueLabel = this.shape.valueLabel;
    if (this.shape._isVSlider) {
      this._label = this._createLabel(label, mc.style.CENTER_TOP);
      this._valueLabel.textAlign = "center";
      this._valueLabel.textBaseline = "bottom";
    } else {
      this._label = this._createLabel(label, mc.style.RIGHT_MIDDLE);
      this._valueLabel.textBaseline = "middle";
    }
    this._valueLabel.font = this._label.font;
    this._valueLabel.color = mc.style.labelColor;
    this.addChild(this._valueLabel);
    this._positionLabel();
  }
  _positionLabel() {
    if (this.shape._isVSlider) {
      this._label.x = this.shape.width / 2;
      this._label.y = this.shape.height + 8;
      this._valueLabel.x = this.shape.width / 2;
      // this._valueLabel.y = 0;
    } else {
      this._label.y = this.shape.height / 2;
      this._label.x = -8;
      this._valueLabel.x = this.shape.width + 8;
      this._valueLabel.y = this.shape.height / 2 + 3;
    }
  }
  get value() {
    return this.shape.value;
  }
  set value(val) {
    this.shape.value = val;
  }
  setMmum(max, min) {
    this.shape.setMmum(max, min);
  }
  get continuous() {
    return this.shape.continuous;
  }
  set continuous(bool) {
    this.shape.continuous = bool;
  }
  get precision() {
    return this.shape.precision;
  }
  set precision(val) {
    this.shape.precision = val;
  }
}
//scrollbar类
class ScrollBar extends createjs.Container {
  /**
   * 滚动条
   * @param {object} parent 
   * @param {*} x =0
   * @param {*} y =0
   * @param {*} barWidth =150
   * @param {*} barHeight =15
   * @param {boolean} isVertical =false
   */
  constructor(parent, x = 0, y = 0, barWidth = 150, barHeight = 15, isVertical = false) {
    super();
    this.height
    if (parent) parent.addChild(this);
    this.x = x;
    this.y = y;
    this.isVertical = isVertical;
    this._contentLength = 0;
    this._value = 0;
    this.unitIncrement = 120;
    this.blockIncrement = 240;

    this.background = new createjs.Shape;
    this.addChild(this.background);
    this.background.on("mousedown", e => {
      const pos = this.isVertical ? e.localY : e.localX
      const handleHead = this.isVertical ? this.handle.y : this.handle.x
      const handleTail = this.isVertical ? this.handle.y + this.handle.height : this.handle.x + this.handle.width
      if (pos < handleHead) {
        this._changeValue(this.value + this.blockIncrement)
      } else if (pos > handleTail) {
        this._changeValue(this.value - this.blockIncrement)
      }
    })
    const rot = this.isVertical ? 0 : -90
    this.headArrow = new ArrowButtonShape(this, () => {
      this._changeValue(this.value + this.unitIncrement);
    }, barHeight, barHeight, rot);

    this.tailArrow = new ArrowButtonShape(this, () => {
      this._changeValue(this.value - this.unitIncrement);
    }, barHeight, barHeight, rot + 180);
    this.handle = new createjs.Shape();
    this.addChild(this.handle);
    this.handle.on("mousedown", e => {
      this.startPos = {
        x: e.stageX,
        y: e.stageY,
        value: this.value
      }
      this.handle.down = true;
      this._handleRedraw();
    })
    this.handle.on("pressmove", e => {
      const delta = this.isVertical ? this.startPos.y - e.stageY : this.startPos.x - e.stageX
      this._changeValue(this.startPos.value + this._positionToValue(delta))
    })
    this.handle.on('mouseover', e => {
      this.handle.over = true;
      this._handleRedraw();
    })
    this.handle.on('mouseout', e => {
      this.handle.over = false;
      this.handle.down = false;
      this._handleRedraw();
    })
    this.handle.on('pressup', e => {
      this.handle.down = false;
      this._handleRedraw();
    })
    this.setSize(barWidth, barHeight);
  }

  _changeValue(value) {
    const oldValue = this._value
    this.value = value
    if (oldValue != this.value) this.dispatchEvent("change")
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = Math.floor(Math.max(Math.min(0, value), this.maxValue))
    this.redraw()
  }

  get contentLength() {
    return this._contentLength
  }

  set contentLength(length) {
    this._contentLength = length
    this.redraw()
  }

  redraw() {
    this.background.graphics
      .clear()
      .beginFill(mc.style.shadowColor)
      .rect(0, 0, this.width, this.height)
      .beginFill(mc.style.buttonUpColor)
      .rect(1, 1, this.width - 2, this.height - 2)
    this._drawArrows()
    this._drawHandle()
  }

  get maxValue() {
    return Math.min(-0.001, this._barWidth - this._contentLength)
  }

  _positionToValue(pos) {
    return pos * this._contentLength / (this._barWidth - 2 * this._barHeight)
  }

  _drawHandle() {
    function normalize(v) {
      return Math.max(0, Math.min(1, v))
    }
    const maxLength = this._barWidth - this._barHeight * 2
    const handleSize = [
      this._barHeight * 0.8,
      maxLength * normalize(this._barWidth / this._contentLength)
    ]

    const handlePos = [
      (this._barHeight - handleSize[0]) / 2,
      this._barHeight + maxLength * (1 - normalize(this._barWidth / this._contentLength)) * normalize(this.value / this.maxValue)
    ]
    const px = this.isVertical ? 0 : 1
    const py = this.isVertical ? 1 : 0
    this.handle.x = handlePos[px]
    this.handle.y = handlePos[py]
    this.handle.width = handleSize[px]
    this.handle.height = handleSize[py]
    this._handleRedraw();
  }
  _handleRedraw() {
    this.handle.graphics.clear();
    if (this.handle.down) {
      this.handle.graphics.beginFill(mc.style.buttonDownColor);
    } else if (this.handle.over) {
      this.handle.graphics.beginFill(mc.style.buttonOverColor);
    } else {
      this.handle.graphics.beginFill(mc.style.shadowColor);
    }
    this.handle.graphics.drawRect(0, 0, this.handle.width, this.handle.height);
  }

  _drawArrows() {
    const size = this._barHeight
    const px = this.isVertical ? 0 : 1
    const py = this.isVertical ? 1 : 0

    const tailPos = [0, this._barWidth - size]
    this.tailArrow.x = tailPos[px]
    this.tailArrow.y = tailPos[py]

    this.headArrow.arrowWidth = size / 2
    this.headArrow.arrowHeight = size / 4
    this.tailArrow.arrowWidth = size / 2
    this.tailArrow.arrowHeight = size / 4
    this.headArrow.setSize(size, size);
    this.tailArrow.setSize(size, size)
  }
  setSize(barWidth, barHeight) {
    this._barWidth = barWidth;
    this._barHeight = barHeight;
    this.width = this.isVertical ? barHeight : barWidth;
    this.height = this.isVertical ? barWidth : barHeight;
    this.setBounds(0, 0, this.width, this.height);
    this.redraw();
  }
}
//ScrollContainer类
class ScrollContainer extends createjs.Container {
  /**
   * [constructor description]
   * @param {[string]} canvas [stage]
   */
  constructor(parent, x, y, width = 400, height = 400, containerWidth = 0, containerHeight = 0, isbar = true, mousewheel = true) {
    super();
    if (parent) parent.addChild(this);
    this.x = x;
    this.y = y;
    this.container = new createjs.Container();
    this.container.setBounds(0, 0, containerWidth, containerHeight);
    this.addChild(this.container)

    this.scrollBarV = new ScrollBar(null, 0, 0, 0, mc.style.SCROLL_BAR_SIZE, true);

    this.scrollBarH = new ScrollBar(null, 0, 0, 0, mc.style.SCROLL_BAR_SIZE);

    this.scrollBarV.on("change", e => {
      this.container.y = e.target.value
      this.dispatchEvent("scroll")
    })

    this.scrollBarH.on("change", e => {
      this.container.x = e.target.value
      this.dispatchEvent("scroll")
    })

    if (mousewheel) {
      canvas.addEventListener("mousewheel", e => {
        const h = this.contentSize.height - this.getBounds().height
        const w = this.contentSize.width - this.getBounds().width
        this.scrollY += e.wheelDeltaY
        this.scrollX += e.wheelDeltaX
      })
    }

    if (isbar) {
      this.addChild(this.scrollBarH, this.scrollBarV);
    }
    this.setSize(width, height);
  }

  get scrollX() {
    return this.container.x
  }

  set scrollX(x) {
    const w = this.contentSize.width - this.getBounds().width
    this.container.x = Math.min(0, Math.floor(Math.max(x, -w)))
    this.scrollBarH.value = x
    this.dispatchEvent("scroll")
  }

  get scrollY() {
    return this.container.y
  }

  set scrollY(y) {
    const h = this.contentSize.height - this.getBounds().height
    this.container.y = Math.min(0, Math.floor(Math.max(y, -h)))
    this.scrollBarV.value = y
    this.dispatchEvent("scroll")
  }

  get contentSize() {
    return {
      width: this.container.getBounds().width,
      height: this.container.getBounds().height
    };
  }
  set contentSize(size) {
    let b = this.getBounds();
    // let w = Math.max(b.width - mc.style.SCROLL_BAR_SIZE, size.width);
    // let h = Math.max(b.height - mc.style.SCROLL_BAR_SIZE, size.height);
    let w = Math.max(b.width , size.width);
    let h = Math.max(b.height , size.height);
    this.container.setBounds(0, 0, w, h);
    this.scrollBarH.contentLength = size.width
    this.scrollBarV.contentLength = size.height
    if (size.width <= this.getBounds().width) {
      this.scrollBarH.visible = false;
    } else {
      this.scrollBarH.visible = true;
    }
    if (size.height <= this.getBounds().height) {
      this.scrollBarV.visible = false;
    } else {
      this.scrollBarV.visible = true;
    }
  }

  setSize(width, height) {
    this.width=width;
    this.height=height;
    this.setBounds(0, 0, width, height);
    // this.contentSize = {
    //   width: Math.max(width - mc.style.SCROLL_BAR_SIZE, this.container.getBounds().width),
    //   height: Math.max(height - mc.style.SCROLL_BAR_SIZE, this.container.getBounds().height)
    // };
    this.contentSize = {
      width: Math.max(width, this.container.getBounds().width),
      height: Math.max(height, this.container.getBounds().height)
    };
    this.container.mask = new createjs.Shape;
    this.container.mask.graphics.beginFill("#efefef").rect(0, 0, width, height);
    this.scrollBarV.x = width - mc.style.SCROLL_BAR_SIZE;
    // this.scrollBarV.setSize(height - mc.style.SCROLL_BAR_SIZE, mc.style.SCROLL_BAR_SIZE);
    this.scrollBarV.setSize(height, mc.style.SCROLL_BAR_SIZE);
    this.scrollBarH.y = height - mc.style.SCROLL_BAR_SIZE;
    this.scrollBarH.setSize(width - mc.style.SCROLL_BAR_SIZE, mc.style.SCROLL_BAR_SIZE);
  }
}
const mc = {
  style: {
    //颜色
    shadowColor: "#888888",
    borderColor: "#999999",
    buttonDownColor: "#bbbbbb",
    buttonOverColor: "#cccccc",
    buttonUpColor: "#dddddd",
    labelColor: "#666666",
    highlightColor: "#eeeeee",
    fontSize: 32,
    fontFamily: "pfrondaseven,宋体",
    strokeStyle: 2,
    CENTER_MIDDLE: "centermiddle",
    LEFT_MIDDLE: "leftmiddle",
    CENTER_BOTTOM: "centerbottom",
    RIGHT_MIDDLE: "rightmiddle",
    CENTER_TOP: "centertop",
    SCROLL_BAR_SIZE: 20,
    darkStyle: function () {
      this.shadowColor = "#999999";
      this.borderColor = "#555555";
      this.buttonDownColor = "#444444";
      this.buttonOverColor = "#999999";
      this.buttonUpColor = "#666666";
      this.labelColor = "#cccccc";
    }
  },
  Rect,
  Circle,
  RoundRect,
  Star,
  Ellipse,
  Arrow,
  /**颜色转换
 * Returns a color in the format: '#RRGGBB', or as a hex number if specified.
 * @param {number|string} color
 * @param {boolean}      toNumber=false  Return color as a hex number.
 * @return {string|number}
 */
  parseColor: function (color, toNumber) {
    if (toNumber === true) {
      if (typeof color === 'number') {
        return (color | 0); //chop off decimal
      }
      if (typeof color === 'string' && color[0] === '#') {
        color = color.slice(1);
      }
      return window.parseInt(color, 16);
    } else {
      if (typeof color === 'number') {
        color = '#' + ('00000' + (color | 0).toString(16)).substr(-6); //pad
      }
      return color;
    }
  },
  /**
  * 随机颜色
  */
  randomColor: function () {
    return "rgb(" + Math.floor(Math.random() * 256) + "," +
      Math.floor(Math.random() * 256) + "," +
      Math.floor(Math.random() * 256) + ")";
  },
  /**
  * 将点连线 
  * @param {*} g 
  * @param {*} mat 
  * @param {*} points 
  */
  drawPoints: function (g, mat, points) {
    points.forEach((point, i) => {
      const p = mat.transformPoint(point[0], point[1])
      p.x = Math.ceil(p.x);
      p.y = Math.ceil(p.y)
      if (i == 0) {
        g.moveTo(p.x, p.y)
      } else {
        g.lineTo(p.x, p.y)
      }
    });
  },
  /**
  * Array随机排序
  */
  randomArray: function (array) {
    if (!Array.prototype.derangedArray) {
      Array.prototype.derangedArray = function () {
        for (var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
        return this;
      };
    }
    array = array.derangedArray();
  },
  getRandom:function(min, max) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    let randomNumber = randomBuffer[0] / (0xffffffff + 1);
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(randomNumber * (max - min + 1)) + min;
}
};
export { mc,PushButton,CheckBox,RadioButton,Slider,ScrollBar,ScrollContainer };


