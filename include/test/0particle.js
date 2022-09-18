(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var particles,
    numParticles;
    class Particle extends Game {
        constructor() {
            super();
            this.titleScreen.setText("Particle");
        }
        
        waitComplete() {
            numParticles=30;
            particles=[];
            for (let i = 0; i < numParticles; i++) {
                const particle = new Barrage();
                let size=Math.random()*50+10;
                particle.setSize(size,size);
                particle.x=Math.random()*width;
                particle.y=Math.random()*height;
                particle.mass=size;
                stage.addChild(particle);
                particles.push(particle);
            }
        }
        runGame() {
            for (const particale of particles) {
                particale.x+=particale.speed.x;
                particale.y+=particale.speed.y;
            }
            for (let i = 0; i < numParticles-1; i++) {
                const partA = particles[i];
                for (let j = i+1; j < numParticles; j++) {
                    const partB = particles[j];
                    if(partA.hitRadius(partB)){
                        this.billiardCollision(partA,partB);
                    }
                    this.gravitate(partA,partB);
                }
            }
        }
        clear() {
            
        }

    }
    Particle.loadItem = null;
    Particle.loaderbar=null;;
    window.Particle = Particle;
})();