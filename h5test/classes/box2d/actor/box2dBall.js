export class Box2DBall {
    constructor(body, actor) {
        this.body = body;
        this.TROUR = 40;
        this.maxSpeed = 300 * Math.PI / 180;
        this._vec = new b2Vec2();
        if(actor) this.body.actor = actor;

        this.body.SetSleepingAllowed(false);
        this.body.SetAngularDamping(1);
        this.body.isReadyToJump = false;
        this.body.SetUserData(USER_DATA_BALL);
    }
    
    act(keys) {
        this.playerTorque = 0;
        if (keys.left) this.playerTorque = -this.TROUR;
        if (keys.right) this.playerTorque = this.TROUR;
        if (keys.up) {
            if (this.body.isReadyToJump) {
                let v=this.body.GetLinearVelocity();
                v.y=0;
                this.body.SetLinearVelocity(v)
                this._vec.y = -this.body.GetMass() * 8;
                this.body.ApplyLinearImpulse(this._vec, this.body.GetPosition());
                this.body.isReadyToJump = false;
            }
        }
        this.body.ApplyTorque(this.playerTorque);
        this._limitAngleVelocity(this.body, this.maxSpeed)
        if (keys.left || keys.right) {
            let v = this.body.GetLinearVelocity();
            v.x = this.body.GetAngularVelocity() * 20 / PTM;
            this.body.SetLinearVelocity(v);
        }
    }
    _limitAngleVelocity(body, speedMax) {
        var av = body.GetAngularVelocity();
        if (Math.abs(av) > speedMax) {
            av = Math.abs(av) / av * speedMax;
            body.SetAngularVelocity(av);
        }
    }
}