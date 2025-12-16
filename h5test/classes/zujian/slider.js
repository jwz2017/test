export class Slider extends createjs.Shape {
    constructor(min,max,width,height) {
        super();
        // public properties:
		this.min = this.value = min||0;
		this.max = max||100;
		
		this.width = width||100;
		this.height = height||20;
		
		this.values = {};
		
		this.trackColor = "#EEE";
		this.thumbColor = "#666";
		
		this.cursor = "pointer";
		this.on("mousedown", this._handleInput, this);
		this.on("pressmove", this._handleInput, this);
    }
    // public methods:
	isVisible() { return true; };

	draw(ctx, ignoreCache) {
		if (this._checkChange()) {
			var x = (this.width-this.height) * Math.max(0,Math.min(1,(this.value-this.min) / (this.max-this.min)));
			this.graphics.clear()
				.beginFill(this.trackColor).drawRect(0,0,this.width,this.height)
				.beginFill(this.thumbColor).drawRect(x,0,this.height, this.height);
		}
        super.draw(ctx,true);
		// this.Shape_draw(ctx, true);
	};
    // private methods:
	_checkChange() {
		var a = this, b = a.values;
		if (a.value !== b.value || a.min !== b.min || a.max !== b.max || a.width !== b.width || a.height !== b.height) {
			b.min = a.min;
			b.max = a.max;
			b.value = a.value;
			b.width = a.width;
			b.height = a.height;
			return true;
		}
		return false;
	};
	
	_handleInput(evt) {
		var val = (evt.localX-this.height/2)/(this.width-this.height)*(this.max-this.min)+this.min;
		val = Math.max(this.min, Math.min(this.max, val));
		if (val == this.value) { return; }
		this.value = val;
		this.dispatchEvent("change");
	};
}