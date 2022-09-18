(function () {
    "use strict";
    //游戏变量;
    var score;
    const SCORE = "Score",
        LEVEL = "level";
    var numParticles = 40,
        particles = [],
        minDist = 100,
        springAmount = 0.012,
        shape;
    class NodeGarden extends Game {
        constructor() {
            super();
            this.titleScreen.setText("节点花园");
        }
        waitComplete() {
            particles=[];
            let dome = document.getElementById("canvas");
            dome.style.background = "#000000";
            shape = new createjs.Shape();
            stage.addChild(shape);
            for (let i = 0; i < numParticles; i++) {
                const particle = new Barrage();
                let size = Math.random() * 20 + 4;
                particle.setSize(size, size, true);
                particle.x = Math.random() * width;
                particle.y = Math.random() * height;
                particle.speed.x = Math.random() * 6 - 3;
                particle.speed.y = Math.random() * 6 - 3;
                particle.mass = size;
                stage.addChild(particle);
                particles.push(particle);

            }
        }
        runGame() {
            for (const particle of particles) {
                particle.x += particle.speed.x;
                particle.y += particle.speed.y;
                if (particle.outOfBounds()) {
                    particle.placeInBounds();
                }
            }
            shape.graphics.clear();
            for (let i = 0; i < numParticles - 1; i++) {
                const partA = particles[i];
                for (let j = i + 1; j < numParticles; j++) {
                    const partB = particles[j];
                    this.spring(partA, partB);
                }
            }
        }
        spring(partA, partB) {
            let dx = partB.x - partA.x,
                dy = partB.y - partA.y,
                distSQ = dx * dx + dy * dy,
                dist = Math.sqrt(distSQ);
            if (dist < minDist) {
                let g = shape.graphics,
                a=1-dist/minDist;
                g.setStrokeStyle(1).beginStroke("rgba(255,255,255,"+a+")")
                    .moveTo(partA.x, partA.y).lineTo(partB.x, partB.y);
                let ax = dx * springAmount;
                let ay = dy * springAmount;
                partA.speed.x += ax / partA.mass;
                partA.speed.y += ay / partA.mass;
                partB.speed.x -= ax / partB.mass;
                partB.speed.y -= ay / partB.mass;
            }

        }
    }
    NodeGarden.loadItem = null;
    NodeGarden.loaderbar = null;;
    window.NodeGarden = NodeGarden;
})();