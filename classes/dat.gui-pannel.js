import { Box2dGame } from "./Game.js";
import { BasicScreen, Fps } from "./screen.js";

export class Pannel extends BasicScreen {
    static guiProps={
        主题音乐: false,
        主题音量: 0.5,
        背景音乐: true,
        背景音量: 0.5,
        fps: false,
    };
    constructor(xpos=70,ypos=15){
        super();
        this.createPannel();
        this.x=xpos;
        this.y=ypos;
    }
    createPannel() {
        let fps = new Fps();
        dat.GUI.TEXT_OPEN = "选项设置";
        dat.GUI.TEXT_CLOSED = "关闭";
        // let gui = new dat.GUI({autoPlace: false, closeOnTop: true });
        let gui = new dat.GUI({ width: 70, autoPlace: false, closeOnTop: true });
        // containerDiv.appendChild(gui.domElement);
        // gui.domElement.style.position = "absolute";
        // gui.domElement.style.bottom = "24px";
        // gui.domElement.style.fontSize="24px"
        
        gameScaleDom.appendChild(gui.domElement);
        gui.domElement.style.visibility="hidden";
        let a=new createjs.DOMElement(gui.domElement);
        this.addChild(a);
        gui.closed = true;
        gui.__closeButton.onclick = () => {
            if (gui.closed) {
                gui.width = 70;
            }
            else {
                gui.width = 245
            }
        }
        //背景音乐
        gui.add(Pannel.guiProps, "背景音乐").onChange((val) => {
            if (this.game.backSound) this.game.backSound.muted = !val;
        });
        gui.add(Pannel.guiProps, "背景音量", 0, 1).onChange((val) => {
            if (this.game.backSound) this.game.backSound.volume = val;
        });
        //fps
        gui.add(Pannel.guiProps, "fps").onChange((val) => {
            if (val) this.game.addChild(fps)
            else this.game.removeChild(fps);
        });
        //box2d debug
        var f1 = gui.addFolder("box2d debug");
        f1.add(Box2dGame.guiProps, "drawShapes").onChange(Box2dGame.updateWorldFromDebugDrawCheckboxes);
        f1.add(Box2dGame.guiProps, "drawJoints").onChange(Box2dGame.updateWorldFromDebugDrawCheckboxes);
        f1.add(Box2dGame.guiProps, "drawAABBs").onChange(Box2dGame.updateWorldFromDebugDrawCheckboxes);
        f1.add(Box2dGame.guiProps, "drawTransforms").onChange(Box2dGame.updateWorldFromDebugDrawCheckboxes);
    };
}