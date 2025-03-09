import { stage,gframe } from "../../classes/gframe.js";
import {Game } from "../../classes/Game.js";

export class SpritesheetBuilder extends Game {
    constructor() {
        super("SpritesheetBuilder");
        var square=new createjs.Container();
        var squareBg=square.addChild(new createjs.Shape());
        squareBg.graphics.beginFill("#00f").drawRect(0,0,80,80);

        var squareFld=square.addChild(new createjs.Text("1","bold 72px Arial","#9bf"));
        squareFld.textBaseline="middle";
        squareFld.textAlign="center";
        squareFld.setTransform(40,40);
        square.setTransform(150,50);
        square.setBounds(0,0,80,80)
        
        var circle=new createjs.Shape();
        circle.graphics.beginFill("#f00").drawCircle(0,0,30).beginFill("#c00").drawCircle(0,0,10);
        circle.setTransform(100,90)

        stage.addChild(square,circle)

        // add a named animation using the frame index:
        var builder=new createjs.SpriteSheetBuilder();
        var index=builder.addFrame(circle,new createjs.Rectangle(-30,-30,60,60))
        builder.addAnimation("circle",index);

        // add the square as a sequence of frames, each with a different number in the text field:
        var frames=[];
        for (let i = 0; i < 5; i++) {
            index=builder.addFrame(square,null,1,(target,data)=>{
                squareFld.text=data;
            },i)
            frames.push(index);
        }
        builder.addAnimation("square",frames,true,0.1);

        var spriteSheet=builder.build();

        // create our bitmap animations using the generated sprite sheet, and put them on stage:
        var circle2=new createjs.Sprite(spriteSheet,"circle");
        circle2.setTransform(100,290);
        stage.addChild(circle2);

        var square2=new createjs.Sprite(spriteSheet,"square");
        square2.setTransform(150,250);
        stage.addChild(square2);

        stage.addChild(new createjs.Bitmap(spriteSheet._images[0])).set({x:75,y:150})
    }

}
