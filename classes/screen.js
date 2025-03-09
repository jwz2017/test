import { ShapeBackground } from "./other.js";
import { PushButton, mc } from "./mc.js";
import { gframe, stage } from "./gframe.js";
/*****************************************游戏界面**************************** */
class BasicScreen extends createjs.Container {
    //style
    static style = {
        textFont: "40px regul,Arial,宋体",
        titleFont: "bold 60px regul,Arial,宋体",
        scoreFont: "30px regul,Arial,宋体",
        levelInFont: "bold 40px 宋体",
        color: "#fff",
    };
    static setFont(obj, font = BasicScreen.style.textFont) {
        let ele = obj.htmlElement;
        ele.style.font = font;
        obj.setBounds(0, 0, ele.clientWidth, ele.clientHeight);
    }
    constructor() {
        super();
        this.backSound = null;
        this.on("added", this.onAdded);
        this.on("removed", this.onRemove);
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

    /**
     * 创建domeElement
     * @param {string} element 
     * @param {parentDiv} domParent =gameScaleDom
     * @returns createjs.DOMElement
     */
    createDom(element, domParent = gameScaleDom) {
        let e = document.createElement(element);
        e.style.visibility = "hidden";
        domParent.appendChild(e);
        let a = new createjs.DOMElement(e);
        this.addChild(a);
        // else this.children.push(a);//不随容器移动，但随容器加入和删除
        return a;
    }

    /**
     * 创建dom文本
     * @param {string} text 
     * @param {string} font =BasicScreen.style.textFont
     * @param {string} color =BasicScreen.style.color
     * @param {parentDiv} domParent =gameScaleDom
     * @returns 
     */
    createText(text, font = BasicScreen.style.textFont, color = BasicScreen.style.color, domParent) {
        let txt = this.createDom("span", domParent);
        let ele = txt.htmlElement;
        ele.innerHTML = text;
        ele.style.userSelect = "none";
        ele.style.color = color
        BasicScreen.setFont(txt, font);
        return txt;
    }
}
class TitleScreen extends BasicScreen {
    constructor(titleText) {
        super()
        if (titleText instanceof createjs.DisplayObject) {
            this.title = titleText;
            this.addChild(this.title);
        } else if (titleText) {
            this.title = this.createText(titleText, BasicScreen.style.titleFont);
        }
        this.title.x = canvas.width - this.title.getBounds().width >> 1;
        this.title.y = canvas.height / 3 + 20;
    }
    createButton(text, onclick = () => {
        this.dispatchEvent(gframe.OKBUTTON, true);
    }) {
        let btn;
        if (!stage.isWebGL) {
            btn = new PushButton(this, text, onclick, 0, 0, 250, 60, new mc.RoundRect(30));
        } else {
            btn = this.createDOMbutton(text, onclick);
        }
        return btn;
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
class ScoreBoard extends BasicScreen {
    static HMODE = "hmodescore";
    static VMODE = "vmodescore"
    constructor({ mode = ScoreBoard.HMODE, offX = 200, offY = 50, rowNum = 3 } = {}) {
        super();
        this._textElements = new Map();
        this.i = -1;
        this.rowNum = rowNum;
        this.mode = mode;
        this.offX = offX;
        this.offY = offY;
    }
    createTextElement(key, val, xpos = 0, ypos = 0, { titleImg, font = BasicScreen.style.scoreFont, color = BasicScreen.style.color, borderFont, offX = 0, valueType = "span", width = 150, height = 50, max = 5 } = {}) {
        let c = this.createDom('div');
        let style = c.htmlElement.style;
        style.font = font;
        style.color = color;
        style.display = "flex";
        style.alignItems = "center";
        if (borderFont) style.border = borderFont;
        this.addChild(c);
        if (xpos || ypos) {
            c.x = xpos;
            c.y = ypos;
        } else if (this.mode == ScoreBoard.VMODE) {
            this.i++;
            c.x = (this.i / this.rowNum | 0) * this.offX + offX;
            c.y = this.i % this.rowNum * this.offY;
        } else if (this.mode == ScoreBoard.HMODE) {
            this.i++;
            c.x = this.i % this.rowNum * this.offX + offX;
            c.y = (this.i / this.rowNum | 0) * this.offY;
        }
        let title;
        if (titleImg) {
            title = titleImg;
        } else {
            title = document.createElement('span');
            title.innerHTML = key + " :";
        }
        c.htmlElement.appendChild(title);

        let value = document.createElement(valueType);
        value.innerHTML = val || 0;
        value.style.marginLeft = "8px";
        c.htmlElement.appendChild(value);
        if (valueType == "meter") {
            value.value = val || 0;
            value.max = max;
            value.min = 0;
            value.style.width = width + "px";
            value.style.height = height + "px";
        }
        this._textElements.set(key, value);
        c.setBounds(0, 0, c.htmlElement.clientWidth, c.htmlElement.clientHeight);
        return c;
    }
    update(label, val) {
        let v = this._textElements.get(label);
        if (v.tagName == "METER") {
            v.value = val;
        }
        else if (v) {
            v.innerHTML = val;
        }
    }
}
class InstructionScreen extends BasicScreen {
    constructor(title, content, actions, width, height) {
        super();
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
    }
}
class LevelInScreen extends ScoreBoard {
    constructor() {
        super();
        let div = this.createTextElement(gframe.LevelInLevel, 0, 0, 0, { font: BasicScreen.style.levelInFont });
        let b = div.getBounds();
        div.x = stage.width - b.width >> 1;
        div.y = stage.height - b.height >> 1;

        if (!stage.isWebGL) {
            this.bg = new ShapeBackground(stage.width / 2, stage.height / 2);
            this.addChild(this.bg);
        }
    }
    onRemove() {
        super.onRemove();
        if (!stage.isWebGL) {
            this.bg.clearBg();
            stage.autoClear = true;
            createjs.Ticker.off("tick", this.t)
        }
    }
    onAdded() {
        super.onAdded();
        if (!stage.isWebGL) {
            stage.autoClear = false;
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
    createTitle(titleText, width) {
        this.title = this.createText(titleText, BasicScreen.style.titleFont);
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
class Fps extends BasicScreen {
    constructor(parentDom) {
        super();
        this.fps = this.createText("", Fps.style.scoreFont, "#f00", parentDom)
    }
    onAdded() {
        this.fps.visible = true;
        this.tickEvent = createjs.Ticker.on("tick", () => {
            this.fps.htmlElement.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps";
        });
    }
    onRemove() {
        this.fps.visible = false;
        createjs.Ticker.off("tick", this.tickEvent)
    }

}
export { BasicScreen, TitleScreen, InstructionScreen, ScoreBoard, LevelInScreen, LoaderBar, Fps }