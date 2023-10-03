import { mc, PushButton, ScrollContainer } from "./mc.js";
import { ShapeBackground } from "./other.js";
var _systemFunction, _lastSystemState, _nextSystemState, _currentSystemState, levelupevent, overevent;
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
  game.newGame();
  _switchSystemState(gframe.state.STATE_NEW_LEVEL);
};
//设置新等级状态
function _systemNewLevel() {
  game.level++;
  game.newLevel();
  game.levelInScreen.updateTitle("level: " + game.level);
  _switchSystemState(gframe.state.STATE_LEVEL_IN);
  overevent = game.on(gframe.event.GAME_OVER, () => {
    _nextSystemState = gframe.state.STATE_GAME_OVER;
    _switchSystemState(gframe.state.STATE_WAIT);
  });
  levelupevent = game.on(gframe.event.LEVEL_UP, () => {
    if (game.level >= game.maxLevel) {
      _nextSystemState = gframe.state.STATE_LEVEL_OUT;
    } else {
      _nextSystemState = gframe.state.STATE_NEW_LEVEL;
    }
    _switchSystemState(gframe.state.STATE_WAIT);
  });
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
    case gframe.state.STATE_LEVEL_IN:
      if (!stage.isWebGL) game.levelInScreen.updateWaitBg();
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
var stageScale=1;
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
    stageScale = (stageWidth / stage.width)//.toFixed(2);//四舍五入
    let h = stageHeight / stageScale;
    stage.height = h > stage.canvas.height ? stage.canvas.height : h;
    gameDiv.style.transform = 'scale(' + stageScale + ')';
  }
  gameDiv.style.height = stage.height + "px";
  screenPosY = stage.height - stage.canvas.height >> 1;
  gameDom.style.width = stage.width * stageScale-6 + "px";
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
  keys.step=30;
  keys.stepindex=0;
  document.onkeydown = (e) => {
    let c = Game.codes[e.keyCode];
    if (_currentSystemState == gframe.state.STATE_GAME_PLAY && Game.codes.hasOwnProperty(e.keyCode) && !keys[c]) {
      keys[c] = true;
      if (c == "pause") {
        createjs.Ticker.paused = !createjs.Ticker.paused;
        // _systemFunction = createjs.Ticker.paused ? _systemWaitForClose : _systemGamePlay;
        if(createjs.Ticker.paused){
          game.addChild(game.pauseScreen);
          _systemFunction=_systemWaitForClose;
        }else{
          game.removeChild(game.pauseScreen);
          _systemFunction=_systemGamePlay;
        }
        if (game.sound) game.sound.paused = !game.sound.paused;
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
      keys.stepindex=0;
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

/*****************************************游戏界面**************************** */
class BasicScreen extends createjs.Container {
  constructor(title = null, width = stage.canvas.width, height = stage.canvas.height, { font = gframe.style.titleFont } = {}) {
    super();
    this._width = width;
    this._height = height;
    this.sound = null;
    this.firstPlay = false;
    if (title) {
      this.title = this.createText(title, { font: font });
      this.title.x = width - this.title.htmlElement.clientWidth >> 1;
      this.title.y = height / 3;
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
      this.firstPlay=false;
      if (this.sound) this.sound.stop();
    });
  }
  createDom(element) {
    let e = document.createElement(element);
    e.style.position = "absolute";
    e.style.visibility = "hidden";
    e.style.top = 0;
    e.style.left = 0;
    gameDiv.appendChild(e);
    let a = new createjs.DOMElement(e);
    return a;
  }
  createText(text, { font = gframe.style.textFont, color = gframe.style.TEXT_COLOR, parent = this } = {}) {
    let txt = this.createDom("span");
    txt.htmlElement.innerHTML = text;
    txt.htmlElement.style.font = font;
    txt.htmlElement.style.color = color;
    txt.htmlElement.style.userSelect = "none";
    if (parent) parent.addChild(txt);
    else this.children.push(txt)
    return txt;
  }
  createDOMcheckbox(label, { top = null, left = null, right = null, bottom = null }) {
    let div = this.createDom("div");
    let style = div.htmlElement.style;
    style.top = top;
    style.left = left;
    style.right = right;
    style.bottom = bottom;
    style.fontSize = "20px";
    this.children.push(div);

    let input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    div.htmlElement.appendChild(input);
    input.style.verticalAlign = "middle";
    input.style.width = "22px";
    input.style.height = "22px";
    input.style.cursor = "pointer";

    let lab = document.createElement("label");
    lab.innerHTML = label;
    div.htmlElement.appendChild(lab);
    lab.style.userSelect = "none";
    lab.style.verticalAlign = "middle";
    lab.style.fontSize = "20px";

    return input;
  }
  createDOMbutton(label, id = null, className = "game-button") {
    let button = this.createDom("span");
    button.htmlElement.setAttribute("class", className);
    button.htmlElement.innerHTML = label;
    this.addChild(button);
    button.id = id;
    button.htmlElement.onclick = () => {
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
  updateTitle(text) {
    this.title.htmlElement.innerHTML = text;
    this.title.x = this._width - this.title.htmlElement.offsetWidth >> 1;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
}
//--------------------------------------------------进度条----------------------------------------------------------------------
class LoaderBar extends BasicScreen {
  constructor(title = "loading...", width = 500, height = 30, { font = gframe.style.laoderFont } = {}) {
    super(title, width, height, { font });
    if (this.title) this.title.y = -this.title.htmlElement.offsetHeight - 8;
    this.createBar();
    this.createValue();
  }
  createBar() {
    this.bar = this.createDom("progress");
    this.addChild(this.bar);
    this.bar.htmlElement.value = 0;
    this.bar.htmlElement.max = 100;

    let style = this.bar.htmlElement.style;
    style.width = this.width + "px";
    style.height = this.height + "px";
    style.backgroundColor = "blue";
  }
  createValue() {
    this.value = this.createDom("span");
    this.value.htmlElement.innerHTML = "000%";
    this.addChild(this.value);

    let style = this.value.htmlElement.style;
    style.font = gframe.style.laoderFont;
    style.color=gframe.style.TEXT_COLOR;

    this.value.x = this.width - this.value.htmlElement.offsetWidth >> 1;
    this.value.y = this.height;
  }
  /**
   * 开始加载
   */
  startLoad(e) {
    this.bar.htmlElement.value = e.progress * 100;
    this.value.htmlElement.innerHTML = Math.floor(e.progress * 100).toString() + "%";
  }
}

class LevelInScreen extends BasicScreen {
  constructor(text = "level:0", width, height) {
    super(text, width, height);
    if (!stage.isWebGL) this.bg = new ShapeBackground(stage.width / 2, stage.height / 2);
    this.addChild(this.bg);
  }
  updateWaitBg() {
    this.bg.updateWaitBg();
  }
  clearBg() {
    this.bg.clearBg();
  }
}
class ScoreBoard extends BasicScreen {
  constructor(xpos = 0, ypos = 0, isBackgoundColor = false, { title = null, font = gframe.style.scoreFont, width = stage.width, height = null, justifyContent = "space-around" } = {}) {
    super(title, 0, 0, { font });
    this.div = this.createDom("div");
    let div = this.div.htmlElement.style;
    div.display = "flex";
    div.flexWrap = "wrap";
    div.justifyContent = justifyContent;
    div.alignItems="center";
    div.userSelect = "none";
    div.width = width + "px";
    if (height) div.height = height + "px";
    if (isBackgoundColor) div.backgroundColor = gframe.style.SCOREBOARD_COLOR;
    this.addChild(this.div);
    this.x = xpos;
    this.y = ypos;
    this._textElements = new Map();
  }
  createTextElement(key, val, xpos = 0, ypos = 0, { image, border } = {}) {
    let c = document.createElement('div');
    if (xpos || ypos) {
      c.style.position = "absolute";
      c.style.left = xpos + "px";
      c.style.top = ypos + "px";
    } else {
      if (this.div.htmlElement.style.justifyContent == "space-between") c.style.flex = "30%";
      c.style.margin = "0 10px";
    }
    if (border) c.style.border = border;
    c.style.font = gframe.style.scoreFont;
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
    this.div.htmlElement.appendChild(c);
    this._textElements.set(key, value);
  }
  update(label, val) {
    this._textElements.get(label).innerHTML = val;
  }
  get width() {
    return this.div.htmlElement.clientWidth;
  }
  get height() {
    return this.div.htmlElement.clientHeight;
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
        array[i].active = true;
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
    this.createPauseScreen();
    this.createScoreBoard();
    //背景音乐
    if (backSoundId) {
      this.sound = createjs.Sound.createInstance(backSoundId);
      this.sound.loop = -1;
      this.sound.volume=gframe.guiProps.背景音量;
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
      let sound=this.titleScreen.sound = createjs.Sound.createInstance("titlesound");
      sound.loop = -1;
      sound.muted=true;
      sound.volume=gframe.guiProps.主题音量;
      this.titleScreen.firstPlay = true;
    }
  }
  createInstructionScreen() {
    this.instructionScreen = new BasicScreen('说明界面', stage.width, stage.height, { font: gframe.style.textFont });
    if (!stage.isWebGL) {
      this.instructionScreen.createOkButton((this.instructionScreen.width - 150) / 2, this.instructionScreen.height * 0.6, null, { label: '返回', width: 150, height: 150, graphics: new mc.Star(6, 0.35) });
    } else {
      let b = this.instructionScreen.createDOMbutton("返回");
      b.x = stage.width - b.htmlElement.clientWidth >> 1;
      b.y = this.instructionScreen.height * 0.6;
    }
  }
  createLevelInScreen() {
    this.levelInScreen = new LevelInScreen('level:0', stage.width, stage.height);
    this.levelInScreen.title.y = this.levelInScreen.height / 2 - this.levelInScreen.title.htmlElement.offsetHeight / 2;
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
    this.levelOutScreen = new BasicScreen('you win');
    if (!stage.isWebGL) {
      this.levelOutScreen.createOkButton((stage.canvas.width - 150) / 2, stage.canvas.height * 0.6, null, { label: '通关', width: 150, height: 150, graphics: new mc.Star(6, 0.35) });
    } else {
      let b = this.levelOutScreen.createDOMbutton("通关");
      b.x = stage.width - b.htmlElement.clientWidth >> 1;
      b.y = stage.canvas.height * 0.6;
    }
  }
  createPauseScreen(){
    this.pauseScreen=new BasicScreen("pause",this.width,this.height);
    this.pauseScreen.title.y=this.height-this.pauseScreen.title.htmlElement.offsetHeight>>1;
  }
  createScoreBoard() {

  }
  newGame() {

  }
  newLevel() {

  }
  _waitComplete() {
    stage.removeChild(this.levelInScreen);
    if (!stage.isWebGL) game.levelInScreen.clearBg();
    stage.enableMouseOver(0);
    stage.addChild(this);
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
  hasTypeOnContainer(actorType, container = this.container) {
    return container.children.some(function (actor) {
      return actor.type == actorType;
    })
  }
  /**
   * 更新actor
   * @param {*} layer this.container
   */
  moveActors(layer = this.container) {
    let actor = layer.getChildAt(layer.numChildren - 1)
    while (actor) {
      actor.act();
      let index = layer.getChildIndex(actor);
      actor = layer.getChildAt(index - 1);
    }
  }
  clear(e) {
    this.dispatchEvent(e);
    if (this.sound) this.sound.stop();
    this.off(gframe.event.GAME_OVER, overevent);
    this.off(gframe.event.LEVEL_UP, levelupevent);
  }
  _clear() {
    stage.alpha = 1;
    createjs.Tween.removeAllTweens();
    stage.enableMouseOver();
    //清除游戏内容元素
    let l = this.container.children.length - 1;
    for (let i = l; i >= 0; i--) {
      const element = this.container.children[i];
      if (element.active) {
        element.recycle();
      } else {
        this.removeChild(element);
      }
    };
    //清除舞台元素
    l = stage.children.length - 1;
    for (let i = l; i >= 0; i--) {
      const element = stage.children[i];
      if (element.htmlElement) {
        element._oldStage = null;
        element.visible = false;
        element.htmlElement.style.visibility = "hidden";
      } else if (element.active) {
        element.recycle();
      } else {
        stage.removeChild(element);
      }
    };
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
  get background() {
    return this._background;
  }
  set background(obj) {
    this._background = obj;
    if(obj instanceof createjs.DisplayObject)this.addChildAt(this._background, 0);
  }
};
var _fontFamily = "regul,pfrondaseven,Arial,宋体";
var gframe = {
  style: {
    titleFont: "bold " + "60px " + _fontFamily,
    textFont: "40px " + _fontFamily,
    laoderFont: "bold 40px Arial,宋体",
    TEXT_COLOR: "#fff",
    //分数板样式
    scoreFont: "30px " + _fontFamily,
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
  loadItem: [{
    src: "fonts/regul-book.woff",
    type: "font",
  }, {
    src: "fonts/pf_ronda_seven.ttf",
    type: "font"
  }, {
    src: "fonts/regul-bold.woff",
    type: "font"
  }],
  loaderBar: null,
  LoaderBar,
  BasicScreen,
  LevelInScreen,
  ScoreBoard,
  Game,
  guiProps : {
    主题音乐:false,
    主题音量:0.5,
    背景音乐:true,
    背景音量:0.5,
  },
  //初始化舞台
  buildStage(canvasId, isGL = false) {
    _systemFunction = _systemWaitForClose;
    //建立舞台
    if (!isGL) stage = new createjs.Stage(canvasId);
    else {
      stage = new createjs.StageGL(canvasId);
      stage.setClearColor(0x00000000);
      // stage.setClearColor(0xA4AB61ff);
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
    //自适应
    _adapt();
    //创建设置面板
    dat.GUI.TEXT_OPEN="选项设置";
    dat.GUI.TEXT_CLOSED="关闭";
    let gui=this.gui = new dat.GUI({width:245,autoPlace:false,closeOnTop:false});
    gameDom.appendChild(gui.domElement);
    gui.domElement.style.position="absolute";
    gui.domElement.style.bottom="26px";
    gui.closed=true;
    gui.__closeButton.onclick=()=>{
      if(gui.closed){
        gui.width=70;
      }
      else {
        gui.width=245
      }
    }
    gui.add(this.guiProps, "主题音乐").onChange((val)=>{
      let sound=game.titleScreen.sound;
      if(sound){
        if(game.titleScreen.firstPlay&&game.titleScreen.stage){
          game.titleScreen.firstPlay=false;
          sound.play();
          sound.muted=false;
        }else sound.muted=!val;
      }
    });
    gui.add(this.guiProps,"主题音量",0,1).onChange((val)=>{
      if(game.titleScreen.sound)game.titleScreen.sound.volume=val;
    });
    gui.add(this.guiProps,"背景音乐").onChange((val)=>{
      if(game.sound) game.sound.muted=!val;
    });
    gui.add(this.guiProps,"背景音量",0,1).onChange((val)=>{
      if(game.sound) game.sound.volume=val;
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
    if (queue != null) queue.close();
    if (!this.loadItem && !GClass.loadItem && !GClass.loadId) _initGame(GClass, widthKeyDown);
    else {
      this.createQueue();
      this.loaderBar = this.loaderBar || new LoaderBar();
      stage.addChild(this.loaderBar);
      this.loaderBar.x = stage.width - this.loaderBar.width >> 1;
      this.loaderBar.y = stage.height - this.loaderBar.height >> 1;
      if (this.loadItem) {
        let manifest = JSON.parse(JSON.stringify(this.loadItem));
        queue.loadManifest(manifest);
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
    let fps = document.createElement('span');
    gameDom.appendChild(fps);
    fps.style.color = "#fff";
    fps.style.font = "20px " + gframe.style.fontFamily;
    fps.style.position = "absolute";
    fps.style.top = "8px";
    createjs.Ticker.addEventListener("tick", () => {
      fps.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps";
    });
  }
};
export { stage, game,queue, lib, keys, pressed, gframe };
