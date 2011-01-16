(function(oCanvas, window, document, undefined){

	// Define the class
	var point = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			draw: function () {
				var canvas = this.core.canvas;
				
				// Do fill
				canvas.fillStyle = this.fill;
				canvas.fillRect(this.x, this.y, 1, 1);
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("point", point);
	
})(oCanvas, window, document);