//刚体轨迹
export class Trail extends createjs.Shape {
    constructor(parent, body, dotDistance = 20) {
        super();
        parent.addChild(this);
        this.trailDistance = dotDistance;
        this.trailColor = "rgba(255,255,255,0.5)";
        this._dotSize = 1;
        this._bird = body;
        let p = body.GetPosition();
        this._birdPrePos = new createjs.Point(p.x, p.y);
    }
    update() {
        this._drawDotTo(this._bird.GetPosition())
    }
    startFromHere() {
        this.graphics.clear();
        let p = this._bird.GetPosition();
        this._birdPrePos.setValues(p.x, p.y);
    }
    _drawDotTo(birdCurPos) {
        this.graphics.setStrokeStyle(1).beginStroke(this.trailColor);
        let dx = birdCurPos.x - this._birdPrePos.x;
        let dy = birdCurPos.y - this._birdPrePos.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var distanceVec;
        while (distance > this.trailDistance / PTM) {
            distanceVec = new createjs.Point(birdCurPos.x - this._birdPrePos.x, birdCurPos.y - this._birdPrePos.y);
            let a = this.trailDistance / PTM / distance;
            distanceVec.setValues(distanceVec.x * a, distanceVec.y * a);
            this._birdPrePos.x += distanceVec.x;
            this._birdPrePos.y += distanceVec.y;
            this._dotSize = Math.random() > 0.5 ? 2 : 1;
            this.graphics.drawCircle(this._birdPrePos.x * PTM, this._birdPrePos.y * PTM, this._dotSize);
            let dx = birdCurPos.x - this._birdPrePos.x;
            let dy = birdCurPos.y - this._birdPrePos.y;
            distance = Math.sqrt(dx * dx + dy * dy);
        }
    }
}