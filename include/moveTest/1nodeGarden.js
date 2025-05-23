import { stage } from "../../classes/gframe.js";
import { Actor,CirActor } from "../../classes/actor.js";
import { Game } from "../../classes/Game.js";
var numParticles = 40,
    particles,
    minDist = 100,
    springAmount = 0.0022,
    shape;
export class NodeGarden extends Game {
    constructor() {
        super("节点花园");
        particles = [];
        shape = new createjs.Shape();
        stage.addChild(shape);
        for (let i = 0; i < numParticles; i++) {
            let size = Math.random() * 20 + 4;
            const particle = new CirActor(Math.random() * stage.width, Math.random() * stage.height);
            particle.drawSpriteData(size)
            particle.edgeBehavior = Actor.WRAP;
    
            particle.speed.setValues(Math.random() * 6 - 3, Math.random() * 6 - 3);
            particle.mass = size;
            stage.addChild(particle);
            particles.push(particle);
    
        }
    }
    runGame() {
        shape.graphics.clear();
        for (let i = 0; i < numParticles - 1; i++) {
            const partA = particles[i];
            for (let j = i + 1; j < numParticles; j++) {
                const partB = particles[j];
                this.spring(partA, partB);
            }
        }
        for (const particle of particles) {
            particle.act();
        }
    }
    spring(partA, partB) {
        let dx = partB.x - partA.x,
            dy = partB.y - partA.y,
            distSQ = dx * dx + dy * dy,
            dist = Math.sqrt(distSQ);
        if (dist < minDist) {
            let g = shape.graphics,
                a = 1 - dist / minDist;
            g.setStrokeStyle(1).beginStroke("rgba(255,255,255," + a + ")")
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
