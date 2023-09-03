import { stage,gframe } from "../../classes/gframe.js";
//游戏变量;
let element,domElement;
export class DomElement extends gframe.Game {
    constructor() {
        super("DomElement");
        element=document.createElement("p");
        element.style.visibility="hidden";
        element.style.top=0;
        element.style.left=0;
        element.style.width="200px";
        element.style.textIndent="2em";
        element.innerHTML="CreateJS是基于HTML5开发的一套模块化的库和工具。基于这些库，可以非常快捷地开发出基于HTML5的游戏动画和交互应用。"
        gameDiv.appendChild(element);
        domElement=new createjs.DOMElement(element);
        domElement.x=stage.width/2;
        domElement.y=stage.height/2;
        domElement.regX=100;
        domElement.regY=50;
        stage.addChild(domElement);
    }
    waitComplete() {
        super.waitComplete();
        // element.style.visibility="hidden";
        domElement.visible=false;
        stage.on("stagemousedown",()=>{
        domElement.visible=true;
        })
    }
    runGame(){
        // domElement.rotation++;
    }
    // clear(){console.log("e");
    //     if(element)element.style.display="none"
    // }

}
