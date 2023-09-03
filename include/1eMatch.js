import { gframe, queue, stage } from "../classes/gframe.js";
import { mc } from "../classes/mc.js";

window.onload = function () {
    gframe.buildStage('canvas');
    gframe.preload(Match);
    gframe.startFPS();
};
var faces, cards, selectedCards, matches;
class Match extends gframe.Game {
    static loadItem = [{
        id: "back",
        src: "match/back.png",
    }, {
        id: "card",
        src: "match/card.png"
    }, {
        id: "garlic",
        src: "match/garlic.png"
    }, {
        id: "onion",
        src: "match/onion.png"
    }, {
        id: "pepper",
        src: "match/pepper.png"
    }, {
        id: "potato",
        src: "match/potato.png"
    }, {
        id: "spinach",
        src: "match/spinach.png"
    }, {
        id: "tomato",
        src: "match/tomato.png"
    }];
    constructor() {
        super("查找游戏0");

    }
    createScoreBoard() {
        this.scoreboard = new gframe.ScoreBoard(0, 0, null);
        this.scoreboard.createTextElement(gframe.Game.LEVEL, 320, 14);
    }
    newLevel() {
        this.scoreboard.update(gframe.Game.LEVEL, this.level);
        selectedCards = [];
        matches = 0;
        faces = [];
        cards = [];
        faces = ['garlic', 'onion', 'pepper', 'potato', 'spinach', 'tomato'];
    }
    waitComplete() {
        this.buildCards();
        this.shuffleCards(); //洗牌  
        this.deelCards();
    }
    buildCards() {
        var face, card1, card2;
        for (let i = 0; i < faces.length; i++) {
            face = faces[i],
                card1 = new Card(face),
                // card2=card1.clone(true);
                card2 = new Card(face);
            card1.key = card2.key = faces[i];
            cards.push(card1, card2);
        }
    }
    shuffleCards() {
        mc.randomArray(cards);
    }
    deelCards() {
        var xpos = 150,
            ypos = 150;
        var count = 0;
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            card.x = -200;
            card.y = 500;
            card.rotation = Math.floor(Math.random() * 600);
            stage.addChild(card);
            var _this = this;
            card.addEventListener('click', this._onClick = function (e) {
                _this.onClick1(e);
            })
            createjs.Tween.get(card).wait(i * 100).to({
                x: xpos,
                y: ypos,
                rotation: 0
            }, 300).call(() => {
                // card.back.shadow=new createjs.Shadow("#333",4,4,6);
            });
            xpos += 150;
            count++;
            if (count === 4) {
                count = 0;
                xpos = 150;
                ypos += 220;
            }
        }
    }
    onClick1(e) {
        // console.log(e.currentTarget);
        if (selectedCards.length === 2) {
            return;
        }
        var card = e.currentTarget;
        card.mouseEnabled = false;
        card.back.visible = false;

        selectedCards.push(card);
        if (selectedCards.length === 2) {
            if (selectedCards[0].key === selectedCards[1].key) {
                matches++;
                this.evalGame();
            } else {
                setTimeout(() => {
                    selectedCards[0].mouseEnabled = selectedCards[1].mouseEnabled = true;
                    selectedCards[0].back.visible = true;
                    selectedCards[1].back.visible = true;
                    selectedCards = [];
                }, 1000);
            }
        }
    }
    evalGame() {
        if (matches === faces.length) {
            this.clear(gframe.event.LEVEL_UP);
        } else {
            selectedCards = [];
        }

    }
    runGame() {

    }
    clear(e) {
        cards.forEach(element => {
            if (element) element.removeEventListener('click', this._onClick);
        });
        super.clear(e);
    }

}

class Card extends createjs.Container {
    constructor(face) {
        super();
        this.back = new createjs.Bitmap(queue.getResult("card")); //使用queue,不能clone   使用地址不能用image.width.要直接用数字

        //加阴影。。。位图直接加阴影在手机上很卡。。可用矢量加阴影
        // this.back1=new createjs.Shape();
        // this.back1.graphics.beginFill("#000").drawRoundRect(0,0,this.back.image.width,this.back.image.height,10);

        // this.addChild(this.back1);
        // this.back1.shadow=new createjs.Shadow("#333",3,3,5);
        this.back.shadow = new createjs.Shadow("#333", 3, 3, 5);

        this.regX = this.back.image.width / 2;
        this.regY = this.back.image.height / 2;
        this.addChild(this.back);

        this.back = new createjs.Bitmap(queue.getResult(face));
        this.back.regX = this.back.image.width / 2;
        this.back.regY = this.back.image.height / 2;
        this.addChild(this.back);
        this.back.x = this.regX;
        this.back.y = 70;
        this.label = new createjs.Text(face.toUpperCase(), "20px Arial", "#000");
        this.label.textAlign = "center";
        this.label.x = this.regX;
        this.label.y = 144;
        this.addChild(this.label);
        this.back = new createjs.Bitmap(queue.getResult('back'));
        // this.back.image.crossOrigin="Anonymous";
        this.addChild(this.back);
        this.a = 0;
    }
}