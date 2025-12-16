/**
 * 碰撞侦听
 */
export class ContactListener {
    constructor() {
        this.contactListener = new Box2D.JSContactListener();
        world.SetContactListener(this.contactListener);
        this.contactListener.PreSolve = (contactPtr, b2ManifoldPtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            var manifold = Box2D.wrapPointer(b2ManifoldPtr, b2Manifold);
            this.PreSolve(contact, manifold);
        }
        this.contactListener.BeginContact = (contactPtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            this.BeginContact(contact);
        }
        this.contactListener.PostSolve = (contactPtr, b2ContactImpulsePtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            var impulse = Box2D.wrapPointer(b2ContactImpulsePtr, b2ContactImpulse);
            this.PostSolve(contact, impulse);
        }
        this.contactListener.EndContact = (contactPtr) => {
            var contact = Box2D.wrapPointer(contactPtr, b2Contact);
            this.EndContact(contact);
        }
    }
    PreSolve(contact, manifold) { };
    BeginContact(contact) { }
    PostSolve(contact, impulse) { };
    EndContact(contact) { }
    /**
     * 查找目标对象
     * @param {*} contact 
     * @param {number} targetA 
     * @returns 
     */
    sortByOneBody(contact, targetA) {
        let _tempBodyA = contact.GetFixtureA().GetBody();
        let _tempBodyB = contact.GetFixtureB().GetBody();
        var userDataA = _tempBodyA.GetUserData();
        var userDataB = _tempBodyB.GetUserData();
        var result;
        if (userDataA == targetA) {
            result = [_tempBodyA, _tempBodyB];
        } else if (userDataB == targetA) {
            result = [_tempBodyB, _tempBodyA];
        }
        return result;
    }
    sortByOneFixture(contact, userData) {
        let tempFA = contact.GetFixtureA();
        let tempFB = contact.GetFixtureB();
        let userDataA = tempFA.GetUserData();
        let userDataB = tempFB.GetUserData();
        let result;
        if (userDataA == userData) {
            result = [tempFA, tempFB]
        } else if (userDataB == userData) {
            result = [tempFB, tempFA];
        }
        return result;
    }
    sortByTwoBody(contact, targetA, targetB) {
        var checkResult;
        let _tempBodyA = contact.GetFixtureA().GetBody();
        let _tempBodyB = contact.GetFixtureB().GetBody();
        var userDataA = _tempBodyA.GetUserData();
        var userDataB = _tempBodyB.GetUserData();
        if (userDataA == targetA && userDataB == targetB) {
            checkResult = [_tempBodyA, _tempBodyB];
        } else if (userDataB == targetA && userDataA == targetB) {
            checkResult = [_tempBodyB, _tempBodyA];
        }
        return checkResult;
    }
}

export class BallMoveContactListener extends ContactListener {
    constructor() {
        super()
    }
    BeginContact(contact) {
        var checkResult = this.sortByOneBody(contact, USER_DATA_BALL);
        if (!checkResult) return;
        let player = checkResult[0];
        let another = checkResult[1];
        if (another.GetUserData() == USER_DATA_GROUND) {
            let velocity = player.GetLinearVelocity();
            if (velocity.y >= 0) {
                this.checkIsReadyToJump(contact, player);
            }
        } else if (another.GetUserData() == USER_DATA_PLANET) {
            this.isContactWithPlatform(contact, player, another);
        }
    }
    EndContact(contact) {
        var checkResult = this.sortByOneBody(contact, USER_DATA_BALL);
        if (!checkResult) return;

        let another = checkResult[1];
        if (another.GetUserData() == USER_DATA_PLANET) {
            another.GetFixtureList().SetSensor(false);
        }
    }
    isContactWithPlatform(contact, player, plat) {
        var wm = new b2WorldManifold();
        contact.GetWorldManifold(wm);
        let contactPoint = wm.get_points();
        contactPoint = plat.GetLocalPoint(contactPoint);

        if (contactPoint.y < 0) {
            this.checkIsReadyToJump(contact, player)
        } else {
            plat.GetFixtureList().SetSensor(true);
            contact.SetEnabled(false);
        }
    }
    checkIsReadyToJump(contact, player) {
        contact.SetRestitution(0)
        this._wm = this._wm || new b2WorldManifold();
        contact.GetWorldManifold(this._wm);
        let v = this._wm.get_normal();
        let contactAngle = Math.atan2(v.y, v.x);
        if (contactAngle < -Math.PI / 4 && contactAngle > -Math.PI * 3 / 4) {
            player.isReadyToJump = true;
        } else {
            player.isReadyToJump = false
        }
    }
}
