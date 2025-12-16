import { Game } from "../../classes/Game.js";
import { stage } from "../../classes/gframe.js";
//游戏变量;
let element,domElement;
export class DomElement extends Game {
    static codes=null;
    constructor() {
        super("DomElement");
        
        element=document.createElement("p");
        element.style.width="200px";
        element.style.textIndent="2em";
        element.style.color="#fff"
        element.innerHTML="CreateJS是基于HTML5开发的一套模块化的库和工具。基于这些库，可以非常快捷地开发出基于HTML5的游戏动画和交互应用。"
        gameDom.appendChild(element);
        domElement=new createjs.DOMElement(element);
        domElement.x=stage.width/2;
        domElement.y=stage.height/2;
        domElement.regX=100;
        domElement.regY=50;
        stage.addChild(domElement);
    }
    runGame(){
        domElement.rotation++;
    }

}
