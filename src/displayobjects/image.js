(function(oCanvas, window, document, undefined){

	// Define the class
	var image = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			loaded: false,
			loading: false,
			firstDrawn: false,
			
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
					_this.width = this.width;
					_this.height = this.height;
					_this.core.canvasElement.removeChild(this);
				};
				
				// Set the path to the image if a string was passed in
				if (source === "newImg") {
					this.img.src = this.image;
				}
			},
			
			// Method that draws the image to the canvas once it's loaded
			draw: function () {
				var canvas = this.core.canvas,
					_this = this;
				
				// If the image has finished loading, go on and draw
				if (this.loaded) {
				
					// Draw the image to the canvas
					canvas.drawImage(this.img, this.x, this.y, this.width, this.height);
					
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