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
				var canvas = this.core.canvas;
				
				if (this.radius > 0) {
				
					canvas.beginPath();
					canvas.arc(this.abs_x, this.abs_y, this.radius, this.start * Math.PI / 180, this.end * Math.PI / 180, (this.direction === "anticlockwise"));
					
					
					if (this.fill !== "") {
						canvas.fillStyle = this.fill;
						canvas.fill();
					}
					
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