var stage, queue, lib, width, height,
  keys = Object.create(null),
  pressed = [];
/*************************GFrame************************************************************************ */
//583 game类 
//735 网格游戏地图类
//847 向量，角色类
//1476 等角游戏类
class GFrame {
  static style = {
    textSize: 50,
    fontFamily: "regul,Serif,Microsoft YaHei",
    TITLE_TEXT_COLOR: "#000000",
    //分数板样式
    SCORE_TEXT_SIZE: 32,
    SCOREBOARD_HEIGHT: 70,
    SCORE_TEXT_COLOR: "#FFFFFF",
    SCOREBOARD_COLOR: "#555"
  };
  static event = {
    GAME_OVER: "gameover",
    LEVEL_UP: "levelup",
    OK_BUTTON: "okbutton",
    LOADER_COMPLETE: "loadercomplete",
    UPDATE: "update"
  };
  static state = {
    STATE_WAIT_FOR_CLOSE: "statewaitforclose",
    STATE_TITLE: "statetitle",
    STATE_INSTRUCTION: "stateinstruction",
    STATE_NEW_GAME: "statenewgame",
    STATE_GAME_OVER: "stategameover",
    STATE_NEW_LEVEL: "statenewlevel",
    STATE_LEVEL_IN: "statelevelin",
    STATE_GAME_PLAY: "stategameplay",
    STATE_LEVEL_OUT: "statelevelout",
    STATE_WAIT: "statewait"
  };
  constructor(canvasId) {
    this.loaderBar = null;
    this.isLoaded = false;
    this._systemFunction = this._systemWaitForClose;
    //建立舞台
    stage = new createjs.Stage(canvasId);
    //开启鼠标经过事件
    stage.enableMouseOver();
    //开启触摸
    createjs.Touch.enable(stage);
    // console.log(createjs.Touch.isSupported());
    //自适应
    this._adapt();
    //使用引导层必须
    //createjs.MotionGuidePlugin.install(); 
    //flash插件
    // createjs.FlashAudioPlugin.swfPath = "plugin/FlashAudioPlugin";
    // createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]);
    //设置帧频
    createjs.Ticker.framerate = 62;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    // createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.on("tick", (e) => {
      this._systemFunction();
      stage.update(e);
    });
  }

  //选择游戏状态
  _switchSystemState(stateval) {
    this._lastSystemState = this._currentSystemState;
    this._currentSystemState = stateval;
    switch (stateval) {
      case GFrame.state.STATE_WAIT:
        this._systemFunction = this._systemWait;
        stage.addChild(this.fade, this.spin1);
        break;
      case GFrame.state.STATE_WAIT_FOR_CLOSE:
        this._systemFunction = this._systemWaitForClose;
        break;
      case GFrame.state.STATE_TITLE:
        this._systemFunction = this._systemTitle;
        break;
      case GFrame.state.STATE_INSTRUCTION:
        this._systemFunction = this._systemInstruction;
        break;
      case GFrame.state.STATE_NEW_GAME:
        this._systemFunction = this._systemNewGame;
        break;
      case GFrame.state.STATE_NEW_LEVEL:
        this._systemFunction = this._systemNewLevel;
        break;
      case GFrame.state.STATE_LEVEL_IN:
        this._systemFunction = this._systemLevelIn;
        break;
      case GFrame.state.STATE_GAME_PLAY:
        this._systemFunction = this._systemGamePlay;
        break;
      case GFrame.state.STATE_GAME_OVER:
        this._systemFunction = this._systemGameOver;
        break;
      case GFrame.state.STATE_LEVEL_OUT:
        this._systemFunction = this._systemLevelOut;
        break;
      default:
    }
  }
  //标题状态
  _systemTitle() {
    stage.addChild(this.game.titleScreen);
    this.game.titleScreen.on(GFrame.event.OK_BUTTON, this._okButton, this, true);
    this._switchSystemState(GFrame.state.STATE_WAIT_FOR_CLOSE);
    this._nextSystemState = GFrame.state.STATE_NEW_GAME;

  }
  //介绍界面状态
  _systemInstruction() {
    stage.addChild(this.game.instructionScreen);
    this.game.instructionScreen.on(GFrame.event.OK_BUTTON, this._okButton, this, true);
    this._switchSystemState(GFrame.state.STATE_WAIT_FOR_CLOSE);
    this._nextSystemState = GFrame.state.STATE_TITLE;
  }
  //新游戏开始状态
  _systemNewGame() {
    this.game.level = 0;
    this.game.newGame();
    this._switchSystemState(GFrame.state.STATE_NEW_LEVEL);
  }
  //设置新等级状态
  _systemNewLevel() {
    this.game.level++;
    this.game.newLevel();
    this.game.levelInScreen.title.text = 'level: ' + this.game.level;
    stage.addEventListener(GFrame.event.UPDATE, (e) => {
      this.game.scoreBoard.update(e.id, e.value);
    });
    stage.addEventListener(GFrame.event.GAME_OVER, () => {
      this._nextSystemState = GFrame.state.STATE_GAME_OVER;
      this._switchSystemState(GFrame.state.STATE_WAIT);
    });
    stage.addEventListener(GFrame.event.LEVEL_UP, () => {
      if (this.game.level >= this.game.maxLevel) {
        this._nextSystemState = GFrame.state.STATE_LEVEL_OUT;
      } else {
        this._nextSystemState = GFrame.state.STATE_NEW_LEVEL;
      }
      this._switchSystemState(GFrame.state.STATE_WAIT);
    });
    this._switchSystemState(GFrame.state.STATE_LEVEL_IN);
  }
  //新等级界面状态
  _systemLevelIn() {
    stage.addChild(this.game.levelInScreen);
    this._switchSystemState(GFrame.state.STATE_WAIT);
  }
  //通关
  _systemLevelOut() {
    stage.addChild(this.game.levelOutScreen);
    this._nextSystemState = GFrame.state.STATE_TITLE;
    this.game.levelOutScreen.on(GFrame.event.OK_BUTTON, this._okButton, this, true);
    this._switchSystemState(GFrame.state.STATE_WAIT_FOR_CLOSE);
  }
  //结束界面状态
  _systemGameOver() {
    stage.addChild(this.game.gameOverScreen);
    this.game.gameOverScreen.on(GFrame.event.OK_BUTTON, this._okButton, this, true);
    this._switchSystemState(GFrame.state.STATE_WAIT_FOR_CLOSE);
    this._nextSystemState = GFrame.state.STATE_TITLE;
  }
  //游戏运行界面状态
  _systemGamePlay() {
    this.game.runGame();
  }
  //等待关闭界面状态
  _systemWaitForClose() {
    if (this._lastSystemState == GFrame.state.STATE_LEVEL_IN) {
      this.game.levelInScreen.updateWaitBg();
    }
  }
  //等级界面等待状态
  _systemWait() {
    switch (this._lastSystemState) {
      //新等级过渡动画
      case GFrame.state.STATE_LEVEL_IN:
        setTimeout(() => {
          stage.removeChild(this.game.levelInScreen);
          this.game.levelInScreen.clearBg();
          this.game.waitComplete();
          this._switchSystemState(GFrame.state.STATE_GAME_PLAY);

        }, 2000);
        break;
      //游戏结束或升级或通关
      case GFrame.state.STATE_GAME_PLAY:
        stage.removeAllEventListeners();
        createjs.Tween.get(stage).to({
          alpha: 0.01
        }, 2000, createjs.Ease.quadOut).call(() => {
          stage.alpha = 1;
          stage.removeAllChildren();
          this.game.clear();
          this._switchSystemState(this._nextSystemState);
        });
        break;
    }
    this._systemFunction = this._systemWaitForClose;
  }


  /********************自适应*********************
   * 
   * 
   */
  _adapt() {
    width = stage.canvas.width;
    height = stage.canvas.height;
    let stageWidth = document.documentElement.clientWidth,
      stageHeight = document.documentElement.clientHeight;
    let game = document.getElementById("game");
    //宽度自适应
    if (stageWidth <= 750) {
      let stageScale = (stageWidth / width); //.toFixed(2);//四舍五入
      let h = stageHeight / stageScale,
        h1 = stage.canvas.height;
      height = h > h1 ? h1 : h;
      game.style.transform = 'scale(' + stageScale + ')';
    }
    //不缩放
    else {
      height = stageHeight > height ? height : stageHeight;
    }
  }

  /**初始化游戏
   * 
   */
  _initGame(GClass, keydown) {
    this.game = new GClass();
    this._switchSystemState(GFrame.state.STATE_TITLE);
    if (keydown) this._onkeydown();
  }

  _onkeydown() {
    document.onkeydown = (e) => {
      let c = Game.codes[e.keyCode];
      if (this._currentSystemState == GFrame.state.STATE_GAME_PLAY && Game.codes.hasOwnProperty(e.keyCode) && !keys[c]) {
        keys[c] = true;
        // this.game.onKeyDown(e);
        if (c == "pause") {
          createjs.Ticker.paused = !createjs.Ticker.paused;
          this._systemFunction = createjs.Ticker.paused ? this._systemWaitForClose : this._systemGamePlay;
        } else if (c == "left" || c == "right" || c == "up" || c == "down") {
          pressed.push(c);
        }
      }
    }
    document.onkeyup = (e) => {
      if (Game.codes.hasOwnProperty(e.keyCode)) {
        let c = Game.codes[e.keyCode];
        keys[c] = false;
        // this.game.onKeyUp(e);
        if (c == "left" || c == "right" || c == "up" || c == "down") pressed.splice(pressed.indexOf(c), 1);
      }
    }
  }
  //按钮点击事件
  _okButton(e) {
    if (e.target.id === GFrame.state.STATE_INSTRUCTION) {
      this._nextSystemState = GFrame.state.STATE_INSTRUCTION;
    }
    stage.removeChild(e.currentTarget);
    this._switchSystemState(this._nextSystemState);
  }

  /*********************预加载****************************
   * 
   * @param {*} array 
   * @param {*} game 
   * @param {*} compid 
   */

  preload(GClass, widthKeyDown = true) {
    if ((!GClass.loadItem && !GClass.loadId) || GClass.isloaded) {
      this._initGame(GClass, widthKeyDown);
    } else {
      if (!this.loaderBar) {
        this.loaderBar = new LoaderBar();
      }
      if (!queue) {
        queue = new createjs.LoadQueue(true, "assets/");
        queue.installPlugin(createjs.Sound); //注册声音插件
      }
      if (GClass.loadId) {
        let comp = AdobeAn.getComposition(GClass.loadId);
        queue.on('fileload', (evt) => {
          // console.log(evt.item.id);
          let images = comp.getImages();
          if (evt.item.type == "image") {
            images[evt.item.id] = evt.result;
          }
        });
        lib = comp.getLibrary();
        queue.loadManifest(lib.properties.manifest);
      }
      if (GClass.loadItem) {
        queue.loadManifest(GClass.loadItem);
      }
      stage.addChild(this.loaderBar);
      queue.on('progress', (e) => {
        this.loaderBar.startLoad(e);
      });
      queue.on('error', () => {
        console.log("loaderror");
      });
      queue.on('complete', function onComplete() {
        queue.removeAllEventListeners();
        stage.removeChild(this.loaderBar);
        GClass.isloaded = true;
        this._initGame(GClass, widthKeyDown);
      }, this);
    }
  }

  //fps
  startFPS() {
    this.fps = document.createElement('span');
    document.getElementById('container').appendChild(this.fps);
    // oDiv2.insertBefore(oB2,oSpan2);//将b2插入到div2中的span2前面
    this.fps.style.fontSize = "18px";
    this.fps.style.position = "absolute";
    this.fps.style.top = "10px";
    this.fps.style.left = "10px";
    this.fps.style.color = GFrame.style.TITLE_TEXT_COLOR;
    createjs.Ticker.addEventListener("tick", () => {
      this.fps.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps";
    });
  }
}

/*******************************************自定义事件****************************************** */

class ScoreUpdate extends createjs.Event {
  constructor(id, value, bubbles = true, cancelable = false) {
    super(GFrame.event.UPDATE, bubbles, cancelable);
    this.id = id;
    this.value = value;
  }
}
//--------------------------------------------------进度条----------------------------------------------------------------------
class LoaderBar extends createjs.Container {
  /**
   * 
   * @param {string} spritesheet title
   */
  constructor() {
    super();
    this.barWidth = 400;
    this.barHeight = 20;
    this.x = width - this.barWidth >> 1;
    this.y = height - this.barHeight >> 1;
    var loaderColor = createjs.Graphics.getRGB(247, 247, 247),
      titleText = new createjs.Text('loading...', '36px Stylus BT', '#ffffff'),
      bgBar = new createjs.Shape(),
      padding = 3;
    titleText.textAlign = "center";
    titleText.x = this.barWidth / 2;
    titleText.y = -90;
    bgBar.graphics.setStrokeStyle(1).beginStroke(loaderColor).drawRect(-padding / 2, -padding / 2, this.barWidth + padding, this.barHeight + padding);
    this.bar = new createjs.Shape();
    this.bar.graphics.beginFill(loaderColor).drawRect(0, 0, 1, this.barHeight);
    this.addChild(titleText, bgBar, this.bar)
    this.init();
  }
  init() {
    this.percent = new createjs.Text("0%", '32px Microsoft YaHei', "#ffffff");
    this.percent.textAlign = "center";
    this.percent.x = this.barWidth / 2;
    this.percent.y = this.barHeight + 10;
    this.addChild(this.percent);
  }
  /**
   * 开始加载
   */
  startLoad(e) {
    this.bar.scaleX = e.progress * this.barWidth;
    this.percent.text = Math.floor(e.progress * 100) + "%";
  }
}

/*****************************************游戏界面**************************** */
class ShapeBackground extends createjs.Container {
  constructor(centerX, centerY) {
    super();
    // Alpha Rectangle, applied each frame at the bottom, fading out the previous content over time.
    this.fade = new createjs.Shape(new createjs.Graphics().f("#FFF").dr(0, 0, stage.canvas.width, stage.canvas.height));
    this.fade.alpha = 0.02;
    // stage.addChild(fade);
    this.shape = new createjs.Shape();
    this.shape.y = 276;
    // middle spinner:
    this.spin2 = new createjs.Container();
    this.spin2.addChild(this.shape);
    this.spin2.x = 391;
    // outside spinner:
    this.spin1 = new createjs.Container();
    this.spin1.addChild(this.spin2);
    this.spin1.x = width / 2;
    this.spin1.y = height / 2;
    this.c = 0;
    this.count = 0;
    this.colorOffset = Math.random() * 360;
    if (centerX) this.w = centerX;
    else this.w = Math.random() * width * 0.5;
    if (centerY) this.h = centerY;
    else this.h = Math.random() * height * 0.5;
    this.addChild(this.fade, this.spin1);
  }
  clearBg() {
    this.c = 0;
    this.count = 0;
    this.spin1.rotation = 0;
    this.spin2.rotation = 0;
    this.shape.rotation = 0;
    stage.autoClear = true;
    createjs.Ticker.framerate = 62;
  }
  updateWaitBg() {
    this.c++;
    if (this.c == 1) {
      stage.autoClear = false;
      // createjs.Ticker.framerate = 30;
      // createjs.Ticker.interval = 50;//20fps
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
class BasicScreen extends createjs.Container {
  constructor(text = null, xpos = 0, ypos = 0) {
    super();
    if (text) {
      this.title = new createjs.Text(text);
      this.title.text = text;
      this.title.x = xpos;
      this.title.y = ypos;
      this.title.textAlign = "center";
      this.title.textBaseline = "middle";
      this.title.font = 'bold ' + GFrame.style.textSize + 'px ' + GFrame.style.fontFamily;
      this.title.color = GFrame.style.TITLE_TEXT_COLOR;
      this.title.lineHeight = 40;
      this.addChild(this.title);
    }
  }
  /**创建按钮
   * 
   * @param {number} xpos 按钮x坐标
   * @param {number} ypos 按钮y坐标
   * @param {string} label 按钮标签文本内容
   * @param {[number]} width 按钮宽度 默认100
   * @param {[number]} height 按钮高度 默认20
   */
  createOkButton(xpos, ypos, label, width, height, graphics, id = null) {
    let button = new PushButton(this, label, function () {
      button.dispatchEvent(GFrame.event.OK_BUTTON, true);
    }, xpos, ypos, width, height, graphics);
    button.id = id;
  }
}

class LevelInScreen extends BasicScreen {
  constructor(text = "level:0", xpos = 0, ypos = 0) {
    super(text, xpos, ypos);
    this.bg = new ShapeBackground(width / 2, height / 2);
    this.addChild(this.bg);
  }
  updateWaitBg() {
    this.bg.updateWaitBg();
  }
  clearBg() {
    this.bg.clearBg();
  }

}
class SideBysideScore extends createjs.Container {
  /**
   * @param {string} label 引索也是key
   * @param {number} value 
   */
  constructor(label, value) {
    super();
    this._label = new createjs.Text(label + ':', "bold " + GFrame.style.SCORE_TEXT_SIZE + 'px ' + GFrame.style.fontFamily, GFrame.style.SCORE_TEXT_COLOR);
    this._value = new createjs.Text(value, GFrame.style.SCORE_TEXT_SIZE + 'px ' + GFrame.style.fontFamily, GFrame.style.SCORE_TEXT_COLOR);
    this.addChild(this._label, this._value);
    // this._value.x = this._label.getBounds().width;
    this._value.x = this._label.getMeasuredWidth();
  }
  setSprite(spritesheet, scale, offY) {
    let t = this._label.text;
    this.removeChild(this._label);
    this._label = new createjs.BitmapText(t, spritesheet);
    this._label.y += offY;
    this._label.scaleX = this._label.scaleY = scale;

    let v = this._value.text;
    this.removeChild(this._value);
    this._value = new createjs.BitmapText(v, spritesheet);
    this._value.y += offY;
    this._value.scaleX = this._value.scaleY = scale;

    this.addChild(this._label, this._value);

    this._value.x = this._label.getBounds().width * scale + 10;


  }
  get value() {
    return this._value.text;
  }
  set value(val) {
    this._value.text = val.toString();
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
  constructor(xpos = 0, ypos = 0, color = GFrame.style.SCOREBOARD_COLOR, w = width, h = GFrame.style.SCOREBOARD_HEIGHT) {
    super();
    this.x = xpos;
    this.y = ypos;
    this._textElements = {};
    if (color) {
      let bg = new createjs.Shape();
      bg.graphics.beginFill(color).drawRect(0, 0, w, h);
      this.addChild(bg);
    }
  }
  /**
   * 创建分数版元素
   * @param {*} label 
   * @param {*} val 
   * @param {*} xpos 
   * @param {*} ypos 
   * @param {*} param4 
   */
  createTextElement(label, val, xpos, ypos, { spriteSheet, scale = 1, offY = 0 } = {}) {
    var _obj = new SideBysideScore(label, val);
    if (spriteSheet) _obj.setSprite(spriteSheet, scale, offY)
    this._textElements[label] = _obj;
    _obj.x = xpos;
    _obj.y = ypos;
    this.addChild(_obj);
  }
  /**
   * 跟新分数板
   * @param {*} label 
   * @param {*} val 
   */
  update(label, val) {
    this._textElements[label].value = val;
  }
}
/***************************************游戏基类****************************** */
class Game {
  static codes = {
    65: "left",
    87: "up",
    68: "right",
    83: "down",
    32: "pause",
    100: "attack",
    101: "jump",
    102: "skill1",
    103: "fire",
    16: "shift",
    17: "ctrl"
  };
  constructor(titleText) {
    mc.style.fontSize = 32; //mc组件字体大小
    this.level = 0;
    this.maxLevel = 1;
    this.init();
    this.createTitleScreen(titleText);
    this.createInstructionScreen();
    this.createLevelInScreen();
    this.createGameOverScreen();
    this.createLevelOutScreen();
    this.createScoreBoard();
  }
  init() {

  }
  createTitleScreen(text) {
    this.titleScreen = new BasicScreen(text, width / 2, height / 3);
    this.titleScreen.createOkButton((width - 250) / 2, height * 3 / 5, '开始', 250, 60, new RoundRect(30)); //300,60
    this.titleScreen.createOkButton((width - 250) / 2, height * 3 / 5 + 70, '游戏说明', 250, 60, new RoundRect(30), GFrame.state.STATE_INSTRUCTION); //300,60
    // this.titleScreen=new lib.Title();//协作animate使用-------------------1
  }
  createInstructionScreen() {
    this.instructionScreen = new BasicScreen('介绍界面', width / 2, height / 4);
    this.instructionScreen.title.font = "24px " + GFrame.style.fontFamily;
    this.instructionScreen.createOkButton((width - 150) / 2, height * 3 / 5, '返回', 150, 150, new Star(6, 0.35));
  }
  createLevelInScreen() {
    this.levelInScreen = new LevelInScreen('level:0', width / 2, height / 2);
  }
  createGameOverScreen() {
    this.gameOverScreen = new BasicScreen('game over', width / 2, height / 3);
    this.gameOverScreen.createOkButton((width - 150) / 2, height * 3 / 5, '结束', 150, 150, new Star(6, 0.35));
  }
  createLevelOutScreen() {
    this.levelOutScreen = new BasicScreen('you win', width / 2, height / 3);
    this.levelOutScreen.createOkButton((width - 150) / 2, height * 3 / 5, '通关', 150, 150, new Star(6, 0.35));
  }
  createScoreBoard() {

  }
  newGame() {

  }
  newLevel() {

  }
  waitComplete() {

  }
  runGame() {

  }
  clear() {

  }

  //创建元素
  getActor(array, Actor) {
    let len = array.length,
      i = 0;
    while (i <= len) {
      if (!array[i]) {
        array[i] = new Actor();
        break;
      } else if (!array[i].active) {
        array[i].active = true;
        break;
      } else {
        i++;
      }
    }
    return array[i];
  }

  //动量守恒碰撞
  billiardCollision(ball0, ball1) {
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
    let overlap = (ball0.size.x / 2 + ball1.size.x / 2) - Math.abs(pos0.x - pos1.x);
    pos0.x += vel0.x / absV * overlap;
    pos1.x += vel1.x / absV * overlap;

    //将位置旋转回来
    pos0.rotate(angle, false);
    pos1.rotate(angle, false);
    //将位置调整为屏幕的实际位置
    ball1.x = ball0.x + pos1.x;
    ball1.y = ball0.y + pos1.y;
    ball0.x = ball0.x + pos0.x;
    ball0.y = ball0.y + pos0.y;
    ball0.updatePos();
    ball1.updatePos();
    //将速度旋转回来
    vel0.rotate(angle, false);
    vel1.rotate(angle, false);
    ball0.speed.setValues(vel0.x, vel0.y);
    ball1.speed.setValues(vel1.x, vel1.y);
  }

  //相互吸引函数
  gravitate(partA, partB) {
    let dx = partB.x - partA.x,
      dy = partB.y - partA.y,
      distSQ = dx * dx + dy * dy,
      dist = Math.sqrt(distSQ),
      force = partA.mass * partB.mass / distSQ,
      ax = force * dx / dist,
      ay = force * dy / dist;
    //弹性吸引
    // let ax=dx*0.012,
    // ay=dy*0.012;
    partA.speed.x += ax / partA.mass;
    partA.speed.y += ay / partA.mass;
    partB.speed.x -= ax / partB.mass;
    partB.speed.y -= ay / partB.mass;
  }
}

/**
 * *******网格游戏类 需要mc组件**************************************************
 */
class GridsMap extends ScrollContainer {
  constructor(x, y, width, height, stepWidth, stepHeight, map) {
    super(null, x, y, width, height, width, height, false, false);
    this.stepWidth = stepWidth;
    this.stepHeight = stepHeight;
    this.width = width;
    this.height = height;
    this.map = map;
  }
  createGridMap(plan, actorChars, drawGrid) {
    if (this.map) this.addChild(this.map);
    this.grids = [];
    this.actors = [];
    let w = plan[0].length,
      h = plan.length;
    this.mapWidth = w * this.stepWidth;
    this.mapHeight = h * this.stepHeight;
    for (let y = 0; y < h; y++) {
      const line = plan[y],
        gridLine = [];
      for (let x = 0; x < w; x++) {
        const ch = line[x],
          Act = actorChars[ch];
        if (Act) {
          this.actors.push(new Act(x * this.stepWidth, y * this.stepHeight, ch));
        }
        gridLine.push(drawGrid(ch, x * this.stepWidth, y * this.stepHeight));
      }
      this.grids.push(gridLine);
    }
    this.actors.forEach((actor) => {
      this.addChild(actor);
    });
    this.player = this.actors.filter(function (actor) {
      return actor.type == "player";
    })[0];
    if (this.map) this.map.cache(0, 0, this.mapWidth, this.mapHeight);
    this.contentSize = {
      width: this.mapWidth,
      height: this.mapHeight
    };
  }
  //屏幕滚动
  scrollPlayerIntoView() {
    let marginw = this.width / 3;
    let marginh = this.height / 3;
    //this viewpot
    this.mapleft = -this.scrollX,
      this.mapright = this.mapleft + this.width,
      this.maptop = -this.scrollY,
      this.mapbottom = this.maptop + this.height;
    if (this.player.x < this.mapleft + marginw) {
      this.scrollX = -this.player.x + marginw;
    } else if (this.player.x > this.mapright - marginw) {
      this.scrollX = -this.player.x - marginw + this.width;
    }
    if (this.player.y < this.maptop + marginh) {
      this.scrollY = Math.floor(-this.player.y + marginh);
    } else if (this.player.y > this.mapbottom - marginh) {
      this.scrollY = Math.floor(-this.player.y - marginh + this.height);
    }
  }
  /**检测是否出屏幕
   * 
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns boolean
   */
  outOfWin(actor) {
    return actor.pos.x + actor.size.x < this.mapleft || actor.pos.x > this.mapright || actor.pos.y + actor.size.y < this.maptop || actor.pos.y > this.mapbottom;
  }
  //检测地图与元素碰撞
  hitMap(actorSize, newPos) {
    let pos = new Vector(newPos.x / this.stepWidth, newPos.y / this.stepHeight);
    let size = new Vector(actorSize.x / this.stepWidth, actorSize.y / this.stepHeight);
    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + size.y);
    if (xStart < 0 || xEnd > this.grids[0].length || yStart < 0) {
      return "wall";
    } else if (yEnd > this.grids.length) {
      return "lava";
    }
    for (var y = yStart; y < yEnd; y++) {
      for (var x = xStart; x < xEnd; x++) {
        var fieldType = this.grids[y][x];
        if (fieldType) {
          return fieldType;
        }
      }
    }
  }

  /**
   * 关卡结束后清理
   */
  clear() {
    this.removeAllChildren();
    if (this.map instanceof createjs.Shape) {
      this.map.uncache();
      this.map.graphics.clear();
    } else if (this.map instanceof createjs.Container) {
      this.map.removeAllChildren();
    }
  }
}

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
    this.edgeBehavior = Actor.RECYCLE;
    this.pos = new Vector(xpos, ypos);
    this.speed = new Vector(0, 0);
    // this.speed.length = 5;
    this.maxSpeed = 10;
    this.active = true;
    this.color = "rgb(64,64,64)";
    this.image = new createjs.Shape();
    this.addChild(this.image);
  }
  init(width, height) {
    this.drawShape(width, height);
    this._initSize();
  }
  _initSize(){
    let b = this.getBounds();
    this.size = new Vector(b.width, b.height);
    this._offX = b.x;
    this._offY = b.y;
    this.update();
  }
  drawShape(width, height) {
    this.image.graphics.clear().beginFill(this.color).drawRect(-width / 2, -height / 2, width, height);
    this.setBounds(-width / 2, -height / 2, width, height);
    // this.hit = Math.max(width, height) / 2;
    this.hit = Math.sqrt(width * width + height * height) / 2;
  }
  update() {
    this.x = this.pos.x - this._offX;
    this.y = this.pos.y - this._offY;
  }

  updatePos() {
    // let b=this.getTransformedBounds();
    this.pos.setValues(this.x + this._offX, this.y + this._offY);
  }
  /**
   * 设置大小，参数为缩放比例
   * @param {*} scaleX 
   * @param {*} scaleY 
   */
  setSize(scaleX, scaleY) {
    let b = this.getBounds();
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this._offX = b.x * scaleX;
    this._offY = b.y * scaleY;
    this.size.setValues(b.width * scaleX, b.height * scaleY);
    this.hit = Math.max(b.width * scaleX, b.height * scaleY) / 2;
    this.updatePos();
  }
  setReg(x, y) {
    this.regX = x;
    this.regY = y;
    this.x += this.regX * this.scaleX;
    this.y += this.regY * this.scaleY;
    this.updatePos();
  }
  setSpriteData(spriteSheet, animation, scale = 1) {
    // if (this.image) this.removeChild(this.image);
    this.image = new createjs.Sprite(spriteSheet, animation);
    let b = this.image.getBounds();
    if (b.x == 0) {
      this.image.regX = b.width / 2;
      this.image.regY = b.height / 2;
    }
    this.image.scale = scale;
    this.addChild(this.image);
    if (!this.size) {
      this._initSize();
    }
  }

  //获取中心点，注册点在x轴时才可用
  getCenterPoint() {
    let x1 = this.size.x / 2 + this.regX * this.scaleX,
      // y1 = this.size.y / 2 + this.regY*this.scaleY,
      angle = this.rotation * Math.PI / 180,
      cos = Math.cos(angle),
      sin = Math.sin(angle),
      // x2 = cos * x1 - sin * y1,
      // y2 = cos * y1 + sin * x1;
      x2 = cos * x1,
      y2 = sin * x1;
    return new Vector(x2 + this.x, y2 + this.y);
  }

  recycle() {
    this.active = false;
    this.parent.removeChild(this);
  }


  /**检测是否碰撞屏幕
   * 
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns boolean
   */
  hitBounds(pos = this.pos, mapWidth = width, mapHeight = height) {
    return pos.x < 0 || pos.x + this.size.x > mapWidth || pos.y < 0 || pos.y + this.size.y > mapHeight;

  }
  /**检测是否出边界
 * 
 * @param {*} x this.x
 * @param {*} y this.y
 * @returns boolean
 */
  outOfBounds(pos = this.pos) {
    return pos.x + this.size.x < 0 || pos.x > width || pos.y + this.size.y < 0 || pos.y > height;
  }
  /**屏幕反弹
   * 
   * @param {*} bounce -1
   */
  rebounds(bounce = -1, mapWidth = width, mapHeight = height) {
    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.speed.x *= bounce;
    } else if (this.pos.x + this.size.x > mapWidth) {
      this.pos.x = mapWidth - this.size.x;
      this.speed.x *= bounce;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.speed.y *= bounce;
    } else if (this.pos.y + this.size.y > mapHeight) {
      this.pos.y = mapHeight - this.size.y;
      this.speed.y *= bounce;
    }
  }

  //屏幕环绕
  placeInBounds(mapWidth = width, mapHeight = height) {
    if (this.pos.x + this.size.x < 0) {
      this.pos.x = mapWidth;
    } else if (this.pos.x > mapWidth) {
      this.pos.x = -this.size.x;
    }
    if (this.pos.y + this.size.y < 0) {
      this.pos.y = mapHeight;
    } else if (this.pos.y > mapHeight) {
      this.pos.y = -this.size.y;
    }
  }
  /**矩形碰撞
 * 
 * @param {*} other 
 * @param {*} x this.x
 * @param {*} y this.y
 * @returns boolean
 */
  hitRect(other, pos = this.pos) {
    return (other.pos.x <= pos.x + this.size.x && pos.x <= other.pos.x + other.size.x && other.pos.y <= pos.y + this.size.y && pos.y <= other.pos.y + other.size.y);
  }
  /**检测 元素之间是否碰撞
   * 
   * @param {*} actors 
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns 
   */
  hitActors(actors, pos = this.pos) {
    for (var i = 0; i < actors.length; i++) {
      var other = actors[i];
      if (other == this) {
        continue;
      }
      if (this.hitRect(other, pos)) {
        return other;
      }
    }
  }
  /**包括其他对象
   * 
   * @param {*} other 
   * @returns boolean
   */
  contains(other) {
    let rect = new createjs.Rectangle(this.pos.x, this.pos.y, this.size.x, this.size.y);
    return rect.contains(other.pos.x, other.pos.y, other.size.x, other.size.y);
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
  //斜面反弹
  hitAngleBounce(actor) {
    let x1 = this.x - actor.x,
      y1 = this.y - actor.y,
      //反向旋转y,vy
      y2 = actor.cos * y1 - actor.sin * x1,
      vy2 = actor.cos * this.speed.y - actor.sin * this.speed.x;
    if (y2 > -this.hit && y2 < vy2) {
      y2 = -this.hit;
      vy2 *= -1;
      //反向旋转x,vx
      let x2 = actor.cos * x1 + actor.sin * y1,
        vx2 = actor.cos * this.speed.x + actor.sin * this.speed.y;
      //将一切旋转回去
      this.x = actor.x + actor.cos * x2 - actor.sin * y2;
      this.y = actor.y + actor.cos * y2 + actor.sin * x2;
      this.speed.x = actor.cos * vx2 - actor.sin * vy2;
      this.speed.y = actor.cos * vy2 + actor.sin * vx2;
      this.updatePos();
    }
  }
  act() {
    this.speed.truncate(this.maxSpeed);
    this.pos.add(this.speed);
    if (this.edgeBehavior == Actor.WRAP) {
      if (this.outOfBounds()) {
        this.placeInBounds();
      }
    } else if (this.edgeBehavior == Actor.BOUNCE) {
      if (this.hitBounds()) {
        this.rebounds();
      }
    } else if (this.edgeBehavior == Actor.RECYCLE) {
      if (this.outOfBounds()) {
        this.recycle();
      }
    }
    this.update();
  }
}

class CirActor extends Actor {
  /**
   * 球形角色类
   * @param {*} xpos 
   * @param {*} ypos 
   */
  constructor(xpos, ypos) {
    super(xpos, ypos);
  }
  drawShape(width) {
    var radius = width / 2;
    this.image.graphics.clear().beginRadialGradientFill(["#c9c9c9", this.color], [0, 1], radius / 3, -radius / 3, 0, radius / 6, -radius / 6, radius).drawCircle(0, 0, radius);
    this.setBounds(-radius, -radius, width, width);
    this.hit = radius;
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
    this.init(15);
  }
  drawShape(width) {
    this.image = new createjs.Shape();
    this.shipFlame = new createjs.Shape();
    this.addChild(this.shipFlame, this.image);
    var g = this.image.graphics;
    g.clear();
    g.beginStroke("#ffffff");
    g.moveTo(0, width); //nose
    g.lineTo(width / 2, -width / 1.6); //rfin
    g.lineTo(0, -width / 5); //notch
    g.lineTo(-width / 2, -width / 1.6); //lfin
    g.closePath(); // nose
    //draw ship flame
    this.shipFlame.y = -width / 1.6;
    this.shipFlame.alpha = 0;
    g = this.shipFlame.graphics;
    g.clear();
    g.beginStroke("#FFFFFF");
    g.moveTo(width / 5, 0); //ship
    g.lineTo(width / 2.5, -width / 3.3); //rpoint
    g.lineTo(width / 5, -width / 5); //rnotch
    g.lineTo(0, -width / 2); //tip
    g.lineTo(-width / 5, -width / 5); //lnotch
    g.lineTo(-width / 2.5, -width / 3.3); //lpoint
    g.lineTo(-width / 5, -0); //ship
    this.setBounds(-width / 2, -width, width, width * 2);
    this.hit = width - 2;
  }
  act() {
    this.steeringForce.truncate(this.maxForce);
    this.steeringForce = this.steeringForce.divide(this.mass);
    this.speed.add(this.steeringForce);
    this.steeringForce.setValues(0, 0);
    super.act();
    this.rotation = this.speed.angle * 180 / Math.PI - 90;
  }
  //寻找行为 
  seek(target) {
    let centerPos = this.pos.plus(this.size.divide(2));
    // let centerPos = new Vector(this.x,this.y);
    let desiredVelocity = target.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity = desiredVelocity.times(this.maxSpeed);
    let force = desiredVelocity.sub(this.speed);
    this.steeringForce.add(force);
  }
  //避开行为 以目标点反向逃离
  flee(target) {
    let centerPos = this.pos.plus(this.size.divide(2));
    // let centerPos = new Vector(this.x,this.y);
    let desiredVelocity = target.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity = desiredVelocity.times(this.maxSpeed);
    let force = desiredVelocity.sub(this.speed);
    this.steeringForce = this.steeringForce.sub(force);
  }
  //到达行为
  arrive(target) {
    let centerPos = this.pos.plus(this.size.divide(2));
    // let centerPos = new Vector(this.x,this.y);
    let desiredVelocity = target.sub(centerPos);
    desiredVelocity.normalize();
    let dist = centerPos.dist(target);
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
    let centerPos = this.pos.plus(this.size.divide(2));
    // let centerPos = new Vector(this.x,this.y);
    let targetcenterPos = target.pos.plus(target.size.divide(2));
    let lookAheadTime = centerPos.dist(targetcenterPos) / this.maxSpeed;
    let predictedTarget = targetcenterPos.plus(target.speed.times(lookAheadTime));
    this.seek(predictedTarget);
  }
  /**
   * 躲避行为 以预判点反方向逃离
   * @param {Actor} target actor类型
   */
  evade(target) {
    let centerPos = this.pos.plus(this.size.divide(2));
    let targetcenterPos = target.pos.plus(target.size.divide(2));
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
      const centerPos = this.pos.plus(this.size.divide(2));
      const circlescenterPos = circle.pos.plus(circle.size.divide(2));
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
    let centerPos = this.pos.plus(this.size.divide(2));
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
        averagePosition.add(vehicle.pos);
        if (this.tooClose(vehicle)) this.flee(vehicle.pos);
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
    if (this.pos.dist(vehicle.pos) > this.inSightDist) return false;
    let heading = this.speed.clone().normalize();
    let difference = vehicle.pos.sub(this.pos);
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
    return this.pos.dist(vehicle.pos) < this.tooCloseDist;
  }
}
