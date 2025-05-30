import { BasicScreen } from "../../classes/screen.js";
import {Game} from "../../classes/Game.js";
import { stage, queue, lib } from "../../classes/gframe.js";
export class LoadBitmap extends Game {
    static backgroundColor="#555";
    static loadItem = [
        {
            id: "spritesheet_button",
            src: "easelJs/spritesheet_button.png",
            type: "image"
        }, 
        {
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
        super("资源加载01");

        /** *****************************************************************************************
         * 滤镜
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

        /** ******************************************animate库加载 ***************************************************************
         * 
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

        /*******************************************dom加入到animate******************************************************
         * 
         */
        this.pop=new BasicScreen();
        let pop=new lib.Pop();
        this.pop.addChild(pop);
        let input=this.pop.createDom("input");
        pop.win.con.addChild(input);
        this.pop.children.push(input);
        input.htmlElement.placeholder="请输入姓名";
        input.htmlElement.type="text";
        this.pop.y = 150;
        this.pop.x = 53;
        pop.win.btn.cursor = "pointer";
        pop.win.btn.on("click", () => {
            pop.gotoAndStop(0);
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
        this.button2 = new createjs.Sprite(buttonss, "out");
        // this.button2.scale=0.5;
        this.button2.set({ x: 400, y: 550 });
        var button2Helper = new createjs.ButtonHelper(this.button2);
        this.button2.addEventListener('click', () => {
            button2Helper.enabled = !button2Helper.enabled;
            this.button2.alpha = 0.5 + button2Helper.enabled * 0.5;
            if(button2Helper.enabled){
                stage.addChild(this.pop);
                pop.gotoAndPlay(1);
            }
        })
        stage.addChild(this.button1, this.button01, this.button, this.button2, this.ma);
    }
    waitComplete(){
        stage.enableMouseOver()
    }
}


