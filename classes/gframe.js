var stage, queue, model, lib, width, height,
  keys = Object.create(null),
  pressed = [];
/*************************GFrame************************************************************************ */
class GFrame {
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
    model.addEventListener(GFrame.event.PAUSE, () => {
      this._systemFunction = createjs.Ticker.paused ? this._systemWaitForClose : this._systemGamePlay;
    });
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
      this._updateWaitBg();
    }
  }
  _updateWaitBg() {
    this.c++;
    if (this.c == 1) stage.autoClear = false;
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
  //等级界面等待状态
  _systemWait() {
    switch (this._lastSystemState) {
      case GFrame.state.STATE_LEVEL_IN:
        stage.addChild(this.fade, this.spin1); //bg
        setTimeout(() => {
          stage.removeChild(this.game.levelInScreen);
          this.game.waitComplete();
          this._switchSystemState(GFrame.state.STATE_GAME_PLAY);
          this._initBg(); //bg
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
  //等待界面
  _createWaitBg() {
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
    // stage.addChild(this.fade,this.spin1);

    // createjs.Ticker.interval = 20;//50fps
    this.c = 0;
    this.count = 0;
    this.colorOffset = Math.random() * 360;
    this.w = width / 2;
    this.h = height / 2;
    // this.w = Math.random() * width*0.5;
    // this.h = Math.random() * height*0.75;
  }
  _initBg() {
    this.c = 0;
    this.count = 0;
    this.spin1.rotation = 0;
    this.spin2.rotation = 0;
    this.shape.rotation = 0;
    stage.autoClear = true;
    stage.removeChild(this.fade, this.spin1);
  }
  //按钮点击
  _okButton(e) {
    if (e.target.id === GFrame.state.STATE_INSTRUCTION) {
      this._nextSystemState = GFrame.state.STATE_INSTRUCTION;
    }
    stage.removeChild(e.currentTarget);
    this._switchSystemState(this._nextSystemState);
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
    //创建等待过渡背景
    this._createWaitBg();
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
      // console.log(e.target);
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
    model.dispatchEvent(GFrame.event.LOADER_COMPLETE)
  }

  onkeydown() {
    document.onkeydown = (e) => {
      let c = this.game.codes[e.keyCode];
      if (this._currentSystemState == GFrame.state.STATE_GAME_PLAY && this.game.codes.hasOwnProperty(e.keyCode) && !keys[c]) {
        keys[c] = true;
        if (c == "pause") {
          createjs.Ticker.paused = !createjs.Ticker.paused;
          this._systemFunction = createjs.Ticker.paused ? this._systemWaitForClose : this._systemGamePlay;
        } else if (createjs.Ticker.paused) {
          return;
        } else if (c == "left" || c == "right" || c == "up" || c == "down") {
          pressed.push(c);
        }
      }
    }
    document.onkeyup = (e) => {
      if (this.game.codes.hasOwnProperty(e.keyCode)) {
        let c = this.game.codes[e.keyCode];
        keys[c] = false;
        if (c == "left" || c == "right" || c == "up" || c == "down") pressed.splice(pressed.indexOf(c), 1);
      }
    }
  }

  //fps
  startFPS() {
    var fps = document.createElement('span');
    document.getElementById('container').appendChild(fps);
    // oDiv2.insertBefore(oB2,oSpan2);//将b2插入到div2中的span2前面
    fps.style.fontSize = "18px";
    fps.style.position = "absolute";
    fps.style.top = "10px";
    fps.style.left = "10px";
    fps.style.color=GFrame.style.TITLE_TEXT_COLOR;
    createjs.Ticker.addEventListener("tick", () => {
      fps.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps";
    });
  }
}

/*******************************************静态变量****************************************** */
GFrame.style = {
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
GFrame.event = {
  GAME_OVER: "gameover",
  LEVEL_UP: "levelup",
  OK_BUTTON: "okbutton",
  LOADER_COMPLETE: "loadercomplete",
  PAUSE: "pause",
  UPDATE: "update"
};

GFrame.state = {
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

class ScoreUpdate extends createjs.Event {
  constructor(id, value, bubbles, cancelable) {
    super(GFrame.event.UPDATE, bubbles, cancelable);
    this.id = id;
    this.value = value;
  }
}

/*****************************************游戏界面**************************** */
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
  setTitleSprite(spritesheet,ani){
    var xpos=this.title.x;
    var ypos=this.title.y;
    this.removeChild(this.title);
    this.title=new createjs.Sprite(spritesheet,ani);
    this.title.regX=this.title.getBounds().width/2;
    this.title.regY=this.title.getBounds().height/2;
    this.title.x=xpos;
    this.title.y=ypos;
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
  createOkButton(xpos, ypos, label, width, height, graphics, id) {
    var g = graphics || new Star(6, 0.35);
    new PushButton(this, label, function () {
      this.id = id;
      this.dispatchEvent(GFrame.event.OK_BUTTON, true);
    }, xpos, ypos, width, height, g);
  }
  /**设置文本内容
   * 
   * @param {string} key 文本索引
   * @param {string} val 文本内容
   */
  setText(val) {
    this.title.text = val.toString();
  }
  setPosition(x, y) {
    this.title.x = x;
    this.title.y = y;
  }
  setFont(val) {
    this.title.font = val;
  }
}

class SideBysideScore extends createjs.Container {
  /**
   * @param {string} label 引索也是key
   * @param {number} value 
   */
  constructor(label, value, valOffsetY = 3) {
    super();
    this.valOffsetY = valOffsetY;
    this._label = new createjs.Text(label + ':', 'bold ' + GFrame.style.SCORE_TEXT_SIZE + 'px ' + GFrame.style.fontFamily, GFrame.style.SCORE_TEXT_COLOR);
    this._value = new createjs.Text(value, 'bold ' + (GFrame.style.SCORE_TEXT_SIZE - 4) + 'px ' + GFrame.style.fontFamily, GFrame.style.SCORE_TEXT_COLOR);
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
      // this._value.regY = this._value.getBounds().height;
      // console.log(this._value.regY);

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
var grids, actors, players, stepWidth = 1,
  stepHeight = 1;
class Game {
  constructor() {
    mc.style.fontSize = 32; //mc组件字体大小
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
      103: "fire"
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
    // this.titleScreen.createShapeBack();
    this.titleScreen.createOkButton((width - 250) / 2, height * 3 / 5, '开始', 250, 60, new RoundRect(30)); //300,60
    this.titleScreen.createOkButton((width - 250) / 2, height * 3 / 5 + 70, '游戏说明', 250, 60, new RoundRect(30), GFrame.state.STATE_INSTRUCTION); //300,60
    // this.titleScreen=new lib.Title();//协作animate使用-------------------1
  }
  createInstructionScreen() {
    this.instructionScreen = new BasicScreen('介绍界面', width / 2, height / 4);
    this.instructionScreen.setFont("24px " + GFrame.style.fontFamily)
    this.instructionScreen.createOkButton((width - 150) / 2, height * 3 / 5, '返回', 150, 150);
  }
  createLevelInScreen() {
    this.levelInScreen = new BasicScreen('level:0', width / 2, height / 2);
  }
  createGameOverScreen() {
    this.gameOverScreen = new BasicScreen('game over', width / 2, height / 3);
    this.gameOverScreen.createOkButton((width - 150) / 2, height * 3 / 5, '结束', 150, 150);
  }
  createLevelOutScreen() {
    this.levelOutScreen = new BasicScreen('you win', width / 2, height / 3);
    this.levelOutScreen.createOkButton((width - 150) / 2, height * 3 / 5, '通关', 150, 150);
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
  // updateScoreBoard(key, val) {
  //   this.scoreBoard.update(key, val);
  // }

  //屏幕滚动
  scrollPlayerIntoView(player, container) {
    var width = container.getBounds().width;
    var height = container.getBounds().height;
    var marginw = width / 3;
    var marginh = height / 3;
    //this viewpot
    var left = -container.scrollX,
      right = left + width;
    var top = -container.scrollY,
      bottom = top + height;
    if (player.x < left + marginw) {
      container.scrollX = -player.x + marginw;
    } else if (player.x > right - marginw) {
      container.scrollX = -player.x - marginw + width;
    }
    if (player.y < top + marginh) {
      container.scrollY = Math.floor(-player.y + marginh);
    } else if (player.y > bottom - marginh) {
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
    map.uncache();
    stepWidth = stepW;
    stepHeight = stepH;

    var plan = plans[this.level - 1],
      mapWidth = plan[0].length,
      mapHeight = plan.length;
    for (var y = 0; y < mapHeight; y++) {
      var line = plan[y],
        gridLine = [];
      for (var x = 0; x < mapWidth; x++) {
        var ch = line[x];
        var Act = actorChars[ch];
        if (Act) {
          actors.push(new Act(x,y, ch));
        }
        gridLine.push(this.setGrid(ch, x, y));
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
    map.cache(0, 0, mapWidth * stepWidth, mapHeight * stepHeight);
  }
  //绘制地图
  setGrid(ch, xpos, ypos) {

  }
  //创建子弹
  createBullet(angle, Bullet) {
    var length = Bullet.bullets.length;
    if (length > 0) {
      var bullet = Bullet.bullets.pop();
    } else {
      var bullet = new Bullet(this.pos);
    }
    bullet.angle = angle;
    this.container.addChild(bullet);
    return bullet;
  }
  //检测子弹
  checkBullets(bullets) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.act();
    }
  }
  
}


//向量
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
}


class Actor extends createjs.Container {
  constructor(xpos=0,ypos=0) {
    super();
    this.pos = new Vector(xpos, ypos);
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 0);
    this.color = "rgb(64,64,64)";
    this.image = new createjs.Shape();
    this.addChild(this.image);
  }
  drawShape() {
    var width = this.size.x * stepWidth,
      height = this.size.y * stepHeight;
    this.image.graphics.clear().beginFill(this.color).drawRect(0, 0, width, height);
  }
  setSize(width, height) {
    this.size.x = width;
    this.size.y = height;
    if (this.image instanceof(createjs.Shape)) {
      this.drawShape();
    } else {
      this.image.scaleX *= width / this.size.x;
      this.image.scaleY *= height / this.size.y;
    }
    this.regX=this.size.x/2*stepWidth;
    this.regY=this.size.y/2*stepHeight;
    this.setPos();
  }
  setPos() {
    this.x = (this.pos.x+this.size.x/2) * stepWidth;
    this.y = (this.pos.y+this.size.y/2) * stepHeight;
    // this.pos.x = xpos;
    // this.pos.y = ypos
  }
  setSpriteData(spriteSheet, animation, scale) {
    // this.removeChild(this.image);
    this.image = new createjs.Sprite(spriteSheet, animation);
    console.log(this.image.x,this.image.y);
    this.image.scale = scale || 1;
    this.image.x = (stepWidth * this.size.x) / 2;
    this.image.y = (stepHeight * this.size.y) / 2;
    this.addChild(this.image);
  }
  //检测是否出屏幕
  outOfBounds() {
    return this.x < -this.size.x*stepWidth || this.y < -this.size.y * stepHeight || this.x > width + this.size.x*stepWidth || this.y > height + this.size.y*stepHeight;
  }
  //屏幕环绕
  placeInBounds() {
    //if its visual bounds are entirely off screen place it off screen on the other side
    if (this.x > width + this.size.x*stepWidth) {
      this.pos.x = this.size.x * -1;

    } else if (this.x < -this.size.x*stepWidth) {
      this.pos.x = width / stepWidth;
    }
    //if its visual bounds are entirely off screen place it off screen on the other side
    if (this.y > height + this.size.y*stepHeight) {
      this.pos.y = this.size.y * -1;
    } else if ( this.y < -this.size.y * stepHeight) {
      this.pos.y = height / stepHeight;
    }
  }
  act() {

  }

}
class HitActor extends Actor {
  constructor(xpos,ypos) {
    super(xpos,ypos);
  }
  //检测元素与背景碰撞
  hitMap(pos) {
    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + this.size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + this.size.y);
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
  //检测 元素之间是否碰撞
  hitActors(actors) {
    // console.time('jis')
    for (var i = 0; i < actors.length; i++) {
      var other = actors[i];
      if (other == this) {
        continue;
      }
      if (this.pos.x + this.size.x < other.pos.x) {
        continue;
      }
      if (this.pos.x > other.pos.x + other.size.x) {
        continue;
      }
      if (this.pos.y + this.size.y < other.pos.y) {
        continue;
      }
      if (this.pos.y > other.pos.y + other.size.y) {
        continue;
      }
      return other;
      // if (other != this &&
      //   Math.abs(this.pos.x+this.size.x/2 - (other.pos.x+other.size.x/2)) < (this.size.x + other.size.x)/2 &&
      //   Math.abs(this.pos.y+this.size.y/2 - (other.pos.y+other.size.y/2)) < (this.size.y + other.size.y)/2) {
      //     return other;
      // }
    }
    // console.timeEnd('jis')
  }
  hitPoint(tx,ty){
    return this.hitRadius(tx,ty,0);
  }
  hitRadius(tx,ty,tHit){
    let hit=this.size.x/2*stepWidth;
    if(tx-tHit>this.x+hit){
      return;
    }
    if(tx+tHit<this.x-hit){
      return;
    }
    if(ty-tHit>this.y+hit){
      return;
    }
    if(ty+tHit<this.y-hit){
      return;
    }
    return hit+tHit>Math.sqrt(Math.pow(Math.abs(this.x-tx),2)+Math.pow(Math.abs(this.y-ty),2));
  }
  
}

class Barrage extends HitActor {
  constructor(xpos,ypos) {
    super(xpos,ypos);
    this.v = 0.15;
  }
  drawShape() {
    var radius = this.size.x * stepWidth / 2;
    this.image.graphics.clear().beginFill(this.color).drawCircle(0, 0, radius);
  }
  act() {
    var newPos = this.pos.plus(this.speed);
    var obstacle = this.hitMap(newPos);
    if (!obstacle) {
      this.pos = newPos;
      this.setPos();
      let actor = this.hitActors(actors);
      if (actor) {
        this.hitResult(actor);
      }
    } else {
      this.recycle();
    }
  }
  hitResult(actor) {

  }
  recycle() {
    this.parent.removeChild(this);
  }
  angleBounce(actor) {
    var x1 = this.pos.x - actor.posX,
      y1 = this.pos.y - actor.posY,
      y2 = actor.cos * y1 - actor.sin * x1,
      vy2 = actor.cos * this.speed.y - actor.sin * this.speed.x;
    if (y2 > -this.size.y && y2 < vy2) {
      y2 = -this.size.y;
      vy2 *= -1;
      var x2 = actor.cos * x1 + actor.sin * y1,
        vx2 = actor.cos * this.speed.x + actor.sin * this.speed.y;
      x1 = actor.cos * x2 - actor.sin * y2;
      y1 = actor.cos * y2 + actor.sin * x2;
      this.speed.x = actor.cos * vx2 - actor.sin * vy2;
      this.speed.y = actor.cos * vy2 + actor.sin * vx2;
      this.pos.x = actor.posX + x1;
      this.pos.y = actor.posY + y1;
    }
  }
  get angle() {
    return this.image.rotation;
  }
  set angle(ang) {
    this.image.rotation = ang;
    var cos = Math.cos(ang * Math.PI / 180),
      sin = Math.sin(ang * Math.PI / 180);
    this.speed.x = cos * this.v;
    // this.speed.y = sin * this.v * stepWidth / stepHeight;
    this.speed.y = sin * this.v;
  }
}