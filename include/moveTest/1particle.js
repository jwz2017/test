import { stage } from "../../classes/gframe.js";
import { Actor,CirActor } from "../../classes/actor.js";
import { GridCollision } from "../../classes/GridCollision.js";
import { Game } from "../../classes/Game.js";
var particles, gridSize = 80, grid,
    numParticles = 100;
export class Particle extends Game {
    static backgroundColor="#fff"
    constructor() {
        super("Particle");
        grid = new GridCollision(stage.width, stage.height, gridSize);
        grid.drawGrid();
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            let size = Math.random() * 25 + 5;
            const particle = new CirActor(Math.random() * stage.width, Math.random() * stage.height);
            particle.drawSpriteData(size*2)
            particle.edgeBehavior = Actor.WRAP;
            particle.mass = size;
            stage.addChild(particle);
            particles.push(particle);
        }
    }
    runGame() {
        // var date=Date.now();
        //普通检测
        // for (let i = 0; i < numParticles - 1; i++) {
        //     const partA = particles[i];
        //     for (let j = i + 1; j < numParticles; j++) {
        //         const partB = particles[j];
        //         if (partA.hitRadius(partB)) {
        //             this.billiardCollision(partA, partB);
        //         }
        //        gravitate(partA, partB);

        //     }
        // }
        //网格检测
        for (let i = 0; i < numParticles - 1; i++) {
            const partA = particles[i];
            for (let j = i + 1; j < numParticles; j++) {
                const partB = particles[j];
                gravitate(partA, partB);
            }
        }
        grid.check(particles);
        let numChecks = grid.checks.length;
        for (let i = 0; i < numChecks; i += 2) {
            let partA = grid.checks[i];
            let partB = grid.checks[i + 1];
            //gravitate(partA,partB);
            if (this.hitRadius(partA,partB)) {
                CirActor.billiardCollision(partA, partB);
            }
        }

        for (const particale of particles) {
            particale.act();

        }
        // console.log(Date.now()-date);
        // debugger;
    }
}
//相互吸引函数
function gravitate(partA, partB) {
    let dx = partB.x - partA.x,
      dy = partB.y - partA.y,
      distSQ = dx * dx + dy * dy,
      dist = Math.sqrt(distSQ),
      force = partA.mass * partB.mass / distSQ,
      ax = force * dx / dist,
      ay = force * dy / dist;
    //弹性吸引
    // let ax=dx*0.012,
    // ay=dy*0.012;
    partA.speed.x += ax / partA.mass;
    partA.speed.y += ay / partA.mass;
    partB.speed.x -= ax / partB.mass;
    partB.speed.y -= ay / partB.mass;
  };