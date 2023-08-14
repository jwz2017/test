import { gframe, stage } from "../../classes/gframe.js";
import { Actor,CirActor } from "../../classes/actor.js";
import { GridCollision } from "../../classes/GridCollision.js";
var particles, gridSize = 80, grid,
    numParticles = 100;
export class Particle extends gframe.Game {
    constructor() {
        super("Particle");
    }
    waitComplete() {
        grid = new GridCollision(stage.width, stage.height, gridSize);
        grid.drawGrid();
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            const particle = new CirActor(Math.random() * stage.width, Math.random() * stage.height);
            let size = Math.random() * 50 + 10;
            particle.init(size, size);
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
        //         this.gravitate(partA, partB);

        //     }
        // }
        //网格检测
        for (let i = 0; i < numParticles - 1; i++) {
            const partA = particles[i];
            for (let j = i + 1; j < numParticles; j++) {
                const partB = particles[j];
                Actor.gravitate(partA, partB);
            }
        }
        grid.check(particles);
        let numChecks = grid.checks.length;
        for (let i = 0; i < numChecks; i += 2) {
            let partA = grid.checks[i];
            let partB = grid.checks[i + 1];
            // this.gravitate(partA,partB);
            if (partA.hitRadius(partB)) {
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