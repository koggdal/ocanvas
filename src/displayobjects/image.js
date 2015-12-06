(function(oCanvas, window, document, undefined){

	// Define the class
	var image = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,

			_: oCanvas.extend({}, thecore.displayObject._, {
				hasBeenDrawn: false
			}),
			
			shapeType: "rectangular",
			loaded: false,
			firstDrawn: false,
			tile: false,
			tile_width: 0,
			tile_height: 0,
			tile_spacing_x: 0,
			tile_spacing_y: 0,
			clipChildren: false,
			
			// Init method for loading the image resource
			init: function () {
				var _this = this,
					source;

				// Abort initialization of the image if there is no image specified
				if (this.image === undefined) {
					return;
				}

				var isImageElement = this.image.nodeName && this.image.nodeName.toLowerCase() === "img";
				this.img = isImageElement ? this.image : new Image();
				
				// Get dimensions when the image is loaded. Also, remove the temp img from DOM
				var onload = function () {
					_this.loaded = true;
					
					// Set dimensions proportionally (if only one is specified, calculate the other)
					if (_this.width !== 0) {
						if (_this.height === 0) {
							_this.height = _this.width / (this.width / this.height);
						}
					} else {
						_this.width = this.width;
					}
					if (_this.height !== 0) {
						if (_this.width === 0) {
							_this.width = _this.height / (this.height / this.width);
						}
					} else {
						_this.height = this.height;
					}
					_this.tile_width = (_this.tile_width === 0) ? _this.width : _this.tile_width;
					_this.tile_height = (_this.tile_height === 0) ? _this.height : _this.tile_height;
					if (_this._.hasBeenDrawn) _this.core.redraw();
				};

				if (isImageElement && this.img.complete) {
					onload.call(this.img);
				} else {
					this.img.addEventListener("load", onload);

					if (!isImageElement) {
						this.img.src = this.image;
					}
				}
			},
			
			// Method that draws the image to the canvas once it's loaded
			draw: function () {
				var canvas = this.core.canvas,
					_this = this,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					width, height;
				
				// If the image has finished loading, go on and draw
				if (this.loaded && this.core.draw.objects[this.zIndex] !== undefined && this.img.width > 0 && this.img.height > 0) {
					
				
					width = (this.width === 0) ? this.img.width : this.width;
					height = (this.height === 0) ? this.img.height : this.height;
				
					if (this.tile) {
					
						var num_x = Math.ceil(width / this.tile_width),
							num_y = Math.ceil(height / this.tile_height),
							tile_x, tile_y;
						
						canvas.save();
						canvas.beginPath();
						
						// Create clipping path for the rectangle that the tiled images will be drawn inside
						canvas.moveTo(x, y);
						canvas.lineTo(x + width, y);
						canvas.lineTo(x + width, y + height);
						canvas.lineTo(x, y + height);
						canvas.lineTo(x, y);
						canvas.clip();
						
						// Draw all the tiled images
						for (tile_y = 0; tile_y < num_y; tile_y++) {
							for (tile_x = 0; tile_x < num_x; tile_x++) {
								canvas.drawImage(this.img, x + tile_x * (this.tile_width + this.tile_spacing_x), y + tile_y * (this.tile_height + this.tile_spacing_y), this.tile_width, this.tile_height);
							}
						}

						canvas.closePath();
						canvas.restore();

						
					} else {
				
						// Draw the image to the canvas
						canvas.drawImage(this.img, x, y, width, height);
						
					}
					
					// Do color if stroke width is specified
					if (this.strokeWidth > 0) {
						canvas.lineWidth = this.strokeWidth;
						canvas.strokeStyle = this.strokeColor;
						canvas.strokeRect(x, y, width, height);
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

				// Do clip
				if(this.clipChildren) {

					// draw the clip region (the square area around the image)
					canvas.beginPath();
					canvas.rect(x, y, width, height);
					canvas.closePath();

					canvas.clip();

				}

				this._.hasBeenDrawn = true;

				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("image", image, "init");
	
})(oCanvas, window, document);
