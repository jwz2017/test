import { gframe, keys, stage } from "../../classes/gframe.js";
import { Tree } from "../../classes/shape.js";

var trees, vpX, vpY,
    numTrees = 100, fl = 250, floor = 50, friction = 0.98,
    vx = 0, vy = 0, vz = 0, ax = 0, ay = 0, az = 0, gravity = 0.3;
export class Trees extends gframe.Game {
    constructor() {
        stage.canvas.style.background = "#000";
        gframe.style.TITLE_TEXT_COLOR="#fff";
        super("屏幕环绕3d");
        this.keyboard=true;
    }
    waitComplete() {
        vpX = stage.width / 2;
        vpY = stage.height / 2;
        trees = [];
        vx = vy = vz = ax = ay = az = 0;
        for (let i = 0; i < numTrees; i++) {
            const tree = new Tree();
            trees.push(tree);
            tree.pos.x = Math.random() * 2000 - 1000;
            tree.pos.y = floor;
            tree.pos.z = Math.random() * 10000;
            stage.addChild(tree);
        }
    }
    runGame() {
        //键盘事件
        ax = ay = az = 0;
        if (keys.up) {
            az = -0.3;
        }
        if (keys.down) {
            az = 0.3;
        }
        if (keys.left) {
            ax = 0.3;
        }
        if (keys.right) {
            ax = -0.3
        }
        if (keys.jump) {
            ay = 1;
        }
        //移动树
        vx += ax;
        vy += ay;
        vz += az;
        vy -= gravity;
        for (let i = 0; i < numTrees; i++) {
            const tree = trees[i];
            this.move(tree);
        }
        vz *= friction;
        vx *= friction;
        vy *= friction;
        //排序
        stage.sortChildren(function (a, b) {
            return b.pos.z - a.pos.z;
        })
    }
    move(tree) {
        tree.pos.x += vx;
        tree.pos.y += vy;
        tree.pos.z += vz;
        if (tree.pos.y < floor) {
            tree.pos.y = floor;
        }
        if (tree.pos.z < -fl) {
            tree.pos.z += 10000;
        }
        if (tree.pos.z > 10000 - fl) {
            tree.pos.z -= 10000;
        }
        let scale = fl / (fl + tree.pos.z);
        tree.scale = scale;
        tree.x = vpX + tree.pos.x * scale;
        tree.y = vpY + tree.pos.y * scale;
        tree.alpha = scale * 0.6 + 0.4;
    }

}