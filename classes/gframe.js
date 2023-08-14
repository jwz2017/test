import { mc, PushButton, ScrollContainer } from "./mc.js";
var _systemFunction, _lastSystemState, _nextSystemState, _currentSystemState;
var stage, game, queue, lib, keys = Object.create(null), pressed = [];
//选择游戏状态
function _switchSystemState(stateval) {
  _lastSystemState = _currentSystemState;
  _currentSystemState = stateval;
  switch (stateval) {
    case gframe.state.STATE_WAIT:
      _systemFunction = _systemWait;
      break;
    case gframe.state.STATE_WAIT_FOR_CLOSE:
      _systemFunction = _systemWaitForClose;
      break;
    case gframe.state.STATE_TITLE:
      _systemFunction = _systemTitle;
      break;
    case gframe.state.STATE_INSTRUCTION:
      _systemFunction = _systemInstruction;
      break;
    case gframe.state.STATE_NEW_GAME:
      _systemFunction = _systemNewGame;
      break;
    case gframe.state.STATE_NEW_LEVEL:
      _systemFunction = _systemNewLevel;
      break;
    case gframe.state.STATE_LEVEL_IN:
      _systemFunction = _systemLevelIn;
      break;
    case gframe.state.STATE_GAME_PLAY:
      _systemFunction = _systemGamePlay;
      break;
    case gframe.state.STATE_GAME_OVER:
      _systemFunction = _systemGameOver;
      break;
    case gframe.state.STATE_LEVEL_OUT:
      _systemFunction = _systemLevelOut;
      break;
    default:
  }
};
//标题状态
function _systemTitle() {
  game.titleScreen.y = 0;
  stage.addChild(game.titleScreen);
  game.titleScreen.on(gframe.event.OK_BUTTON, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = gframe.state.STATE_NEW_GAME;
};
//介绍界面状态
function _systemInstruction() {
  game.instructionScreen.y = 0;
  stage.addChild(game.instructionScreen);
  game.instructionScreen.on(gframe.event.OK_BUTTON, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = gframe.state.STATE_TITLE;
};
function _getScoreboardElement(key) {
  if (!game.scoreboard) return;
  let a = game.scoreboard.getElement(key);
  if (a) {
    return a;
  }
}
//新游戏开始状态
function _systemNewGame() {
  game.level = 0;
  game.score = 0;
  game.lives = 3;
  game.newGame();
  let s = _getScoreboardElement(Game.SCORE);
  if (s) s.value = game.score;
  let l = _getScoreboardElement(Game.LIVES);
  if (l) l.value = game.lives;
  _switchSystemState(gframe.state.STATE_NEW_LEVEL);
};
//设置新等级状态
function _systemNewLevel() {
  game.level++;
  game.newLevel();
  let l = _getScoreboardElement(Game.LEVEL);
  if (l) l.value = game.level;
  game.levelInScreen.title.text = 'level:' + game.level;
  // stage.addEventListener(gframe.event.UPDATE, (e) => {
  //   if(game.scoreboard)game.scoreboard.update(e.id, e.value);
  // });
  stage.addEventListener(gframe.event.GAME_OVER, () => {
    _nextSystemState = gframe.state.STATE_GAME_OVER;
    _switchSystemState(gframe.state.STATE_WAIT);
  });
  stage.addEventListener(gframe.event.LEVEL_UP, () => {
    if (game.level >= game.maxLevel) {
      _nextSystemState = gframe.state.STATE_LEVEL_OUT;
    } else {
      _nextSystemState = gframe.state.STATE_NEW_LEVEL;
    }
    _switchSystemState(gframe.state.STATE_WAIT);
  });
  _switchSystemState(gframe.state.STATE_LEVEL_IN);
};
//新等级界面状态
function _systemLevelIn() {
  stage.addChild(game.levelInScreen);
  _switchSystemState(gframe.state.STATE_WAIT);
};
//通关
function _systemLevelOut() {
  stage.addChild(game.levelOutScreen);
  _nextSystemState = gframe.state.STATE_TITLE;
  game.levelOutScreen.on(gframe.event.OK_BUTTON, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
};
//结束界面状态
function _systemGameOver() {
  game.gameOverScreen.y = 0;
  stage.addChild(game.gameOverScreen);
  game.gameOverScreen.on(gframe.event.OK_BUTTON, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = gframe.state.STATE_TITLE;
};
//游戏运行界面状态
function _systemGamePlay() {
  game.runGame();
};
//等待关闭界面状态
function _systemWaitForClose() {
  let y1 = stage.height - stage.canvas.height >> 1;
  switch (_lastSystemState) {
    case gframe.state.STATE_TITLE:
      if (game.titleScreen.y > y1) {
        game.titleScreen.y -= 1;
      }
      break;
    case gframe.state.STATE_INSTRUCTION:
      if (game.instructionScreen.y > y1) {
        game.instructionScreen.y -= 1;
      }
      break;
    case gframe.state.STATE_LEVEL_IN:
      game.levelInScreen.updateWaitBg();
      break;
    case gframe.state.STATE_LEVEL_OUT:
      if (game.levelOutScreen.y > y1) {
        game.levelOutScreen.y -= 1;
      }
      break;
    case gframe.state.STATE_GAME_OVER:
      if (game.gameOverScreen.y > y1) {
        game.gameOverScreen.y -= 1;
      }
      break;

    default:
      break;
  }
};
//等级界面等待状态
function _systemWait() {
  switch (_lastSystemState) {
    //新等级过渡动画
    case gframe.state.STATE_LEVEL_IN:
      setTimeout(() => {
        stage.removeChild(game.levelInScreen);
        game.levelInScreen.clearBg();
        stage.enableMouseOver(0);
        // stage.addChild(game);
        if (game.scoreboard) stage.addChild(game.scoreboard);
        game.waitComplete();
        _switchSystemState(gframe.state.STATE_GAME_PLAY);

      }, 2000);
      break;
    //游戏结束或升级或通关
    case gframe.state.STATE_GAME_PLAY:
      // stage.removeAllEventListeners();
      createjs.Tween.get(stage).to({
        alpha: 0.01
      }, 2000, createjs.Ease.quadOut).call(() => {
        gframe.clear();
        _switchSystemState(_nextSystemState);
      });
      break;
  }
  _systemFunction = _systemWaitForClose;
};
/**
 * **************自适应**********************************
 */
function _adapt() {
  stage.width = stage.canvas.width;
  stage.height = stage.canvas.height;
  gameDiv.style.width = stage.width + "px";
  let stageWidth = document.documentElement.clientWidth,
    stageHeight = document.documentElement.clientHeight;
  stage.height = stageHeight > stage.height ? stage.height : stageHeight;
  //宽度自适应
  if (stageWidth <= stage.canvas.width) {
    if (stageWidth <= 320) stageWidth = 320;
    let stageScale = (stageWidth / stage.width)//.toFixed(2);//四舍五入
    let h = stageHeight / stageScale,
      h1 = stage.canvas.height;
    stage.height = h > h1 ? h1 : h;
    gameDiv.style.transform = 'scale(' + stageScale + ')';
  }
  gameDiv.style.height = stage.height + "px";
};
/**
 * 初始化游戏
 * @param {*} GClass 
 * @param {*} keydown 
 */
function _initGame(GClass, keydown) {
  if (keydown) _onkeydown();
  else {
    document.onkeydown = null;
    document.onkeyup = null;
  }
  game = new GClass();
  _switchSystemState(gframe.state.STATE_TITLE);
};
//键盘事件
function _onkeydown() {
  var pressAtime = 0, releaseAtime = 0, presseDtime = 0, releaseDtime = 0;
  var pressInterval = 90;
  document.onkeydown = (e) => {
    let c = Game.codes[e.keyCode];
    if (_currentSystemState == gframe.state.STATE_GAME_PLAY && Game.codes.hasOwnProperty(e.keyCode) && !keys[c]) {
      keys[c] = true;
      if (c == "pause") {
        createjs.Ticker.paused = !createjs.Ticker.paused;
        _systemFunction = createjs.Ticker.paused ? _systemWaitForClose : _systemGamePlay;
      } else if (c == "left" || c == "right" || c == "up" || c == "down") {
        pressed.push(c);
        if (c == "left") {
          pressAtime = Date.now();
          if (pressAtime - releaseAtime <= pressInterval) {
            keys["leftRun"] = true;
          } else {
            keys["leftRun"] = false;
          }
        }
        else if (c == "right") {
          presseDtime = Date.now();
          if (presseDtime - releaseDtime <= pressInterval) {
            // console.log(presseDtime-releaseDtime);
            keys["rightRun"] = true;
          } else {
            keys["rightRun"] = false;
          }
        }

      }
    }
  }
  document.onkeyup = (e) => {
    if (Game.codes.hasOwnProperty(e.keyCode)) {
      let c = Game.codes[e.keyCode];
      keys[c] = false;
      if (c == "left" || c == "right" || c == "up" || c == "down") {
        pressed.splice(pressed.indexOf(c), 1);
        if (c == "left") {
          releaseAtime = Date.now();
          keys["leftRun"] = false;
        }
        else if (c == "right") {
          releaseDtime = Date.now();
          keys["rightRun"] = false;
        }
      }
    }
  }
};
//按钮点击事件
function _okButton(e) {
  if (e.target.id === gframe.state.STATE_INSTRUCTION) {
    _nextSystemState = gframe.state.STATE_INSTRUCTION;
  }
  stage.removeChild(e.currentTarget);
  _switchSystemState(_nextSystemState);
};
/*******************************************自定义事件****************************************** */
// class ScoreUpdate extends createjs.Event {
//   constructor(id, value, bubbles = true, cancelable = false) {
//     super(gframe.event.UPDATE, bubbles, cancelable);
//     this.id = id;
//     this.value = value;
//   }
// };
//--------------------------------------------------进度条----------------------------------------------------------------------
class LoaderBar extends createjs.Container {
  /**
   * 
   * @param {string} spritesheet title
   */
  constructor() {
    super();
    this.barWidth = stage.width - 100;
    this.barHeight = 20;
    this.x = stage.width - this.barWidth >> 1;
    this.y = stage.height - this.barHeight >> 1;
    var loaderColor = createjs.Graphics.getRGB(247, 247, 247),
      titleText = new createjs.Text('loading...', '36px Stylus BT', '#ffffff'),
      bgBar = new createjs.Shape(),
      padding = 3;
    titleText.textAlign = "center";
    titleText.x = this.barWidth / 2;
    titleText.y = -titleText.getBounds().height - 10;
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
    // createjs.Ticker.framerate = 62;
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
      this.title.font = 'bold ' + gframe.style.textSize + 'px ' + gframe.style.fontFamily;
      this.title.color = gframe.style.TITLE_TEXT_COLOR;
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
      button.dispatchEvent(gframe.event.OK_BUTTON, true);
    }, xpos, ypos, width, height, graphics);
    button.id = id;
  }
}

class LevelInScreen extends BasicScreen {
  constructor(text = "level:0", xpos = 0, ypos = 0) {
    super(text, xpos, ypos);
    this.bg = new ShapeBackground(stage.width / 2, stage.height / 2);
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
  constructor(label) {
    super();
    this._label = new createjs.Text(label + ':', "bold " + gframe.style.SCORE_TEXT_SIZE + 'px ' + gframe.style.fontFamily, gframe.style.SCORE_TEXT_COLOR);
    this._valueText = new createjs.Text("0000", gframe.style.SCORE_TEXT_SIZE + 'px ' + gframe.style.fontFamily, gframe.style.SCORE_TEXT_COLOR);
    this.addChild(this._label, this._valueText);
    this._valueText.x = this._label.getMeasuredWidth();
  }
  setSprite(spritesheet, scale, offY) {
    let t = this._label.text;
    this.removeChild(this._label);
    this._label = new createjs.BitmapText(t, spritesheet);
    this._label.y += offY;
    this._label.scaleX = this._label.scaleY = scale;

    let v = this._valueText.text;
    this.removeChild(this._valueText);
    this._valueText = new createjs.BitmapText(v, spritesheet);
    this._valueText.y += offY;
    this._valueText.scaleX = this._valueText.scaleY = scale;

    this.addChild(this._label, this._valueText);
    this._valueText.x = this._label.getBounds().width * scale + 10;
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
      iterator.y = iterator.getBounds().height * 2 * j;
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
  createTextElement(key, xpos = 0, ypos = 0, { spriteSheet, scale = 1, offY = 0 } = {}) {
    var _obj = new SideBysideScore(key);
    if (spriteSheet) _obj.setSprite(spriteSheet, scale, offY)
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
}
/***************************************游戏基类****************************** */
class Game extends ScrollContainer {
  static SCORE = "score";
  static LEVEL = "level";
  static LIVES = "lives";
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
  //创建元素
  static getActor(array, Actor) {
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
  };
  constructor(titleText, width = stage.width, height = stage.height) {
    super(null, 0, 0, width, height, 0, 0, false, false);
    this.width = width;
    this.height = height;
    mc.style.fontSize = 32; //mc组件字体大小
    this.level = 0;
    this.score = 0;
    this.lives = 3;
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
    this.titleScreen = new BasicScreen(text, stage.canvas.width / 2, stage.canvas.height / 3);
    this.titleScreen.createOkButton((stage.canvas.width - 250) / 2, stage.canvas.height / 2, '开始', 250, 60, new mc.RoundRect(30));
    this.titleScreen.createOkButton((stage.canvas.width - 250) / 2, stage.canvas.height / 2 + 70, '游戏说明', 250, 60, new mc.RoundRect(30), gframe.state.STATE_INSTRUCTION);
    // this.titleScreen=new lib.Title();//协作animate使用-------------------1
  }
  createInstructionScreen() {
    this.instructionScreen = new BasicScreen('介绍界面', stage.canvas.width / 2, stage.canvas.height / 3);
    this.instructionScreen.title.font = "40px " + gframe.style.fontFamily;
    this.instructionScreen.createOkButton((stage.canvas.width - 150) / 2, stage.canvas.height / 2, '返回', 150, 150, new mc.Star(6, 0.35));
  }
  createLevelInScreen() {
    this.levelInScreen = new LevelInScreen('level:0', stage.width / 2, stage.height / 2);
  }
  createGameOverScreen() {
    this.gameOverScreen = new BasicScreen('game over', stage.canvas.width / 2, stage.canvas.height / 3);
    this.gameOverScreen.createOkButton((stage.canvas.width - 150) / 2, stage.canvas.height / 2, '结束', 150, 150, new mc.Star(6, 0.35));
  }
  createLevelOutScreen() {
    this.levelOutScreen = new BasicScreen('you win', stage.canvas.width / 2, stage.canvas.height / 3);
    this.levelOutScreen.createOkButton((stage.canvas.width - 150) / 2, stage.canvas.height / 2, '通关', 150, 150, new mc.Star(6, 0.35));
  }
  createScoreBoard() {

  }
  newGame() {

  }
  newLevel() {

  }
  waitComplete() {
    // stage.enableMouseOver();//开启鼠标经过效果
  }
  runGame() {

  }
  clear() {

  }
};
var gframe = {
  style: {
    textSize: 80,
    fontFamily: "Serif,regul,Microsoft YaHei",
    TITLE_TEXT_COLOR: "#000000",
    //分数板样式
    SCORE_TEXT_SIZE: 32,
    SCORE_TEXT_COLOR: "#FFFFFF",
    SCOREBOARD_COLOR: "#555"
  },
  event: {
    GAME_OVER: "gameover",
    LEVEL_UP: "levelup",
    OK_BUTTON: "okbutton",
    LOADER_COMPLETE: "loadercomplete",
    UPDATE: "update",
    // ScoreUpdate
  },
  state: {
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
  },
  loaderBar: null,
  SideBysideScore,
  BasicScreen,
  LevelInScreen,
  ScoreBoard,
  Game,
  //初始化舞台
  init(canvasId) {
    this.isLoaded = false;
    _systemFunction = _systemWaitForClose;
    //建立舞台
    stage = new createjs.Stage(canvasId);
    // createjs.DisplayObject._hitTestContext = stage.canvas.getContext("2d",{willReadFrequently: true});
    //开启鼠标经过事件
    stage.enableMouseOver();
    //开启触摸
    createjs.Touch.enable(stage);
    // console.log(createjs.Touch.isSupported());
    //自适应
    _adapt();
    //使用引导层必须
    //createjs.MotionGuidePlugin.install(); 
    //flash插件
    // createjs.FlashAudioPlugin.swfPath = "plugin/FlashAudioPlugin";
    // createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]);
    //设置帧频
    createjs.Ticker.framerate = 65;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    // createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.on("tick", (e) => {
      _systemFunction();
      stage.update(e);
    });
  },
  /*********************预加载****************************
  * 
  * @param {*} array 
  * @param {*} game 
  * @param {*} compid 
  */
  preload(GClass, widthKeyDown) {
    if ((!GClass.loadItem && !GClass.loadId) || GClass.isloaded) {
      _initGame(GClass, widthKeyDown);
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
        _initGame(GClass, widthKeyDown);
      }, this);
    }
  },
  get keyboard() {
    if (document.onkeydown) return true;
    else return false;
  },
  set keyboard(bool) {
    if (bool) {
      _onkeydown()
    } else {
      document.onkeydown = null;
      document.onkeyup = null;
    }
  },
  clear() {
    stage.alpha = 1;
    game.clear();
    stage.removeAllEventListeners();
    stage.removeAllChildren();
    stage.enableMouseOver();
  },
  //fps
  startFPS() {
    this.fps = document.createElement('span');
    containerDiv.appendChild(this.fps);
    this.fps.style.color = "#fff";
    this.fps.style.font = "20px " + gframe.style.fontFamily;
    this.fps.style.position = "absolute";
    this.fps.style.top = "10px";
    this.fps.style.left = "10px";
    createjs.Ticker.addEventListener("tick", () => {
      this.fps.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps";
    });
  }
};

export { stage, game, queue, lib, keys, pressed, gframe };
