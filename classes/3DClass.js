/**
 * 3d相关以及等角游戏类
 */
class Point3D {
    constructor(x = 0, y = 0, z = 0) {
        this.fl = 250;
        this._vpX = 0;
        this._vpY = 0;
        this._cX = 0;
        this._cY = 0;
        this._cZ = 0;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    setVanishingPoint(vpX, vpY) {
        this._vpX = vpX;
        this._vpY = vpY;
    }
    setCenter(cX, cY, cZ = 0) {
        this._cX = cX;
        this._cY = cY;
        this._cZ = cZ;
    }
    get screenX() {
        let scale = this.fl / (this.fl + this.z + this._cZ);
        return this._vpX + this._cX + this.x * scale;
    }
    get screenY() {
        let scale = this.fl / (this.fl + this.z + this._cZ);
        return this._vpY + this._cY + this.y * scale;
    }
    rotateX(angleX) {
        let cosX = Math.cos(angleX),
            sinX = Math.sin(angleX),
            y1 = this.y * cosX - this.z * sinX,
            z1 = this.z * cosX + this.y * sinX;
        this.y = y1;
        this.z = z1;
    }
    rotateY(angleY) {
        let cosY = Math.cos(angleY),
            sinY = Math.sin(angleY),
            x1 = this.x * cosY - this.z * sinY,
            z1 = this.z * cosY + this.x * sinY;
        this.x = x1;
        this.z = z1;
    }
    rotateZ(angleZ) {
        let cosZ = Math.cos(angleZ),
            sinZ = Math.sin(angleZ),
            x1 = this.x * cosZ - this.y * sinZ,
            y1 = this.y * cosZ + this.x * sinZ;
        this.x = x1;
        this.y = y1;
    }

}
class Triangle {
    constructor(a, b, c, color) {
        this._pointA = a;
        this._pointB = b;
        this._pointC = c;
        this._color = color;
    }
    draw(g) {
        if (this._isBackFace()) {
            return;
        }
        g.beginStroke(this.getAdjustedColor());
        g.beginFill(this.getAdjustedColor());
        g.moveTo(this._pointA.screenX, this._pointA.screenY);
        g.lineTo(this._pointB.screenX, this._pointB.screenY);
        g.lineTo(this._pointC.screenX, this._pointC.screenY);
        g.closePath();
        // g.endStroke();
        g.endFill();
    }
    _isBackFace() {
        let cax = this._pointC.screenX - this._pointA.screenX;
        let cay = this._pointC.screenY - this._pointA.screenY;
        let bcx = this._pointB.screenX - this._pointC.screenX;
        let bcy = this._pointB.screenY - this._pointC.screenY;
        return cax * bcy > cay * bcx;
    }
    getAdjustedColor() {
        let color = GFrame.parseColor(this._color, true);
        let red = color >> 16;
        let green = color >> 8 & 0xff;
        let blue = color & 0xff;
        let lightFactor = this._getLightFactor();
        red *= lightFactor;
        green *= lightFactor;
        blue *= lightFactor;
        return GFrame.parseColor(red << 16 | green << 8 | blue);
    }
    _getLightFactor() {
        let ab = new Object();
        ab.x = this._pointA.x - this._pointB.x;
        ab.y = this._pointA.y - this._pointB.y;
        ab.z = this._pointA.z - this._pointB.z;
        let bc = new Object();
        bc.x = this._pointB.x - this._pointC.x;
        bc.y = this._pointB.y - this._pointC.y;
        bc.z = this._pointB.z - this._pointC.z;
        let norm = new Object();
        norm.x = (ab.y * bc.z) - (ab.z * bc.y);
        norm.y = -((ab.x * bc.z) - (ab.z * bc.x));
        norm.z = (ab.x * bc.y) - (ab.y * bc.x);
        let dotProd = norm.x * this.light.x + norm.y * this.light.y + norm.z * this.light.z;
        let normMag = Math.sqrt(norm.x * norm.x + norm.y * norm.y + norm.z * norm.z);
        let lightMag = Math.sqrt(this.light.x * this.light.x + this.light.y * this.light.y + this.light.z * this.light.z);

        return Math.acos(dotProd / (normMag * lightMag)) / Math.PI * this.light.brightness;
    }
    get depth() {
        let zpos = Math.min(this._pointA.z, this._pointB.z);
        zpos = Math.min(zpos, this._pointC.z);
        return zpos;
    }

}
class Light {
    constructor(x = -100, y = -100, z = -100, brightness = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.brightness = brightness;
    }
    get brightness() {
        return this._brightness;
    }
    set brightness(b) {
        this._brightness = Math.max(b, 0);
        this._brightness = Math.min(this._brightness, 1);
    }

}

//**********************************等角世界游戏************************************* */
class IsoUtils {
    //1.2247的精确计算版本
    static Y_CORRECT = Math.cos(-Math.PI / 6) * Math.SQRT2;
    /**
     * 把等角空间中的一个3d坐标点转换成屏幕上的2d坐标点
     * @param {Point3D} pos 
     */
    static isoToScreen = function (pos) {
        let screenX = pos.x - pos.z;
        let screenY = pos.y * IsoUtils.Y_CORRECT + (pos.x + pos.z) * .5;
        return new createjs.Point(screenX, screenY);
    }
    /**
     * 把屏幕上的2d坐标点转换成等角空间中的一个3d坐标点
     * @param {createjs.Point} point 
     */
    static screenToIso = function (point) {
        let xpos = point.y + point.x * .5;
        let ypos = 0;
        let zpos = point.y - point.x * .5;
        return new Point3D(xpos, ypos, zpos);
    }
    constructor() {

    }
}

class IsoObject extends createjs.Container {
    constructor(size) {
        super();
        this._size = size;
        this._position = new Point3D();
        this._walkable = false;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.updateScreenPosition();
    }
    /**
     * 把当前时刻的一个3d坐标点转换成屏幕上的2d坐标点，并将自己安置于该点
     */
    updateScreenPosition() {
        let screenPos = IsoUtils.isoToScreen(this._position);
        this.x = screenPos.x;
        this.y = screenPos.y;
    }

    set xpos(value) {
        this._position.x = value;
        this.updateScreenPosition();
    }
    set ypos(value) {
        this._position.y = value;
        this.updateScreenPosition();
    }
    set zpos(value) {
        this._position.z = value;
        this.updateScreenPosition();
    }
    set position(value) {
        this._position = value;
        this.updateScreenPosition();
    }
    /**
     * 指定其它对象是否可以经过所占位置
     */
    set walkable(value) {
        this._walkable = value;
    }
    get walkable() {
        return this._walkable;
    }
    get xpos() {
        return this._position.x;
    }
    get ypos() {
        return this._position.y;
    }
    get zpos() {
        return this._position.z;
    }
    get position() {
        return this._position;
    }
    get size() {
        return this._size;
    }
    /**
     * 返回形变后的层深
     */
    get depth() {
        return (this._position.x + this._position.z) * .866 - this._position.y * .707;
    }
    get rect() {
        return new createjs.Rectangle(this.xpos - this.size / 2, this.zpos - this.size / 2, this.size, this.size);
    }
}
class DrawnIsoTile extends IsoObject {
    constructor(size, color, height = 0) {
        super(size);
        this.shape = new createjs.Shape();
        this.addChild(this.shape);
        this._color = color;
        this._height = height;
        this.drawShape();
    }
    drawShape() {
        this.shape.graphics.clear().
            setStrokeStyle(0.1).
            beginStroke("#000").
            beginFill(this.color).
            moveTo(-this.size, 0).
            lineTo(0, -this.size * .5).
            lineTo(this.size, 0).
            lineTo(0, this.size * .5).
            lineTo(-this.size, 0).
            endStroke().
            endFill();
    }
    set height(value) {
        this._height = value;
        this.drawShape();
    }
    get height() {
        return this._height;
    }
    set color(value) {
        this._color = value;
        this.drawShape();
    }
    get color() {
        return this._color;
    }
}
class DrawnIsoBox extends DrawnIsoTile {
    constructor(size, color, height) {
        super(size, color, height);

    }
    drawShape() {
        this.shape.graphics.clear();
        let color = GFrame.parseColor(this.color, true);
        let red = color >> 16;
        let green = color >> 8 & 0xff;
        let blue = color & 0xff;
        let leftShadow = GFrame.parseColor((red * .5) << 16 | (green * .5) << 8 | (blue * .5));
        let rightShadow = GFrame.parseColor((red * .75) << 16 | (green * .75) << 8 | (blue * .75));
        let h = this._height * IsoUtils.Y_CORRECT;
        //draw top
        this.shape.graphics.beginFill(this._color).
            moveTo(-this._size, -h).
            lineTo(0, -this._size * .5 - h).
            lineTo(this._size, -h).
            lineTo(0, this._size * .5 - h).
            lineTo(-this._size, -h).
            endFill();
        //draw left
        this.shape.graphics.beginFill(leftShadow).
            moveTo(-this._size, -h).
            lineTo(0, this._size * .5 - h).
            lineTo(0, this._size * .5).
            lineTo(-this._size, 0).
            lineTo(-this._size, -h).
            endFill();
        //draw right
        this.shape.graphics.beginFill(rightShadow).
            moveTo(this._size, -h).
            lineTo(0, this._size * .5 - h).
            lineTo(0, this._size * .5).
            lineTo(this._size, 0).
            lineTo(this._size, -h).
            endFill();
    }
}
//使用外部图形类
class GraphicTile extends IsoObject {
    constructor(size, gfx, xoffset, yoffset) {
        super(size);
        // let gfx = new ClassRef();
        gfx.x = -xoffset;
        gfx.y = -yoffset;
        this.addChild(gfx);
    }

}
/**
 * 等角世界类
 */
class IsoWorld extends createjs.Container {
    constructor() {
        super();
        this._floor = new createjs.Container();
        this._world = new createjs.Container();
        this.addChild(this._floor, this._world);
    }
    addChildToWorld(child) {
        this._world.addChild(child);
        this.sortDepth();
    }
    addChildToFloor(child) {
        this._floor.addChild(child);
    }
    canMove(obj) {
        let rect = obj.rect.setValues(obj.rect.x + obj.vx, obj.rect.y + obj.vz, obj.rect.width, obj.rect.height);
        for (let i = 0; i < this._world.numChildren; i++) {
            const objB = this._world.getChildAt(i);
            if (obj != objB && !objB.walkable && rect.intersects(objB.rect)) {
                return false;
            }
        }
        return true;
    }
    sortDepth() {
        this._world.sortChildren(function (a, b) {
            return a.depth - b.depth;
        });
    }
}