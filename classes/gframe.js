var _systemFunction, _lastSystemState, _nextSystemState, _currentSystemState;
var stage, game, queue, lib, keys = Object.create(null), pressed = [];
var screenPosY = 0;

//游戏状态
const STATE_WAIT_FOR_CLOSE = "statewaitforclose",
  STATE_TITLE = "statetitle",
  STATE_INSTRUCTION = "stateinstruction",
  STATE_NEW_GAME = "statenewgame",
  STATE_GAME_OVER = "stategameover",
  STATE_NEW_LEVEL = "statenewlevel",
  STATE_LEVEL_IN = "statelevelin",
  STATE_GAME_PLAY = "stategameplay",
  STATE_LEVEL_OUT = "statelevelout",
  STATE_WAIT = "statewait";

//选择游戏状态
function _switchSystemState(stateval) {
  _lastSystemState = _currentSystemState;
  _currentSystemState = stateval;
  switch (stateval) {
    case STATE_WAIT:
      _systemFunction = _systemWait;
      break;
    case STATE_WAIT_FOR_CLOSE:
      _systemFunction = _systemWaitForClose;
      break;
    case STATE_TITLE:
      _systemFunction = _systemTitle;
      break;
    case STATE_INSTRUCTION:
      _systemFunction = _systemInstruction;
      break;
    case STATE_NEW_GAME:
      _systemFunction = _systemNewGame;
      break;
    case STATE_NEW_LEVEL:
      _systemFunction = _systemNewLevel;
      break;
    case STATE_LEVEL_IN:
      _systemFunction = _systemLevelIn;
      break;
    case STATE_GAME_PLAY:
      _systemFunction = _systemGamePlay;
      break;
    case STATE_GAME_OVER:
      _systemFunction = _systemGameOver;
      break;
    case STATE_LEVEL_OUT:
      _systemFunction = _systemLevelOut;
      break;
    default:
  }
};
//标题状态
function _systemTitle() {
  game.titleScreen.y = 0;
  stage.addChild(game.titleScreen);
  _switchSystemState(STATE_WAIT_FOR_CLOSE);
  _nextSystemState = STATE_NEW_GAME;
};
//介绍界面状态
function _systemInstruction() {
  stage.addChild(game.instructionScreen);
  _switchSystemState(STATE_WAIT_FOR_CLOSE);
  _nextSystemState = STATE_TITLE;
};
//新游戏开始状态
function _systemNewGame() {
  // gframe.clearContainer(stage);
  if(stage.contains(game.instructionScreen)) stage.removeChild(game.instructionScreen);
  game.score = 0;
  game.level = 0;
  game.gameOver = false;
  game.newGame();
  _switchSystemState(STATE_NEW_LEVEL);
};
//设置新等级状态
function _systemNewLevel() {
  game.level++;
  game.levelUp = false;
  game.levelInScreen.update(gframe.LevelInLevel, game.level);
  game.newLevel();
  _switchSystemState(STATE_LEVEL_IN);
};
//新等级界面状态
function _systemLevelIn() {
  stage.addChild(game.levelInScreen);
  _switchSystemState(STATE_WAIT);
};
//过场特效
function _systemWait() {
  switch (_lastSystemState) {
    //新等级过渡动画
    case STATE_LEVEL_IN:
      createjs.Tween.get(stage).wait(1000).call(() => {
        _waitComplete();
      });
      break;
    //游戏结束或升级或通关
    case STATE_GAME_PLAY:
      game._clearBefore();
      createjs.Tween.get(stage).to({
        alpha: 0.2
      }, 2000, createjs.Ease.quadOut).call(() => {
        game._clearAfter();
        _switchSystemState(_nextSystemState);
      });
      break;
  }
  _systemFunction = _systemWaitForClose;
};
//levelIn结束
function _waitComplete() {
  stage.enableMouseOver(0);
  if (game.levelInScreen) stage.removeChild(game.levelInScreen);
  if (game.scoreboard) stage.addChild(game.scoreboard);
  stage.addChild(game);
  stage.children.forEach(element => {
    if (element.htmlElement) {
      element.visible = true;
    }
  });
  if (game.backSound) game.backSound.play();
  if(gframe.pannel)gframe.pannel.game=game;
  stage.addChild(gframe.pannel);
  game.waitComplete();
  _switchSystemState(STATE_GAME_PLAY);
};

//游戏运行界面状态
function _systemGamePlay(e) {
  game.runGame(e);
  if (game.levelUp) {
    if (game.level >= game.maxLevel) {
      _nextSystemState = STATE_LEVEL_OUT;
      stage.enableMouseOver();
    } else {
      _nextSystemState = STATE_NEW_LEVEL;
    }
    _switchSystemState(STATE_WAIT);
  } else if (game.gameOver) {
    _nextSystemState = STATE_GAME_OVER;
    stage.enableMouseOver();
    _switchSystemState(STATE_WAIT);
  }
};
//通关
function _systemLevelOut() {
  game.levelOutScreen.y = 0;
  stage.addChild(game.levelOutScreen);
  _nextSystemState = STATE_TITLE;
  _switchSystemState(STATE_WAIT_FOR_CLOSE);
};
//结束界面状态
function _systemGameOver() {
  game.gameOverScreen.y = 0;
  stage.addChild(game.gameOverScreen);
  _switchSystemState(STATE_WAIT_FOR_CLOSE);
  _nextSystemState = STATE_TITLE;
};

//暂停界面状态
function _systemPause() {
  createjs.Ticker.paused = !createjs.Ticker.paused;
  if (createjs.Ticker.paused) {
    stage.addChild(game.pauseScreen);
    _systemFunction = _systemWaitForClose;
  } else {
    stage.removeChild(game.pauseScreen);
    _systemFunction = _systemGamePlay;
  }
  if (game.backSound) game.backSound.paused = !game.backSound.paused;
}
//等待关闭界面状态
function _systemWaitForClose() {
  switch (_lastSystemState) {
    case STATE_TITLE:
      if (game.titleScreen.y > screenPosY) {
        game.titleScreen.y -= 1;
      }
      break;
    case STATE_LEVEL_OUT:
      if (game.levelOutScreen.y > screenPosY) {
        game.levelOutScreen.y -= 1;
      }
      break;
    case STATE_GAME_OVER:
      if (game.gameOverScreen.y > screenPosY) {
        game.gameOverScreen.y -= 1;
      }
      break;

    default:
      break;
  }
};

/**
 * **************自适应**********************************
 */
var stageScale = 1;
function _adapt(isH = false) {
  stage.width = stage.canvas.width;
  stage.height = stage.canvas.height;
  gameDiv.style.width = stage.width + "px";
  let stageWidth = document.documentElement.clientWidth,
    stageHeight = document.documentElement.clientHeight;
  if (isH) {
    //高度自适应
    stageScale = stageHeight / stage.height;
  } else {
    stage.height = stageHeight > stage.height ? stage.height : stageHeight;
    //宽度自适应
    if (stageWidth <= stage.canvas.width) {
      if (stageWidth <= 320) stageWidth = 320;
      stageScale = (stageWidth / stage.width)//.toFixed(2);//四舍五入
      let h = stageHeight / stageScale;
      stage.height = h > stage.canvas.height ? stage.canvas.height : h;
    }
    gameDiv.style.height = stage.height + "px";
    screenPosY = stage.height - stage.canvas.height >> 1;
  }
  gameDiv.style.transform = 'scale(' + stageScale + ')';
  containerDiv.style.width = stage.width * stageScale + "px";
};
/**
 * 初始化游戏
 * @param {*} GClass 
 * @param {*} keydown 
 */
function buildGame(GClass, isDamo) {
  if (GClass.codes) gframe.onkeydown(GClass);
  game = new GClass();
  game.createPauseScreen();
  game.createScoreBoard();
  if (!isDamo) {
    game.createTitleScreen();
    game.createInstructionScreen();
    game.createLevelInScreen();
    game.createGameOverScreen();
    game.createLevelOutScreen();
    stage.addEventListener("okbutton", _okButton);
    _switchSystemState(STATE_TITLE);
  } else {
    _waitComplete();
  }
};

function _preloadGame(GClass, isDamo) {
  if (!GClass.loadItem && !GClass.loadId) buildGame(GClass, isDamo);
  else {
    let loaderBar = new GClass.LoaderBar();
    stage.addChild(loaderBar);
    let b = loaderBar.getBounds();
    loaderBar.x = stage.width - b.width >> 1;
    loaderBar.y = stage.height - b.height >> 1;
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
      // let manifest = JSON.parse(JSON.stringify(lib.properties.manifest));
      // queue.loadManifest(manifest);
      queue.loadManifest(lib.properties.manifest);
    }
    if (GClass.loadItem) {
      // let manifest = JSON.parse(JSON.stringify(GClass.loadItem));
      // queue.loadManifest(manifest);
      queue.loadManifest(GClass.loadItem);
    }
    queue.on('progress', (e) => {
      loaderBar.startLoad(e);
    });
    queue.on('error', () => {
      console.log("loaderror");
    });
    queue.on('complete', function onComplete() {
      queue.removeAllEventListeners();
      stage.removeChild(loaderBar);
      buildGame(GClass, isDamo);
    });

  }
};

//按钮点击事件
function _okButton(e) {
  if(e.target.id==STATE_INSTRUCTION){
    _nextSystemState=STATE_INSTRUCTION;
    stage.removeChild(game.titleScreen);
  }else{
    e.target.parent.removeChild(e.target);
  }
  _switchSystemState(_nextSystemState);
};
/***********************************gframe*************************************** */
var gframe = {
  LevelInLevel: "关卡",//等级界面
  OKBUTTON: "okbutton",
  pannel:null,
  createrContainer(parent) {
    let c = new createjs.Container();
    c.name = "gameLayer";
    parent.addChild(c);
    return c;
  },
  clearContainer(container) {
    let l = container.numChildren - 1;
    for (let i = l; i >= 0; i--) {
      const element = container.children[i];
      if (element.active) {
        // element.recycle();
        element.active = false;
        container.removeChild(element);
      }else if (element.htmlElement) {
        element.visible = false;
        container.removeChild(element);
      } else if (element.name == "gameLayer") {
        this.clearContainer(element);
      } else {
        container.removeChild(element);
      }
    };
  },

  /**
   * 建立舞台
   * @param {string} canvasId 
   * @param {false} isGL 是否为webgl模式
   * @param {false} isH 是否为高度自适应
   */
  buildStage(canvasId, isGL = false, isH = false, basePath = "../assets/") {
    _systemFunction = _systemWaitForClose;
    //建立舞台
    if (!isGL) stage = new createjs.Stage(canvasId);
    else {
      stage = new createjs.StageGL(canvasId, { "antialias": true });
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
    createjs.Ticker.framerate = 62;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    // createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.on("tick", (e) => {
      _systemFunction(e);
      stage.update(e);
    });
    //自适应
    _adapt(isH);

    queue = new createjs.LoadQueue(true, basePath);
    queue.installPlugin(createjs.Sound); //注册声音插件
  },
  /*********************预加载****************************
  * 
  * @param {Class} GClass 
  * @param {false} isDamo 跳过开始
  */
  preload(GClass, isDamo) {
    stage.canvas.style.background=GClass.backgroundColor
    if (GClass.loadFontItem) queue.loadManifest(GClass.loadFontItem)
    if (GClass.loadBarItem) {
      // GClass.loadBarItem = JSON.parse(JSON.stringify(GClass.loadBarItem));
      queue.loadManifest(GClass.loadBarItem);
    }
    if (GClass.loadFontItem || GClass.loadBarItem) {
      GClass.loadFontItem = null;
      GClass.loadBarItem=null;
      queue.on("complete", () => {
        _preloadGame(GClass, isDamo);
      }, null, true);
    } else {
      _preloadGame(GClass, isDamo);
    }
  },
  
  //禁止键盘事件
  noKeydown() {
    document.onkeydown = null;
    document.onkeyup = null;
  },
  //启用键盘事件
  onkeydown(GClass) {
    var pressAtime = 0, releaseAtime = 0, presseDtime = 0, releaseDtime = 0;
    var pressInterval = 90;
    keys.step = 30;
    keys.stepindex = 0;
    document.onkeydown = (e) => {
      let c = GClass.codes[e.keyCode];
      if (_currentSystemState == STATE_GAME_PLAY && GClass.codes.hasOwnProperty(e.keyCode) && !keys[c]) {
        keys[c] = true;
        game.onRunGameKeydown()
        if (c == "pause") {
          _systemPause();
        } else if (c == "left" || c == "right" || c == "up" || c == "down") {
          pressed.push(c);
          if (c == "left") {
            pressAtime = Date.now();
            if (pressAtime - releaseAtime <= pressInterval) {
              keys["leftRun"] = true;
            } else {
              keys["leftRun"] = false;
            }
          } else if (c == "right") {
            presseDtime = Date.now();
            if (presseDtime - releaseDtime <= pressInterval) {
              keys["rightRun"] = true;
            } else {
              keys["rightRun"] = false;
            }
          }

        }
      } else if (_lastSystemState == STATE_TITLE && GClass.codes.hasOwnProperty(e.keyCode) && !keys[c]) {
        keys[c] = true;
        game.onTitleKeydown()
      }
    }
    document.onkeyup = (e) => {
      if (GClass.codes.hasOwnProperty(e.keyCode)) {
        let c = GClass.codes[e.keyCode];
        keys[c] = false;
        keys.stepindex = 0;
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
  },
  reset() {
    _switchSystemState(STATE_WAIT_FOR_CLOSE);
    game._clearBefore();
    game._clearAfter();
    game = null;
    this.noKeydown();
    stage.removeEventListener("okbutton",_okButton);
    createjs.Ticker.paused = false;
    if (window.world) {
      world = null;
      debugDraw = null;
    }
    if (queue != null) {
      queue.close();
    }
  }
};
export { stage, game, queue, lib, keys, pressed, gframe };