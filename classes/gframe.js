var stage, queue, model, lib, width, height,
  keys = Object.create(null),
  pressed = [];
/*************************GFrame************************************************************************ */
class GFrame {
  static style = {
    textSize: 50,
    fontFamily: "regul,Microsoft YaHei,Serif",
    TITLE_TEXT_COLOR: "#000000",
    //分数板样式
    SCORE_BUFF: 0,
    SCORE_TEXT_SIZE: 36,
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
    this._systemFunction = this._systemWaitForClose;
    this.stageScale = 1;
    //建立舞台
    stage = new createjs.Stage(canvasId);
    stage.enableMouseOver(); //开启鼠标经过事件
    // console.log(createjs.Touch.isSupported());
    createjs.Touch.enable(stage, true, false); //开启触摸
    width = stage.canvas.width;
    height = stage.canvas.height;
    //createjs.MotionGuidePlugin.install(); //使用引导层必须

    // createjs.FlashAudioPlugin.swfPath = "plugin/FlashAudioPlugin";//安装flash插件
    // createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]);//安装flash插件

    createjs.Ticker.framerate = 62; //设置帧频
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    // createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.on("tick", (e) => {
      this._systemFunction();
      stage.update(e);
    });

    queue = new createjs.LoadQueue(true, "assets/");
    queue.installPlugin(createjs.Sound); //注册声音插件

    /*********接收animate影片剪辑播放过程发出的事件。***/
    model = new createjs.EventDispatcher();
    model.addEventListener(GFrame.event.UPDATE, (e) => {
      this.game.scoreBoard.update(e.id, e.value);
    });
    model.addEventListener(GFrame.event.GAME_OVER, () => {
      this._nextSystemState = GFrame.state.STATE_GAME_OVER;
      this._switchSystemState(GFrame.state.STATE_WAIT);
    });
    model.addEventListener(GFrame.event.LEVEL_UP, () => {
      if (this.game.level >= this.game.maxLevel) {
        this._nextSystemState = GFrame.state.STATE_LEVEL_OUT;
      } else {
        this._nextSystemState = GFrame.state.STATE_NEW_LEVEL;
      }
      this._switchSystemState(GFrame.state.STATE_WAIT);
    })
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
    this.game.levelInScreen.setText('level: ' + this.game.level);
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
      case GFrame.state.STATE_LEVEL_IN:
        setTimeout(() => {
          stage.removeChild(this.game.levelInScreen);
          this._systemWaitForClose();
          this.game.waitComplete();
          this._switchSystemState(GFrame.state.STATE_GAME_PLAY);
          this.game
        }, 2000);
        break;
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
  adapt(bool) {
    let stageWidth = document.documentElement.clientWidth,
      stageHeight = document.documentElement.clientHeight;
    let game = document.getElementById("game");
    //宽度自适应
    if (stageWidth <= 750) {
      this.stageScale = (stageWidth / width); //.toFixed(2);//四舍五入
      let h = stageHeight / this.stageScale,
        h1 = stage.canvas.height;
      height = h > h1 ? h1 : h;
    }
    //高度自适应
    else if (stageWidth >= 1200 && bool) {
      this.stageScale = stageHeight / height;
      game.style.width = width * this.stageScale + 'px';
      height = stage.canvas.height;
    }
    //不缩放
    else {
      this.stageScale = 1;
      let h = stageHeight / this.stageScale,
        h1 = stage.canvas.height;
      height = h > h1 ? h1 : h;
    }
    game.style.transform = 'scale(' + this.stageScale + ')';
    // //创建等待过渡背景
    // this._createWaitBg();
  }

  /*********************预加载****************************
   * 
   * @param {*} array 
   * @param {*} game 
   * @param {*} compid 
   */
  preload(GClass) {
    if ((!GClass.loadItem && !GClass.id) || GClass.isloaded) {
      this.initGame(GClass);
    } else if (GClass.Loaderbar) {
      this.loaderBar = new GClass.Loaderbar();
      queue.on('complete', () => {
        queue.removeAllEventListeners();
        this._preloadon(GClass);
      });
    } else {
      this.loaderBar = new LoaderBar();
      this._preloadon(GClass);
    }
  }
  _preloadon(GClass) {
    stage.addChild(this.loaderBar);
    queue.on('complete', function onComplete() {
      queue.removeAllEventListeners();
      stage.removeChild(this.loaderBar);
      GClass.isloaded = true;
      this.initGame(GClass);
    }, this);
    queue.on('progress', (e) => {
      this.loaderBar.startLoad(e);
    });
    queue.on('error', () => {
      console.log("loaderror");
    });
    if (GClass.id) {
      let comp = AdobeAn.getComposition(GClass.id);
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
  }

  /**初始化游戏
   * 
   */
  initGame(GClass) {
    this.game = new GClass();
    this._switchSystemState(GFrame.state.STATE_TITLE);
    this.onkeydown();
  }

  onkeydown() {
    document.onkeydown = (e) => {
      let c = this.game.codes[e.keyCode];
      if (this._currentSystemState == GFrame.state.STATE_GAME_PLAY && this.game.codes.hasOwnProperty(e.keyCode) && !keys[c]) {
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
      if (this.game.codes.hasOwnProperty(e.keyCode)) {
        let c = this.game.codes[e.keyCode];
        keys[c] = false;
        // this.game.onKeyUp(e);
        if (c == "left" || c == "right" || c == "up" || c == "down") pressed.splice(pressed.indexOf(c), 1);
      }
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
  //按钮点击事件
  _okButton(e) {
    if (e.target.id === GFrame.state.STATE_INSTRUCTION) {
      this._nextSystemState = GFrame.state.STATE_INSTRUCTION;
    }
    stage.removeChild(e.currentTarget);
    this._switchSystemState(this._nextSystemState);
  }
}

/*******************************************自定义事件****************************************** */

class ScoreUpdate extends createjs.Event {
  constructor(id, value, bubbles, cancelable) {
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
  _initBg() {
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
    if (!this.stage) {
      this._initBg()
    }
  }
}
class BasicScreen extends createjs.Container {
  constructor(text = null, xpos = 0, ypos = 0) {
    super();
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
  setTitleSprite(spritesheet, ani) {
    var xpos = this.title.x;
    var ypos = this.title.y;
    this.removeChild(this.title);
    this.title = new createjs.Sprite(spritesheet, ani);
    this.title.regX = this.title.getBounds().width / 2;
    this.title.regY = this.title.getBounds().height / 2;
    this.title.x = xpos;
    this.title.y = ypos;
    this.addChild(this.title);
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
  /**设置文本内容
   * 
   * @param {string} key 文本索引
   * @param {string} val 文本内容
   */
  setText(val) {
    this.title.text = val.toString();
  }
  setXYition(x, y) {
    this.title.x = x;
    this.title.y = y;
  }
  setFont(val) {
    this.title.font = val;
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

}
class SideBysideScore extends createjs.Container {
  /**
   * @param {string} label 引索也是key
   * @param {number} value 
   */
  constructor(label, value, valOffsetY = 4) {
    super();
    this.valOffsetY = valOffsetY;
    this._label = new createjs.Text(label + ':', GFrame.style.SCORE_TEXT_SIZE + 'px ' + GFrame.style.fontFamily, GFrame.style.SCORE_TEXT_COLOR);
    this._value = new createjs.Text(value, (GFrame.style.SCORE_TEXT_SIZE - 4) + 'px ' + GFrame.style.fontFamily, GFrame.style.SCORE_TEXT_COLOR);
    this._value.y = this.valOffsetY;
    this.addChild(this._label, this._value);
    this._setValueXPos();
  }
  setSprite({
    lableImage,
    spriteSheet,
    lableAnimation
  } = {}) {
    if (lableAnimation) {
      this.removeChild(this._label);
      this._label = new createjs.Sprite(spriteSheet, lableAnimation);
      this.addChild(this._label);
    } else if (lableImage) {
      this.removeChild(this._label);
      this._label = new createjs.Bitmap(lableImage);
      this.addChild(this._label);
    }
    if (spriteSheet) {
      let valtext = this.value;
      this.removeChild(this._value);
      this._value = new createjs.BitmapText(valtext, spriteSheet);
      this._setValueXPos();
      this.addChild(this._value);
    }
  }
  _setValueXPos() {
    this._value.y = this.valOffsetY;
    this._value.x = this._label.getBounds().width + GFrame.style.SCORE_BUFF;
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
   * 分数板
   * @param {number} xpos 
   * @param {number} ypos 
   */
  constructor(xpos = 0, ypos = 0) {
    super();
    this.x = xpos;
    this.y = ypos;
    this._textElements = {};
  }
  createBg(bgId) {
    if (!bgId) {
      this.scoreboardBg = new createjs.Shape();
      this.scoreboardBg.graphics.beginFill(GFrame.style.SCOREBOARD_COLOR)
        .drawRect(0, 0, width, GFrame.style.SCOREBOARD_HEIGHT);
    } else if (queue.getItem(bgId).type == "image") {
      this.scoreboardBg = new createjs.Bitmap(queue.getResult(bgId));
    } else {
      this.scoreboardBg = new createjs.Sprite(queue.getResult(bgId), 'scoreboardBg');
    }
    this.addChild(this.scoreboardBg);
  }
  /**
   * 创建分数元素
   * @param {string} label 
   * @param {number} val 
   * @param {number} xpos 
   * @param {number} ypos 
   * @param {object} scoreId
   */
  createTextElement(label, val, xpos, ypos, {
    lableImage,
    spriteSheet,
    lableAnimation
  } = {}, valOffsetY) {
    var _obj = new SideBysideScore(label, val, valOffsetY);
    if (lableImage || spriteSheet) _obj.setSprite({
      lableImage,
      spriteSheet,
      lableAnimation
    })
    this._textElements[label] = _obj;
    _obj.x = xpos;
    _obj.y = ypos || GFrame.style.SCOREBOARD_HEIGHT - _obj.getBounds().height >> 1;
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
var grids, actors, players,
  mapWidth, mapHeight, mapright, mapbottom,
  stepWidth = 1,
  stepHeight = 1,
  maptop = 0,
  mapleft = 0;
class Game {
  constructor() {
    mc.style.fontSize = 32; //mc组件字体大小
    mapWidth = width;
    mapHeight = height;
    mapright = mapWidth;
    mapbottom = mapHeight;
    this.level = 0;
    this.maxLevel = 1;
    this.container = stage;
    this.codes = {
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

    this.createTitleScreen();
    this.createInstructionScreen();
    this.createLevelInScreen();
    this.createGameOverScreen();
    this.createLevelOutScreen();
    this.createScoreBoard();
  }
  createTitleScreen() {
    this.titleScreen = new BasicScreen('开始界面5', width / 2, height / 3);
    this.titleScreen.createOkButton((width - 250) / 2, height * 3 / 5, '开始', 250, 60, new RoundRect(30)); //300,60
    this.titleScreen.createOkButton((width - 250) / 2, height * 3 / 5 + 70, '游戏说明', 250, 60, new RoundRect(30), GFrame.state.STATE_INSTRUCTION); //300,60
    // this.titleScreen=new lib.Title();//协作animate使用-------------------1
  }
  createInstructionScreen() {
    this.instructionScreen = new BasicScreen('介绍界面', width / 2, height / 4);
    this.instructionScreen.setFont("24px " + GFrame.style.fontFamily)
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

  //屏幕滚动
  scrollPlayerIntoView(player, container) {
    var width = container.getBounds().width;
    var height = container.getBounds().height;
    var marginw = width / 3;
    var marginh = height / 3;
    //this viewpot
    mapleft = -container.scrollX;
    mapright = mapleft + width;
    maptop = -container.scrollY;
    mapbottom = maptop + height;
    if (player.x < mapleft + marginw) {
      container.scrollX = -player.x + marginw;
    } else if (player.x > mapright - marginw) {
      container.scrollX = -player.x - marginw + width;
    }
    if (player.y < maptop + marginh) {
      container.scrollY = Math.floor(-player.y + marginh);
    } else if (player.y > mapbottom - marginh) {
      container.scrollY = Math.floor(-player.y - marginh + height);
    }
  }
  /**
   * 创建网格
   * @param {*} plans 
   * @param {*} step 
   * @param {*} actorChars 
   */
  createGrid(plans, stepW, stepH, actorChars, map) {
    grids = [];
    actors = [];
    this.container.addChild(map);
    stepWidth = stepW;
    stepHeight = stepH;
    var plan = plans[this.level - 1],
      w = plan[0].length,
      h = plan.length;
    mapWidth = w * stepWidth;
    mapHeight = h * stepHeight;
    for (var y = 0; y < h; y++) {
      var line = plan[y],
        gridLine = [];
      for (var x = 0; x < w; x++) {
        var ch = line[x];
        var Act = actorChars[ch];
        if (Act) {
          actors.push(new Act(x * stepWidth, y * stepHeight, ch));
        }
        gridLine.push(this.setGrid(ch, x * stepWidth, y * stepHeight));
      }
      grids.push(gridLine);
    }
    actors.forEach((actor) => {
      this.container.addChild(actor);
    });
    players = actors.filter(function (actor) {
      return actor.type == "player";
    });
    this.player = players[0];
    map.cache(0, 0, mapWidth, mapHeight);
  }
  //绘制地图
  setGrid(ch, xpos, ypos) {

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
    this.container.addChild(array[i]);
    return array[i];
  }
  canMove(tile){
    
  }

  //动量守恒碰撞
  billiardCollision(ball0, ball1) {
    let dx = ball1.x - ball0.x,
      dy = ball1.y - ball0.y,
      angle = Math.atan2(dy, dx);
    //旋转ball0的位置
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
    // let temp=vel0;
    // vel0=vel1;
    // vel1=temp;
    //更新位置
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
    partA.speed.x += ax / partA.mass;
    partA.speed.y += ay / partA.mass;
    partB.speed.x -= ax / partB.mass;
    partB.speed.y -= ay / partB.mass;
  }
}

//向量
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
    this._offsetX = 0;
    this._offsetY = 0;
    this.active = true;

    this.color = "rgb(64,64,64)";
  }
  drawShape(width, height) {
    this.image.graphics.clear().beginFill(this.color).drawRect(-width / 2, -height / 2, width, height);
    this.image.setBounds(-width / 2, -height / 2, width, height);
  }
  setSize(width, height, isreal = true) {
    if (this.image) {
      let _scalesizeX = width / this.size.x,
        _scalesizeY = height / this.size.y;
      this.size.x = width;
      this.size.y = height;
      this._offsetX *= _scalesizeX;
      this._offsetY *= _scalesizeY;
      if (_scalesizeX = _scalesizeY) {
        this.hit *= _scalesizeX;
      } else {
        this.hit = Math.sqrt(width * width + height * height) / 2;
      }
      if (isreal) {
        this.scaleX *= _scalesizeX;
        this.scaleY *= _scalesizeY;
      }
      this.update();
    } else {
      this.image = new createjs.Shape();
      this.addChildAt(this.image, 0);
      this.drawShape(width, height);
      this.init();
    }
  }
 //检测元素与背景碰撞
 hitMap(pos1 = this.pos) {
  let pos = new Vector(pos1.x / stepWidth, pos1.y / stepHeight);
  let size = new Vector(this.size.x / stepWidth, this.size.y / stepHeight);
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);
  if (xStart < 0 || xEnd > grids[0].length || yStart < 0) {
    return "wall";
  } else if (yEnd > grids.length) {
    return "lava";
  }
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = grids[y][x];
      if (fieldType) {
        return fieldType;
      }
    }
  }
}
  setSpriteData(spriteSheet, animation, scale = 1) {
    // if (this.image) this.removeChild(this.image);
    this.image = new createjs.Sprite(spriteSheet, animation);
    this.image.scale = scale;
    this.addChild(this.image);
    if (this.size) {
      if (this.image.getBounds().x == 0) {
        this.image.regX = -this._offsetX / scale;
        this.image.regY = -this._offsetY / scale;
      }
      this.image.setBounds(this._offsetX, this._offsetY, this.size.x, this.size.y);
    } else {
      this.init();
    }
  }
  init() {
    let r = this.getBounds();
    if (!this.hit) this.hit = Math.sqrt(r.width * r.width + r.height * r.height) / 2;
    this._offsetX = r.x;
    this._offsetY = r.y;
    this.size = new Vector(r.width, r.height);
    this.update();
  }
  update() {
    this.x = this.pos.x - this._offsetX;
    this.y = this.pos.y - this._offsetY;
  }
  updatePos() {
    this.pos.x = this.x + this._offsetX;
    this.pos.y = this.y + this._offsetY;
  }
  setReg(regX, regY) {
    this.regX = regX;
    this.regY = regY;
    this._offsetX -= regX;
    this._offsetY -= regY;
    this.update();
  }
  get offsetX() {
    return this._offsetX;
  }
  get offsetY() {
    return this._offsetY;
  }

  getCenterPoint() {
    let x1 = this.size.x / 2 + this.offsetX,
      // y1 = this.rect.height / 2 + this.rect.y,
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
    this.parent.removeChild(this);
    this.active = false;
  }

  /**检测是否碰撞屏幕
   * 
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns boolean
   */
  hitBounds(pos = this.pos) {
    return pos.x < 0 || pos.x + this.size.x > mapWidth || pos.y < 0 || pos.y + this.size.y > mapHeight;

  }
  /**屏幕反弹
   * 
   * @param {*} bounce -1
   */
  rebounds(bounce = -1) {
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
  /**检测是否出屏幕
   * 
   * @param {*} x this.x
   * @param {*} y this.y
   * @returns boolean
   */
  outOfBounds() {
    return this.pos.x + this.size.x < mapleft || this.pos.x > mapright || this.pos.y + this.size.y < maptop || this.pos.y > mapbottom;
  }
  //屏幕环绕
  placeInBounds() {
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
  act() {

  }

}
class HitActor extends Actor {
  constructor(xpos, ypos) {
    super(xpos, ypos);
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
  contains(xpos, ypos, sizeX, sizeY) {
    this._rectangle.setValues(this.pos.x, this.pos.y, this.size.x, this.size.y);
    return this._rectangle.contains(xpos, ypos, sizeX, sizeY);
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
class Barrage extends HitActor {
  constructor(xpos, ypos) {
    super(xpos, ypos);
  }
  drawShape(width) {
    var radius = width / 2;
    this.image.graphics.clear().beginRadialGradientFill(["#c9c9c9", this.color], [0, 1], radius / 3, -radius / 3, 0, radius / 6, -radius / 6, radius).drawCircle(0, 0, radius);
    this.image.setBounds(-radius, -radius, width, width);
    this.hit = radius;
  }
}
class SteeredActor extends HitActor {
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
    this.drawShape(15);
    this.init();
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
    this.image.setBounds(-width / 2, -width, width, width * 2);
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
    let desiredVelocity = target.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity = desiredVelocity.times(this.maxSpeed);
    let force = desiredVelocity.sub(this.speed);
    this.steeringForce.add(force);
  }
  //避开行为 以目标点反向逃离
  flee(target) {
    let centerPos = this.pos.plus(this.size.divide(2));
    let desiredVelocity = target.sub(centerPos);
    desiredVelocity.normalize();
    desiredVelocity = desiredVelocity.times(this.maxSpeed);
    let force = desiredVelocity.sub(this.speed);
    this.steeringForce = this.steeringForce.sub(force);
  }
  //到达行为
  arrive(target) {
    let centerPos = this.pos.plus(this.size.divide(2));
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
//*************************************等角游戏************************************* */
class IsoUtils {
  //1.2247的精确计算版本
  static Y_CORRECT = Math.cos(-Math.PI / 6) * Math.SQRT2;
  /**
   * 把等角空间中的一个3d坐标点转换成屏幕上的2d坐标点
   * @param {Point3D} pos 
   */
  static isoToScreen = function (pos) {
    let screenX = pos.x - pos.z;
    let screenY = pos.y * IsoUtils.Y_CORRECT + (pos.x + pos.z) * .5;
    return new createjs.Point(screenX, screenY);
  }
  /**
   * 把屏幕上的2d坐标点转换成等角空间中的一个3d坐标点
   * @param {createjs.Point} point 
   */
  static screenToIso = function (point) {
    let xpos = point.y + point.x * .5;
    let ypos = 0;
    let zpos = point.y - point.x * .5;
    return new Point3D(xpos, ypos, zpos);
  }
  constructor() {


  }

}

class IsoObject extends createjs.Container {
  constructor(size) {
    super();
    this._size = size;
    this._position = new Point3D();
    this._walkable = false;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.updateScreenPosition();
  }
  /**
   * 把当前时刻的一个3d坐标点转换成屏幕上的2d坐标点，并将自己安置于该点
   */
  updateScreenPosition() {
    let screenPos = IsoUtils.isoToScreen(this._position);
    this.x = screenPos.x;
    this.y = screenPos.y;
  }

  set xpos(value) {
    this._position.x = value;
    this.updateScreenPosition();
  }
  set ypos(value) {
    this._position.y = value;
    this.updateScreenPosition();
  }
  set zpos(value) {
    this._position.z = value;
    this.updateScreenPosition();
  }
  set position(value) {
    this._position = value;
    this.updateScreenPosition();
  }
  /**
   * 指定其它对象是否可以经过所占位置
   */
  set walkable(value) {
    this._walkable = value;
  }
  get walkable() {
    return this._walkable;
  }
  get xpos() {
    return this._position.x;
  }
  get ypos() {
    return this._position.y;
  }
  get zpos() {
    return this._position.z;
  }
  get position() {
    return this._position;
  }
  get size() {
    return this._size;
  }
  /**
   * 返回形变后的层深
   */
  get depth() {
    return (this._position.x + this._position.z) * .866 - this._position.y * .707;
  }
  get rect() {
    return new createjs.Rectangle(this.xpos - this.size / 2, this.zpos - this.size / 2, this.size, this.size);
  }
}
class DrawnIsoTile extends IsoObject {
  constructor(size, color, height = 0) {
    super(size);
    this.shape = new createjs.Shape();
    this.addChild(this.shape);
    this._color = color;
    this._height = height;
    this.drawShape();
  }
  drawShape() {
    this.shape.graphics.clear().
    setStrokeStyle(0.1).
    beginStroke("#000").
    beginFill(this.color).
    moveTo(-this.size, 0).
    lineTo(0, -this.size * .5).
    lineTo(this.size, 0).
    lineTo(0, this.size * .5).
    lineTo(-this.size, 0).
    endStroke().
    endFill();
  }
  set height(value) {
    this._height = value;
    this.draw();
  }
  get height() {
    return this._height;
  }
  set color(value) {
    this._color = value;
    this.draw();
  }
  get color() {
    return this._color;
  }
}
class DrawnIsoBox extends DrawnIsoTile {
  constructor(size, color, height) {
    super(size, color, height);

  }
  drawShape() {
    this.shape.graphics.clear();
    let color = utils.parseColor(this.color, true);
    let red = color >> 16;
    let green = color >> 8 & 0xff;
    let blue = color & 0xff;
    let leftShadow = utils.parseColor((red * .5) << 16 | (green * .5) << 8 | (blue * .5));
    let rightShadow = utils.parseColor((red * .75) << 16 | (green * .75) << 8 | (blue * .75));
    let h = this._height * IsoUtils.Y_CORRECT;
    //draw top
    this.shape.graphics.beginFill(this._color).
    moveTo(-this._size, -h).
    lineTo(0, -this._size * .5 - h).
    lineTo(this._size, -h).
    lineTo(0, this._size * .5 - h).
    lineTo(-this._size, -h).
    endFill();
    //draw left
    this.shape.graphics.beginFill(leftShadow).
    moveTo(-this._size, -h).
    lineTo(0, this._size * .5 - h).
    lineTo(0, this._size * .5).
    lineTo(-this._size, 0).
    lineTo(-this._size, -h).
    endFill();
    //draw right
    this.shape.graphics.beginFill(rightShadow).
    moveTo(this._size, -h).
    lineTo(0, this._size * .5 - h).
    lineTo(0, this._size * .5).
    lineTo(this._size, 0).
    lineTo(this._size, -h).
    endFill();
  }
}
/**
 * 等角世界类
 */
class IsoWorld extends createjs.Container {
  constructor() {
    super();
    this._floor = new createjs.Container();
    this._world = new createjs.Container();
    this.addChild(this._floor, this._world);
  }
  addChildToWorld(child) {
    this._world.addChild(child);
    this.sortDepth();
  }
  addChildToFloor(child) {
    this._floor.addChild(child);
  }
  canMove(obj) {
    let rect = obj.rect.setValues(obj.rect.x + obj.vx, obj.rect.y + obj.vz, obj.rect.width, obj.rect.height);
    for (let i = 0; i < this._world.numChildren; i++) {
      const objB = this._world.getChildAt(i);
      if (obj != objB && !objB.walkable && rect.intersects(objB.rect)) {
        return false;
      }
    }
    return true;
  }
  sortDepth() {
    this._world.sortChildren(function (a, b) {
      return a.depth - b.depth;
    });
  }
}
class GraphicTile extends IsoObject{
        constructor(size,ClassRef,xoffset,yoffset){
            super(size);
            let gfx=new ClassRef();
            gfx.x=-xoffset;
            gfx.y=-yoffset;
            this.addChild(gfx);
        }

    }