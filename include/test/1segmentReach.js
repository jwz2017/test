import { Game } from "../../classes/Game.js";
import { Actor, CirActor, Vector } from "../../classes/actor.js";
import { stage } from "../../classes/gframe.js";
import { Segment } from "../../classes/shape.js";

var segments, ball, numSegments = 6, gravity = 0.5;
export class SegmentReach extends Game{
    static backgroundColor="#fff"
    constructor() {
        super("关节伸展");
        segments = [];
        ball = new CirActor(0,0,25);
        ball.maxSpeed = 20;
        ball.edgeBehavior = Actor.BOUNCE;
        ball.speed.x = 10;
        stage.addChild(ball);
    
        for (let i = 0; i < numSegments; i++) {
            var segment = new Segment(0,0,50,10);
            stage.addChild(segment);
            segments.push(segment);
        }
        segment.x = stage.width / 2;
        segment.y = stage.height / 2;
    }
    runGame() {
        this.moveBall();
        var target = this.reach(segments[0], ball.x, ball.y);
        // var target=this.reach(segments[0],stage.mouseX,stage.mouseY);
        for (let i = 1; i < numSegments; i++) {
            const segment = segments[i];
            target = this.reach(segment, target.x, target.y);
        }
        for (let i = numSegments - 1; i > 0; i--) {
            const segmentA = segments[i];
            const segmentB = segments[i - 1];
            this.position(segmentB, segmentA);
        }
        this.checkHit();
    }
    reach(segment, xpos, ypos) {
        let dx = xpos - segment.x;
        let dy = ypos - segment.y;
        let angle = Math.atan2(dy, dx);
        segment.rotation = angle * 180 / Math.PI;
        let w = segment.getPin().x - segment.x;
        let h = segment.getPin().y - segment.y;
        let tx = xpos - w;
        let ty = ypos - h;
        return new Vector(tx, ty);
    }
    position(segmentA, segmentB) {
        segmentA.x = segmentB.getPin().x;
        segmentA.y = segmentB.getPin().y;
    }
    moveBall() {
        ball.speed.y += gravity;
        ball.act();
    }
    checkHit() {
        let segment = segments[0];
        let dx = segment.getPin().x - ball.x;
        let dy = segment.getPin().y - ball.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ball.hit) {
            ball.speed.x += Math.random() * 2 - 1;
            ball.speed.y -= 1;
        }
    }

}