import { stage } from "./gframe.js";
import { Node } from "./Node.js";
import { PushButton, ScrollContainer, mc } from "./mc.js";
import { ShapeBackground } from "./other.js";
import { checkPixelCollision } from "./hitTest.js";
/**********************************事件************************************** */
class Okbutton extends createjs.Event {
    static TYPE = 'okbutton';
    constructor(id) {
        super(Okbutton.TYPE, false);
        this.id = id;
    }
}
/*****************************************游戏界面**************************** */
class BasicScreen extends createjs.Container {
    constructor(title = null, width = canvas.width, height = canvas.height) {
        super();
        this._width = width;
        this._height = height;
        this.backSound = null;
        if (title) {
            this.title = this.createText(title, true, Game.style.titleFont, Game.style.TEXT_COLOR);
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
            if (this.backSound) this.backSound.play();
        });
        this.addEventListener("removed", () => {
            this.children.forEach(element => {
                if (element.htmlElement) {
                    element._oldStage = null;
                    element.visible = false;
                    element.htmlElement.style.visibility = "hidden";
                }
            });
            if (this.backSound) this.backSound.stop();
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
    createText(text, isChild = true, font = Game.style.textFont, color = Game.style.TEXT_COLOR) {
        let txt = this.createDom("span");
        txt.htmlElement.innerHTML = text;
        txt.htmlElement.style.font = font;
        txt.htmlElement.style.color = color;
        txt.htmlElement.style.userSelect = "none";
        if (isChild) this.addChild(txt);//在容器内随容器移动而移动
        else this.children.push(div);//不随容器移动，但随容器加入和删除
        return txt;
    }
    createDOMcheckbox(label, { top = 0, left = 0, right = null, bottom = null } = {}) {
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
    createOkButton(xpos, ypos, button, { id, label, graphics, width, height } = {}) {
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
    setTitleFont(font) {
        this.title.htmlElement.style.font = font;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
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
    constructor(xpos = 0, ypos = 0, isBackgoundColor = false, { width = stage.width, justifyContent = "space-around", border = false } = {}) {//space-around
        super(null, width, 0);
        this.div = this.createDom("div");
        let div = this.div.htmlElement.style;
        div.display = "flex";
        div.flexWrap = "wrap";
        div.justifyContent = justifyContent;
        div.alignItems = "center";
        div.userSelect = "none";
        div.width = width + "px";
        if (border) div.border = "2px solid #999";
        if (isBackgoundColor) div.backgroundColor = Game.style.SCOREBOARD_COLOR;
        this.addChild(this.div);
        this.x = xpos;
        this.y = ypos;
        this._textElements = new Map();
    }
    createTextElement(key, val, xpos = 0, ypos = 0, { titleImg, borderFont, valueType = "span", width = 150, height = 50, max = 5 } = {}) {
        let c = document.createElement('div');
        if (xpos || ypos) {
            c.style.position = "absolute";
            c.style.left = xpos + "px";
            c.style.top = ypos + "px";
        } else {
            if (this.div.htmlElement.style.justifyContent == "space-between") {
                c.style.flex = "30%";
            }
            c.style.margin = "0 10px";
        }
        if (borderFont) c.style.border = borderFont;
        c.style.font = Game.style.scoreFont;
        c.style.color = Game.style.SCORE_TEXT_COLOR;
        c.style.display = "flex";
        c.style.alignItems = "center";
        let title;
        if (titleImg) {
            title = titleImg;
        } else {
            title = document.createElement('span');
            title.innerHTML = key + ":";
        }
        c.appendChild(title);
        let value = document.createElement(valueType);
        value.innerHTML = val || "";
        value.style.marginLeft = "8px";
        c.appendChild(value);
        if (valueType == "meter") {
            value.value = val || 0;
            value.max = max;
            value.min = 0;
            value.style.width = width + "px";
            value.style.height = height + "px";
        }
        this.div.htmlElement.appendChild(c);
        this._textElements.set(key, value);
        return value;
    }
    update(label, val) {
        this._textElements.get(label).innerHTML = val;
        this._textElements.get(label).value = val;
    }
    get width() {
        return this.div.htmlElement.clientWidth;
    }
    get height() {
        return this.div.htmlElement.clientHeight;
    }
}
//--------------------------------------------------进度条----------------------------------------------------------------------
class LoaderBar extends BasicScreen {
    constructor(title = "loading...", width = 500, height = 30) {
        super(title, width, height, Game.style.laoderFont);
        this.setTitleFont(Game.style.textFont);
        this.title.x = width - this.title.htmlElement.clientWidth >> 1;
        this.title.y = -this.title.htmlElement.offsetHeight - 8;
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
        style.font = Game.style.laoderFont;
        style.color = Game.style.TEXT_COLOR;

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
/***************************************游戏基类****************************** */
var _fontFamily = "regul,pfrondaseven,Arial,宋体";
class Game extends ScrollContainer {
    static style = {
        titleFont: "bold " + "60px " + _fontFamily,
        textFont: "40px " + _fontFamily,
        laoderFont: "bold 40px Arial,宋体",
        TEXT_COLOR: "#fff",
        //分数板样式
        scoreFont: "30px " + _fontFamily,
        SCORE_TEXT_COLOR: "#FFFFFF",
        SCOREBOARD_COLOR: "#555"
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
    static SCORE = "score";
    static LEVEL = "level";
    static LIVES = "lives";
    //创建元素
    static getActor(array, Actor, parent) {
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
        let a = array[i];
        if (parent) parent.addChild(a)
        return a;
    };
    static createrContainer() {
        let c = new createjs.Container();
        c.name = "container";
        return c;
    }
    /**
     * Game类
     * @param {string} titleText 
     * @param {stage.width} width 
     * @param {stage.height} height 
     * @param {0} stepWidth 
     * @param {0} stepHeight 
     */
    constructor(titleText, width = stage.width, height = stage.height, stepWidth = 0, stepHeight = 0) {
        super(null, 0, 0, width, height, 0, 0, false, false);
        //游戏层
        this.floorLayer = Game.createrContainer();
        this.playerLayer = Game.createrContainer();
        this.enemyLayer = Game.createrContainer();
        this.propLayer = Game.createrContainer();
        this.container.addChild(this.floorLayer, this.playerLayer, this.enemyLayer, this.propLayer);
        //网格
        this.nodes = [];
        this.numCols = 0;
        this.numRows = 0;
        this.stepWidth = stepWidth;
        this.stepHeight = stepHeight;
        this._tempNode = new Node(-1, -1);
        //地图字符
        this.playerChars = {};
        this.enemyChars = {};
        this.propChars = {};
        //游戏属性
        this.maxLevel = 1;
        this.gameOver = false;
        this.levelUp = false;
        this.score = 0;
        this.level = 0;
        this.lives = 3;
        //Astar智能寻路
        this._startNode = null;
        this._endNode = null;
        //创建界面
        this.createTitleScreen(titleText);
        this.createInstructionScreen();
        this.createLevelInScreen();
        this.createGameOverScreen();
        this.createLevelOutScreen();
        this.createPauseScreen();
        this.createScoreBoard();
        //背景音乐
        this.backSound = null;
    }
    /************************界面初始化*************************** */
    createTitleScreen(title) {
        this.titleScreen = new BasicScreen(title);
        if (!stage.isWebGL) {
            this.titleScreen.createOkButton((stage.canvas.width - 250) / 2, stage.canvas.height * 0.6, null, { label: 'start', width: 250, height: 60, graphics: new mc.RoundRect(30) });
            this.titleScreen.createOkButton((stage.canvas.width - 250) / 2, stage.canvas.height * 0.6 + 80, null, { label: '游戏说明', width: 250, height: 60, graphics: new mc.RoundRect(30), id: Game.state.STATE_INSTRUCTION });
            // this.titleScreen=new lib.Title();//协作animate使用-------------------1
        } else {
            let b = this.titleScreen.createDOMbutton("start");
            b.x = stage.width - b.htmlElement.clientWidth >> 1;
            b.y = stage.canvas.height * 0.52;

            b = this.titleScreen.createDOMbutton("简介", Game.state.STATE_INSTRUCTION);
            b.x = stage.width - b.htmlElement.clientWidth >> 1;
            b.y = stage.canvas.height * 0.52 + b.htmlElement.clientHeight + 20;
        }
    }
    createInstructionScreen() {
        this.instructionScreen = new BasicScreen('说明界面', stage.width, stage.height);
        this.instructionScreen.setTitleFont(Game.style.textFont);
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
    createPauseScreen() {
        this.pauseScreen = new BasicScreen("pause", this.width, this.height);
        this.pauseScreen.title.y = stage.height - this.pauseScreen.title.htmlElement.offsetHeight >> 1;
    }
    createScoreBoard() {

    }
    /***************************游戏开始状态************************ */
    newGame() {

    }
    newLevel() {

    }
    waitComplete() {

    }
    runGame() {

    }
    /***************************游戏运行时相关方法************* */
    //检查层内是否还有相关类型元素
    hasTypeOnContainer(actorType, container = this.container) {
        return container.children.some(function (actor) {
            return actor.type == actorType;
        })
    }

    //更新层内元素状态
    moveActors(layer) {
        let l = layer.numChildren - 1
        for (let i = l; i >= 0; i--) {
            const element = layer.getChildAt(i);
            element.act();
        }
    }
    // 检测地图元素碰撞
    hitMap(rect1, image = null, alphaThreshold = 0) {
        let x1 = rect1.x / this.stepWidth,
            y1 = rect1.y / this.stepHeight,
            w1 = rect1.width / this.stepWidth,
            h1 = rect1.height / this.stepHeight;
        var xStart = Math.floor(x1);
        var xEnd = Math.ceil(x1 + w1);
        var yStart = Math.floor(y1);
        var yEnd = Math.ceil(y1 + h1);
        if (xStart < 0 || xEnd > this.nodes[0].length || yStart < 0) {
            this._tempNode.type = Node.NOWALKABLE;
            return this._tempNode;
        } else if (yEnd > this.nodes.length) {
            this._tempNode.type = Node.DEATH;
            return this._tempNode;
        }
        for (var y = yStart; y < yEnd; y++) {
            for (var x = xStart; x < xEnd; x++) {
                let node = this.nodes[y][x];
                if (node.type != Node.WALKABLE) {
                    if (!node.actor) return node;
                    else {
                        if (!image || !(node.actor.image instanceof createjs.Sprite)) {
                            if (rect1.intersects(node.actor.rect)) return node;
                        } else {
                            let r = rect1.intersection(node.actor.rect);
                            if (r) {
                                this._transformRect(r);
                                if (checkPixelCollision(image, node.actor.image, r, alphaThreshold)) {
                                    return node
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    //检测地图道具元素碰撞
    hitMapWithProp(rect1, image = null, alphaThreshold = 0) {
        let x1 = rect1.x / this.stepWidth,
            y1 = rect1.y / this.stepHeight,
            w1 = rect1.width / this.stepWidth,
            h1 = rect1.height / this.stepHeight;
        var xStart = Math.floor(x1);
        var xEnd = Math.ceil(x1 + w1);
        var yStart = Math.floor(y1);
        var yEnd = Math.ceil(y1 + h1);
        for (var y = yStart; y < yEnd; y++) {
            for (var x = xStart; x < xEnd; x++) {
                let node = this.nodes[y][x];
                if (node.type == Node.WALKABLE && node.actor) {
                    if (!image || !(node.actor.image instanceof createjs.Sprite)) {
                        if (rect1.intersects(node.actor.rect)) return node;
                    } else {
                        let r = rect1.intersection(node.actor.rect);
                        if (r) {
                            this._transformRect(r)
                            if (checkPixelCollision(image, node.actor.image, r, alphaThreshold)) {
                                return node
                            }
                        }
                    }
                }
            }
        }
    }
    clear() { }
    //结束时立即清除
    _clearBefore() {
        if (this.backSound) this.backSound.stop();
        // this.removeAllEventListeners();
        this.clear();
    }
    _clearAfter() {
        stage.alpha = 1;
        createjs.Tween.removeAllTweens();
        stage.enableMouseOver();
        //清除游戏内容元素
        this._clearContainer(this.container);
        //清除舞台元素
        this._clearContainer(stage);
        if (stage.world) {
            var list = world.GetBodyList();
            while (list.a) {
                world.DestroyBody(list);
                list = list.GetNext();
            }
            console.log("刚体数量" + world.GetBodyCount());

        }
    }
    updateLives(live) {
        this.scoreboard.update(Game.LIVES, live == 3 ? "🧡🧡🧡" : live == 2 ? "🧡🧡" : live == 1 ? "🧡" : "");
    }
    /**
     * 检测是否与边界碰撞
     * @param {*} rect 矩形形状
     * @returns bool
     */
    hitBounds(rect) {
        let s = this.contentSize;
        return rect.x < 0 || rect.x + rect.width > s.width || rect.y < 0 || rect.y + rect.height > s.height;
    }
    /**
     * 检测是否出边界
     * @param {*} actor 
     * @returns bool
     */
    outOfBounds(actor) {
        let s = this.contentSize,
            rect = actor.rect;
        return rect.x + rect.width < 0 || rect.x > s.width || rect.y + rect.height < 0 || rect.y > s.height;
    }
    /**
     * 屏幕反弹
     * @param {*} actor 
     * @param {true} isbottom  是否底部反弹
     */
    rebounds(actor, isbottom = true) {
        let rect = actor.rect,
            s = this.contentSize;
        if (rect.x < 0) {
            actor.speed.x *= actor.bounce;
            rect.x = 0;
            actor.x = rect.width / 2;
        } else if (rect.x + rect.width > s.width) {
            actor.speed.x *= actor.bounce;
            rect.x = s.width - rect.width;
            actor.x = s.width - rect.width / 2;
        }
        if (rect.y < 0) {
            actor.speed.y *= actor.bounce;
            rect.y = 0;
            actor.y = rect.height / 2;
        } else if (rect.y + rect.height > s.height && isbottom) {
            actor.speed.y *= actor.bounce;
            rect.y = s.height - rect.height;
            actor.y = s.height - rect.height / 2;
        }
    }
    /**
     * 屏幕环绕
     * @param {*} actor 
     */
    placeInBounds(actor) {
        let s=this.contentSize;
        let rect = actor.rect;
        if (rect.x + rect.width < 0) {
            rect.x = s.width;
            actor.x = s.width + rect.width / 2;
        } else if (rect.x > s.width) {
            rect.x = -rect.width;
            actor.x = -rect.width / 2;
        }
        if (rect.y + rect.height < 0) {
            rect.y = s.height;
            actor.y = s.height + rect.height / 2;
        } else if (rect.y > s.height) {
            rect.y = -rect.height;
            actor.y = -rect.height / 2;
        }
    }
    /***************************网格相关************************ */
    //创建网格
    createGrid(rows, cols) {
        this.numCols = cols;
        this.numRows = rows;
        for (let i = 0; i < this.numCols; i++) {
            this.nodes[i] = [];
            for (let j = 0; j < this.numRows; j++) {
                this.nodes[i][j] = new Node(i, j);
            }
        }
    }
    //创建网格地图
    createGridMap(plan, drawGrid, isIso = false) {
        this.nodes = [];
        this.numCols = plan[0].length;
        this.numRows = plan.length;
        for (let y = 0; y < this.numRows; y++) {
            const line = plan[y];
            this.nodes[y] = [];
            for (let x = 0; x < this.numCols; x++) {
                const ch = line[x],
                    Act = this.playerChars[ch] || this.propChars[ch] || this.enemyChars[ch];
                this.nodes[y][x] = new Node(x, y);
                if (Act) {
                    let a = new Act(x * this.stepWidth, y * this.stepHeight, ch);
                    if (Act == this.playerChars[ch]) {
                        this.playerLayer.addChild(a);
                        if (a.type === "player") {
                            this.player = a;
                        }
                    } else if (Act == this.propChars[ch]) {
                        this.propLayer.addChild(a);
                        this.nodes[y][x].actor = a;
                    } else if (Act == this.enemyChars[ch]) {
                        this.enemyLayer.addChild(a);
                    }
                }
                drawGrid(ch, this.nodes[y][x]);
            }
        }
        if (isIso) {
            //等角地图深度排序
            this.sortDepth();
            //设置地图大小
            let w1 = this.numCols * this.stepWidth + this.numRows * this.stepHeight;
            this.contentSize = {
                width: w1,
                height: w1 / 2
            }
            this.container.x = this.width / 2;
            this.container.y = this.stepHeight / 2;
            this.floorLayer.cache(-this.contentSize.width / 2, -this.stepHeight / 2, this.contentSize.width, this.contentSize.height);
        } else {
            this.contentSize = {
                width: this.numCols * this.stepWidth,
                height: this.numRows * this.stepHeight
            }
            this.floorLayer.cache(0, 0, this.contentSize.width, this.contentSize.height)
        }
    };
    /**
   * 寻找周围相似节点
   * @param {*} node 
   * @returns 
   */
    findLikeNode(node) {
        let nodesToCheck = [], nodesMatched = [], nodesTested = [];
        let typeToMatch = node.type;
        nodesToCheck.push(node);
        //八方位检测
        // let rowList = [-1, 0, 1, -1, 1, -1, 0, 1],
        //     colList = [-1, -1, -1, 0, 0, 1, 1, 1];
        //上下左右四方位检测
        let rowList = [0, -1, 1, 0];
        let colList = [-1, 0, 0, 1];
        while (nodesToCheck.length > 0) {
            let tempNode = nodesToCheck.pop();
            if (tempNode.type == typeToMatch) {
                nodesMatched.push(tempNode);
            }
            let tempNode2;
            for (let i = 0; i < colList.length; i++) {
                if (tempNode.x + colList[i] >= 0 && (tempNode.x + colList[i]) < this.numCols
                    && tempNode.y + rowList[i] >= 0 && (tempNode.y + rowList[i]) < this.numRows) {
                    tempNode2 = this.getNode(tempNode.x + colList[i], tempNode.y + rowList[i]);
                    if (tempNode2 && tempNode2.type == typeToMatch && nodesToCheck.indexOf(tempNode2) == -1
                        && nodesTested.indexOf(tempNode2) == -1) {
                        nodesToCheck.push(tempNode2);
                    }
                }
            }
            nodesTested.push(tempNode);
        }
        return nodesMatched;
    }
    /**************************3d及iso************************** */
    //深度排序
    sortDepth(container = this.floorLayer) {
        container.sortChildren(function (a, b) {
            return a.depth - b.depth;
        });
    }
    /**************************get set*************************** */
    getNode(x, y) {
        return this.nodes[x][y]
    }
    setEndNode(x, y) {
        this._endNode = this.nodes[x][y];
    }
    setStartNode(x, y) {
        this._startNode = this.nodes[x][y];
    }
    setNodeType(x, y, value) {
        this.nodes[x][y].type = value;
    }
    get endNode() {
        return this._endNode;
    }
    get startNode() {
        return this._startNode;
    }
    get playerChildren() {
        return this.playerLayer.children;
    }
    get enemyChildren() {
        return this.enemyLayer.children;
    }
    get propChildren() {
        return this.propLayer.children;
    }
    get background() {
        return this._background;
    };
    set background(obj) {
        this._background = obj;
        if (obj instanceof createjs.DisplayObject) this.addChildAt(this._background, 0);
    };
    addToFloor(child) {
        this.floorLayer.addChild(child);
    }
    addToPlayer(child) {
        this.playerLayer.addChild(child);
    }
    addToProp(child) {
        this.propLayer.addChild(child);
    }
    addToEnemy(child) {
        this.enemyLayer.addChild(child);
    }
    _transformRect(r) {
        let p = this.container.localToGlobal(r.x, r.y);
        r.x = p.x;
        r.y = p.y;
    }
    _clearContainer(container) {
        let l = container.children.length - 1;
        for (let i = l; i >= 0; i--) {
            const element = container.children[i];
            if (element.htmlElement) {
                element._oldStage = null;
                element.visible = false;
                element.htmlElement.style.visibility = "hidden";
                container.removeChild(element);
            } else if (element.active) {
                element.recycle();
            } else if (element.name == "container") {
                this._clearContainer(element);
            } else {
                container.removeChild(element);
            }
        };
    };
    /*********************************box2d*********************************** */
    containerDebugDraw() {
        this.superDraw(context)//this-->container
        context.scale(PTM, PTM);
        context.lineWidth /= PTM;
        drawAxes(context);
        world.DrawDebugData();
    }
    updateWorld(e) {
        world.Step(e.delta / 1000, 10, 10);
        world.ClearForces();
        this.runGame();
    }
    dragBody(userData){
        let mouseMove;
        stage.on("stagemousedown", (e) => {
            let drawbody = EasyWorld.getBodyAt(e.stageX, e.stageY);
            if (drawbody.GetUserData()==userData||(!userData&&drawbody)) {
                mouseMove = stage.on("stagemousemove", (e) => {
                    EasyWorld.drawBodyTo(drawbody, e.stageX, e.stageY, false);
                })
            }
        })
        stage.on("stagemouseup", (e) => {
            if (mouseMove) {
                EasyWorld.stopDragBody();
                stage.off("stagemousemove", mouseMove);
                mouseMove = null;
            }
        })
    }
};

/**
 * **************************滚动游戏类 **************************************************
 */
class ScrollMapGame extends Game {
    constructor(titleText, width, height, stepWidth, stepHeight) {
        super(titleText, width, height, stepWidth, stepHeight);
        this.mapleft = 0;
        this.maptop = 0;
        this.mapright = this.width;
        this.mapbottom = this.height;
    }
    //屏幕滚动默认焦点游戏玩家
    scrollPlayerIntoView(actor = this.player, marginw = this.width / 3, marginh = this.height / 3) {
        let a = this.setActorScroll(actor, marginw, marginh);
        this.scrollX = a.scrollX;
        this.scrollY = a.scrollY;
    }
    //设置焦点对象
    setActorScroll(actor, marginw = this.width / 2, marginh = this.height / 2) {
        let scrollX = this.scrollX, scrollY = this.scrollY;
        //this viewpot
        this.mapleft = -scrollX;
        this.mapright = this.mapleft + this.width;
        this.maptop = -scrollY;
        this.mapbottom = this.maptop + this.height;
        if (actor.x < this.mapleft + marginw) {
            scrollX = -actor.x + marginw;
        } else if (actor.x > this.mapright - marginw) {
            scrollX = -actor.x - marginw + this.width;
        }
        if (actor.y < this.maptop + marginh) {
            scrollY = Math.floor(-actor.y + marginh);
        } else if (actor.y > this.mapbottom - marginh) {
            scrollY = Math.floor(-actor.y - marginh + this.height);
        }
        return { scrollX, scrollY };
    }
    /**检测是否出屏幕
     * 
     * @param {*} x this.x
     * @param {*} y this.y
     * @returns boolean
     */
    outOfWin(actor) {
        let rect = actor.rect;
        return rect.x + rect.width < this.mapleft || rect.x > this.mapright || rect.y + rect.height < this.maptop || rect.y > this.mapbottom;
    }
}
export { BasicScreen, LevelInScreen, ScoreBoard, LoaderBar, Game, ScrollMapGame };