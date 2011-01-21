(function(oCanvas, window, document, undefined){

	// Define the class
	var ellipse = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "ellipse",
			shapeType: "radial",
			
			_: {
				radius_x: 0,
				radius_y: 0
			},
			
			set radius (value) {
				this._.radius_x = value;
				this._.radius_y = value;
			},
			
			set radius_x (value) {
				this._.radius_x = value;
			},
			
			set radius_y (value) {
				this._.radius_y = value;
			},
			
			get radius () {
				return this._.radius_x;
			},
			
			get radius_x () {
				return this._.radius_x;
			},
			
			get radius_y () {
				return this._.radius_y;
			},
			
			draw: function () {
				var canvas = this.core.canvas;
				
				canvas.beginPath();
				
				// Draw a perfect circle with the arc method if both radii are the same
				if (this.radius_x === this.radius_y) {
					canvas.arc(this.x, this.y, this.radius_x, 0, Math.PI * 2, false);
				} else {
					
					// Calculate values for the ellipse
					var EllipseToBezierConstant = 0.276142374915397,
						o = {x: this.radius_x * 2 * EllipseToBezierConstant, y: this.radius_y * 2 * EllipseToBezierConstant};
					
					// Draw the curves that will form the ellipse
					canvas.moveTo(this.x - this.radius_x, this.y);
					canvas.bezierCurveTo(this.x - this.radius_x, this.y - o.y, this.x - o.x, this.y - this.radius_y, this.x, this.y - this.radius_y);
					canvas.bezierCurveTo(this.x + o.x, this.y - this.radius_y, this.x + this.radius_x, this.y - o.y, this.x + this.radius_x, this.y);
					canvas.bezierCurveTo(this.x + this.radius_x, this.y + o.y, this.x + o.x, this.y + this.radius_y, this.x, this.y + this.radius_y);
					canvas.bezierCurveTo(this.x - o.x, this.y + this.radius_y, this.x - this.radius_x, this.y + o.y, this.x - this.radius_x, this.y);
				}
				
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
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("ellipse", ellipse);
	
})(oCanvas, window, document);