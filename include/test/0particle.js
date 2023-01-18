(function () {
    "use strict";
    //游戏变量;
    var particles,gridSize=65,grid,
    numParticles=100;
    class Particle extends Game {
        constructor() {
            super();
            this.titleScreen.setText("Particle");
        }
        
        waitComplete() {
            grid=new GridCollision(width,height,gridSize);
            grid.drawGrid();
            particles=[];
            for (let i = 0; i < numParticles; i++) {
                const particle = new Barrage();
                let size=Math.random()*50+10;
                particle.setSize(size,size);
                particle.speed.zero();
                particle.edgeBehavior=null;
                particle.pos.setValues(Math.random()*mapWidth,Math.random()*mapHeight)
                particle.mass=size;
                stage.addChild(particle);
                particles.push(particle);
            }
        }
        runGame() {
            for (const particale of particles) {
                particale.act();
                
            }
            //普通检测
            for (let i = 0; i < numParticles-1; i++) {
                const partA = particles[i];
                for (let j = i+1; j < numParticles; j++) {
                    const partB = particles[j];
                    // if(partA.hitRadius(partB)){
                    //     this.billiardCollision(partA,partB);
                    // }
                    // this.gravitate(partA,partB);

                }
            }
            //网格检测
            grid.check(particles);
            let numChecks=grid.checks.length;
            for (let i = 0; i < numChecks; i+=2) {
                let partA=grid.checks[i];
                let partB=grid.checks[i+1];
                this.gravitate(partA,partB);
                if(partA.hitRadius(partB)){
                    this.billiardCollision(partA,partB);
                }
                
            }
        }
    }
    window.Particle = Particle;
})();