window.onload = function () {
    "use strict";
    /*************游戏入口*****/
    var g = new GFrame('canvas');
    g.preload(Jump);
    g.startFPS();
};
(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "score",
        LEVEL = "level";
    var spriteSheet,
        actorChars,
        bullets,
        step = 30,
        winWidth = 750,
        winHeight = 400,
        mapContainer = new GridsMap(0, 0, winWidth, winHeight, step, step),
        plans = [
            [
                "                      v      |         x",
                "                                        ",
                "                                        ",
                "  x             = x                     ",
                "  x       o  o                    o     ",
                "  x b @  xxxxxxx  xxxxxxxxxxxxxxxxxxx   ",
                "  xxxxx            x                    ",
                "         !!!!!!!!x                      ",
                "         xxxxxxxxx                      ",
                "      x                                 ",
                "       x                                ",
                "         x                              ",
                "        x                               ",
                "      x                                 ",
                "                                        ",
                "     xxxxx                              ",
                "     xxxxx                              ",
                "     xxxxx                              ",
                "     xxxxx                              ",
                "     xxxxx                              ",
                "x    xxxxx                              "
            ],
            [
                "                             |                        ",
                "                                                      ",
                "                 x   =       x                        ",
                "  x       o                                           ",
                "  x          o                    o                   ",
                "  x  @   xxxxxx  x xx  xx  xxx  x xxxxxxxxxxxxxxxx    ",
                "  xxxxx           x                                   ",
                "      x!!!!!!!!!!!x           xxxxxxxxxx              ",
                "      xxxxxxxxxxxxx                                   ",
                "                                                      "
            ]
        ];

    class Jump extends Game {
        static loadItem = [{
            id: "woody_0",
            src: "jump/woody_0.png"
        }, {
            id: "woody_1",
            src: "jump/woody_1.png"
        }, {
            id: "woody_2",
            src: "jump/woody_2.png"
        }, {
            id: "guiqizhan",
            src: "jump/guiqizhan.png"
        }];
        constructor() {
            super("Jump");
            this.instructionScreen.title.text = "方向w,a,s,d\n小键盘4567普通攻击，跳跃，技能";
        }
        init() {
            this.maxLevel = plans.length;
            mapContainer.y = (height - winHeight) / 2;
            let spriteData = {
                images: [queue.getResult("woody_0"), "assets/sprite/woody_1.png", queue.getResult("woody_2")],
                frames: {
                    width: 80,
                    height: 80,
                    regX: 40,
                    regY: 40
                },
                animations: {
                    stand: [0, 3, "stand", 0.1], //[]表示从0到3帧
                    walk: { //{}表示逐帧
                        frames: [4, 5, 6, 7, 6, 5],
                        next: "walk", //next:null就停止在末帧
                        speed: 0.15
                    },
                    run: {
                        frames: [20, 21, 22, 21],
                        next: "run",
                        speed: 0.1
                    },
                    roll: {
                        frames: [58, 59, 69, 58, 59, 69],
                        next: "stand",
                        speed: 0.2
                    },
                    attack1: [10, 13, "stand", 0.2],
                    attack2: [14, 17, "stand", 0.2],
                    skill1: {
                        frames: [8, 9, 19],
                        next: "stand",
                        speed: 0.14
                    },
                    jump: {
                        frames: [60, 61, 62],
                        next: "jumpSky",
                        speed: 0.3
                    },
                    jumpSky: {
                        frames: [62],
                        speed: 0.3
                    },
                    crouch: {
                        frames: [61],
                        next: "stand",
                        speed: 0.3
                    },
                    runJump: {
                        frames: [112],
                        speed: 0.3
                    },
                    fire: {
                        frames: [140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151],
                        next: "stand",
                        speed: 0.3
                    }
                }
            };
            spriteSheet = new createjs.SpriteSheet(spriteData);
            actorChars = {
                "@": JumpPlayer,
                "b": Big,
                "o": Coin,
                "=": Lava,
                "|": Lava,
                "v": Lava
            }

        }
        createScoreBoard() {
            this.scoreBoard = new ScoreBoard(0, 0);
            this.scoreBoard.createTextElement(SCORE, '0', 20, 14);
            this.scoreBoard.createTextElement(LEVEL, '0', 320, 14);
        }
        newGame() {
            score = 0;
            this.scoreBoard.update(SCORE, score);
        }
        newLevel() {
            bullets = [];
            this.scoreBoard.update(LEVEL, this.level);
            let plan = plans[this.level - 1];
            mapContainer.createGridMap(plan, actorChars, (ch, node) => {
                let color = "#555";
                let shape = new createjs.Shape();
                if (ch == "x") {
                    node.walkable = false;
                    color = "#fff";
                } else if (ch == "!") {
                    node.walkable = false;
                    node.death = true;
                    color = "rgb(255,100,100)";
                }
                shape.graphics.beginStroke(color).beginFill(color).drawRect(node.x * step, node.y * step, step, step);
                mapContainer.addChildToFloor(shape);
            });
        }
        waitComplete() {
            stage.addChild(this.scoreBoard, mapContainer);
            mapContainer.scrollPlayerIntoView();
            // mapContainer.player.init(18,30);
            // mapContainer.player.setSpriteData(spriteSheet,"stand",0.4)
            // console.log(mapContainer.player.getBounds(),mapContainer.player._bounds);
        }

        runGame() {
            // 渲染actors
            for (let i = mapContainer.actors.length - 1; i >= 0; i--) {
                const actor = mapContainer.actors[i];
                actor.act();
            }
            //检测子弹
            for (const bullet of bullets) {
                if (bullet.active) {
                    bullet.act();
                }
            }
            //滚动地图
            mapContainer.scrollPlayerIntoView();
        }
        clear() {
            mapContainer.clear();
        }

    }

    window.Jump = Jump;

    class JumpPlayer extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speed.zero();
            this.status = "walk";
            this.type = "player";
            this.arrow = "right";
            this.xspeed = 1.2;
            this.yspeed = 6;
            this.gravity = 0.27;
            this.runXSpeed = 1.8;
            this.isrun = false;
            this.runtick = 0;
            this.init(0.8 * 30, 1.5 * 30);
            this.plus(0,-0.5*30);
            this.setSpriteData(spriteSheet, "stand", 0.6);
        }
        startRoll() {
            this.oldPos = new Vector(this.x, this.y);
            this.status = "roll";
            this.speed.x = this.xspeed;
            this.image.gotoAndPlay("roll");
            //重设图片位置
            this.rect.height/=2;
            this.plus(0,this.rect.height);
            this.image.regY = 30;
        }
        stopRoll() {
            this.plus(0,-this.rect.height);
            this.rect.height*=2;
            this.image.regY = 0;
        }
        moveY() {
            this.speed.y += this.gravity;
            var newRect = this.rect.clone();
            newRect.y += this.speed.y;
            var obstacle = mapContainer.hitMap(newRect);
            if (obstacle) {
                //落地地面以后
                // if (obstacle == "lava") {
                if (obstacle.death == true) {
                    this.dispatchEvent(GFrame.event.GAME_OVER, true);
                    // return;
                } else if (this.status == "jump" && this.speed.y > 0) {
                    //检测跳跃是否结束
                    this.status = "crouch";
                    this.image.gotoAndPlay("crouch");
                } else if (keys.jump && this.status == "walk") {
                    this.speed.y = -this.yspeed;
                    this.status = "jump";
                    this.image.gotoAndPlay("jump");
                } else if (keys.down && this.status == "walk") {
                    //开始滚动
                    this.startRoll();
                } else if (keys.attack && this.status == "walk") {
                    //开始普通攻击
                    this.status = "attack";
                    if (Math.random() > 0.5) {
                        this.image.gotoAndPlay("attack1");
                    } else {
                        this.image.gotoAndPlay("attack2");
                    }
                } else if (keys.skill1 && this.status == "walk") {
                    //开始技能1攻击
                    this.status = "skill1";
                    this.image.gotoAndPlay("skill1");
                } else if (keys.fire && this.status == "walk") {
                    //放子弹
                    this.status = "fire";
                    this.image.gotoAndPlay("fire");
                    this.createBullet();
                } else {
                    this.speed.y = 0;
                }
            } else {
                //未碰撞地图状态
                this.plus(0,this.speed.y);
            }
        }
        //创建子弹
        createBullet() {
            let bullet = Game.getActor(bullets, Barrage1);
            if (this.arrow == "right") {
                bullet.scaleX = 1;
                bullet.speed.angle = 0;
            } else {
                bullet.scaleX = -1;
                bullet.speed.angle = Math.PI;
            }
            bullet.setPos(this.x,this.y);
            mapContainer.addChild(bullet);
        }
        //玩家移动
        moveX() {
            this.runtick++;
            if (this.image.currentAnimation == "stand" || (this.status == "walk" && this.speed.x == 0)) {
                //检测是否停止
                if (this.status == "roll") {
                    this.stopRoll();
                    let obstacle = mapContainer.hitMap(this.rect);
                    if (obstacle) {
                        this.setPos(this.oldPos.x,this.oldPos.y);
                    }
                }
                this.status = "walk"
                this.speed.x = 0;
                if (this.image.currentAnimation != "stand") this.image.gotoAndPlay("stand");
            }
            if (this.status == "roll") {

            } else if (this.status == "jump" || this.status == "walk") {
                if (pressed[pressed.length - 1] == "right" || pressed[pressed.length - 1] == "left") {
                    let key = pressed[pressed.length - 1];
                    if (this.image.currentAnimation == "stand") {
                        if (this.runtick < 12) {
                            this.isrun = true;
                            this.image.gotoAndPlay("run");
                        } else {
                            this.isrun = false;
                            this.image.gotoAndPlay("walk");
                        }
                        this.runtick = 0;
                    }

                    if (key == "left" && this.arrow == "right") {
                        this.image.scaleX *= -1;
                        this.xspeed *= -1;
                        this.runXSpeed *= -1;
                        this.arrow = "left";
                    } else if (key == "right" && this.arrow == "left") {
                        this.image.scaleX *= -1;
                        this.xspeed *= -1;
                        this.runXSpeed *= -1;
                        this.arrow = "right";
                    }
                    this.speed.x = this.isrun ? this.runXSpeed : this.xspeed;
                } else {
                    this.speed.x = 0;
                }
            } else {
                this.speed.x = 0;
            }
            var newRect = this.rect.clone();
            newRect.x += this.speed.x;
            var obstacle = mapContainer.hitMap(newRect);
            if (obstacle) {
                if (obstacle.death == true) {
                    this.dispatchEvent(GFrame.event.GAME_OVER, true);
                }
            } else {
                this.plus(this.speed.x,0);
            }
        }
        act() {
            this.moveX();
            this.moveY();
            var actor = this.hitActors(mapContainer.actors);
            if (actor) {
                if (actor.type == "coin") {
                    actor.parent.removeChild(actor);
                    mapContainer.actors.splice(mapContainer.actors.indexOf(actor), 1);
                    score += 20;
                    this.dispatchEvent(new ScoreUpdate(SCORE, score));
                    if (!mapContainer.actors.some(function (actor) {
                        return actor.type == "coin";
                    })) {
                        this.dispatchEvent(GFrame.event.LEVEL_UP, true);
                    }
                } else if (actor.type == "big") {
                    actor.parent.removeChild(actor);
                    mapContainer.actors.splice(mapContainer.actors.indexOf(actor), 1);

                    if (this.status == "roll") {
                        this.image.gotoAndPlay("stand");
                        this.status = "walk";
                        this.stopRoll();
                    }
                    this.plus(0,-this.rect.height * 0.1);
                    let a = this.act;
                    this.act = function () { };
                    createjs.Tween.get(this).to({
                        scaleX:1.2,
                        scaleY:1.2
                    }, 800, createjs.Ease.quadOut).call(() => {
                        this.rect.copy(this.getTransformedBounds());
                        this.act = a;
                    });
                } else if (actor.type == "lava") {
                    this.dispatchEvent(GFrame.event.GAME_OVER, true);
                }
            }
        }
    }
    class Barrage1 extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.speed.length = 5;
            var skilData = {
                images: [queue.getResult("guiqizhan")],
                frames: {
                    width: 82,
                    height: 83,
                    regX: 41,
                    regY: 41.5
                },
                animations: {
                    run: [0, 3, "run", 0.1],
                    hit: [4, 7, "", 0.3],
                    run2: [8, 11, "run2", 0.3]
                }
            };
            this.init(0.7 * mapContainer.stepWidth, 0.7 * mapContainer.stepHeight);
            this.setSpriteData(new createjs.SpriteSheet(skilData), "run", 0.5);
        }
        act() {
            var obstacle = mapContainer.hitMap(this.rect);
            if (!obstacle) {
                let actor = this.hitActors(mapContainer.actors);
                if (actor && actor.type == "lava") {
                    this.recycle();
                } else {
                    this.speed.truncate(this.maxSpeed);
                    this.plus(this.speed.x,this.speed.y);
                    if (mapContainer.outOfWin(this)) {
                        this.recycle()
                    }
                }
            } else {
                this.recycle();
            }
        }
    }

    class Lava extends Actor {
        constructor(xpos, ypos, ch) {
            super(xpos, ypos);
            this.speed.length = 1.6;
            this.type = "lava";
            this.color = "rgb(255,100,100)";
            this.init(30, 30);
            if (ch == "=") {
                // this.spe;
            } else if (ch == "|") {
                this.speed.angle = Math.PI / 2;
            } else if (ch == "v") {
                this.speed.angle = Math.PI / 2;
                this.repeatPos = new Vector(this.x, this.y);
            }
        }
        act() {
            var newrect = this.rect.clone();
            newrect.x += this.speed.x;
            newrect.y += this.speed.y;
            if (!mapContainer.hitMap(newrect)) {
                this.plus(this.speed.x,this.speed.y);
            } else if (this.repeatPos) {
                this.setPos(this.repeatPos.x,this.repeatPos.y);
            } else {
                this.speed = this.speed.times(-1);
            }
        }
    }
    class Coin extends Actor {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.angleSpeed = 0.08;
            this.wobbleDist = 2.1;
            this.angle = Math.random() * Math.PI * 2;
            this.type = "coin";
            this.color = "rgb(241,229,89)";
            this.init(0.6 * 30, 0.6 * 30);
            this.y += 0.2 * 30;
            this.basePos = new Vector(this.x, this.y);
        }
        act() {
            this.image.rotation++;
            this.angle += this.angleSpeed;
            this.speed.y = Math.sin(this.angle) * this.wobbleDist;
            this.y = this.basePos.y + this.speed.y;
        }
    }
    class Big extends Coin {
        constructor(xpos, ypos) {
            super(xpos, ypos);
            this.type = "big";
            this.scaleX=this.scaleY=0.6;
        }
    }
})();