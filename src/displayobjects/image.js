(function(oCanvas, window, document, undefined){

	// Define the class
	var image = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			loaded: false,
			loading: false,
			firstDrawn: false,
			tile: false,
			tile_width: 0,
			tile_height: 0,
			
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
				};
				
				// Set the path to the image if a string was passed in
				if (source === "newImg") {
					this.img.src = this.image;
				}
			},
			
			// Method that draws the image to the canvas once it's loaded
			draw: function (cb) {
				var canvas = this.core.canvas,
					_this = this;
				
				// If the image has finished loading, go on and draw
				if (this.loaded) {
				
					if (this.tile) {
					
						var num_x = Math.ceil(this.width / this.tile_width),
							num_y = Math.ceil(this.height / this.tile_height),
							x, y;
						
						for (y = 0; y < num_y; y++) {
							for (x = 0; x < num_x; x++) {
								canvas.drawImage(this.img, this.abs_x + x * this.tile_width, this.abs_y + y * this.tile_height, this.tile_width, this.tile_height);
							}
						}
						
						
						
					} else {
				
						// Draw the image to the canvas
						canvas.drawImage(this.img, this.abs_x, this.abs_y, this.width, this.height);
						
					}
					
					// Trigger callback
					if (cb) {
						cb.call(this);
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
						_this.draw(cb);
					}, 100);
				}
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("image", image, "init");
	
})(oCanvas, window, document);