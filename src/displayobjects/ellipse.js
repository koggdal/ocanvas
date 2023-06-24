(function(oCanvas, window, document, undefined){

	// Define the class
	var ellipse = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "radial",
			clipChildren: false,
			
			_: oCanvas.extend(
				{},
				thecore.displayObject._,
				{
					shadow: oCanvas.extend(
						{},
						thecore.displayObject._.shadow
					)
				},
				{
					radius_x: 0,
					radius_y: 0
				}
			),
			
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

			getOrigin: function () {
				var x = 0;
				var y = 0;
				var origin = this.origin;

				if (this.origin.x === "right") {
					x = this.radius_x;
				} else if (this.origin.x === "left") {
					x = -this.radius_x;
				} else {
					x = !isNaN(parseFloat(this.origin.x)) ? parseFloat(this.origin.x) : 0;
				}

				if (this.origin.y === "bottom") {
					y = this.radius_y;
				} else if (this.origin.y === "top") {
					y = -this.radius_y;
				} else {
					y = !isNaN(parseFloat(this.origin.y)) ? parseFloat(this.origin.y) : 0;
				}

				return {
					x: x,
					y: y
				};
			},
			
			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;
				
				canvas.beginPath();
				
				// Draw a perfect circle with the arc method if both radii are the same
				if (this.radius_x === this.radius_y) {
					canvas.arc(x, y, this.radius_x, 0, Math.PI * 2, false);
				}
				
				// Draw an ellipse if the radii are not the same
				else {
					
					// Calculate values for the ellipse
					var EllipseToBezierConstant = 0.276142374915397,
						o = {x: this.radius_x * 2 * EllipseToBezierConstant, y: this.radius_y * 2 * EllipseToBezierConstant};
					
					// Draw the curves that will form the ellipse
					canvas.moveTo(x - this.radius_x, y);
					canvas.bezierCurveTo(x - this.radius_x, y - o.y, x - o.x, y - this.radius_y, x, y - this.radius_y);
					canvas.bezierCurveTo(x + o.x, y - this.radius_y, x + this.radius_x, y - o.y, x + this.radius_x, y);
					canvas.bezierCurveTo(x + this.radius_x, y + o.y, x + o.x, y + this.radius_y, x, y + this.radius_y);
					canvas.bezierCurveTo(x - o.x, y + this.radius_y, x - this.radius_x, y + o.y, x - this.radius_x, y);
				}
				
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
	oCanvas.registerDisplayObject("ellipse", ellipse);
	
})(oCanvas, window, document);