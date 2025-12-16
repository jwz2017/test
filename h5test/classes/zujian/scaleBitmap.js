export class ScaleBitmap extends createjs.DisplayObject {
    constructor(imageOrUri,scale9Grid) {
        super();
        if (typeof imageOrUri == "string") {
			this.image = new Image();
			this.image.src = imageOrUri;
		} else {
			this.image = imageOrUri;
		}
        this.drawWidth = this.image.width;
        this.drawHeight = this.image.height;
        this.scale9Grid = scale9Grid;
        this.snapToPixel = true;
    }
    setDrawSize(newWidth, newHeight) {
		this.drawWidth = newWidth;
		this.drawHeight = newHeight;
	};
    isVisible() {
		var hasContent = this.cacheCanvas || (this.image && (this.image.complete || this.image.getContext || this.image.readyState >= 2));
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
	};
    draw(ctx, ignoreCache) {
		if (super.draw(ctx, ignoreCache)) { return true; }

		var centerX = this.scale9Grid.width;
		var centerY = this.scale9Grid.height;
		if(centerX == 0) //vertical
		{
			if(centerY == 0)
			{
				throw "One of scale9Grid width or height must be greater than zero.";
			}
			var imageWidth = this.image.width;
			var scale3Region1 = this.scale9Grid.y;
			var scale3Region3 = this.image.height - scale3Region1 - centerY;
			var oppositeEdgeScale = this.drawWidth / imageWidth;
			var scaledFirstRegion = scale3Region1 * oppositeEdgeScale;
			var scaledThirdRegion = scale3Region3 * oppositeEdgeScale;
			var scaledSecondRegion = this.drawHeight - scaledFirstRegion - scaledThirdRegion;

			ctx.drawImage(this.image, 0, 0, imageWidth, scale3Region1, 0, 0, this.drawWidth, scaledFirstRegion);
			ctx.drawImage(this.image, 0, scale3Region1, imageWidth, centerY, 0, scaledFirstRegion, this.drawWidth, scaledSecondRegion);
			ctx.drawImage(this.image, 0, scale3Region1 + centerY, imageWidth, scale3Region3, 0, scaledFirstRegion + scaledSecondRegion, this.drawWidth, scaledThirdRegion);
		}
		else if(centerY == 0) //horizontal
		{
			var imageHeight = this.image.height;
			scale3Region1 = this.scale9Grid.x;
			scale3Region3 = this.image.width - scale3Region1 - centerX;
			oppositeEdgeScale = this.drawHeight / this.image.height;
			scaledFirstRegion = scale3Region1 * oppositeEdgeScale;
			scaledThirdRegion = scale3Region3 * oppositeEdgeScale;
			scaledSecondRegion = this.drawWidth - scaledFirstRegion - scaledThirdRegion;

			ctx.drawImage(this.image, 0, 0, scale3Region1, imageHeight, 0, 0, scaledFirstRegion, this.drawHeight);
			ctx.drawImage(this.image, scale3Region1, 0, centerX, imageHeight, scaledFirstRegion, 0, scaledSecondRegion, this.drawHeight);
			ctx.drawImage(this.image, scale3Region1 + centerX, 0, scale3Region3, imageHeight, scaledFirstRegion + scaledSecondRegion, 0, scaledThirdRegion, this.drawHeight);
		}
		else
		{
			var left = this.scale9Grid.x;
			var top = this.scale9Grid.y;
			var right = this.image.width - centerX - left;
			var bottom = this.image.height - centerY - top;
			var scaledCenterX = this.drawWidth - left - right;
			var scaledCenterY = this.drawHeight - top - bottom;

			ctx.drawImage(this.image, 0, 0, left, top, 0, 0, left, top);
			ctx.drawImage(this.image, left, 0, centerX, top, left, 0, scaledCenterX, top);
			ctx.drawImage(this.image, left + centerX, 0, right, top, left + scaledCenterX, 0, right, top);

			ctx.drawImage(this.image, 0, top, left, centerY, 0, top, left, scaledCenterY);
			ctx.drawImage(this.image, left, top, centerX, centerY, left, top, scaledCenterX, scaledCenterY);
			ctx.drawImage(this.image, left + centerX, top, right, centerY, left + scaledCenterX, top, right, scaledCenterY);

			ctx.drawImage(this.image, 0, top + centerY, left, bottom, 0, top + scaledCenterY, left, bottom);
			ctx.drawImage(this.image, left, top + centerY, centerX, bottom, left, top + scaledCenterY, scaledCenterX, bottom);
			ctx.drawImage(this.image, left + centerX, top + centerY, right, bottom, left + scaledCenterX, top + scaledCenterY, right, bottom);
		}

		return true;
	};
    clone() {
		var o = new ScaleBitmap(this.image, this.scale9Grid.clone());
		if (this.sourceRect) { o.sourceRect = this.sourceRect.clone(); }
		this.cloneProps(o);
		return o;
	};
    toString() {
		return "[ScaleBitmap (name="+  this.name +")]";
	};
}