(function () {
    "use strict";
    var seeker,fleer;
    class FleeTest1 extends Game {
        constructor() {
            super();
            this.titleScreen.setText("逃离测试1");
        }
        waitComplete() {
            seeker=new SteeredActor(200,200);
            seeker.edgeBehavior=Actor.BOUNCE;

            fleer=new SteeredActor(400,300);
            fleer.edgeBehavior=Actor.BOUNCE;
            stage.addChild(seeker,fleer);    
        }
        runGame() {
            seeker.seek(fleer.pos);
            fleer.flee(seeker.pos);
            seeker.act();
            fleer.act();
        }

    }
    window.FleeTest1 = FleeTest1;
})();