(function(oCanvas, window, document, undefined){

	// Define the class
	var image = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "rectangular",
			loaded: false,
			firstDrawn: false,
			tile: false,
			tile_width: 0,
			tile_height: 0,
			tile_spacing_x: 0,
			tile_spacing_y: 0,
			
			// Init method for loading the image resource
			init: function () {
				var _this = this,
				
					// Get source (settings.image can be either an HTML img element or a string with path to the image)
					source = (this.image.nodeName && this.image.nodeName.toLowerCase() === "img") ? "htmlImg" : "newImg";
				
				// Get image object (either create a copy of the current element, or a new image)
				this.img = (source === "htmlImg") ? this.image.cloneNode(false) : new Image();
				
				// Temporarily append it to the canvas to be able to get dimensions
				this.core.canvasElement.appendChild(this.img);
				
				// Get dimensions when the image is loaded. Also, remove the temp img from DOM
				this.img.onload = function () {
					_this.loaded = true;
					_this.width = (_this.width === 0) ? this.width : _this.width;
					_this.height = (_this.height === 0) ? this.height : _this.height;
					_this.tile_width = (_this.tile_width === 0) ? _this.width : _this.tile_width;
					_this.tile_height = (_this.tile_height === 0) ? _this.height : _this.tile_height;
					_this.core.canvasElement.removeChild(this);
					_this.core.redraw();
				};
				
				// Set the path to the image if a string was passed in
				if (source === "newImg") {
					this.img.src = this.image;
				}
			},
			
			// Method that draws the image to the canvas once it's loaded
			draw: function () {
				var canvas = this.core.canvas,
					_this = this,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;
				
				// If the image has finished loading, go on and draw
				if (this.loaded && this.core.draw.objects[this.id - 1] !== undefined && this.img.width > 0 && this.img.height > 0) {
				
					if (this.tile) {
					
						var num_x = Math.ceil(this.width / this.tile_width),
							num_y = Math.ceil(this.height / this.tile_height),
							tile_x, tile_y;
						
						canvas.save();
						canvas.beginPath();
						
						// Create clipping path for the rectangle that the tiled images will be drawn inside
						canvas.moveTo(x, y);
						canvas.lineTo(x + this.width, y);
						canvas.lineTo(x + this.width, y + this.height);
						canvas.lineTo(x, y + this.height);
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
						canvas.drawImage(this.img, x, y, this.width, this.height);
						
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
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("image", image, "init");
	
})(oCanvas, window, document);