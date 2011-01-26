(function(oCanvas, window, document, undefined){

	// Define the class
	var polygon = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "polygon",
			shapeType: "radial",
			
			sides: 3,
			
			_: {
				radius: 0,
				side: 0,
				points: []
			},
			
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
			
			draw: function (cb) {
				var canvas = this.core.canvas;
				
				var firstPoint = { x: 0, y: 0 },
					x = this.abs_x,
					y = this.abs_y,
					sides = this.sides,
					points = this._.points,
					radius = this.radius,
					xPos, yPos;
				
				canvas.beginPath();
				
				for (var i = 0; i <= sides; i++) {
					xPos = x + radius * Math.cos(i * 2 * Math.PI / sides);
					yPos = y + radius * Math.sin(i * 2 * Math.PI / sides);
					
					if (points.length !== sides) {
						points.push({ x: xPos, y: yPos });
					}
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
				
				
				if (this.strokeWeight > 0) {
					canvas.lineWidth = this.strokeWeight;
					canvas.strokeStyle = this.strokeColor;
					canvas.stroke();
				}
				
				
				if (cb) {
					cb.call(this);
				}
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("polygon", polygon);
	
})(oCanvas, window, document);