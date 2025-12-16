import { stage, gframe, queue } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import { Slider as Cslider } from "../../classes/zujian/slider.js";

var bitmap, maskFilter, blur, cursor, drawingCanvas, oldPt, oldMidPt, isDrawing;
export class AlphaMaskFilter extends Game {
    static loadItem = [
        {
            id: "flowers",
            src: "easelJs/flowers.jpg",
        }
    ];
    constructor() {
        super("AlphaMaskFilter");

    }
    waitComplete() {
        stage.enableMouseOver();
        stage.addEventListener("mousedown", this.handleMouseDown);
        stage.addEventListener("stagemouseup", this.handleMouseUp);
        stage.addEventListener("stagemousemove", this.handleMouseMove);
        let image = queue.getResult("flowers")
        drawingCanvas = new createjs.Shape();
        drawingCanvas.cache(0, 0, image.width, image.height);

        bitmap = new createjs.Bitmap(image);
        // bitmap.y = 100;
        maskFilter = new createjs.AlphaMaskFilter(drawingCanvas.cacheCanvas);
        bitmap.filters = [maskFilter];
        bitmap.cache(0, 0, image.width, image.height);

        blur = new createjs.Bitmap(image);
        // blur.y = 100
        blur.filters = [new createjs.BlurFilter(24, 24, 2), new createjs.ColorMatrixFilter(new createjs.ColorMatrix(60))];
        blur.cache(0, 0, 960, 400);

        stage.addChild(blur, bitmap);

        cursor = new createjs.Shape(new createjs.Graphics().beginFill("#fff").drawCircle(0, 0, 25));
        cursor.cursor = "pointer";
        cursor.mouseEnabled=false;
        stage.addChild(cursor);

        let slider=new Cslider();
        stage.addChild(slider);
        slider.y=500;
        slider.x=20;
        slider.value=30;
        // slider.draw(canvas.getContext('2d'))

    }
    handleMouseDown(e) {
        // console.log(e.target.x,e.localY);
        
        oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
        oldMidPt = oldPt;
        isDrawing = true;
    }
    handleMouseMove() {
        cursor.x = stage.mouseX;
        cursor.y = stage.mouseY;

        if(!isDrawing) {
            return;
        }

        var midPoint = new createjs.Point(oldPt.x + stage.mouseX >> 1, oldPt.y + stage.mouseY >> 1);


        drawingCanvas.graphics.clear()
				.setStrokeStyle(40, "round", "round")
				.beginStroke("rgba(0,0,0,0.08)")
				.moveTo(midPoint.x, midPoint.y)
				.curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

        oldPt.x=stage.mouseX;
        oldPt.y=stage.mouseY;

        oldMidPt.x=midPoint.x;
        oldMidPt.y=midPoint.y;

        drawingCanvas.updateCache("source-over");
        bitmap.updateCache();
    }



    handleMouseUp() {
        isDrawing=false;
    }

}