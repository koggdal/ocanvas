(function(oCanvas, window, document, undefined){

	// Define the class
	var point = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "point",
			shapeType: "rectangular",
			
			draw: function (cb) {
				var canvas = this.core.canvas;
				
				// Do fill
				canvas.beginPath();
				canvas.fillStyle = this.fill;
				canvas.fillRect(this.abs_x, this.abs_y, 1, 1);
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