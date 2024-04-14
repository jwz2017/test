import { Vector } from "./actor.js";
//旋转矩形碰撞
export class OBB {
  constructor(centerPoint, width, height, rotation) {
    this.centerPoint = centerPoint;
    this.extents = [width / 2, height / 2];
    this.axes = [new Vector(Math.cos(rotation), Math.sin(rotation)), new Vector(-1 * Math.sin(rotation), Math.cos(rotation))];

    this._width = width;
    this._height = height;
    this._rotation = rotation;

  }
  getProjectionRadius(axis) {
    return this.extents[0] * Math.abs(axis.dot(this.axes[0])) + this.extents[1] * Math.abs(axis.dot(this.axes[1]));
  }
}
export var detectorOBBvsOBB = function (OBB1, OBB2) {
  let nv=Vector.sub(OBB1.centerPoint,OBB2.centerPoint);
  var axisA1 = OBB1.axes[0];
  if (OBB1.getProjectionRadius(axisA1) + OBB2.getProjectionRadius(axisA1) <= Math.abs(nv.dot(axisA1))) return false;
  var axisA2 = OBB1.axes[1];
  if (OBB1.getProjectionRadius(axisA2) + OBB2.getProjectionRadius(axisA2) <= Math.abs(nv.dot(axisA2))) return false;
  var axisB1 = OBB2.axes[0];
  if (OBB1.getProjectionRadius(axisB1) + OBB2.getProjectionRadius(axisB1) <= Math.abs(nv.dot(axisB1))) return false;
  var axisB2 = OBB2.axes[1];
  if (OBB1.getProjectionRadius(axisB2) + OBB2.getProjectionRadius(axisB2) <= Math.abs(nv.dot(axisB2))) return false;
  return true;
}
/**
 像素级碰撞检测
 * @author olsn, indiegamr.com
 **/
var collisionCanvas = document.createElement('canvas');
var collisionCtx = collisionCanvas.getContext('2d', { willReadFrequently: true });
//collisionCtx.globalCompositeOperation = 'source-in';
collisionCtx.save();

var collisionCanvas2 = document.createElement('canvas');
var collisionCtx2 = collisionCanvas2.getContext('2d', { willReadFrequently: true });
collisionCtx2.save();

var cachedBAFrames = [];
export var checkPixelCollision = function (bitmap1, bitmap2, rect, alphaThreshold, getRect) {
  getRect = getRect || false;

  var imageData1, imageData2,
    pixelIntersection;
  let intersection = rect;
  alphaThreshold = alphaThreshold || 0;
  alphaThreshold = Math.min(0.99999, alphaThreshold);

  //setting the canvas size
  collisionCanvas.width = intersection.width;
  collisionCanvas.height = intersection.height;
  collisionCanvas2.width = intersection.width;
  collisionCanvas2.height = intersection.height;

  imageData1 = _intersectingImagePart(intersection, bitmap1, collisionCtx);
  imageData2 = _intersectingImagePart(intersection, bitmap2, collisionCtx2);
  //compare the alpha values to the threshold and return the result
  // = true if pixels are both > alphaThreshold at one coordinate
  pixelIntersection = _compareAlphaValues(imageData1, imageData2, intersection.width, intersection.height, alphaThreshold, getRect);

  if (pixelIntersection) {
    pixelIntersection.x += intersection.x;
    pixelIntersection.x2 += intersection.x;
    pixelIntersection.y += intersection.y;
    pixelIntersection.y2 += intersection.y;
  } else {
    return false;
  }
  return pixelIntersection;
}
var _intersectingImagePart = function (intersetion, bitmap, ctx) {
  var bl, image, frameName, sr;
  var regX, regY;
  if (bitmap instanceof createjs.Bitmap) {
    image = bitmap.image;
  } else if (bitmap instanceof createjs.Sprite) {
    let frame = bitmap.spriteSheet.getFrame(bitmap.currentFrame)
    // console.log(frame);
    frameName = frame.image.src + ':' +
      frame.rect.x + ':' + frame.rect.y + ':' +
      frame.rect.width + ':' + frame.rect.height; // + ':' + frame.rect.regX  + ':' + frame.rect.regY 
    if (cachedBAFrames[frameName]) {
      image = cachedBAFrames[frameName];
    } else {
      cachedBAFrames[frameName] = image = createjs.SpriteSheetUtils.extractFrame(bitmap.spriteSheet, bitmap.currentFrame);
    }
    regX = frame.regX;
    regY = frame.regY;
  } else if (bitmap instanceof createjs.MovieClip) {
    var mBitmap;
    if (bitmap.instance.instance != undefined) {
      mBitmap = bitmap.instance.instance;
    } else if (bitmap.instance != undefined) {
      mBitmap = bitmap.instance;
    }
    let frame = mBitmap.spriteSheet.getFrame(mBitmap.currentFrame)
    frameName = frame.image.src + ':' +
      frame.rect.x + ':' + frame.rect.y + ':' +
      frame.rect.width + ':' + frame.rect.height; // + ':' + frame.rect.regX  + ':' + frame.rect.regY 
    if (cachedBAFrames[frameName]) {
      image = cachedBAFrames[frameName];
    } else {
      cachedBAFrames[frameName] = image = createjs.SpriteSheetUtils.extractFrame(mBitmap.spriteSheet, mBitmap.currentFrame);
    }
  }
  regX = regX || 0;
  regY = regY || 0;
  bl = bitmap.globalToLocal(intersetion.x, intersetion.y);
  ctx.restore();
  ctx.save();
  //ctx.clearRect(0,0,intersetion.width,intersetion.height);
  ctx.rotate(_getParentalCumulatedProperty(bitmap, 'rotation') * (Math.PI / 180));
  ctx.scale(_getParentalCumulatedProperty(bitmap, 'scaleX', '*'), _getParentalCumulatedProperty(bitmap, 'scaleY', '*'));
  ctx.translate(-bl.x - regX, -bl.y - regY);
  // ctx.translate(-bl.x - intersetion['rect' + i].regX, -bl.y - intersetion['rect' + i].regY);
  if ((sr = bitmap.sourceRect) != undefined) {
    ctx.drawImage(image, sr.x, sr.y, sr.width, sr.height, 0, 0, sr.width, sr.height);
  } else {
    ctx.drawImage(image, 0, 0, image.width, image.height);
  }
  return ctx.getImageData(0, 0, intersetion.width | 1, intersetion.height | 1).data;
}

var _compareAlphaValues = function (imageData1, imageData2, width, height, alphaThreshold, getRect) {
  var alpha1, alpha2, x, y, offset = 3,
    pixelRect = {
      x: Infinity,
      y: Infinity,
      x2: -Infinity,
      y2: -Infinity
    };

  // parsing through the pixels checking for an alpha match
  // TODO: intelligent parsing, not just from 0 to end!
  for (y = 0; y < height; ++y) {
    for (x = 0; x < width; ++x) {
      alpha1 = imageData1.length > offset + 1 ? imageData1[offset] / 255 : 0;
      alpha2 = imageData2.length > offset + 1 ? imageData2[offset] / 255 : 0;

      if (alpha1 > alphaThreshold && alpha2 > alphaThreshold) {
        if (getRect) {
          if (x < pixelRect.x) pixelRect.x = x;
          if (x > pixelRect.x2) pixelRect.x2 = x;
          if (y < pixelRect.y) pixelRect.y = y;
          if (y > pixelRect.y2) pixelRect.y2 = y;
        } else {
          return {
            x: x,
            y: y,
            width: 1,
            height: 1
          };
        }
      }
      offset += 4;
    }
  }

  if (pixelRect.x != Infinity) {
    pixelRect.width = pixelRect.x2 - pixelRect.x + 1;
    pixelRect.height = pixelRect.y2 - pixelRect.y + 1;
    return pixelRect;
  }

  return null;
}

// this is needed to paint the intersection part correctly,
// if the tested bitmap is a child to a rotated/scaled parent
// this was not painted correctly before
var _getParentalCumulatedProperty = function (child, propName, operation) {
  operation = operation || '+';
  if (child.parent && child.parent[propName]) {
    var cp = child[propName];
    var pp = _getParentalCumulatedProperty(child.parent, propName, operation);
    if (operation == '*') {
      return cp * pp;
    } else {
      return cp + pp;
    }
  }

  return child[propName];
}


