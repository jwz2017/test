(function () {
    "use strict";
    //游戏变量;
    var rect0, rect1;
    class RectRotate extends Game {
        constructor() {
            super("矩形旋转碰撞");
        }
        waitComplete() {
            rect0 = new Actor();
            rect0.init(200, 80);
            rect0.mass = 2;
            rect0.setReg(-50, -20);
            rect0.setPos(350,440);

            rect1 = new Actor();
            rect1.init(200, 50);
            rect1.mass = 1;
            rect1.setPos(350,580);
            stage.addChild(rect0, rect1);

        }
        runGame() {
            rect0.rotation += 1;
            rect1.rotation += 0.5;
            // //中心点
            let r0= rect0.getTransformedBounds();
            let rect0center=new Vector(r0.x+r0.width/2,r0.y+r0.height/2);

            // //外接圆碰撞
            if (rect0.hitRadius(rect1,rect1.x,rect1.y, rect0center.x, rect0center.y)) {
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
    window.RectRotate = RectRotate;
})();