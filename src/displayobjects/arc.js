(function(oCanvas, window, document, undefined){

	// Define the class
	var arc = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "radial",
			radius: 0,
			start: 0,
			end: 0,
			direction: "clockwise",
			pieSection: false,
			clipChildren: false,
			
			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;

				// beginPath and closePath must be outside if statement because the clipChildren feature (a radius of 0 must hide all children)
				canvas.beginPath();
				
				// Don't draw if the radius is 0 or less (won't be visible anyway)
				if (this.radius > 0 && this.start !== this.end) {
				
					// Draw the arc
					if (this.pieSection) {
						canvas.moveTo(x, y);
					}
					canvas.arc(x, y, this.radius, this.start * Math.PI / 180, this.end * Math.PI / 180, (this.direction === "anticlockwise"));
					
					// Do fill
					if (this.fill !== "") {
						canvas.fillStyle = this.fill;
						canvas.fill();
					}
					
					// Do stroke
					if (this.strokeWidth > 0) {
						canvas.lineWidth = this.strokeWidth;
						canvas.strokeStyle = this.strokeColor;
						canvas.stroke();
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
	oCanvas.registerDisplayObject("arc", arc);
	
})(oCanvas, window, document);
