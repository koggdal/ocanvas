(function(oCanvas, window, document, undefined){

	// Define the class
	var sprite = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			// Set properties
			shapeType: "rectangular",
			loaded: false,
			firstDrawn: false,
			frames: [],
			duration: 0,
			frame: 1,
			generate: false,
			numFrames: 0,
			offset_x: 0,
			offset_y: 0,
			direction: "x",
			running: false,
			active: false,
			loop: true,
			
			_: oCanvas.extend({}, thecore.displayObject._, {
				autostart: false
			}),
			
			set autostart (value) {
				this.active = value;
				this._.autostart = value;
			},
			
			get autostart () {
				return this._.autostart;
			},
			
			// Init method for loading the image resource
			init: function () {
				if (this.image === undefined) {
					return;
				}
				var _this = this,
				
					// Get source (settings.image can be either an HTML img element or a string with path to the image)
					source = (this.image.nodeName && this.image.nodeName.toLowerCase() === "img") ? "htmlImg" : "newImg";
				
				// Get image object (either create a copy of the current element, or a new image)
				this.img = (source === "htmlImg") ? this.image.cloneNode(false) : new Image();
				
				// Temporarily append it to the canvas to be able to get dimensions
				this.core.canvasElement.appendChild(this.img);
				
				// Get dimensions when the image is loaded. Also, remove the temp img from DOM
				this.img.onload = function () {
				
					// Set the full source image dimensions
					_this.full_width = this.width;
					_this.full_height = this.height;
					
					// If automatic generation is specified
					if (_this.generate) {
						var dir, length_full, length_cropped, num_frames, i;
					
						// Get frame data
						dir = _this.direction;
						length_full = (dir === "y") ? _this.full_height : _this.full_width;
						length_cropped = (dir === "y") ? _this.height : _this.width;

						if (_this.numFrames > 0) {
							num_frames = _this.numFrames;
						} else {
							num_frames = length_full / length_cropped;
							_this.numFrames = num_frames;
						}
						
						// Create frames based on the specified width, height, direction, offset and duration
						_this.frames = [];
						for (i = 0; i < num_frames; i++) {
							_this.frames.push({
								x: _this.offset_x + (i * (dir === "x" ? _this.width : 0)),
								y: _this.offset_y + (i * (dir === "y" ? _this.height : 0)),
								d: _this.duration
							});
						}
					}
					_this.core.canvasElement.removeChild(this);
					_this.loaded = true;
				};
				
				// Set the path to the image if a string was passed in
				if (source === "newImg") {
					this.img.src = this.image;
				}
			},
			
			draw: function () {
				var _this = this,
					canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					frame;
				
				// If the image has finished loading, go on and draw
				if (this.loaded) {
				
					// Draw current frame
					if (this.frames.length > 0) {
					
						// Get current frame
						if (this.frame > this.frames.length) {
							return this;
						}
						frame = this.frames[this.frame - 1];
						frame_width = (frame.w !== undefined) ? frame.w : this.width;
						frame_height = (frame.h !== undefined) ? frame.h : this.height;
						
						// Draw the current sprite part
						canvas.drawImage(this.img, frame.x, frame.y, frame_width, frame_height, x, y, frame_width, frame_height);
						
						// Do stroke if stroke width is specified
						if (this.strokeWidth > 0) {
							canvas.lineWidth = this.strokeWidth;
							canvas.strokeStyle = this.strokeColor;
							canvas.strokeRect(x, y, frame_width, frame_height);
						}
						
						// Set a redraw timer at the current frame duration if a timer is not already running
						if (this.running === false && this.active) {
						
							setTimeout(function () {
							
								// Increment the frame number only after the frame duration has passed
								if (_this.loop) {
									_this.frame = (_this.frame === _this.frames.length) ? 1 : _this.frame + 1;
								} else {
									_this.frame = (_this.frame === _this.frames.length) ? _this.frame : _this.frame + 1;
								}
								
								// Set timer status
								_this.running = false;
								
								// Redraw canvas if the timeline is not running
								if (!_this.core.timeline.running) {
									_this.core.draw.redraw();
								}
								
							}, frame.d);
							
							// Set timer status
							this.running = true;
						}
					}
					
					// Clear the timer if this is the first time it is drawn
					if (this.firstDrawn === false) {
						this.firstDrawn = true;
						clearTimeout(this.loadtimer);
					}
				}
				
				// If the image hasn't finished loading, set a timer and try again
				else {
					clearTimeout(this.loadtimer);
					this.loadtimer = setTimeout(function () {
						_this.draw();
					}, 100);
				}
				
				return this;
			},
			
			start: function () {
				this.startAnimation();

				return this;
			},

			startAnimation: function () {
				this.active = true;
				this.core.redraw();
				
				return this;
			},
			
			stopAnimation: function () {
				this.active = false;
				
				return this;
			},
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("sprite", sprite, "init");
	
})(oCanvas, window, document);
