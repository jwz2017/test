import { Game, LoaderBar } from "./Game.js";
import { Fps } from "./fps.js";
var _systemFunction, _lastSystemState, _nextSystemState, _currentSystemState;
var stage, game, queue, lib, keys = Object.create(null), pressed = [];
var screenPosY = 0;
//box2d
var e_shapeBit = 0x0001, e_jointBit = 0x0002, e_aabbBit = 0x0004, e_pairBit = 0x0008, e_centerOfMassBit = 0x0010;
function updateWorldFromDebugDrawCheckboxes() {
  var flags = 0;
  if (gframe.guiProps.drawShapes)
    flags |= e_shapeBit;
  if (gframe.guiProps.drawJoints)
    flags |= e_jointBit;
  if (gframe.guiProps.drawAABBs)
    flags |= e_aabbBit;
  // if (gframe.guiProps.drawPairs )
  //     flags |= e_pairBit;
  if (gframe.guiProps.drawTransforms)
    flags |= e_centerOfMassBit;
  if (debugDraw) debugDraw.SetFlags(flags);
}
//键盘按键
var codes = {
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
//选择游戏状态
function _switchSystemState(stateval) {
  _lastSystemState = _currentSystemState;
  _currentSystemState = stateval;
  switch (stateval) {
    case Game.state.STATE_WAIT:
      _systemFunction = _systemWait;
      break;
    case Game.state.STATE_WAIT_FOR_CLOSE:
      _systemFunction = _systemWaitForClose;
      break;
    case Game.state.STATE_TITLE:
      _systemFunction = _systemTitle;
      break;
    case Game.state.STATE_INSTRUCTION:
      _systemFunction = _systemInstruction;
      break;
    case Game.state.STATE_NEW_GAME:
      _systemFunction = _systemNewGame;
      break;
    case Game.state.STATE_NEW_LEVEL:
      _systemFunction = _systemNewLevel;
      break;
    case Game.state.STATE_LEVEL_IN:
      _systemFunction = _systemLevelIn;
      break;
    case Game.state.STATE_GAME_PLAY:
      _systemFunction = _systemGamePlay;
      break;
    case Game.state.STATE_GAME_OVER:
      _systemFunction = _systemGameOver;
      break;
    case Game.state.STATE_LEVEL_OUT:
      _systemFunction = _systemLevelOut;
      break;
    default:
  }
};
//标题状态
function _systemTitle() {
  game.titleScreen.y = 0;
  stage.addChild(game.titleScreen);
  game.titleScreen.on("okbutton", _okButton, null, true);
  _switchSystemState(Game.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = Game.state.STATE_NEW_GAME;
};
//介绍界面状态
function _systemInstruction() {
  game.instructionScreen.y = 0;
  stage.addChild(game.instructionScreen);
  game.instructionScreen.on("okbutton", _okButton, null, true);
  _switchSystemState(Game.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = Game.state.STATE_TITLE;
};
//新游戏开始状态
function _systemNewGame() {
  game.score = 0;
  game.level = 0;
  game.lives = 3;
  game.gameOver = false;
  game.newGame();
  _switchSystemState(Game.state.STATE_NEW_LEVEL);
};
//设置新等级状态
function _systemNewLevel() {
  game.level++;
  game.levelUp = false;
  game.newLevel();
  game.levelInScreen.updateTitle("level: " + game.level);
  _switchSystemState(Game.state.STATE_LEVEL_IN);
};
//新等级界面状态
function _systemLevelIn() {
  stage.addChild(game.levelInScreen);
  _switchSystemState(Game.state.STATE_WAIT);
};
//通关
function _systemLevelOut() {
  stage.addChild(game.levelOutScreen);
  _nextSystemState = Game.state.STATE_TITLE;
  game.levelOutScreen.on("okbutton", _okButton, null, true);
  _switchSystemState(Game.state.STATE_WAIT_FOR_CLOSE);
};
//结束界面状态
function _systemGameOver() {
  game.gameOverScreen.y = 0;
  stage.addChild(game.gameOverScreen);
  game.gameOverScreen.on("okbutton", _okButton, null, true);
  _switchSystemState(Game.state.STATE_WAIT_FOR_CLOSE);
  _nextSystemState = Game.state.STATE_TITLE;
};
//游戏运行界面状态
function _systemGamePlay(e) {
  game._runGame(e);
  if (game.levelUp) {
    if (game.level >= game.maxLevel) {
      _nextSystemState = Game.state.STATE_LEVEL_OUT;
    } else {
      _nextSystemState = Game.state.STATE_NEW_LEVEL;
    }
    _switchSystemState(Game.state.STATE_WAIT);
  } else if (game.gameOver) {
    _nextSystemState = Game.state.STATE_GAME_OVER;
    _switchSystemState(Game.state.STATE_WAIT);
  }
};
//等待关闭界面状态
function _systemWaitForClose() {
  switch (_lastSystemState) {
    case Game.state.STATE_TITLE:
      if (game.titleScreen.y > screenPosY) {
        game.titleScreen.y -= 1;
      }
      break;
    case Game.state.STATE_LEVEL_IN:
      if (!stage.isWebGL) game.levelInScreen.updateWaitBg();
      break;
    case Game.state.STATE_LEVEL_OUT:
      if (game.levelOutScreen.y > screenPosY) {
        game.levelOutScreen.y -= 1;
      }
      break;
    case Game.state.STATE_GAME_OVER:
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
    case Game.state.STATE_LEVEL_IN:
      createjs.Tween.get(stage).wait(1000).call(() => {
        stage.removeChild(game.levelInScreen);

        if (!stage.isWebGL) game.levelInScreen.clearBg();
        if (game.scoreboard) stage.addChild(game.scoreboard);
        stage.enableMouseOver(0);
        stage.addChild(game);
        stage.children.forEach(element => {
          if (element.htmlElement) {
            element.visible = true;
            element.htmlElement.style.visibility = "visible";
          }
        });
        if (game.backSound) game.backSound.play();
        game.waitComplete();

        _switchSystemState(Game.state.STATE_GAME_PLAY);
      });
      break;
    //游戏结束或升级或通关
    case Game.state.STATE_GAME_PLAY:
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
/**
 * **************自适应**********************************
 */
var stageScale = 1;
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
  gameDom.style.width = stage.width * stageScale - 6 + "px";
};
/**
 * 初始化游戏
 * @param {*} GClass 
 * @param {*} keydown 
 */
function _initGame(GClass, keydown) {
  if (gframe.guiProps.fps) Fps.start();
  if (keydown) gframe.onkeydown();
  else {
    document.onkeydown = null;
    document.onkeyup = null;
  }
  if (game) {
    stage.removeAllEventListeners();
  }
  game = new GClass();
  if (stage.world) {
    game._runGame = game.updateWorld;
    if (debugDraw) {
      game.container.superDraw = game.container.draw;
      game.container.draw = game.containerDebugDraw
      
    }
  } else game._runGame = game.runGame;
  _switchSystemState(Game.state.STATE_TITLE);
};

//按钮点击事件
function _okButton(e) {
  switch (e.id) {
    case Game.state.STATE_INSTRUCTION:
      _nextSystemState = Game.state.STATE_INSTRUCTION;
      break;
    default:
      break;
  }
  stage.removeChild(e.currentTarget);
  _switchSystemState(_nextSystemState);
};
//创建设置面板
function createPannel() {
  dat.GUI.TEXT_OPEN = "选项设置";
  dat.GUI.TEXT_CLOSED = "关闭";
  let gui = gframe.gui = new dat.GUI({ width: 70, autoPlace: false, closeOnTop: false });
  gameDom.appendChild(gui.domElement);
  gui.domElement.style.position = "absolute";
  gui.domElement.style.bottom = "24px";
  // gui.domElement.style.fontSize="16px"
  gui.closed = true;
  gui.__closeButton.onclick = () => {
    if (gui.closed) {
      gui.width = 70;
    }
    else {
      gui.width = 245
    }
  }
  //主题音乐
  gui.add(gframe.guiProps, "主题音乐").onChange((val) => {
    if(!game.titleScreen.backSound&&game.titleSound){
      game.titleScreen.backSound=game.titleSound;
      if(game.titleScreen.parent)game.titleScreen.backSound.play();
    }
    if(game.titleScreen.backSound)game.titleScreen.backSound.muted = !val;
  });
  gui.add(gframe.guiProps, "主题音量", 0, 1).onChange((val) => {
    if (game.titleScreen.backSound) game.titleScreen.backSound.volume = val;
  });
  //背景音乐
  gui.add(gframe.guiProps, "背景音乐").onChange((val) => {
    if (game.backSound) game.backSound.muted = !val;
  });
  gui.add(gframe.guiProps, "背景音量", 0, 1).onChange((val) => {
    if (game.backSound) game.backSound.volume = val;
  });
  //fps
  gui.add(gframe.guiProps, "fps").onChange((val) => {
    if (val) Fps.start();
    else Fps.stop();
  });
  //box2d debug
  var f1 = gui.addFolder("box2d debug");
  f1.add(gframe.guiProps, "drawShapes").onChange(updateWorldFromDebugDrawCheckboxes);
  f1.add(gframe.guiProps, "drawJoints").onChange(updateWorldFromDebugDrawCheckboxes);
  f1.add(gframe.guiProps, "drawAABBs").onChange(updateWorldFromDebugDrawCheckboxes);
  f1.add(gframe.guiProps, "drawTransforms").onChange(updateWorldFromDebugDrawCheckboxes);
};
/***********************************gframe*************************************** */

var gframe = {
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
  guiProps: {
    isPannel: true,
    主题音乐: false,
    主题音量: 0.5,
    背景音乐: true,
    背景音量: 0.5,
    fps: true,
    drawShapes: true,
    drawJoints: true,
    drawAABBs: false,
    drawTransforms: false
  },
  //创建box2d世界 
  buildWorld(isDebug, gravity = 10) {
    stage.world=true;
    world = new b2World(new b2Vec2(0, gravity));
    context = stage.canvas.getContext("2d")
    if (isDebug) {
      debugDraw = getCanvasDebugDraw();
      // debugDraw.SetFlags(e_shapeBit);
      updateWorldFromDebugDrawCheckboxes();
      world.SetDebugDraw(debugDraw);
    }
  },
  //建立化舞台
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
      _systemFunction(e);
      stage.update(e);
    });
    //自适应
    _adapt();
    if (this.guiProps.isPannel) createPannel();
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
  //禁止键盘事件
  noKeydown() {
    document.onkeydown = null;
    document.onkeyup = null;
  },
  //启用键盘事件
  onkeydown() {
    var pressAtime = 0, releaseAtime = 0, presseDtime = 0, releaseDtime = 0;
    var pressInterval = 90;
    keys.step = 30;
    keys.stepindex = 0;
    document.onkeydown = (e) => {
      let c = codes[e.keyCode];
      if (_currentSystemState == Game.state.STATE_GAME_PLAY && codes.hasOwnProperty(e.keyCode) && !keys[c]) {
        keys[c] = true;
        if (c == "pause") {
          createjs.Ticker.paused = !createjs.Ticker.paused;
          if (createjs.Ticker.paused) {
            stage.addChild(game.pauseScreen);
            _systemFunction = _systemWaitForClose;
          } else {
            stage.removeChild(game.pauseScreen);
            _systemFunction = _systemGamePlay;
          }
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
              keys["rightRun"] = true;
            } else {
              keys["rightRun"] = false;
            }
          }

        }
      }
    }
    document.onkeyup = (e) => {
      if (codes.hasOwnProperty(e.keyCode)) {
        let c = codes[e.keyCode];
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
    _switchSystemState(Game.state.STATE_WAIT_FOR_CLOSE);
    game._clearBefore();
    game._clearAfter();
    createjs.Ticker.paused = false;
    stage.world = false;
    debugDraw = null;
  }
};
export { stage, game, queue, lib, keys, pressed, gframe };
