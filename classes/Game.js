import { gframe, stage } from "./gframe.js";
import { ScrollContainer } from "./mc.js";
import { checkPixelCollision } from "./hitTest.js";
import { BasicScreen, TitleScreen, LevelInScreen, LoaderBar, InstructionScreen } from "./screen.js";

/**
 * 网格节点
 */
class Node {
    static WALKABLE = "walkable";
    static NOWALKABLE = "nowalkable";
    static PROP = "prop";
    static DEATH = "death";
    constructor(xpos, ypos, { type, actor, costMultiplier = 1 } = {}) {
        this.x = xpos;
        this.y = ypos;
        this.type = type;
        this.actor = actor;
        this.costMultiplier = costMultiplier;
    }
}

/***************************************游戏基类****************************** */
class Game extends ScrollContainer {
    static backgroundColor = "#000";//游戏背景颜色
    static LoaderBar = LoaderBar;
    // static loadBarItem = null;
    static loadItem = null;
    static loadId = null;
    static loadBarItem = [{
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

    /**
     * Game类
     * @param {string} titleText 
     * @param {stage.width} width 
     * @param {stage.height} height 
     */
    constructor(titleText, width = stage.width, height = stage.height) {
        super(null, 0, 0, width, height, 0, 0, false, false);
        this.titleText = titleText;
        this.instructionText = "说明内容";
        //游戏层
        this.floorLayer = gframe.createrContainer(this.container);
        this.playerLayer = gframe.createrContainer(this.container);
        this.enemyLayer = gframe.createrContainer(this.container);
        this.propLayer = gframe.createrContainer(this.container);
        //网格
        this.nodes = [];
        this._tempNode = new Node(-1, -1);
        this.playerChars=Object.create(null);
        this.propChars=Object.create(null);
        this.enemyChars=Object.create(null);
        //游戏属性
        this.gameOver = false;
        this.levelUp = false;
        this.maxLevel = 1;
        this.level = 0;
        this.score = 0;
        this.lives = 3;
        //背景音乐
        this.backSound = null;
    }
    /************************界面初始化*************************** */
    createTitleScreen() {
        this.titleScreen = new TitleScreen(this.titleText);
        let btn1 = this.titleScreen.createButton("start");
        btn1.x = stage.width - btn1.getBounds().width >> 1;
        btn1.y = canvas.height * 0.6;
        let btn2 = this.titleScreen.createButton("简介", () => {
            stage.addChild(this.instructionScreen);
        })
        btn2.x = stage.width - btn2.getBounds().width >> 1;
        btn2.y = btn1.y + btn1.getBounds().height + 20;
    }
    createInstructionScreen() {
        this.instructionScreen = new InstructionScreen("游戏介绍", this.instructionText, [
            {
                text: "cancel",
                onclick: () => {
                    stage.removeChild(this.instructionScreen);
                }
            }
        ], stage.width * .8);
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
    /***************************游戏开始状态************************ */
    createScoreBoard() { }
    newGame() { }
    newLevel() { }
    waitComplete() { }
    runGame() { }
    onTitleKeydown() { }
    onRunGameKeydown() { }
    clear() { }
    /***************************游戏运行时相关方法************* */
    //结束时立即清除
    _clearBefore() {
        if (this.backSound) this.backSound.stop();
        this.removeAllEventListeners("mousedown");
        stage.removeAllEventListeners("stagemousedown");
        stage.removeAllEventListeners("stagemouseup");
        stage.removeAllEventListeners("stagemousemove");
        this.clear();
        createjs.Tween.removeAllTweens();
    };
    //过场过后清理
    _clearAfter() {
        stage.alpha = 1;
        //清除游戏内容元素
        gframe.clearContainer(this.container);
        //清除舞台元素
        gframe.clearContainer(stage);
    }
    //检查层内是否还有相关类型元素
    hasTypeOnContainer(actorType, container) {
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
   * 与其它元素碰撞
   * @param {*} actors 
   * @param {rectangle} rect=this.rect
   * @param {boolean} pixl=false
   * @param {0} alphaThreshold 象素透明度
   * @returns 
   */
    hitActors(actor, actors, actorRect = null, pixl = false, alphaThreshold = 0) {
        let rect = actorRect || actor.rect;
        for (var i = 0; i < actors.length; i++) {
            var other = actors[i];
            if ((other == actor) || !other.active) {
                continue;
            }
            let hit = this.hitActor(actor, other, rect, pixl, alphaThreshold);
            if (hit) return hit;
        }
    }
    hitActor(actor, other, actorRect = null, pixl = false, alphaThreshold = 0) {
        let rect = actorRect || actor.rect;
        if (!pixl || (other.image instanceof createjs.Shape) || (actor.image instanceof createjs.Shape)) {
            if (rect.intersects(other.rect)) return other;
        } else {
            let r = rect.intersection(other.rect);
            if (r) {
                let p = this.container.localToGlobal(r.x, r.y);
                r.x = p.x;
                r.y = p.y;
                if (checkPixelCollision(actor.image, other.image, r, alphaThreshold)) {
                    return other
                }
            }
        }
    }
    /**
     * 两个球体碰撞或球与点的碰撞
     * @param {*} obj1 
     * @param {*} obj2
     * @returns 
     */
    hitRadius(obj1, obj2) {
        let otherHit = obj2.hit || 0;
        if (obj1.x - obj1.hit > obj2.x + otherHit) {
            return;
        }
        if (obj1.x + obj1.hit < obj2.x - otherHit) {
            return;
        }
        if (obj1.y - obj1.hit > obj2.y + otherHit) {
            return;
        }
        if (obj1.y + obj1.hit < obj2.y - otherHit) {
            return
        }
        return obj1.hit + otherHit > Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
    }

    checkBounds(actor, noBottom) {
        if (actor.edgeBehavior == "wrap") {
            this.placeInBounds(actor);
        } else if (actor.edgeBehavior == "bounce") {
            this.rebounds(actor, noBottom);

        } else if (actor.edgeBehavior == "recycle") {
            if (this.outOfBounds(actor.rect)) {
                actor.recycle();

            }
        }
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
    outOfBounds(rect) {
        let s = this.contentSize;
        return rect.x + rect.width < 0 || rect.x > s.width || rect.y + rect.height < 0 || rect.y > s.height;
    }
    /**
     * 屏幕反弹
     * @param {*} actor 
     * @param {true} noBottom  是否底部反弹
     */
    rebounds(actor, noBottom) {
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
        } else if (rect.y + rect.height > s.height && !noBottom) {
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
    createNode(x, y, type) {
        return this.nodes[x][y] = new Node(x, y, { type: type });
    }
    clearNode(x, y) {
        this.nodes[x][y] = null;
    }
    /**
     * 创建网格地图
     * @param {*} plan 关卡地图
     * @param {*} drawGrid 背景地图函数
     * @param {false} isIso 是否为二等角地图
     */
    createGridMap(plan,stepWidth,stepHeight, drawGrid,isIso = false) {
        this.nodes = [];
        this.stepWidth=stepWidth;
        this.stepHeight=stepHeight;
        let numCols=plan[0].length,
        numRows=plan.length;
        for (let x = 0; x < numCols; x++) {
            this.nodes[x] = [];
            for (let y = 0; y < numRows; y++) {
                this.nodes[x].length++;
                const ch = plan[y][x],
                    Act = this.playerChars[ch] || this.propChars[ch] || this.enemyChars[ch];
                if (Act) {
                    let a = new Act(x * this.stepWidth, y * this.stepHeight, ch);
                    switch (Act) {
                        case this.playerChars[ch]:
                            this.playerLayer.addChild(a);
                            if (a.type === "player") {
                                this.player = a;
                            }
                            break;
                        case this.propChars[ch]:
                            this.propLayer.addChild(a);
                            let node = this.createNode(x, y, Node.PROP);
                            node.actor = a;
                            break;
                        case this.enemyChars[ch]:
                            this.enemyLayer.addChild(a);
                            break;
                    }
                }
                drawGrid(ch, x, y);
            }
        }
        if (isIso) {
            //等角地图深度排序
            this.sortDepth();
            //设置地图大小
            let w1 = numCols * this.stepWidth + numRows * this.stepHeight;
            this.contentSize = {
                width: w1,
                height: w1 / 2
            }
            this.container.x = this.width / 2;
            this.container.y = this.stepHeight / 2;
            this.floorLayer.cache(-this.contentSize.width / 2, -this.stepHeight / 2, this.contentSize.width, this.contentSize.height);
        } else {
            this.contentSize = {
                width: numCols * this.stepWidth,
                height: numRows * this.stepHeight
            }
            this.floorLayer.cache(0, 0, this.contentSize.width, this.contentSize.height)
        }
    };

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
        if (xStart < 0 || xEnd > this.nodes.length || yStart < 0) {
            this._tempNode.type = Node.NOWALKABLE;
            return this._tempNode;
        } else if (yEnd > this.nodes[0].length) {
            this._tempNode.type = Node.DEATH;
            return this._tempNode;
        }
        for (var y = yStart; y < yEnd; y++) {
            for (var x = xStart; x < xEnd; x++) {
                let node = this.nodes[x][y];
                // if (node) {
                if (node && node.type != Node.WALKABLE) {
                    if (!node.actor) {
                        return node
                    } else {
                        if (!image || (node.actor.image instanceof createjs.Shape)) {
                            if (rect1.intersects(node.actor.rect)) {
                                if (node.type == Node.PROP) {
                                    if (hitPropNode) { hitPropNode(node); }
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
                if (tempNode.x + colList[i] >= 0 && (tempNode.x + colList[i]) < this.nodes.length
                    && tempNode.y + rowList[i] >= 0 && (tempNode.y + rowList[i]) < this.nodes[0].length) {

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

    setNodeType(x, y, value) {
        this.nodes[x][y].type = value;
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

};

/**
 * **************************滚动游戏类 **************************************************
 */
class ScrollMapGame extends Game {
    constructor(titleText, width, height) {
        super(titleText, width, height);
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
        let xpos = this._scrollActor.x,
            ypos = this._scrollActor.y;
        if (xpos < this.mapleft + this._marginw) {
            this.scrollX = -xpos + this._marginw;
        } else if (xpos > this.mapright - this._marginw) {
            this.scrollX = -xpos - this._marginw + this.width;
        }
        if (ypos < this.maptop + this._marginh) {
            this.scrollY = -ypos + this._marginh;
        } else if (ypos > this.mapbottom - this._marginh) {
            this.scrollY = -ypos - this._marginh + this.height;
        }
    }
    //停止滚动
    stopScrollView() {
        this._scrollActor = new createjs.Point(this._scrollActor.x, this._scrollActor.y);
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
    /**
     * 检测是否出屏幕
     * @param {*} rect 
     * @returns boolean
    */
    outOfBounds(rect) {
        return rect.x + rect.width < this.mapleft || rect.x > this.mapright || rect.y + rect.height < this.maptop || rect.y > this.mapbottom;
    }
}
/*********************************box2d*********************************** */

var e_shapeBit = 0x0001, e_jointBit = 0x0002, e_aabbBit = 0x0004, e_pairBit = 0x0008, e_centerOfMassBit = 0x0010;
class Box2dGame extends ScrollMapGame {
    static guiProps = {
        drawShapes: true,
        drawJoints: true,
        drawAABBs: false,
        drawTransforms: false
    };
    static updateWorldFromDebugDrawCheckboxes = function () {
        var flags = 0;
        if (Box2dGame.guiProps.drawShapes)
            flags |= e_shapeBit;
        if (Box2dGame.guiProps.drawJoints)
            flags |= e_jointBit;
        if (Box2dGame.guiProps.drawAABBs)
            flags |= e_aabbBit;
        // if (Box2dGame.guiProps.drawPairs )
        //     flags |= e_pairBit;
        if (Box2dGame.guiProps.drawTransforms)
            flags |= e_centerOfMassBit;
        if (window.debugDraw) debugDraw.SetFlags(flags);
    };
    constructor(titleText, isDebug = true, gravity = 10, width, height) {
        super(titleText, width, height);
        this._buildWorld(isDebug, gravity);
        this.mouseStart = new b2Vec2();
        this.mouseEnd = new b2Vec2();
    }

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
    }

    /**
     * 创建box2d世界
     * @param {true} isDebug
     * @param {10} gravity 
     */
    _buildWorld(isDebug = true, gravity = 10) {
        world = new b2World(new b2Vec2(0, gravity));
        context = stage.canvas.getContext("2d")
        if (isDebug) {
            this.container.superDraw = this.container.draw;
            this.container.draw = this.containerDebugDraw

            debugDraw = getCanvasDebugDraw();
            // debugDraw.SetFlags(e_shapeBit);
            Box2dGame.updateWorldFromDebugDrawCheckboxes();
            world.SetDebugDraw(debugDraw);

        }
    };

    _clearAfter() {
        super._clearAfter();
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

    runGame(e) {
        world.Step(e.delta / 1000, 10, 10);
        world.ClearForces();

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
}
export { Node, Game, ScrollMapGame, Box2dGame };