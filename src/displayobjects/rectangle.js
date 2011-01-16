(function(oCanvas, window, document, undefined){

	// Define the class
	var rectangle = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			draw: function () {
				var canvas = this.core.canvas;
				
				/*
				var origin = this.getOrigin(),
					sX = (this.rotation > 0) ? -origin.x : this.x-origin.x,
					sY = (this.rotation > 0) ? -origin.y : this.y-origin.y,
					lW = this.lineWidth,
					w = this.width,
					h = this.height;
					*/
				
				// Do fill if a color is specified
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					canvas.fillRect(this.x, this.y, this.width, this.height);
					canvas.fill();
				}
				
				// Do color if stroke weight is specified
				if (this.strokeWeight > 0) {
				
					// Set styles
					canvas.lineWidth = this.strokeWeight;
					canvas.strokeStyle = this.strokeColor;
					
					// Set stroke outside the box
					if (this.strokePosition === "outside") {
						canvas.strokeRect(this.x - this.strokeWeight/2, this.y - this.strokeWeight/2, this.width + this.strokeWeight, this.height + this.strokeWeight);
					}
					
					// Set stroke on the edge of the box (half of the stroke outside, half inside)
					else if (this.strokePosition === "center") {
						canvas.strokeRect(this.x, this.y, this.width, this.height);
					}
					
					// Set stroke on the inside of the box
					else if (this.strokePosition === "inside") {
						canvas.strokeRect(this.x + this.strokeWeight/2, this.y + this.strokeWeight/2, this.width - this.strokeWeight, this.height - this.strokeWeight);
					}
					
					// Draw stroke
					canvas.stroke();
				}
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("rectangle", rectangle);
	
})(oCanvas, window, document);