import { Game } from "../../classes/Game.js";
import { CirActor } from "../../classes/actor.js";
import { keys, stage } from "../../classes/gframe.js";

var ball, xpos, ypos, zpos, vpX, vpY,
    fl = 250;
export class Perspective1 extends Game {
    static codes = {
            87: "up",
            83: "down",
        };
    constructor() {
        super("透视1");
        xpos = ypos = zpos = 0;
        vpX = stage.width / 2;
        vpY = stage.height / 2;
    
        ball = new CirActor(0,0,25);
        stage.addChild(ball);
    }
    runGame() {
        if (keys.up) {
            zpos += 5;
        } else if (keys.down) {
            zpos -= 5;
        }
        if (zpos > -fl) {
            xpos = stage.mouseX - vpX;
            ypos = stage.mouseY - vpY;
            let scale = fl / (fl + zpos);
            ball.scale = scale;
            ball.x = vpX + xpos * scale;
            ball.y = vpY + ypos * scale;
            ball.visible = true;
        } else {
            ball.visible = false;
        }

    }

}