import { Game, ScoreBoard } from "../../classes/Game.js";
import { gframe, stage, queue, lib } from "../../classes/gframe.js";
var spriteSheet1;
export class LoadBitmap extends Game {
    static loadItem = [
        {
            id: "spritesheet_button",
            src: "images/spritesheet_button.png",
            type: "image"
        }, {
            id: "loadspritedata",
            src: "fakezee/fakezee.json",
            type: "spritesheet"
        }
        , {
            src: "loadsprite/ma.js",
            type: "javascript"
        }
    ];
    static loadId = 'A81D833FE7C7754FB5395FF7A6EFA6E1';
    constructor() {
        spriteSheet1 = queue.getResult("loadspritedata");
        super("资源加载01");
        this.titleScreen = new lib.Title();
        this.instructionScreen.title.text = "1:图片预加载\r2:九宫格使用\r3:animate库加载\r4:animate制作sprite\r5:dom加入到舞台\r6:dom加入到animate\r7:位图字体\r8:sprite animation随机播放速度";

        /** *******************************************预加载图片**********************************************
         * 直接使用地址  queue()设置false后和getResult等同
         */
        this.button1 = new createjs.Bitmap(queue.getResult("Button")); //未经预加载直接使用地址，不能获取this.button1.image.width
        var drawingCanvas = new createjs.Shape();
        drawingCanvas.graphics.beginLinearGradientFill(["#ffff", "#fff0"], [0.5, 0.5], 0, 0, this.button1.image.width, this.button1.image.height).drawRect(0, 0, this.button1.image.width, this.button1.image.height)
        drawingCanvas.cache(0, 0, this.button1.image.width, this.button1.image.height);
        var maskFilter = new createjs.AlphaMaskFilter(drawingCanvas.cacheCanvas);
        this.button1.filters = [maskFilter];
        this.button1.cache(0, 0, this.button1.image.width, this.button1.image.height)
        this.button1.scale = 1;
        this.button1.cursor = "pointer";
        /***********************************************九宫格使用********************************************************
         * 
         */
        this.button = new createjs.ScaleBitmap(queue.getResult('Button'), new createjs.Rectangle(80, 25, 6, 6));
        this.button.setDrawSize(280, 56);
        this.button.x = 100;

        /** ******************************************animate库加载 ***************************************************************
         * fly和index.html在同一目录
         */
        this.button01 = new lib.Button;
        this.button01.cursor = "pointer";
        this.button01.x = 400;
        //  * 加载声音后不需要注册，未加载需要 createjs.Sound.registerSound("sound.mp3", "soundId", 4);
        //  * 加载lib里设置data:"1"：一个声音只能再一个通道里播放。
        //  * interrupt   点击重新播放
        //  * sound是AbstractSoundInstance类，是具体的声音控制

        /********************************************animate制作sprite*********************************************
         * 
         */
        this.ma = new ma();
        this.ma.y = 100;
        console.log(this.ma.getBounds());

        /*******************************************dom加入到animate******************************************************
         * 
         */
        this.nameInput = document.getElementById("inputText");
        this.nameInpuElement = new createjs.DOMElement(this.nameInput);
        this.pop = new lib.Pop();
        this.pop.win.con.addChild(this.nameInpuElement);
        this.pop.y = 150;
        this.pop.x = 53;
        this.pop.win.btn.cursor = "pointer";
        this.pop.on("added", () => {
            this.nameInput.style.visibility = "visible";
            this.nameInpuElement.visible = true;
        })
        this.pop.on("removed", () => {
            console.log("d");
            this.nameInput._oldStage = null;
            this.nameInput.style.visibility = "hidden";
            this.nameInpuElement.visible = false;
        })
        this.pop.win.btn.on("click", () => {
            this.pop.gotoAndStop(0);
            stage.removeChild(this.pop);
        })
        var buttonss = new createjs.SpriteSheet({
            images: [queue.getResult("spritesheet_button")],
            frames: {
                width: 300,
                height: 100
            },
            animations: { out: 0, over: 1, down: 2 }
        });
        this.button2 = new createjs.Sprite(buttonss, "up");
        // this.button2.scale=0.5;
        this.button2.set({ x: 400, y: 550 });
        var button2Helper = new createjs.ButtonHelper(this.button2);
        this.button2.addEventListener('click', () => {
            button2Helper.enabled = !button2Helper.enabled;
            // this.button2.mouseEnabled=button2Helper.enabled;
            stage.addChild(this.pop);
            this.pop.gotoAndPlay(1);
            if (this.button2.alpha == 1) {
                stage.removeChild(this.a);
            }
            else {
                stage.addChild(this.a)
            }
            this.button2.alpha = 0.5 + button2Helper.enabled * 0.5;
        })
    }
    waitComplete() {
        super.waitComplete();
        this.a = new ScoreBoard(0, 300, true);
        this.a.createTextElement("ddd", 0);
        this.a.createTextElement("ddd", 0);
        this.a.createTextElement("ddd", 0);
        this.a.createTextElement("ddd", 0);
        this.a.createTextElement("ddd", 0);
        stage.addChild(this.a);
        stage.addChild(this.button1, this.button01, this.button, this.button2, this.ma, this.scoreboard);
    }
}

