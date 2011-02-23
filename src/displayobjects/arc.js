(function(oCanvas, window, document, undefined){

	// Define the class
	var arc = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "arc",
			shapeType: "radial",
			radius: 0,
			start: 0,
			end: 0,
			direction: "clockwise",
			
			draw: function (cb) {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;
				
				// Don't draw if the radius is 0 or less (won't be visible anyway)
				if (this.radius > 0) {
				
					// Draw the arc
					canvas.beginPath();
					canvas.arc(x, y, this.radius, this.start * Math.PI / 180, this.end * Math.PI / 180, (this.direction === "anticlockwise"));
					
					// Do fill
					if (this.fill !== "") {
						canvas.fillStyle = this.fill;
						canvas.fill();
					}
					
					// Do stroke
					if (this.strokeWeight > 0) {
						canvas.lineWidth = this.strokeWeight;
						canvas.strokeStyle = this.strokeColor;
						canvas.stroke();
					}
					
					canvas.closePath();
					
				}
				
				if (cb) {
					cb.call(this);
				}
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("arc", arc);
	
})(oCanvas, window, document);