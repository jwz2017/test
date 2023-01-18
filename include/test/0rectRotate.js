(function () {
    "use strict";
    //游戏变量;
    var rect0, rect1;
    class RectRotate extends Game {
        constructor() {
            super();
            this.titleScreen.setText("矩形旋转碰撞");
        }
        waitComplete() {
            rect0 = new HitActor();
            rect0.setSize(200, 80);
            rect0.mass = 2;
            rect0.setReg(-50, 0);
            rect0.x = 350;
            rect0.y = 350;

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
            if (rect0.hitWRadius(rect1.hit,rect1.x,rect1.y, rect0center.x, rect0center.y)) {
                // let rect1center = rect1.getCenterPoint();
                let obb1 = new ndgmr.OBB(rect0center, rect0.size.x, rect0.size.y, rect0.rotation * Math.PI / 180);
                let obb2 = new ndgmr.OBB(new Vector(rect1.x,rect1.y), rect1.size.x, rect1.size.y, rect1.rotation * Math.PI / 180);
                //旋转矩形碰撞
                var r = ndgmr.detectorOBBvsOBB(obb1, obb2);
                if (r) {
                    rect0.color = rect1.color = "#ff0000";
                } else {
                    rect0.color = rect1.color = "rgb(64,64,64)";
                }
                rect0.drawShape(rect0.size.x, rect0.size.y);
                rect1.drawShape(rect1.size.x, rect1.size.y);
            }
        }
    }
    window.RectRotate = RectRotate;
})();