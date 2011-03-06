(function(oCanvas, window, document, undefined){

	// Define the class
	var rectangle = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "rectangle",
			shapeType: "rectangular",
			
			draw: function (cb) {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;
				
				canvas.beginPath();
				
				// Do fill if a color is specified
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					canvas.fillRect(x, y, this.width, this.height);
					canvas.fill();
				}
				
				// Do color if stroke weight is specified
				if (this.strokeWeight > 0) {
				
					// Set styles
					canvas.lineWidth = this.strokeWeight;
					canvas.strokeStyle = this.strokeColor;
					
					// Set stroke outside the box
					if (this.strokePosition === "outside") {
						canvas.strokeRect(x - this.strokeWeight / 2 + 0.5, y - this.strokeWeight / 2 + 0.5, this.width + this.strokeWeight - 1, this.height + this.strokeWeight - 1);
					}
					
					// Set stroke on the edge of the box (half of the stroke outside, half inside)
					else if (this.strokePosition === "center") {
						canvas.strokeRect(x, y, this.width, this.height);
					}
					
					// Set stroke on the inside of the box
					else if (this.strokePosition === "inside") {
						canvas.strokeRect(x + this.strokeWeight / 2, y + this.strokeWeight / 2, this.width - this.strokeWeight, this.height - this.strokeWeight);
					}
					
					// Draw stroke
					canvas.stroke();
				}
				
				canvas.closePath();
				
				if (cb) {
					cb.call(this);
				}
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("rectangle", rectangle);
	
})(oCanvas, window, document);