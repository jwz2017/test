import { stage,gframe, lib } from "../../classes/gframe.js";
import {Game } from "../../classes/Game.js";

export class ButtonHelp extends Game {
    // static backgroundColor="#555"
    // static loadItem=[
    //     {
    //         id:"button"
    //     }
    // ]
    static loadId='A81D833FE7C7754FB5395FF7A6EFA6E1';
    constructor() {
        super("ButtonHelp");
        // console.log(lib.VectorButton);
        // stage.addChild(new(lib.VectorButton))
        var vectorButton=new lib.VectorButton();
        stage.addChild(vectorButton).set({x:100,y:100})
        this.button=new createjs.ButtonHelper(vectorButton)
    }
    waitComplete(){
        stage.enableMouseOver()
    }
}
