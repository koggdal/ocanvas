(function(oCanvas, window, document, undefined){

	// Define the class
	var rectangle = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "rectangle",
			shapeType: "rectangular",
			
			draw: function () {
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
				
				// Do color if stroke width is specified
				if (this.strokeWidth > 0) {
				
					// Set styles
					canvas.lineWidth = this.strokeWidth;
					canvas.strokeStyle = this.strokeColor;
					
					// Set stroke outside the box
					if (this.strokePosition === "outside") {
						canvas.strokeRect(x - this.strokeWidth / 2 + 0.5, y - this.strokeWidth / 2 + 0.5, this.width + this.strokeWidth - 1, this.height + this.strokeWidth - 1);
					}
					
					// Set stroke on the edge of the box (half of the stroke outside, half inside)
					else if (this.strokePosition === "center") {
						canvas.strokeRect(x, y, this.width, this.height);
					}
					
					// Set stroke on the inside of the box
					else if (this.strokePosition === "inside") {
						canvas.strokeRect(x + this.strokeWidth / 2, y + this.strokeWidth / 2, this.width - this.strokeWidth, this.height - this.strokeWidth);
					}
					
					// Draw stroke
					canvas.stroke();
				}
				
				canvas.closePath();
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("rectangle", rectangle);
	
})(oCanvas, window, document);