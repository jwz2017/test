(function () {
    "use strict";
    //游戏变量;定义。。构造内初始化，new game初始化
    var score = 0;
    const SCORE = "Score";
    class LoadBitmap extends Game {
        static loadItem = [{
            id: "scorebg",
            src: "images/scorebg.png"
        }, {
            id: "spritesheet_button",
            src: "images/spritesheet_button.png"
        }, {
            id: "loadspritedata",
            src: "fakezee/fakezee.json",
            type: "spritesheet"
        }, {
            id: "mapic",
            src: "loadsprite/ma.png"
        }];
        static loadId = 'A81D833FE7C7754FB5395FF7A6EFA6E1';
        constructor() {
            super("资源加载01");
            // this.titleScreen=new lib.Title();
            this.instructionScreen.title.text="1:图片预加载\r2:九宫格使用\r3:animate库加载\r4:animate制作sprite\r5:dom加入到舞台\r6:dom加入到animate\r7:位图字体\r8:sprite animation随机播放速度";

            /** *******************************************预加载图片**********************************************
             * 直接使用地址  queue()设置false后和getResult等同
             * container使用queue,不能clone
             */
            this.button1 = new createjs.Bitmap(queue.getResult("Button")); //未经预加载直接使用地址，不能获取this.button1.image.width
            var drawingCanvas = new createjs.Shape();
            drawingCanvas.graphics.beginLinearGradientFill(["#ffff", "#fff0"], [0.5, 0.5], 0, 0, this.button1.image.width, this.button1.image.height).drawRect(0, 0, this.button1.image.width, this.button1.image.height)
            drawingCanvas.cache(0, 0, this.button1.image.width, this.button1.image.height);
            var maskFilter = new createjs.AlphaMaskFilter(drawingCanvas.cacheCanvas);
            this.button1.filters = [maskFilter];
            this.button1.cache(0, 0, this.button1.image.width, this.button1.image.height)
            this.button1.scaleX = this.button1.scaleY = 0.5;
            this.button1.cursor = "pointer";
            this.button1.addEventListener('click', () => {
                createjs.Sound.play('p', {
                    interrupt: createjs.Sound.INTERRUPT_ANY
                });
            });
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


            /*******************************************dom加入到舞台*******************************************************
             * 
             */
            this.textTxt = document.getElementById("testTxt");
            this.domElement = new createjs.DOMElement(this.textTxt);
            this.domElement.x = 600;
            this.domElement.y = 250;
            this.domElement.regX = 100;
            this.domElement.regY = 100;

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
            this.pop.on("add",()=>{
                this.nameInpuElement.visible=true;
            })
            this.pop.win.btn.on("click", () => {
                this.pop.gotoAndStop(0);
                stage.removeChild(this.pop);
                this.nameInput.style.display="none";
            })
            var buttonss = new createjs.SpriteSheet({
                images: [queue.getResult("spritesheet_button")],
                frames: {
                    width: 300,
                    height:100
                },
                animations:{out:0,over:1,down:2}
            });
            this.button2=new createjs.Sprite(buttonss,"up");
            // this.button2.scale=0.5;
            this.button2.set({x:400,y:550});
            var button2Helper=new createjs.ButtonHelper(this.button2);
            this.button2.addEventListener('click',()=>{
                button2Helper.enabled=!button2Helper.enabled;
                this.button2.alpha=0.5+button2Helper.enabled*0.5;
                // this.button2.mouseEnabled=button2Helper.enabled;
                stage.addChild(this.pop);
                this.nameInput.style.display="block";
                this.pop.gotoAndPlay(1);
            })
        }
        newGame() {

        }
        waitComplete() {
            this.textTxt.style.display = "block";
            stage.addChild(this.button1, this.button01, this.button, this.button2, this.domElement,  this.ma, this.scoreBoard);

            /*******************************sprite animation随机播放速度********************************************
             * 
             */
            let xpos = 300,
                ypos = 107,
                hgap = 60;
            // spriteSheet = new createjs.SpriteSheet(queue.getResult('loadspritedata'));
            for (let i = 0; i < 6; i++) {
                const die = new createjs.Sprite(queue.getResult('loadspritedata'), 'die');
                die.paused = true;
                die.name = "die" + i;
                die.regX = die.getBounds().width / 2;
                die.regY = die.getBounds().height / 2;
                die.x = xpos;
                die.y = ypos;
                xpos += hgap;
                stage.addChild(die);
            }
            this.button01.on('click', function click() {
                this.mouseEnabled = false;
                this.alpha = 0.5;
                for (let i = 0; i < 6; i++) {
                    const die = stage.getChildByName('die' + i);
                    die.framerate = Math.floor(Math.random() * 20) + 20;
                    die.advance(3000); //随机数字
                    die.play();
                }
                setTimeout(() => { //1000ms后执行
                    for (let i = 0; i < 6; i++) {
                        const die = stage.getChildByName('die' + i);
                        die.stop();
                        console.log(Math.floor(die.currentAnimationFrame)); //获取当前帧
                        //currentFrame     currentAnimation
                    }
                    this.alpha = 1; //this指向pushputtonshape ()=>指向loadsprite
                    this.mouseEnabled = true;
                }, 1000);
            }, this.button01)
        }
        runGame() {
            // this.domElement.rotation+=1;
            score++;
            this.scoreBoard.update(SCORE, score);
        }
        clear() {
            this.nameInput.style.display = "none";
            this.textTxt.style.display = "none";
        }
        /***************************************分数板位图字体***************************************************
         * 
         */
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard(0, height - GFrame.style.SCOREBOARD_HEIGHT);
            this.scoreBoard.createTextElement(SCORE, '0%', 10, 10, {
                spriteSheet: queue.getResult("loaderbarData")
            });
        }

    }
    
    window.LoadBitmap = LoadBitmap;
    class LoaderBar1 extends LoaderBar {
        constructor(pos) {
            super(pos);
        }
        init() {
            var item = [{
                id: "loaderbarData",
                src: "fonts/loaderbar.json",
                type: "spritesheet"
            },{
                id:"spritesheet_sparkle",
                src:"images/spritesheet_sparkle.png"
            }];
            queue.loadManifest(item);
            queue.on('fileload', (e) => {
                if (e.item.id=="loaderbarData") {
                    var spritesheet = e.result;
                    this.title = new createjs.Sprite(spritesheet, "title");
                    this.title.regX = this.title.getBounds().width / 2;
                    this.title.y = -this.title.getBounds().height;
    
                    this.percent = new createjs.BitmapText('0%', spritesheet);
                    this.percent.regX = this.percent.getBounds().width / 2;
                    this.percent.x = this.barWidth / 2;
                    this.percent.y = this.barHeight + 10;
                    this.addChild(this.title, this.percent);
                }else if(e.item.id=="spritesheet_sparkle"){
                    var effectData={
                        images:[e.result],
                        frames:{
                            width:21,
                            height:23,
                            regX:10,
                            regY:11
                        }
                    }
                    this.sparkle=new Sparkles(effectData,200);
                    this.addChild(this.sparkle);
                }
            });
        }
        startLoad(e) {
            super.startLoad(e);
            this.title.x = e.progress * this.barWidth;
            this.sparkle.addSparkles(Math.random()*20+10|0,e.progress*this.barWidth,this.barHeight,0.1);
            if (e.progress==1) {
                this.sparkle.clear();
                this.removeChild(this.sparkle);
            }
        }
    }
    LoadBitmap.Loaderbar = LoaderBar1;

})();