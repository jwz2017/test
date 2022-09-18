(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var rect0, rect1;
    class RectRotate extends Game {
        constructor() {
            super();
            this.titleScreen.setText("矩形旋转碰撞");
        }
        waitComplete() {
            rect0 = new HitActor();
            rect0.setSize(200, 80, true);
            rect0.mass = 2;
            rect0.x = 350;
            rect0.y = 350;
            rect0.setReg(-50, 20);

            rect1 = new HitActor();
            rect1.setSize(200, 50);
            rect1.mass = 1;
            rect1.x = 350;
            rect1.y = 580;
            stage.addChild(rect0, rect1);

        }
        runGame() {
            rect0.rotation += 1;
            rect1.rotation += 0.5;
            //中心点
            let rect0center = rect0.getCenterPoint();
            //外接圆碰撞
            if (rect0.hitRadius(rect1,rect1.x,rect1.y, rect0center.x, rect0center.y)) {
                console.log("d");
                // let rect1center = rect1.getCenterPoint();
                let obb1 = new ndgmr.OBB(rect0center, rect0.rect.width, rect0.rect.height, rect0.rotation * Math.PI / 180);
                let obb2 = new ndgmr.OBB(new Vector(rect1.x,rect1.y), rect1.rect.width, rect1.rect.height, rect1.rotation * Math.PI / 180);
                //旋转矩形碰撞
                var r = ndgmr.detectorOBBvsOBB(obb1, obb2);

                if (r) {
                    rect0.color = rect1.color = "#ff0000";
                } else {
                    rect0.color = rect1.color = "rgb(64,64,64)";
                }
                rect0.drawShape(rect0.rect.width, rect0.rect.height);
                rect1.drawShape(rect1.rect.width, rect1.rect.height);
            }
        }

    }
    RectRotate.loadItem = null;
    RectRotate.loaderbar = null;;
    window.RectRotate = RectRotate;
})();