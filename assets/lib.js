(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


(lib.AnMovieClip = function(){
	this.actionFrames = [];
	this.ignorePause = false;
	this.gotoAndPlay = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
	}
}).prototype = p = new cjs.MovieClip();
// symbols:



(lib.Bitmap4 = function() {
	this.initialize(img.Bitmap4);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,592,451);


(lib.Button = function() {
	this.initialize(img.Button);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,166,56);// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop, this.reversed));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 图层 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#000000").s().p("AhxB0QAkgcARggQgZgOgRgHQAMgnALgsIgCAAQgNAAgLADIgKgJIAlAAQAKgrACgSIAYALIgKAFIgMAtIAgAAIAHgJIAQAOIgIAGQgLA7gOAjQATAKAEAFQAEAFAAAIIgBAKQAAABgBABQAAABAAAAQAAABgBAAQAAABAAAAQgDAAgFgJQgJgNgNgKQgZAlgmAUgAhZAhQASAHAPAGQAQgjAJg7IgiAAIgYBRgAAFBAIgBg6IAQAJIBBAAIAHgKIARAOIgIAGQAABIABAKIgPAIIAAgVIhDAAIAAARIgQAGIABg1gAAUBYIBDAAIAAhCIhDAAgAgKgcQAKgDANgYQANgXALgoIAWAPIgJAEQggA6gMANIBZgDQgKgSgSgTIADgDQApAcACAGQADAHAAAGQAAAHgEAFQgEAFgCAAQgBAAAAAAQgBgBAAAAQAAAAgBgBQAAgBAAgBIgGgOQgsADgWAEQgWAFgIAHg");
	this.shape.setTransform(112.575,19.35);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#000000").s().p("AhyBvQAigVARgcQASgbAAgtIgnAAQgNAAgLADIgKgJIBJAAIAAhMIgZAAQgNAAgMADIgJgJICtAAIAPgPIAWAVIg7AAIAABMIAhAAIARgQIAWAWIhIAAIAABOQAAAUACASIgRAGIABg0IAAhGIg+AAQgCArgSAdQgSAdgrAXgAgdgQIA+AAIAAhMIg+AAg");
	this.shape_1.setTransform(86.9,19.825);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#000000").ss(1,1,1).p("AvnjHIfPAAIAAGPI/PAAg");
	this.shape_2.setTransform(100,20);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#33CC33").s().p("AvnDIIAAmPIfPAAIAAGPg");
	this.shape_3.setTransform(100,20);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#000000").s().p("AhxB0QAkgdARgfQgZgPgRgGQAMgnALgrIgCAAQgNAAgLADIgKgKIAlAAQAKgsACgSIAYALIgKAGIgMAtIAgAAIAHgJIAQANIgIAGQgLA9gOAiQATAKAEAFQAEAFAAAJIgBAJQgBABAAABQAAABAAAAQgBABAAAAQAAAAAAAAQgDAAgFgHQgJgOgNgKQgZAkgmAVgAhZAiQASAFAPAHQAQgjAJg6IgiAAIgYBRgAAFA/IgBg5IAQAKIBBAAIAHgLIARANIgIAIQAABGABAMIgPAHIAAgUIhDAAIAAAQIgQAGIABg2gAAUBZIBDAAIAAhEIhDAAgAgKgbQAKgEANgYQANgXALgoIAWAOIgJAFQggA5gMAPIBZgDQgKgUgSgSIADgDQApAbACAIQADAGAAAFQAAAIgEAFQgEAFgCAAQgCAAgBgEIgGgPQgsAEgWAEQgWAFgIAHg");
	this.shape_4.setTransform(113.075,19.85);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#000000").s().p("AhyBvQAigVARgcQARgbACgtIgpAAQgNAAgLADIgJgJIBKAAIAAhMIgaAAQgNAAgMADIgJgJICtAAIAPgPIAVAVIg5AAIAABMIAgAAIAQgQIAXAWIhHAAIAABOQgBAUACASIgSAGIABg0IAAhGIg+AAQgBArgSAdQgSAdgsAXgAgegQIA+AAIAAhMIg+AAg");
	this.shape_5.setTransform(87.4,20.325);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#006633").s().p("AvnDIIAAmPIfPAAIAAGPg");
	this.shape_6.setTransform(100,20);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#333333").s().p("AvnDIIAAmPIfPAAIAAGPg");
	this.shape_7.setTransform(100,20);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#000000").s().p("AvnDIIAAmPIfPAAIAAGPg");
	this.shape_8.setTransform(100,20);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_6},{t:this.shape_2},{t:this.shape_5},{t:this.shape_4}]},1).to({state:[{t:this.shape_7},{t:this.shape_2},{t:this.shape_5},{t:this.shape_4}]},1).to({state:[{t:this.shape_8},{t:this.shape_2},{t:this.shape_5},{t:this.shape_4}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,202,42);


(lib.prizecon = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 图层 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(37,180,218,0.008)").s().p("AtRCWIAAkrIajAAIAAErg");
	this.shape.setTransform(85,15);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.prizecon, new cjs.Rectangle(0,0,170,30), null);


(lib.元件1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 图层 1
	this.instance = new lib.Button();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.元件1, new cjs.Rectangle(0,0,166,56), null);


(lib.Title = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	this.isSingleFrame = false;
	// timeline functions:
	this.frame_0 = function() {
		if(this.isSingleFrame) {
			return;
		}
		if(this.totalFrames == 1) {
			this.isSingleFrame = true;
		}
		this.stop();
		this.btn1.addEventListener("click", ()=> {
			console.log(this);	
			this.dispatchEvent(GFrame.event.OK_BUTTON, false);
		});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// 图层 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AjIA5QAAh2gChEIAgARIBrAAQASgyAHgsIiNAAQggAAgYAHIgUgUIG0AAIAjghIAoAuIkRAAIAgASIgUAGQgbAmgRAgIDVAAIAPgVIAjAaIgPAPQAADEADCDIgiAQIAAgsIlSAAIAAAeIggAQQAChNAAh3gABIDCIBgAAIAAkkIhgAAgAgvDCIBbAAIAAhhIhbAAgAiqDCIBfAAIAAkkIhfAAgAgvBUIBbAAIAAhWIhbAAgAgvgPIBbAAIAAhTIhbAAg");
	this.shape.setTransform(450.7,283.325);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AjoDyQBPgfAkgrQAkgqAHhpQhAA5htAaIgDgJQCRgwA7hqIhWAAIAAAPIgeANQACg2AAg2QAAg2gCg0IAjAUID9AAIARgWIAkAeIgWAQQAABgACA3IgfANIAAgWIhVAAQAnA0AwAVQAxAWBHAJIAAAGQgcAFgLAaQg5gUgugfQgtgfgfg7IgpAAQgfAwghAeIAuATIgRANQgPBpgtAjQgtAjhTAWgAAKhIIB2AAIAAhCIh2AAgAiEhIIByAAIAAhCIhyAAgAAKiXIB2AAIAAg9Ih2AAgAiEiXIByAAIAAg9IhyAAgAA+CEQAAg7gCgyIAuAUIgPAPQAAB6ACAzIghAPQACg3AAg7g");
	this.shape_1.setTransform(395.25,283.775);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("Aj0D6QBNg+AkhEQg2geglgOQAahWAYheIgEAAQgdAAgYAGIgTgTIBPAAQAVheAFgnIAyAYIgUAMQgIAdgSBEIBEAAIAPgTIAjAcIgSANQgYCCgeBKQAqAXAIALQAJAKAAASQAAAKgCAKQgCAKgDAAQgGAAgLgRQgUgdgagVQg3BPhQArgAjBBJQAnANAgANQAhhLAUiAIhIAAIg0CxgAALCJQAAhSgCgqIAgAUICNAAIAPgWIAlAcIgRAQQAACZACAYIghAPIAAgrIiRAAIAAAiIggAOQACghAAhSgAApC+ICRAAIAAiQIiRAAgAgXg8QAXgJAcgyQAbgzAXhVIAxAfIgUAKQhDB7gbAfIC+gHQgWgqgkgnIAGgGQBXA7AGAPQAGAQgBALQAAAOgJAMQgIALgEgBQgFAAgCgIIgNgfQhfAHgvAJQguALgSAPg");
	this.shape_2.setTransform(338.05,283);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("Aj2DwQBIgvAlg7QAmg6AChiIhWAAQgcAAgYAGIgUgTICeAAIAAikIg3AAQgcAAgYAHIgUgVIF1AAIAhggIAuAuIh9AAIAACkIBGAAIAjgjIAwAwIiZAAIAACpQAAAqACAnIglAOQAChCAAguIAAiYIiHAAQgCBdgnA/QgoA9hdAzgAhBgjICHAAIAAikIiHAAg");
	this.shape_3.setTransform(282.7,284);

	this.btn1 = new lib.btn();
	this.btn1.name = "btn1";
	this.btn1.setTransform(264.3,649.55);
	new cjs.ButtonHelper(this.btn1, 0, 1, 2, false, new lib.btn(), 3);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#666666").s().p("Eg6lBMkMAAAiZHMB1LAAAMAAACZHg");
	this.shape_4.setTransform(375,490);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.btn1},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Title, new cjs.Rectangle(0,0,750,980), null);


(lib.popwin = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// 图层 1
	this.con = new lib.prizecon();
	this.con.name = "con";
	this.con.setTransform(296,225.5,1,1,0,0,0,85,15);

	this.btn = new lib.元件1();
	this.btn.name = "btn";
	this.btn.setTransform(286,415,1,1,0,0,0,83,28);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#33FF00").s().p("AhQCyQgEgZgIgaQAWACAVAAQATAAAHgFQAGgFAAgNIAAgdIidAAIAAgwICdAAIAAgPIAxgeIiFAAIAAguIDLAAIAAAuIhDArIAAACICNAAIAAAwIiNAAIAAAxQAAA0g3AAgAingsIAAhdICMAAIgKgcIA8gMIAMAoICGAAIAABdIgyAAIAAgvIjrAAIAAAvg");
	this.shape.setTransform(424.7,73.075);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#33FF00").s().p("AhnCyIAAh4IgmAMQgIgSgOgaQBKgRA7gZQgagTgSgMIAjghIA6AnQAqgYAhgeIiRAAQghAjgsAeIgggkQBFgvAnhBIA3AFQgIAQgLARICyAAIAAArQg0A+hiAvICYAAIAACmIg0AAIAAgRIijAAIAAARgAgzB0ICjAAIAAg7IijAAg");
	this.shape_1.setTransform(386.125,73.15);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#33FF00").s().p("AAXB5QAbACAeABQAJAAAGgCQAHgCAEgFQAEgDABgGQACgFAAgnIAChJIABg4Ig/AAQgMAZgNAYQgSgLgYgLIAADWIgyAAIAAgaIg0AAIAAAcIgyAAIAAklIAmAAQALgjAEgWIA2AIIgQAxIA9AAIAABHQAcgxAbhQIAyANIgRAvIBdAAIgEDPQgBAhgFAPQgFANgKAIQgKAIgRADQgSAEg8AAQgFgggJgXgAh0BkIA0AAIAAg9Ig0AAgAh0gIIA0AAIAAg+Ig0AAgAAAAEIAqgcQAaAfAeAsIguAeQgbgtgZggg");
	this.shape_2.setTransform(350.775,73.05);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#33FF00").s().p("AhRClQhMAAAAhNIAAiFIDoAAIAAhFIjyAAIAAgyIEoAAIAAC2Ig2AAIAAgPIiyAAIAABOQgBAiAhAAICOAAQAPAAAIgGQAIgFADgMIAIg6QAgAOAXAHQgKA0gGATQgFATgVAKQgUAKghAAg");
	this.shape_3.setTransform(314.9,73.575);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#33FF00").s().p("ABfCyIAAgVIi9AAIAAAVIg0AAIAAk3IBlAAQAGgZAEgUIA7AJIgPAkICKAAIAAE3gAheBtIC9AAIAAgjIi9AAgAheAdIC9AAIAAgiIi9AAgAhegyIC9AAIAAgjIi9AAg");
	this.shape_4.setTransform(276.7,73.15);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#33FF00").s().p("AizCCQBwhRAoh5QgXgogogkIAwgcQAmAfA0BqQAzBnBRA6QgfAhgQAVQhOhNg0hpQgtBsheBLQgRgVgagag");
	this.shape_5.setTransform(239.575,73.25);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#33FF00").s().p("AguCzIAAjZIBsAAIAACzQAAAigiAAIgagBIgFgnIATAAQAIABAAgJIAAgUIgfAAIAABIgAgHBHIAfAAIAAgUIgfAAgAgHAQIAfAAIAAgUIgfAAgAh3CzIAAhAIg7AFIgBguIA8gDIAAghIg6AAIAAgwQAKgjAIgsIgUAAIAAgqIAcAAIAHgvIArAEIgJArIA9AAIAAApQA4gkAcgxIA7AAIgJANQAnA1A4AdQgLAOgQAYQgUgLgRgNIAAANIh8AAIAAgKQgOAKgPAKQgSgagKgMIAMgIIhCAAIgTBWIATAAIAAhAIAqAAIAABAIATAAIAAApIgTAAIAAAeIAVgCQgBAWABAVIgVACIAABEgAAZhdIA+AAIgfgiQgQAUgPAOgABTCuIgHgsIAeADQAOAAAAgWIAAiSIApAAIAACjQAAAvglAAIgpgBgABIBrIAAiBIAhAAIAACBg");
	this.shape_6.setTransform(202.775,73.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#33FF00").s().p("AAdCLIA3ACQAUAAAAgSIAAgEIh2AAIAAA7IgwAAIAAi7IDXAAIAACIQAAAXgKAMQgKAMgTACQgSABg4ABIgLgngAgOBZIB2AAIAAgSIh2AAgAgOAqIB2AAIAAgSIh2AAgAifCNQAKgNAAgSIAAh0IgdAAIAAgvIBLAAIAACNIAagTQACAgACAXQglAbgXAZgAhYgWIAAggIBpAAIAAgQIhVAAIAAgfIBVAAIAAgQIheAAIAAgeIBeAAIAAgdIA0AAIAAAdIBmAAIAAAeIhmAAIAAAQIBcAAIAAAfIhcAAIAAAQIBuAAIAAAggAipiWIAngXQAZAhAWAhIgrAaQgUglgXggg");
	this.shape_7.setTransform(165.675,73.15);

	this.instance = new lib.Bitmap4();

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.btn},{t:this.con}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.popwin, new cjs.Rectangle(0,0,592,451), null);


(lib.Pop = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_59 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(59).call(this.frame_59).wait(1));

	// 图层 1
	this.win = new lib.popwin();
	this.win.name = "win";
	this.win.setTransform(296.1,225.55,0.2505,0.2505,180,0,0,296.1,225.6);
	this.win.alpha = 0.2109;

	this.timeline.addTween(cjs.Tween.get(this.win).to({regX:296,regY:225.5,scaleX:1,scaleY:1,rotation:0,x:296,y:225.5,alpha:1},59).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-30,-77.6,651.9,606.1);


// stage content:
(lib._lib = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// ma
	this.instance = new lib.Pop();
	this.instance.setTransform(350,517,1,1,0,0,0,296.1,225.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(650.9,950.5,-226.7,-377);
// library properties:
lib.properties = {
	id: 'A81D833FE7C7754FB5395FF7A6EFA6E1',
	width: 750,
	height: 980,
	fps: 60,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/Bitmap4.png?1659689365806", id:"Bitmap4"},
		{src:"images/Button.png?1659689365806", id:"Button"},
		{src:"sounds/p.mp3?1659689365806", id:"p"},
		{src:"sounds/woosh.mp3?1659689365806", id:"woosh"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['A81D833FE7C7754FB5395FF7A6EFA6E1'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused || stageChild.ignorePause){
			stageChild.syncStreamSounds();
		}
	}
}
an.handleFilterCache = function(event) {
	if(!event.paused){
		var target = event.target;
		if(target){
			if(target.filterCacheList){
				for(var index = 0; index < target.filterCacheList.length ; index++){
					var cacheInst = target.filterCacheList[index];
					if((cacheInst.startFrame <= target.currentFrame) && (target.currentFrame <= cacheInst.endFrame)){
						cacheInst.instance.cache(cacheInst.x, cacheInst.y, cacheInst.w, cacheInst.h);
					}
				}
			}
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;