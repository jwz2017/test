class Sparkles extends createjs.Container{
        constructor(spriteData,h=height,autoClear=true){
            super();
            stage.autoClear=autoClear;
            this.sprite=new createjs.Sprite(new createjs.SpriteSheet(spriteData));
            var fader=this.addChild(new createjs.Shape());
            fader.graphics.beginFill("rgba(0,0,0, 0.3)").drawRect(0,0, width, this.height).endFill();
            this.tick=createjs.Ticker.on("tick",(event)=>{
                var m=event.delta/16;
                var l=this.numChildren;
                for (let i = 1; i < l; i++) {
                    const sparkle = this.getChildAt(i);
                    if(--sparkle.life<=0){
                        this.removeChild(sparkle);
                        i--;l--;
                        continue;
                    }
                    sparkle.vY+=0.1*m;
                    sparkle.x+=sparkle.vX*m;
                    sparkle.y+=sparkle.vY*m;
                    sparkle.alpha=sparkle.alphaStart*(sparkle.life/sparkle.lifeMax);
                    if (sparkle.y>h) {
                        sparkle.vY*=-(Math.random()*0.1+0.8);
                        sparkle.vX+=Math.cos(Math.random()*Math.PI*2)*3;
                    }else if(sparkle.y<0){
                        sparkle.vY*=0.9;
                    }
                    if(sparkle.x>width||sparkle.x<0){
                        sparkle.vX*=-1;
                    }
                }
            });
        }
        addSparkles(count,x,y,speed){
            for (let i = 0; i < count; i++) {
                const sparkle = this.sprite.clone();
                sparkle.x=x;
                sparkle.y=y;
                sparkle.rotation=Math.random()*360;
                sparkle.alpha=sparkle.alphaStart=Math.random()*0.7+0.6;
                sparkle.scale=Math.random()+0.3;
                sparkle.life=sparkle.lifeMax=Math.random()*100+50;

                var a=Math.PI*2*Math.random();
                var v=(Math.random()-0.5)*30*speed;
                sparkle.vX=Math.cos(a)*v;
                sparkle.vY=Math.sin(a)*v;
                // debugger;
                sparkle.gotoAndPlay(Math.random()*sparkle.spriteSheet.getNumFrames()|0);
                this.addChild(sparkle);
            }
        }
        clear(){
            createjs.Ticker.off("tick",this.tick);
            stage.autoClear=true;
        }
    }