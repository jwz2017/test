import { Trail } from "../Trail.js";

//弹弓
export class BirdThrower extends createjs.Container {
    constructor(parent, bird, x, y) {
        super();
        parent.addChild(this);
        this.x = x;
        this.y = y;
        this.isBirdMoveing = false;
        this.maxThrowImpulse = 4;
        this.bird = bird;
        this.bird.SetTransform(new b2Vec2(x / PTM, y / PTM), 0);
        if (bird.actor) {
            bird.actor.x = x;
            bird.actor.y = y;
        }
        this.bird.SetActive(false);

        this._mousePoint = new b2Vec2();
        this._activeSize = 70;
        this._distanceToCenter = new b2Vec2();
        let p = bird.GetPosition();
        this._center = new createjs.Point(p.x, p.y);

        this._trail = new Trail(this, bird)
        this._dragLine = new createjs.Shape();
        this.addChild(this._dragLine);
        parent.addChild(this._trail)
        this.drawActiveSize();

        this.impulse = new b2Vec2();

        this.addEvent();
    }
    addEvent() {
        this.on("mousedown", (e) => {
            if (this.isBirdMoveing) return;
            this.bird.SetActive(false);
            this._mousePoint.x = e.stageX / PTM;
            this._mousePoint.y = e.stageY / PTM;
        });
        this.on("pressup", () => {
            if (this.isBirdMoveing) return;
            this.bird.SetActive(true);
            this.impulse.Set(this._distanceToCenter.x, this._distanceToCenter.y);
            let mass = this.bird.GetMass();
            this.impulse.Set(-this.impulse.x * mass * this.maxThrowImpulse, -this.impulse.y * mass * this.maxThrowImpulse)

            this.bird.ApplyLinearImpulse(this.impulse, this.bird.GetPosition());
            this.isBirdMoveing = true;
            this._trail.startFromHere();
            this._dragLine.graphics.clear();
            this.drawActiveSize();
        });
        this.on("pressmove", (e) => {
            if (this.isBirdMoveing) return;
            this._mousePoint.x = e.stageX / PTM;
            this._mousePoint.y = e.stageY / PTM;

            let dx = this._mousePoint.x - this._center.x;
            let dy = this._mousePoint.y - this._center.y;
            this._distanceToCenter.Set(dx, dy);
            if (this._distanceToCenter.Length() * PTM >= this._activeSize) {
                let a = this._activeSize / PTM / this._distanceToCenter.Length()
                this._distanceToCenter.Set(this._distanceToCenter.x * a, this._distanceToCenter.y * a);
                let dx = this._distanceToCenter.x + this._center.x;
                let dy = this._distanceToCenter.y + this._center.y;
                this._mousePoint.Set(dx, dy)
            }
            this.bird.SetTransform(this._mousePoint, 0);
            if(this.bird.actor){
                this.bird.actor.x=this._mousePoint.x*PTM;
                this.bird.actor.y=this._mousePoint.y*PTM;
            }

            this._dragLine.graphics.clear().setStrokeStyle(1).beginStroke("#fff").moveTo(0, 0).lineTo(this._mousePoint.x * PTM - this.x, this._mousePoint.y * PTM - this.y);
            this.drawActiveSize();
        })
    }
    drawActiveSize() {
        let a = this._dragLine.graphics;
        a.setStrokeStyle(2).beginStroke("#555").moveTo(0, 0).lineTo(0, this._activeSize);
        a.setStrokeStyle(1).beginFill("rgba(0,0,0,0.1)").drawCircle(0, 0, 8).endFill();
        a.setStrokeStyle(1).beginStroke("rgba(255,0,0,0.4)").drawCircle(0, 0, this._activeSize);
        a.beginFill("#000").drawEllipse(-10, this._activeSize, 20, 5).endFill();
    }
    drawTrail() {
        if (this.isBirdMoveing) {
            this._trail.update();
        }
    }
    SetActiveSize(val) {
        this._activeSize = val;
        this.drawActiveSize();
    }
    reset() {
        this.isBirdMoveing = false;
        this.bird.SetLinearVelocity(new b2Vec2(0, 0));
        this.bird.SetAngularVelocity(0);
        this.bird.SetTransform(new b2Vec2(this.x / PTM, this.y / PTM), 0);
        if(this.bird.actor){
            this.bird.actor.x=this.x;
            this.bird.actor.y=this.y;
        }
        this.bird.SetActive(false);
    }
}