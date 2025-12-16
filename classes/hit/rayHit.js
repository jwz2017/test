export function isBallInBucker(rect, nextRect, bucketRect) {
    let p = new createjs.Point();
    let x1 = rect.x+rect.width/2,
        y1 = rect.y+rect.height/2,
        x2 = nextRect.x+nextRect.width/2,
        y2 = nextRect.y+nextRect.height/2,
        x3 = bucketRect.x ,
        y3 = bucketRect.y,
        x4 = bucketRect.x + bucketRect.width ,
        y4 = y3;
    if (x1 == x2 || y1 == y2) return;
    let m1 = (y2 - y1) / (x2 - x1),
        m2 = (y4 - y3) / (x4 - x3),
        b1 = y1 - m1 * x1,
        b2 = y3 - m2 * x3;
    p.x = (b2 - b1) / (m1 - m2);
    p.y = m1 * p.x + b1;
    return p.x>x3&&p.x<x4&&y2>p.y&&y1<p.y;
}