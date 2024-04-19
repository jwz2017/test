import { Game, ScoreBoard } from "../classes/Game.js";
import {gframe } from "../classes/gframe.js";
window.onload = function () {
    /*************游戏入口*****/
     gframe.buildStage('canvas');
     //stage.setClearColor(0x00000000);
     gframe.preload(WordGame);
};
//游戏变量;
var answers=["CERATEJS IS&AWESOME","ABCDEFGHDK OIS&SKDDD"];
var answer;
var abc="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var lettersNeeded=0;
export class WordGame extends Game{
    constructor() {
        super("WordGame");
        WordGame.style.backgroundColor="#555"
        this.maxLevel=answers.length;
        this.x=200;
        this.y=200;
    }
    createScoreBoard() {
        this.scoreboard = new ScoreBoard();
        this.scoreboard.createTextElement(WordGame.LIVES);
    }
    newLevel() {
        lettersNeeded=0;
        this.lives=5;
        answer=answers[this.level-1];
        this.scoreboard.update(WordGame.LIVES,this.lives);
        this.drawBoard();
        this.drawLetters();
        this.drawMessage();
    }
    drawBoard(){
        var i,char,box;
        var xPos=20;
        var yPos=90;
        for (let i = 0; i < answer.length; i++) {
            char = answer[i];
            if(char!=" "&&char!="&"){
                lettersNeeded++;
                box=new createjs.Shape();
                box.graphics.beginStroke("#000").drawRect(0,0,20,24);
                box.regX=10;
                box.regY=12;
                box.x=xPos;
                box.y=yPos;
                box.name="box_"+i;
                box.key=char;
                this.container.addChild(box);
            }
            xPos+=26;
            if(char=="&"){
                yPos+=40;
                xPos=20;
            }
        }
    }
    drawMessage(){
        let txt=new createjs.Text("WORD GAME","26px Arial");
        txt.color="#990000";
        txt.x=txt.y=10;
        this.container.addChild(txt);
    }
    drawLetters(){
        let i,char,txt,btn;
        let cnt=0;
        let xPos=20;
        let yPos=200;
        for (i = 0; i < abc.length; i++) {
            char = abc[i];
            btn=new createjs.Shape();
            btn.graphics.beginFill("#000").beginStroke("#000")
            .drawRect(0,0,20,24);
            btn.regX=10;
            btn.regY=12;
            btn.x=xPos;
            btn.y=yPos;
            this.container.addChild(btn);
            //create text
            txt=new createjs.Text(char);
            txt.color="#fff";
            txt.textAlign="center";
            txt.textBaseline="middle";
            txt.x=xPos;
            txt.y=yPos;
            this.container.addChild(txt);
            btn.txt=txt;
            let eve=btn.on('click',(e)=>{
                let b=e.target;
                let t=b.txt;
                b.off("click",eve);
                this.checkForMatches(t);
            });
            //adjust positions
            xPos+=24;
            cnt++;
            if(cnt==13){
                yPos+=30;
                xPos=20;
            }
        }
    }
    checkForMatches(txt){
        let letter=txt.text;
        let i,char,box,txtClone;
        let match=false;
        let l=answer.length;
        for (i = 0; i < l; i++) {
            char = answer[i];
            if(char==" "||char=="&"){
                continue;
            }
            box=this.container.getChildByName("box_"+i);
            if(box.key==letter){
                lettersNeeded--;
                if(lettersNeeded==0){
                    this.levelUp=true;
                }
                match=true;
                txtClone=txt.clone();
                txtClone.color="#000";
                txtClone.x=box.x;
                txtClone.y=box.y;
                this.container.addChild(txtClone);
            }
        }
        this.container.removeChild(txt);
        if(!match){
            this.lives--;
            if(this.lives==0) this.gameOver=true;
            this.scoreboard.update(WordGame.LIVES,this.lives);
        }
    }

}
