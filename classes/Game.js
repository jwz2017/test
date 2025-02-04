import { stage } from "./gframe.js";
import { Node } from "./Node.js";
import { PushButton, ScrollContainer, mc } from "./mc.js";
import { ShapeBackground } from "./other.js";
import { checkPixelCollision } from "./hitTest.js";
/**********************************事件************************************** */
class Okbutton extends createjs.Event {
    static ADD_INSTRUCTION = "addinstruction";
    constructor(nextState) {
        super("okbutton", true);
        // console.log(this.bubbles);
        this.nextState = nextState;
    }
}
/*****************************************游戏界面**************************** */

class BasicScreen extends createjs.Container {
    //style
    static style = {
        textFont:"40px regul,Arial,宋体",
        titleFont:"bold 60px regul,Arial,宋体",
        scoreFont:"30px regul,Arial,宋体",
        color:"#fff",
    };
    static setFont(obj,font=BasicScreen.style.textFont) {
        let ele = obj.htmlElement;
        ele.style.font=font;
        obj.setBounds(0, 0, ele.clientWidth, ele.clientHeight);
    }
    constructor() {
        super();
        this.backSound = null;
        this.on("added", this.onAdded);
        this.on("removed", this.onRemove);
    }
    createDom(element, domParent = gameScaleDom) {
        let e = document.createElement(element);
        e.style.visibility = "hidden";
        domParent.appendChild(e);
        let a = new createjs.DOMElement(e);
        this.addChild(a);
        // else this.children.push(a);//不随容器移动，但随容器加入和删除
        return a;
    }
    onAdded() {
        this.children.forEach(element => {
            if (element.htmlElement) {
                element.visible = true;
            }
        });
        if (this.backSound) this.backSound.play();
    }
    onRemove() {
        this.children.forEach(element => {
            if (element.htmlElement) {
                element.visible = false;
            }
        });
        if (this.backSound) this.backSound.stop();
    }
    createText(text,font,color) {
        let txt = this.createDom("span");
        let ele = txt.htmlElement;
        if (text != null) ele.innerHTML = text;
        ele.style.userSelect = "none";
        ele.style.color = color||BasicScreen.style.color;
        BasicScreen.setFont(txt,font);
        return txt;
    }
    createBar(width, height) {
        let bar = this.createDom("progress");
        let ele = bar.htmlElement;
        bar.setBounds(0, 0, width, height);
        ele.value = 0;
        ele.max = 100;
        ele.style.width = width + "px";
        ele.style.height = height + "px";
        ele.style.backgroundColor = "blue";
        return bar;
    }
    createScreen(title, content, actions, width, height) {
        const modal = this.createDom('div');
        let ele = modal.htmlElement;
        ele.classList.add('modal');
        if (width) ele.style.width = width + "px";
        if (height) ele.style.height = height + "px";
        ele.style.maxWidth = stage.width + "px";
        ele.style.maxHeight = stage.height + "px";

        const header = document.createElement('div');
        header.classList.add('modal-header');
        header.innerHTML = title;

        const body = document.createElement('div');
        body.classList.add('modal-body');
        body.innerHTML = content

        const buffer = document.createElement('div');
        buffer.classList.add('modal-buffer');

        const footer = document.createElement('div');
        footer.classList.add('modal-footer');

        actions.forEach(action => {
            const button = document.createElement('button');
            button.classList.add('modal-action');
            button.innerHTML = action.text;
            button.onclick = action.onclick;
            footer.appendChild(button);
        });
        modal.htmlElement.appendChild(header);
        modal.htmlElement.appendChild(body);
        modal.htmlElement.appendChild(buffer);
        modal.htmlElement.appendChild(footer);
        BasicScreen.setFont(modal);
        return modal;
    }
    /**
     * dom按钮
     * @param {*} label 
     * @param {*} nextState 
     * @param {"game-button"} className 
     * @param {*} onClick 
     * @returns 
     */
    createDOMbutton(label, onClick, className = "game-button") {
        let button = this.createDom("span");
        let element = button.htmlElement;
        element.classList.add(className);
        element.innerHTML = label;
        element.onclick = onClick
        button.setBounds(0, 0, element.clientWidth, element.clientHeight);
        return button;
    }
}
class TitleScreen extends BasicScreen {
    constructor(titleText) {
        super()
        if (titleText instanceof createjs.DisplayObject) {
            this.title = titleText;
            this.addChild(this.title);
        } else if (titleText) {
            this.title = this.createText(titleText,BasicScreen.style.titleFont);
        }
        this.title.x = canvas.width - this.title.getBounds().width >> 1;
        this.title.y = canvas.height / 3 + 20;
    }
    createButton(text, onclick = () => {
        this.dispatchEvent(new Okbutton());
    }) {
        let btn;
        if (!stage.isWebGL) {
            btn = new PushButton(this, text, onclick, 0, 0, 250, 60, new mc.RoundRect(30));
        } else {
            btn = this.createDOMbutton(text, onclick);
        }
        return btn;
    }
}
class ScoreBoard extends BasicScreen {
    constructor(width = stage.width, justifyContent = "space-around") {//space-around
        super();
        this.back = this.createDom("div");
        let div = this.back.htmlElement.style;
        div.display = "flex";
        div.flexWrap = "wrap";
        div.justifyContent = justifyContent;
        div.alignItems = "center";
        div.userSelect = "none";
        div.width = width + "px";
        this._textElements = new Map();
    }
    createTextElement(key, val, xpos = null, ypos = null, { titleImg,font=BasicScreen.style.scoreFont,color=BasicScreen.style.color, borderFont, valueType = "span", width = 150, height = 50, max = 5 } = {}) {
        let c = document.createElement('div');
        if (xpos != null && ypos != null) {
            c.style.position = "absolute";
            c.style.left = xpos + "px";
            c.style.top = ypos + "px";
        } else {
            if (this.back.htmlElement.style.justifyContent == "space-between") {
                c.style.flex = "30%";
            }
            c.style.margin = "0 10px";
        }
        if (borderFont) c.style.border = borderFont;
        c.style.font=font;
        c.style.color = color;
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
        this.back.htmlElement.appendChild(c);
        this._textElements.set(key, value);
        this.back.setBounds(0, 0, this.back.htmlElement.clientWidth, this.back.htmlElement.clientHeight);
        return c;
    }
    update(label, val) {
        let v = this._textElements.get(label);
        if (v.tagName == "METER") {
            v.value = val;
        }
        else if (v) v.innerHTML = val;
    }
}
class LevelInScreen extends ScoreBoard {
    constructor() {
        super();
        let div = this.createTextElement(Game.LEVEL, "0", 0, 0, { font: BasicScreen.style.titleFont});
        div.style.left = (stage.width - div.clientWidth >> 1) + "px";
        div.style.top = (stage.height - div.clientHeight >> 1) + "px";
        if (!stage.isWebGL) {
            this.bg = new ShapeBackground(stage.width / 2, stage.height / 2);
            this.addChild(this.bg);
        }
    }
    onRemove() {
        super.onRemove();
        if (!stage.isWebGL) {
            createjs.Ticker.off("tick", this.t)
            this.bg.clearBg();
        }
    }
    onAdded() {
        super.onAdded();
        if (!stage.isWebGL) {
            this.t = createjs.Ticker.on("tick", (e) => {
                this.bg.updateWaitBg()
            })
        }
    }
}
//--------------------------------------------------进度条----------------------------------------------------------------------
class LoaderBar extends BasicScreen {
    constructor(titleText = "loading...", width = 500, height = 30) {
        super();
        this.createTitle(titleText, width);
        this.bar = this.createBar(width, height);
        this.bar.y = this.title.getBounds().height + this.title.y;
        this.createValue(width, height);
    }
    createTitle(titleText, width) {
        this.title = this.createText(titleText,BasicScreen.style.titleFont);
        this.title.x = width - this.title.getBounds().width >> 1;
    }
    createValue(width, height) {
        this.value = this.createText("000%");
        this.value.x = width - this.value.getBounds().width >> 1;
        this.value.y = this.bar.y + height;
    }
    onRemove() {
        super.onRemove();
    }
    startLoad(e) {
        this.bar.htmlElement.value = e.progress * 100;
        this.value.htmlElement.innerHTML = Math.floor(e.progress * 100).toString() + "%";
    }
}
/***************************************游戏基类****************************** */
class Game extends ScrollContainer {
    static backgroundColor = "#000";//游戏背景颜色
    static LoaderBar = LoaderBar;
    static loadBarItem = null;
    static loadItem = null;
    static loadId = null;
    static loadFontItem = [{
        src: "fonts/regul-book.woff",
        type: "font",
    },
    {
        src: "fonts/pf_ronda_seven.ttf",
        type: "font"
    }, {
        src: "fonts/regul-bold.woff",
        type: "font",
    }];
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
    //键盘按键
    static codes = null;
    // static codes = {
    //     65: "left",
    //     87: "up",
    //     68: "right",
    //     83: "down",
    //     32: "pause",
    //     100: "attack",
    //     101: "jump",
    //     102: "skill1",
    //     103: "fire",
    //     16: "shift",
    //     17: "ctrl"
    // };

    static SCORE = "score";
    static LEVEL = "level";
    static LIVES = "lives";
    //创建元素
    static getActor(Actor, parent) {
        Actor.array = Actor.array || [];
        let len = Actor.array.length, i = 0;
        while (i <= len) {
            if (!Actor.array[i]) {
                Actor.array[i] = new Actor();
                Actor.array[i].active = true;
                break;
            } else if (!Actor.array[i].active) {
                Actor.array[i].active = true;
                break;
            } else {
                i++;
            }
        }
        if (parent) parent.addChild(Actor.array[i])
        return Actor.array[i];
    };
    static clearContainer(container) {
        let l = container.numChildren - 1;
        for (let i = l; i >= 0; i--) {
            const element = container.children[i];
            if (element.htmlElement) {
                element.visible = false;
                container.removeChild(element);
            } else if (element.active) {
                element.recycle();
            } else if (element.name == "container") {
                Game.clearContainer(element);
            } else {
                container.removeChild(element);
            }
        };
    };
    /**
     * Game类
     * @param {string} titleText 
     * @param {false} enableMouseOver 开启鼠标经过；
     * @param {stage.width} width 
     * @param {stage.height} height 
     * @param {0} stepWidth 
     * @param {0} stepHeight 
     */
    constructor(titleText, enableMouseOver = false, width = stage.width, height = stage.height, stepWidth = 0, stepHeight = 0) {
        super(null, 0, 0, width, height, 0, 0, false, false);
        this.titleText = titleText;
        this.instructionText = "说明内容";
        this.backgroundColor = null;
        this._enableMouseOver = enableMouseOver;
        this.mouseStart = new createjs.Point();
        this.mouseEnd = new createjs.Point();
        //游戏层
        this.floorLayer = this.createrContainer();
        this.playerLayer = this.createrContainer();
        this.enemyLayer = this.createrContainer();
        this.propLayer = this.createrContainer();
        //网格
        this.nodes = [];
        this.numCols = 0;
        this.numRows = 0;
        this.stepWidth = stepWidth;
        this.stepHeight = stepHeight;
        this._tempNode = new Node(-1, -1);
        //地图字符
        this.playerChars = Object.create(null);
        this.enemyChars = Object.create(null);
        this.propChars = Object.create(null);
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
        //背景音乐
        this.backSound = null;
        this.titleSound = null;
    }
    createrContainer(parent) {
        let c = new createjs.Container();
        c.name = "container";
        if (parent) parent.addChild(c);
        else this.container.addChild(c);
        return c;
    };

    /************************界面初始化*************************** */
    createTitleScreen() {
        this.titleScreen = new TitleScreen(this.titleText);
        let btn1 = this.titleScreen.createButton("start");
        btn1.x = stage.width - btn1.getBounds().width >> 1;
        btn1.y = canvas.height * 0.6;
        let btn2;
        if (!stage.isWebGL) {
            btn2 = this.titleScreen.createButton("游戏介绍", () => {
                stage.addChild(this.instructionScreen)
            });
        } else {
            btn2 = this.titleScreen.createDOMbutton("简介", () => {
                stage.addChild(this.instructionScreen)
            })
        }
        btn2.x = stage.width - btn2.getBounds().width >> 1;
        btn2.y = btn1.y + btn1.getBounds().height + 20;
    }
    createInstructionScreen() {
        this.instructionScreen = new BasicScreen();
        this.instructionScreen.createScreen("游戏介绍", this.instructionText, [
            {
                text: "cancel",
                onclick: () => {
                    stage.removeChild(this.instructionScreen);
                }
            }
        ], stage.width * .6)
        let b = this.instructionScreen.getBounds();
        this.instructionScreen.x = stage.width - b.width >> 1;
        this.instructionScreen.y = stage.height - b.height >> 1;
    }
    createLevelInScreen() {
        this.levelInScreen = new LevelInScreen();
    }
    createGameOverScreen() {
        this.gameOverScreen = new TitleScreen("game over");
        let btn1 = this.gameOverScreen.createButton("结束");
        btn1.x = stage.width - btn1.getBounds().width >> 1;
        btn1.y = canvas.height * 0.6;
    }
    createLevelOutScreen() {
        this.levelOutScreen = new TitleScreen("you win");
        let btn1 = this.levelOutScreen.createButton("再来一次");
        btn1.x = stage.width - btn1.getBounds().width >> 1;
        btn1.y = canvas.height * 0.6;
    }
    createPauseScreen() {
        this.pauseScreen = new TitleScreen("pause");
        this.pauseScreen.title.y = stage.height - this.pauseScreen.title.getBounds().height >> 1;
    }
    createScoreBoard() { }
    /***************************游戏开始状态************************ */
    newGame() { }
    newLevel() { }
    waitComplete() { }
    runGame() { }
    onTitleKeydown() { }
    onRunGameKeydown() { }
    clear() { }
    //levelIn结束
    _waitComplete() {
        if (this.levelInScreen) stage.removeChild(this.levelInScreen);
        if (this.scoreboard) stage.addChild(this.scoreboard);
        stage.addChild(this);
        stage.children.forEach(element => {
            if (element.htmlElement) {
                element.visible = true;
            }
        });
        if (this.backSound) this.backSound.play();
        if (!this._enableMouseOver) stage.enableMouseOver(0);
        if (this.backgroundColor) containerDiv.style.backgroundColor = this.backgroundColor;
        this.waitComplete();
    }
    //结束时立即清除
    _clearBefore() {
        if (this.backSound) this.backSound.stop();
        this.removeAllEventListeners("mousedown");
        stage.removeAllEventListeners("stagemousedown");
        stage.removeAllEventListeners("stagemouseup");
        stage.removeAllEventListeners("stagemousemove");
        this.clear();
    };
    _clearAfter() {
        stage.alpha = 1;
        createjs.Tween.removeAllTweens();
        if (!this._enableMouseOver) stage.enableMouseOver();
        //清除游戏内容元素
        Game.clearContainer(this.container);
        //清除舞台元素
        Game.clearContainer(stage);
        if (window.world) {
            var list = world.GetJointList();
            while (list.a) {
                world.DestroyJoint(list);
                list = list.GetNext();
            }
            list = world.GetBodyList();
            while (list.a) {
                world.DestroyBody(list);
                list = list.GetNext();
            }
            console.log("刚体数量" + world.GetBodyCount());
        }

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
        for (let i = layer.numChildren - 1; i >= 0; i--) {
            const element = layer.getChildAt(i);
            element.act();
        }
    }
    /**
     * 检测地图元素碰撞
     * @param {*} rect1 
     * @param {null} image 
     * @param {0} alphaThreshold 
     * @param {null} hitPropNode 
     * @returns node
     */
    hitMap(rect1, image, alphaThreshold = 0, hitPropNode) {
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
                if (node.type) {
                    if (!node.actor) {
                        if (node.type == Node.PROP) {
                            if (hitPropNode) hitPropNode(node);
                        } else {
                            return node;
                        }
                    } else {
                        if (!image || !(node.actor.image instanceof createjs.Sprite)) {
                            if (rect1.intersects(node.actor.rect)) {
                                if (node.type == Node.PROP) {
                                    if (hitPropNode) hitPropNode(node);
                                } else {
                                    return node;
                                }
                            }
                        } else {
                            let r = rect1.intersection(node.actor.rect);
                            if (r) {
                                let p = this.container.localToGlobal(r.x, r.y);
                                r.x = p.x;
                                r.y = p.y;
                                if (checkPixelCollision(image, node.actor.image, r, alphaThreshold)) {
                                    if (node.type == Node.PROP) {
                                        if (hitPropNode) hitPropNode(node);
                                    } else {
                                        return node;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    updateScore(key, val) {
        this.scoreboard.update(key, val);
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
        let s = this.contentSize;
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
    /**
     * 创建网格地图
     * @param {*} plan 关卡地图
     * @param {*} drawGrid 背景地图函数
     * @param {false} isIso 是否为二等角地图
     */
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
                        this.nodes[y][x].type = Node.PROP;
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
    /*********************************box2d*********************************** */
    containerDebugDraw() {
        this.superDraw(context)//this-->container
        context.scale(PTM, PTM);
        context.lineWidth /= PTM;
        drawAxes(context);
        world.DrawDebugData();
        let mj = EasyWorld.mouseJoint
        if (mj) {
            drawSegment1(mj.GetAnchorB(), mj.GetTarget(), "255,255,255");
        }
        // let p=this.parent;
        // if(p.isDrawing){
        //     drawSegment1(p.mouseStart, p.mouseEnd, "255,255,255");
        // }
    }
    updateWorld(e) {
        world.Step(e.delta / 1000, 10, 10);
        world.ClearForces();
        this.runGame();
    }
    dragBody(userData, maxForce = 20, isStrictDrag = false) {
        let mouseMove;
        stage.on("stagemousedown", (e) => {
            let p = this.container.globalToLocal(e.stageX, e.stageY)
            let drawbody = EasyWorld.getBodyAt(p.x, p.y);
            if (drawbody) {
                if (userData) {
                    if (drawbody.GetUserData() == userData) {
                        mouseMove = stage.on("stagemousemove", (e) => {
                            p = this.container.globalToLocal(e.stageX, e.stageY)
                            EasyWorld.drawBodyTo(drawbody, p.x, p.y, maxForce, isStrictDrag);
                        })
                    }
                } else {
                    mouseMove = stage.on("stagemousemove", (e) => {
                        p = this.container.globalToLocal(e.stageX, e.stageY);
                        EasyWorld.drawBodyTo(drawbody, p.x, p.y, maxForce, isStrictDrag);
                    })
                }
            }
        })
        stage.on("stagemouseup", () => {
            if (mouseMove) {
                EasyWorld.stopDragBody();
                stage.off("stagemousemove", mouseMove);
                mouseMove = null;
            }
        })
    }
    drawMouseMove(onMouseUp) {
        let mouseMove;
        stage.on("stagemousedown", (e) => {
            let p = this.container.globalToLocal(e.stageX, e.stageY)
            this.isDrawing = true;
            this.mouseStart.x = p.x / PTM;
            this.mouseStart.y = p.y / PTM;
            this.mouseEnd.x = this.mouseStart.x;
            this.mouseEnd.y = this.mouseStart.y;
            mouseMove = stage.on("stagemousemove", (e) => {
                p = this.container.globalToLocal(e.stageX, e.stageY)
                this.mouseEnd.x = p.x / PTM;
                this.mouseEnd.y = p.y / PTM;
            })
        });
        stage.on("stagemouseup", () => {
            stage.off("stagemousemove", mouseMove);
            this.isDrawing = false;
            if (onMouseUp) onMouseUp();
        })
    }
};

/**
 * **************************滚动游戏类 **************************************************
 */
class ScrollMapGame extends Game {
    constructor(titleText, enableMouseOver, width, height, stepWidth, stepHeight) {
        super(titleText, enableMouseOver, width, height, stepWidth, stepHeight);
        //滚动
        this.mapleft = 0;
        this.maptop = 0;
        this.mapright = this.width;
        this.mapbottom = this.height;
        this._scrollActor = this.player;
        this._marginw = this.width / 2;
        this._marginh = this.height / 2;
    }
    //屏幕滚动默认焦点游戏玩家
    scrollView() {
        this.mapleft = -this.scrollX;
        this.mapright = this.mapleft + this.width;
        this.maptop = -this.scrollY;
        this.mapbottom = this.maptop + this.height;
        if (this._scrollActor.x < this.mapleft + this._marginw) {
            this.scrollX = -this._scrollActor.x + this._marginw;
        } else if (this._scrollActor.x > this.mapright - this._marginw) {
            this.scrollX = -this._scrollActor.x - this._marginw + this.width;
        }
        if (this._scrollActor.y < this.maptop + this._marginh) {
            this.scrollY = Math.floor(-this._scrollActor.y + this._marginh);
        } else if (this._scrollActor.y > this.mapbottom - this._marginh) {
            this.scrollY = Math.floor(-this._scrollActor.y - this._marginh + this.height);
        }
    }
    //停止滚动
    stopScrollView() {
        let p = new createjs.Point();
        p.setValues(this._scrollActor.x, this._scrollActor.y);
        this._scrollActor = p;
    }
    /**
     * 设置焦点参数
     * @param {*} actor null不改变
     * @param {*} marginWidth null不改变
     * @param {*} marginHeight null不改变
     */
    setActorScroll(actor, marginWidth, marginHeight) {
        if (actor) this._scrollActor = actor;
        if (marginWidth) this._marginw = marginWidth;
        if (marginHeight) this._marginh = marginHeight
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
export { BasicScreen, TitleScreen, Okbutton, ScoreBoard, LoaderBar, Game, ScrollMapGame };