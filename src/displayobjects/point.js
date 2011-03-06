(function(oCanvas, window, document, undefined){

	// Define the class
	var point = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "point",
			shapeType: "rectangular",
			
			draw: function (cb) {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;
				
				canvas.beginPath();
				
				// Do fill
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					canvas.fillRect(x, y, 1, 1);
				}
				
				// Do stroke
				if (this.strokeWidth > 0) {
					canvas.strokeStyle = this.strokeColor;
					canvas.lineWidth = this.strokeWidth;
					canvas.strokeRect(x - this.strokeWidth / 2, y - this.strokeWidth / 2, this.strokeWidth + 1, this.strokeWidth + 1);
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
	oCanvas.registerDisplayObject("point", point);
	
})(oCanvas, window, document);