import { stage, gframe, queue } from "../../classes/gframe.js";
import { Game } from "../../classes/Game.js";
import { Slider } from "../../classes/zujian/slider.js";

var sliders = {}, colorMatrix, blurFilter,bmp;
export class FiltersInput extends Game {
    // static backgroundColor="#"
    static loadItem = [{
        id: "flowers",
        src: "../../assets/easelJs/flowers.jpg"
    }]
    constructor() {
        super("FiltersInput");
        bmp = new createjs.Bitmap(queue.getResult("flowers"));
        let b = bmp.getBounds();
        bmp.cache(0, 0, b.width, b.height);
        stage.addChild(bmp);

        var panel = new createjs.Shape().set({ alpha: 0.7 });
        panel.graphics.beginFill("#111").drawRect(0, b.height - 125, stage.width, 125);
        stage.addChild(panel);

        var sliderNames = ["brightness", "contrast", "hue", "saturation", "blurX", "blurY"];
        for (let i = 0; i < sliderNames.length; i++) {
            const name = sliderNames[i];
            let x = (i / 2 | 0) * 250 + 5;
            let y = i % 2 * 50 + 305;

            let label = new createjs.Text(name, "18px Arial", "white");
            label.set({ textAlign: "right", x: x + 80, y: y });

            var slider = new Slider(0, 1, 150).set({ x: x + 90, y: y });
            sliders[name] = slider;
            if (i < 4) {
                slider.value = 0.5;
            }
            slider.on("change", this.handleSliderChange, this);
            stage.addChild(label, slider);
        }

        colorMatrix = new createjs.ColorMatrix();
        var colorMatrixFilter = new createjs.ColorMatrixFilter(colorMatrix);
        blurFilter = new createjs.BlurFilter(0, 0, 2);
        bmp.filters = [colorMatrixFilter, blurFilter];
    }
    handleSliderChange(e) {
        blurFilter.blurX = sliders.blurX.value * 32;
        blurFilter.blurY = sliders.blurY.value * 32;
        
        colorMatrix.setColor(
            sliders.brightness.value * 200 - 100,
            sliders.contrast.value * 200 - 100,
            sliders.saturation.value * 200 - 100,
            sliders.hue.value * 360 - 180
        );
        bmp.updateCache();
    }
    waitComplete() {
        stage.enableMouseOver();
    }

}
