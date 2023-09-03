import { mc, PushButton, ScrollContainer } from "./mc.js";
var _systemFunction, _lastSystemState, _nextSystemState, _currentSystemState,levelupevent,overevent;
var stage, game, queue, lib, keys = Object.create(null), pressed = [];
var screenPosY = 0;

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
  game.titleScreen.on(gframe.event.Okbutton.TYPE, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = gframe.state.STATE_NEW_GAME;
};
//介绍界面状态
function _systemInstruction() {
  game.instructionScreen.y = 0;
  stage.addChild(game.instructionScreen);
  game.instructionScreen.on(gframe.event.Okbutton.TYPE, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = gframe.state.STATE_TITLE;
};
//新游戏开始状态
function _systemNewGame() {
  game.score = 0;
  game.level = 0;
  game.lives = 3;
  game.init();
  _switchSystemState(gframe.state.STATE_NEW_LEVEL);
};
//设置新等级状态
function _systemNewLevel() {
  game.level++;
  game.newLevel();
  game.levelInScreen.updateTitle("level: " + game.level);
  overevent=game.on(gframe.event.GAME_OVER, () => {
    _nextSystemState = gframe.state.STATE_GAME_OVER;
    _switchSystemState(gframe.state.STATE_WAIT);
  });
  levelupevent=game.on(gframe.event.LEVEL_UP, () => {
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
  game.levelOutScreen.on(gframe.event.Okbutton.TYPE, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
};
//结束界面状态
function _systemGameOver() {
  game.gameOverScreen.y = 0;
  stage.addChild(game.gameOverScreen);
  game.gameOverScreen.on(gframe.event.Okbutton.TYPE, _okButton, null, true);
  _switchSystemState(gframe.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = gframe.state.STATE_TITLE;
};
//游戏运行界面状态
function _systemGamePlay() {
  game.runGame();
};
//等待关闭界面状态
function _systemWaitForClose() {
  switch (_lastSystemState) {
    case gframe.state.STATE_TITLE:
      if (game.titleScreen.y > screenPosY) {
        game.titleScreen.y -= 1;
      }
      break;
    case gframe.state.STATE_INSTRUCTION:
      if (game.instructionScreen.y > screenPosY) {
        game.instructionScreen.y -= 1;
      }
      break;
    case gframe.state.STATE_LEVEL_IN:
      // if(!stage.isWebGL)game.levelInScreen.updateWaitBg();
      break;
    case gframe.state.STATE_LEVEL_OUT:
      if (game.levelOutScreen.y > screenPosY) {
        game.levelOutScreen.y -= 1;
      }
      break;
    case gframe.state.STATE_GAME_OVER:
      if (game.gameOverScreen.y > screenPosY) {
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
      createjs.Tween.get(stage).wait(1000).call(() => {
        game._waitComplete();
        _switchSystemState(gframe.state.STATE_GAME_PLAY);
      });
      // setTimeout(() => {

      // }, 1000);
      break;
    //游戏结束或升级或通关
    case gframe.state.STATE_GAME_PLAY:
      createjs.Tween.get(stage).to({
        alpha: 0.2
      }, 2000, createjs.Ease.quadOut).call(() => {
        game._clear();
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
    let h = stageHeight / stageScale;
    stage.height = h > stage.canvas.height ? stage.canvas.height : h;
    gameDiv.style.transform = 'scale(' + stageScale + ')';
  }
  gameDiv.style.height = stage.height + "px";
  screenPosY = stage.height - stage.canvas.height >> 1;
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
  if (game) {
    stage.removeAllEventListeners();
    game.removeAllEventListeners();
  }
  game = new GClass();
  game.on(gframe.event.CLOSE, () => {
    game._clear();
  });
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
        if (game.backSound) game.backSound.paused = !game.backSound.paused;
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
  switch (e.id) {
    case gframe.state.STATE_INSTRUCTION:
      _nextSystemState = gframe.state.STATE_INSTRUCTION;
      break;
    default:
      break;
  }
  stage.removeChild(e.currentTarget);
  _switchSystemState(_nextSystemState);
};
class Okbutton extends createjs.Event {
  static TYPE = 'okbutton';
  constructor(id) {
    super(Okbutton.TYPE, false);
    this.id = id;
  }
}
//--------------------------------------------------进度条----------------------------------------------------------------------
class LoaderBar extends createjs.Container {
  constructor(width = 500, height = 20) {
    super();
    this.width = width;
    this.height = height;
    this.createTitle();
    this.createBar();
    this.createValue();
  }
  createTitle() {
    let titleText = new createjs.Text('loading...', '36px Stylus BT', '#ffffff')
    titleText.textAlign = "center";
    titleText.x = this.width / 2;
    titleText.y = -titleText.getBounds().height - 10;
    this.addChild(titleText);
  }
  createBar() {
    let loaderColor = createjs.Graphics.getRGB(247, 247, 247);
    let bgBar = new createjs.Shape();
    let padding = 3;
    bgBar.graphics.setStrokeStyle(1).beginStroke(loaderColor).drawRect(-padding / 2, -padding / 2, this.width + padding, this.height + padding);
    this.bar = new createjs.Shape();
    this.bar.graphics.beginFill(loaderColor).drawRect(0, 0, 1, this.height);
    this.addChild(bgBar, this.bar)
  }
  createValue() {
    this.percent = new createjs.Text("0%", '32px Microsoft YaHei', "#ffffff");
    this.percent.textAlign = "center";
    this.percent.x = this.width / 2;
    this.percent.y = this.height + 10;
    this.addChild(this.percent);
  }
  /**
   * 开始加载
   */
  startLoad(e) {
    this.bar.scaleX = e.progress * this.width;
    this.percent.text = Math.floor(e.progress * 100) + "%";
  }
}

/*****************************************游戏界面**************************** */

class BasicScreen extends createjs.Container {
  constructor(text = null, titlexpos = stage.canvas.width / 2, titleypos = stage.canvas.height / 3) {
    super();
    this.sound = null;
    this.firstPlay = false;
    if (text) {
      this.title = new createjs.Text(text);
      this.title.text = text;
      this.title.x = titlexpos;
      this.title.y = titleypos;
      this.title.textAlign = "center";
      this.title.lineWidth = 500;
      this.title.font = 'bold ' + gframe.style.textSize + 'px ' + gframe.style.fontFamily;
      this.title.color = gframe.style.TITLE_TEXT_COLOR;
      this.addChild(this.title);
      if (stage.isWebGL) this._cacheTitle();
    }
    this.addEventListener("added", () => {
      this.children.forEach(element => {
        if (element.htmlElement) {
          element.visible = true;
          element.htmlElement.style.visibility = "visible";
        }
      });
      if (this.sound && !this.firstPlay) this.sound.play();
    });
    this.addEventListener("removed", () => {
      this.children.forEach(element => {
        if (element.htmlElement) {
          element._oldStage = null;
          element.visible = false;
          element.htmlElement.style.visibility = "hidden";
        }
      });
      if (this.sound) this.sound.stop();
    });
  }
  createDOMcheckbox(label, { top, left, right, bottom, parent = null }) {
    let div = document.createElement("div");
    gameDiv.appendChild(div);
    div.setAttribute("class", "checkboxcontainer");
    div.style.top = top + "px";
    div.style.left = left + "px";
    div.style.right = right + "px";
    div.style.bottom = bottom + "px";
    let input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("class", "checkbox");

    let lab = document.createElement("label");
    lab.innerHTML = label;
    lab.setAttribute("class", "checklabel")
    div.appendChild(input);
    div.appendChild(lab);
    let checkbox = new createjs.DOMElement(div);
    if (parent) this.addChild(checkbox);
    else this.children.push(checkbox);
    return input;
  }
  createDOMbutton(label, id = null,className="game-button") {
    let dom = document.createElement("span");
    gameDiv.appendChild(dom);
    dom.setAttribute("class",className);
    dom.innerHTML = label;
    let button = new createjs.DOMElement(dom);
    this.addChild(button);
    button.id = id;

    dom.onclick = () => {
      this.dispatchEvent(new Okbutton(id));
    }
    return button;
  }
  /**创建按钮
   * 
   * @param {number} xpos 按钮x坐标
   * @param {number} ypos 按钮y坐标
   * @param {string} label 按钮标签文本内容
   * @param {[number]} width 按钮宽度 默认100
   * @param {[number]} height 按钮高度 默认20
   */
  createOkButton(xpos, ypos, button, { id, label, graphics, width, height }) {
    if (button) {
      var btn = button;
      btn.x = xpos;
      btn.y = ypos;
      this.addChild(btn);
    } else {
      var btn = new PushButton(this, label, null, xpos, ypos, width, height, graphics)
    }
    btn.on("pressup", (e) => {
      if (e.target.hitTest(e.localX, e.localY)) {
        this.dispatchEvent(new Okbutton(id));
      }
    })
  }
  _cacheTitle() {
    let b = this.title.getBounds();
    this.title.cache(b.x, b.y, b.width, b.height + gframe.style.textSize / 4);
  }
  updateTitle(text) {
    this.title.text = text;
    if (this.title.bitmapCache) {
      this.title.uncache()
      this._cacheTitle();
    }
  }
}

class LevelInScreen extends BasicScreen {
  constructor(text = "level:0", xpos = 0, ypos = 0) {
    super(text, xpos, ypos);
    // this.bg = new ShapeBackground(stage.width / 2, stage.height / 2);
    this.addChild(this.bg);
  }
  updateWaitBg() {
    this.bg.updateWaitBg();
  }
  clearBg() {
    this.bg.clearBg();
  }
}

class ScoreBoard extends createjs.Container {
  constructor(xpos = 0, ypos = 0, backgroundColor = false, { width = stage.width, height, justifyContent = "space-around" } = {}) {
    super();
    this.div = document.createElement("div");
    this.div.style.display = "flex";
    this.div.style.flexWrap = "wrap";
    this.div.style.visibility = "hidden";
    this.div.style.justifyContent = justifyContent;
    this.div.style.userSelect = "none";
    this.div.style.top = 0;
    this.div.style.left = 0;
    this.div.style.width = width + "px";
    this.div.style.width = width + "px";
    gameDiv.appendChild(this.div);
    let a = new createjs.DOMElement(this.div);
    this.addChild(a);
    this.x = xpos;
    this.y = ypos;
    if (height) this.div.style.height = height + "px";
    if (backgroundColor) this.div.style.backgroundColor = gframe.style.SCOREBOARD_COLOR;
    this._textElements = new Map();
    this.on('added', () => {
      this.div.style.visibility = "visible";
      a.visible = true;
    });
    this.on('removed', () => {
      a._oldStage = null;
      this.div.style.visibility = "hidden";
      a.visible = false;
    });
  }
  createTextElement(key, val, xpos = 0, ypos = 0, { image, border } = {}) {
    let c = document.createElement('div');
    if (xpos || ypos) {
      c.style.position = "absolute";
      c.style.left = xpos + "px";
      c.style.top = ypos + "px";
    } else {
      if (this.div.style.justifyContent == "space-between") c.style.flex = "30%";
      c.style.margin = "0 10px";
    }
    if (border) c.style.border = border;
    c.style.font = gframe.style.SCORE_TEXT_SIZE + "px " + gframe.style.fontFamily;
    c.style.color = gframe.style.SCORE_TEXT_COLOR;
    let title;
    if (image) {
      title = document.createElement('img');
      title.src = image;
    } else {
      title = document.createElement('span');
      title.innerHTML = key + ":";
    }
    c.appendChild(title);
    let value = document.createElement('span');
    value.innerHTML = val;
    value.style.marginLeft = "8px";
    c.appendChild(value);
    this.div.appendChild(c);
    this._textElements.set(key, value);
  }
  placeElements() {

  }
  get height() {
    return this.div.clientHeight;
  }
  get width() {
    return this.div.clientWidth;
  }
  update(label, val) {
    this._textElements.get(label).innerHTML = val;
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
  constructor(titleText, width = stage.width, height = stage.height, { titleSoundId = null, backSoundId = null } = {}) {
    super(null, 0, 0, width, height, 0, 0, false, false);
    this.maxLevel = 1;
    this.score = 0;
    this.level = 0;
    this.lives = 3;
    mc.style.fontSize = 32; //mc组件字体大小
    this.createTitleScreen(titleText, titleSoundId);
    this.createInstructionScreen();
    this.createLevelInScreen();
    this.createGameOverScreen();
    this.createLevelOutScreen();
    this.createScoreBoard();
    //背景音乐
    if (backSoundId) {
      let dom = document.getElementById("bmusic");
      this._sound = new createjs.DOMElement(dom);
      this.superAddChild(this._sound);
      this._sound.x = this.width - 40;
      this._sound.y = this.height - 40;
      this.sound = createjs.Sound.createInstance(backSoundId);
      this.sound.loop = -1;
      dom.onclick = () => {
        if (dom.classList.contains("icon-shengyinjingyin")) {
          dom.setAttribute("class", "iconfont icon-shengyinkai")
        } else {
          dom.setAttribute("class", "iconfont icon-shengyinjingyin")
        }
        this.sound.muted = !this.sound.muted;
      }
    }
  }

  createTitleScreen(title, soundId) {
    this.titleScreen = new BasicScreen(title);
    if (!stage.isWebGL) {
      this.titleScreen.createOkButton((stage.canvas.width - 250) / 2, stage.canvas.height * 0.6, null, { label: 'start', width: 250, height: 60, graphics: new mc.RoundRect(30) });
      this.titleScreen.createOkButton((stage.canvas.width - 250) / 2, stage.canvas.height * 0.6 + 80, null, { label: '游戏说明', width: 250, height: 60, graphics: new mc.RoundRect(30), id: gframe.state.STATE_INSTRUCTION });
      // this.titleScreen=new lib.Title();//协作animate使用-------------------1
    } else {
      let b = this.titleScreen.createDOMbutton("start");
      b.x = stage.width - b.htmlElement.clientWidth >> 1;
      b.y = stage.canvas.height * 0.52;

      b = this.titleScreen.createDOMbutton("简介", gframe.state.STATE_INSTRUCTION);
      b.x = stage.width - b.htmlElement.clientWidth >> 1;
      b.y = stage.canvas.height * 0.52 + b.htmlElement.clientHeight + 20;
    }
    //主题声音
    if (soundId) {
      this.titleScreen.sound = createjs.Sound.createInstance("titlesound");
      this.titleScreen.sound.loop = -1;
      this.titleScreen.firstPlay = true;
      let titlemusic = new createjs.DOMElement(document.getElementById("titlemusic"));
      this.titleScreen.children.push(titlemusic);
      titlemusic.htmlElement.style.right = 0;
      titlemusic.htmlElement.style.bottom = 0;
      tmusic.onchange = () => {
        if (this.titleScreen.firstPlay) {
          this.titleScreen.sound.play();
          this.titleScreen.firstPlay = false;
          return
        }
        this.titleScreen.sound.muted = !this.titleScreen.sound.muted;
      }
    }
  }
  createInstructionScreen() {
    this.instructionScreen = new BasicScreen('说明界面');
    if (!stage.isWebGL) {
      this.instructionScreen.title.font = "40px " + gframe.style.fontFamily;
      this.instructionScreen.title.lineHeight = 40;
      this.instructionScreen.createOkButton((stage.canvas.width - 150) / 2, stage.canvas.height * 0.6, null, { label: '返回', width: 150, height: 150, graphics: new mc.Star(6, 0.35) });
    } else {
      let b = this.instructionScreen.createDOMbutton("返回");
      b.x = stage.width - b.htmlElement.clientWidth >> 1;
      b.y = stage.canvas.height * 0.6;
    }
  }
  createLevelInScreen() {
    this.levelInScreen = new LevelInScreen('level:0', stage.width / 2, stage.height / 2);
  }
  createGameOverScreen() {
    this.gameOverScreen = new BasicScreen('game over');
    if (!stage.isWebGL) {
      this.gameOverScreen.createOkButton((stage.canvas.width - 150) / 2, stage.canvas.height * 0.6, null, { label: '结束', width: 150, height: 150, graphics: new mc.Star(6, 0.35) });
    } else {
      let b = this.gameOverScreen.createDOMbutton("结束");
      b.x = stage.width - b.htmlElement.clientWidth >> 1;
      b.y = stage.canvas.height * 0.6;
    }
  }
  createLevelOutScreen() {
    this.levelOutScreen = new BasicScreen('you win', stage.canvas.width / 2, stage.canvas.height / 3);
    if (!stage.isWebGL) {
      this.levelOutScreen.createOkButton((stage.canvas.width - 150) / 2, stage.canvas.height * 0.6, null, { label: '通关', width: 150, height: 150, graphics: new mc.Star(6, 0.35) });
    } else {
      let b = this.gameOverScreen.createDOMbutton("通关");
      b.x = stage.width - b.htmlElement.clientWidth >> 1;
      b.y = stage.canvas.height * 0.6;
    }
  }
  createScoreBoard() {

  }
  init() {

  }
  newLevel() {

  }
  _waitComplete() {
    stage.removeChild(this.levelInScreen);
    // game.levelInScreen.clearBg();
    stage.enableMouseOver(0);
    stage.addChild(this);
    this.children.forEach(element => {
      if (element.htmlElement) {
        element.visible = true;
        element.htmlElement.style.visibility = "visible";
      }
    });
    stage.children.forEach(element => {
      if (element.htmlElement) {
        element.visible = true;
        element.htmlElement.style.visibility = "visible";
      }
    });
    if (this.sound) this.sound.play();
    if (this.scoreboard) stage.addChild(this.scoreboard);
    this.waitComplete();
  }
  waitComplete() {

  }
  runGame() {

  }
  clear(e) {
    this.dispatchEvent(e);
    if (this.sound) this.sound.stop();
    this.off(gframe.event.GAME_OVER,overevent);
    this.off(gframe.event.LEVEL_UP,levelupevent);
  }
  _clear() {
    stage.alpha = 1;
    createjs.Tween.removeAllTweens();
    stage.enableMouseOver();
    this.children.forEach(element => {
      if (element.htmlElement) {
        element._oldStage = null;
        element.visible = false;
        element.htmlElement.style.visibility = "hidden";
      }
    });
    stage.children.forEach(element => {
      if (element.htmlElement) {
        element._oldStage = null;
        element.visible = false;
        element.htmlElement.style.visibility = "hidden";
      }
    });
    stage.removeAllChildren();
  }
  get keyboard() {
    if (document.onkeydown) return true;
    else return false;
  };
  set keyboard(bool) {
    if (bool) {
      _onkeydown()
    } else {
      document.onkeydown = null;
      document.onkeyup = null;
    }
  };
};
var gframe = {
  style: {
    textSize: 60,
    fontFamily: "regul,pfrondaseven,Arial,宋体",
    TITLE_TEXT_COLOR: "#000000",
    //分数板样式
    SCORE_TEXT_SIZE: 30,
    SCORE_TEXT_COLOR: "#FFFFFF",
    SCOREBOARD_COLOR: "#555"
  },
  event: {
    GAME_OVER: "gameover",
    LEVEL_UP: "levelup",
    CLOSE: "close",
    LOADER_COMPLETE: "loadercomplete",
    Okbutton,
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
  LoaderBar,
  BasicScreen,
  LevelInScreen,
  ScoreBoard,
  Game,
  //初始化舞台
  buildStage(canvasId, isGL = false) {
    _systemFunction = _systemWaitForClose;
    //建立舞台
    if (!isGL) stage = new createjs.Stage(canvasId);
    else {
      stage = new createjs.StageGL(canvasId);
      stage.setClearColor(0xA4AB61ff);
    }
    // createjs.DisplayObject._hitTestContext = stage.canvas.getContext("2d",{willReadFrequently: true});
    //开启鼠标经过事件
    stage.enableMouseOver();
    //开启触摸
    //windows触摸屏上用touch
    // createjs.Touch.enable = function (stage, singleTouch, allowDefault) {
    //   if (stage.__touch) { return true; }
    //   stage.__touch = { pointers: {}, multitouch: !singleTouch, preventDefault: !allowDefault, count: 0 };
    //   createjs.Touch._IOS_enable(stage);
    //   return true;
    // };
    createjs.Touch.enable(stage);
    // console.log(createjs.Touch.isSupported());
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
  createQueue() {
    queue = new createjs.LoadQueue(true, "./assets/");
    queue.installPlugin(createjs.Sound); //注册声音插件
  },
  /*********************预加载****************************
  * 
  * @param {*} array 
  * @param {*} game 
  * @param {*} compid 
  */
  preload(GClass, widthKeyDown) {
    _adapt();//自适应
    if (queue != null) queue.close();
    if (!GClass.loadItem && !GClass.loadId) _initGame(GClass, widthKeyDown);
    else {
      this.createQueue();
      this.loaderBar = this.loaderBar || new LoaderBar();
      stage.addChild(this.loaderBar);
      this.loaderBar.x = stage.width - this.loaderBar.width >> 1;
      this.loaderBar.y = stage.height - this.loaderBar.height >> 1;
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
        let manifest = JSON.parse(JSON.stringify(lib.properties.manifest));
        queue.loadManifest(manifest);
      }
      if (GClass.loadItem) {
        let manifest = JSON.parse(JSON.stringify(GClass.loadItem));
        queue.loadManifest(manifest);
      }
      queue.on('progress', (e) => {
        this.loaderBar.startLoad(e);
      });
      queue.on('error', () => {
        console.log("loaderror");
      });
      queue.on('complete', function onComplete() {
        queue.removeAllEventListeners();
        stage.removeChild(this.loaderBar);
        _initGame(GClass, widthKeyDown);
      }, this);
    }
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
