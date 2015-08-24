(function(oCanvas, window, document, undefined){

	// Define the class
	var polygon = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "radial",
			sides: 3,
			clipChildren: false,
			
			_: oCanvas.extend({}, thecore.displayObject._, {
				radius: 0,
				side: 0
			}),
			
			set radius (value) {
				this._.radius = value;
				this._.side = 2 * this._.radius * Math.sin(Math.PI / this.sides);
			},
			
			set side (value) {
				this._.side = value;
				this._.radius = (this._.side / 2) / Math.sin(Math.PI / this.sides);
			},
			
			get radius () {
				return this._.radius;
			},
			
			get side () {
				return this._.side;
			},
			
			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					firstPoint = { x: 0, y: 0 },
					sides = this.sides,
					radius = this.radius,
					xPos, yPos, i;
				
				canvas.beginPath();
				
				for (i = 0; i <= sides; i++) {
					xPos = x + radius * Math.cos(i * 2 * Math.PI / sides);
					yPos = y + radius * Math.sin(i * 2 * Math.PI / sides);
					
					if (i === 0) {
						canvas.moveTo(xPos, yPos);
						firstPoint = { x: xPos, y: yPos };
					} else
					if (i == sides) {
						canvas.lineTo(firstPoint.x, firstPoint.y);
					} else {
						canvas.lineTo(xPos, yPos);
					}
				}
				
				canvas.closePath();
				
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					canvas.fill();
				}
				
				
				if (this.strokeWidth > 0) {
					canvas.lineWidth = this.strokeWidth;
					canvas.strokeStyle = this.strokeColor;
					canvas.stroke();
				}

				// Do clip
				if(this.clipChildren) {
					canvas.clip();
				}
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("polygon", polygon);
	
})(oCanvas, window, document);