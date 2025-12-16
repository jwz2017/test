import { stage,gframe } from "../../classes/gframe.js";
import {Game } from "../../classes/Game.js";
import { TextLink } from "../../classes/zujian/textLink.js";

export class TextLinkTest extends Game {
    constructor() {
        super("TextLinktest");
        var links=["yellow","blue","green","red","purple","orange"];
        for (let i = 0; i < links.length; i++) {
            const link =new TextLink(links[i]+"link!","36px Arial",links[i],"#fff");
            link.x=100;
            link.y=50+i*50;
            link.addEventListener("click",(e)=>{
                alert("you clicked on: "+e.target.text);
            })
            link.cursor="pointer";
            stage.addChild(link);
        }
    }
    waitComplete(){
        stage.enableMouseOver();
    }

}
