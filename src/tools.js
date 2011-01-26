(function(oCanvas, window, document, undefined){

	// Define the class
	var tools = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},
			
			// Method for checking if the pointer's current position is inside the specified object
			isPointerInside: function (obj) {
			
				// Line
				// Does not work correctly at the moment
				if (obj.type === "line") {
					var mouse = this.core.mouse;
					return ((mouse.x > obj.start.x) && (mouse.x < obj.end.x) && (mouse.y > obj.start.y - obj.strokeWeight / 2) && (mouse.y < obj.end.y + obj.strokeWeight / 2) );
				} else
				
				// Point
				if (obj.type === "point") {
					var mouse = this.core.mouse;
						
					return (mouse.x === obj.abs_x && mouse.y === obj.abs_y);
				} else
				
				// Rectangle
				if (obj.shapeType === "rectangular") {
					var mouse = this.core.mouse;
						
					return ((mouse.x > obj.abs_x) && (mouse.x < obj.abs_x + obj.width) && (mouse.y > obj.abs_y) && (mouse.y < obj.abs_y + obj.height));
				} else
				
				// Circle
				if (obj.type === "ellipse" && obj.radius_x === obj.radius_y) {
					var mouse = this.core.mouse;
					var D = Math.sqrt(Math.pow(mouse.x - obj.abs_x, 2) + Math.pow(mouse.y - obj.abs_y, 2));
					return (D < obj.radius_x);
				} else
				
				// Ellipse
				if (obj.type === "ellipse") {
					var mouse = {x: this.core.mouse.x, y: this.core.mouse.y };
					mouse.x -= obj.abs_x;
					mouse.y -= obj.abs_y;
					var a = obj.radius_x,
						b = obj.radius_y;
					
					return ((mouse.x*mouse.x)/(a*a) + (mouse.y*mouse.y)/(b*b) < 1);
				} else
				
				// Polygon
				if (obj.type === "polygon") {
					var mouse = this.core.mouse,
						points = obj._.points,
						length = points.length,
						j = length-1,
						odd = false,
						i;
					
					for (i = 0; i < length; i++) {
						if ( ((points[i].y < mouse.y) && (points[j].y >= mouse.y)) || ((points[j].y < mouse.y) && (points[i].y >= mouse.y)) ) {
							if(points[i].x+(mouse.y-points[i].y)/(points[j].y-points[i].y)*(points[j].x-points[i].x) < mouse.x) {
								odd = !odd;
							}
						}
						j = i;
					}
					
					return odd;
				} else
				
				// Arc
				// Does not work correctly at the moment
				if (obj.type === "arc") {
					var mouse = this.core.mouse,
						D = Math.sqrt(Math.pow(mouse.x - obj.abs_x, 2) + Math.pow(mouse.y - obj.abs_y, 2)),
						radius = obj.radius,
						eP = {},
						p1 = {},
						angleRange, a, y_, z, angle;
					
					if (obj.strokeWeight === obj.radius * 2) {
						radius = obj.strokeWeight;
					}
					
					if (D > radius) {
						return false;
					}
					
					angleRange = obj.end - obj.start;
					
					// If the arc is made like a pie chart piece
					// (desired radius is set as stroke weight and actual radius is set to half that size)
					if (radius === obj.strokeWeight) {
						
						
					}
					
					// If it's a normal arc
					else {
						
						if (angleRange > 180) {
							a = (360 - angleRange) / 2;
							y_ = Math.cos(a * Math.PI / 180) * radius;
							
							eP.x = obj.abs_x + Math.cos(a * Math.PI / 180) * y_;
							eP.y = obj.abs_y - Math.sin(a * Math.PI / 180) * y_;
							
							
							z = 180 - 2 * a;
							
							p1.x = obj.abs_x - Math.cos(z * Math.PI / 180) * radius;
							p1.y = obj.abs_y - Math.sin(z * Math.PI / 180) * radius;
							
							var aRight = 90 - (90 - z) - (90 - a);
							
							if (mouse.y < eP.y && mouse.x < eP.x) {
								angle = a - Math.acos(Math.abs(mouse.y - eP.y) / Math.sqrt(Math.pow(mouse.x - eP.x, 2) + Math.pow(mouse.y - eP.y, 2))) * 180 / Math.PI;
							} else 
							if (mouse.y > eP.y && mouse.x >= eP.x) {
								angle = aRight - Math.acos(Math.abs(mouse.x - eP.x) / Math.sqrt(Math.pow(mouse.x - eP.x, 2) + Math.pow(mouse.y - eP.y, 2))) * 180 / Math.PI;
							} else
							if (mouse.y < obj.abs_y && mouse.x >= eP.x) {
								return false;
							} else {
								angle = -1000000;
							}
							
							
							if (angle <= 0 && mouse.x >= p1.x && mouse.y > eP.y && mouse.y < obj.abs_y) {
								return true;
							} else if (angle <= 0 && mouse.y <= obj.abs_y && D <= radius) {
								return true;
							} else if (D <= radius && ((mouse.x <= p1.x && mouse.y <= obj.abs_y) || (mouse.y >= obj.abs_y)) ) {
								return true;
							} else {
								return false;
							}
						} else if (angleRange === 180) {
							if (mouse.y >= obj.abs_y && D <= radius) {
								return true;
							} else {
								return false;
							}
						} else if (angleRange < 180) {
							a = angleRange / 2;
							x_ = Math.sin(a * Math.PI / 180) * radius;
							y_ = Math.cos(a * Math.PI / 180) * radius;
							
							eP.x = obj.abs_x + Math.cos(a * Math.PI / 180) * y_;
							eP.y = obj.abs_y + Math.sin(a * Math.PI / 180) * y_;
							
							var a_ = Math.acos(Math.abs(mouse.x - eP.x) / Math.sqrt(Math.pow(mouse.x - eP.x, 2) + Math.pow(mouse.y - eP.y, 2))) * 180 / Math.PI,
								angle = 90 - a - a_;
							
							if (angle <= 0 && mouse.y > eP.y) {
								return true;
							} else if (angle >= 0 && mouse.y < eP.y && mouse.x > eP.x) {
								return true;
							} else {
								return false;
							}
						}
					}
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("tools", tools);

})(oCanvas, window, document);