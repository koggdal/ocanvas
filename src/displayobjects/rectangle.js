(function(oCanvas, window, document, undefined){

	// Define the class
	var rectangle = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "rectangular",
			clipChildren: false,
			
			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;
				
				canvas.beginPath();

				canvas.rect(x, y, this.width, this.height);
				
				// Do fill if a color is specified
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					canvas.fill();
				}

				// Do color if stroke width is specified
				if (this.strokeWidth > 0) {
				
					// Set styles
					canvas.lineWidth = this.strokeWidth;
					canvas.strokeStyle = this.strokeColor;
					
					// Set stroke outside the box
					if (this.strokePosition === "outside") {
						canvas.strokeRect(x - this.strokeWidth / 2, y - this.strokeWidth / 2, this.width + this.strokeWidth, this.height + this.strokeWidth);
					}
					
					// Set stroke on the edge of the box (half of the stroke outside, half inside)
					else if (this.strokePosition === "center") {
						canvas.strokeRect(x, y, this.width, this.height);
					}
					
					// Set stroke on the inside of the box
					else if (this.strokePosition === "inside") {
						canvas.strokeRect(x + this.strokeWidth / 2, y + this.strokeWidth / 2, this.width - this.strokeWidth, this.height - this.strokeWidth);
					}
				}

				canvas.closePath();

				// Do clip
				if(this.clipChildren) {
					canvas.clip();
				}

				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("rectangle", rectangle);
	
})(oCanvas, window, document);