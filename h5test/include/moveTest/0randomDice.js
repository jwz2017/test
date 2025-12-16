import { Game } from "../../classes/Game.js";
import { stage, queue } from "../../classes/gframe.js";
import { PushButton } from "../../classes/zujian/mc.js";
var button;
export class RandomDice extends Game {
    static loadItem = [{
        id: "dice",
        src: "fakezee/fakezee.json",
        type:"spritesheet"
    }];
    constructor() {
        super("RandomDice");
        this.enableMouseOver=true
        this.sprite=new createjs.Sprite(queue.getResult("dice"),"die");
        this.sprite.paused=true;
        
        button = new PushButton(stage, "ok", this.onMouseDown, 200, 400,200,40);
        button.x = stage.width - button.getBounds().width >> 1;
        button.y = stage.height - button.getBounds().height >> 1;
        button.toggle = true;
        let xpos = 250, ypos = 200, offX = 50;
        for (let i = 0; i < 6; i++) {
            const element = this.sprite.clone();
            element.name = "dice" + i;
            element.x = xpos;
            element.y = ypos;
            xpos += offX;
            stage.addChild(element);
        }
    }
    onMouseDown() {
        if (button.selected) {
            for (let i = 0; i < 6; i++) {
                const element = stage.getChildByName("dice" + i);
                element.framerate = Math.random()*20+30;
                element.paused = false;
            }
        } else {
            for (let i = 0; i < 6; i++) {
                const element = stage.getChildByName("dice" + i);
                element.paused = true;
                console.log(Math.ceil(element.currentAnimationFrame));
                
            }
        }
    }
}
