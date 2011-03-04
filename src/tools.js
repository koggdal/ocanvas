(function(oCanvas, window, document, undefined){

	// Define the class
	var tools = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},
			
			// Method for transforming the pointer position to the current object's transformation
			transformPointerPosition : function (rotation, cX, cY, extraAngle, pointer) {
				extraAngle = extraAngle || 0;
				pointer = pointer || this.core.pointer;
				
				var topright = (pointer.x >= cX && pointer.y <= cY),
					bottomright = (pointer.x >= cX && pointer.y >= cY),
					bottomleft = (pointer.x <= cX && pointer.y >= cY),
					topleft = (pointer.x <= cX && pointer.y <= cY),
					D = Math.sqrt(Math.pow(pointer.x - cX, 2) + Math.pow(pointer.y - cY, 2)),
					rotation = ((rotation / 360) - Math.floor(rotation / 360)) * 360 - extraAngle,
					c, x, y;
				
				// When pointer is in top right or bottom left corner
				if ( topright || bottomleft ) {
					c = (180 - rotation - Math.asin(Math.abs(pointer.y - cY) / D) * 180 / Math.PI) * Math.PI / 180;
					
					x = cX + Math.cos(c) * D * (topright ? -1 : 1);
					y = cY + Math.sin(c) * D * (topright ? -1 : 1);
				}
				
				// When pointer is in top left or bottom right corner
				else if (topleft || bottomright) {
					c = (Math.asin(Math.abs(pointer.y - cY) / D) * 180 / Math.PI - rotation) * Math.PI / 180;
					
					x = cX + Math.cos(c) * D * (topleft ? -1 : 1);
					y = cY + Math.sin(c) * D * (topleft ? -1 : 1);
				}
				
				return {
					x: x,
					y: y
				};
			},
			
			// Method for checking if the pointer's current position is inside the specified object
			isPointerInside: function (obj, pointerObject) {
			
				// Line
				if (obj.type === "line") {
				
					// Get angle difference relative to if it had been horizontal
					var dX = Math.abs(obj.end.x - obj.abs_x),
						dY = Math.abs(obj.end.y - obj.abs_y),
						D = Math.sqrt(dX * dX + dY * dY),
						angle = Math.asin(dY / D) * 180 / Math.PI,
						origin = obj.getOrigin(),
						
						// Transform the pointer position with the angle correction
						pointer = this.transformPointerPosition(obj.rotation, obj.abs_x, obj.abs_y, angle * -1, pointerObject);
					
					// Check if pointer is inside the line
					// Pointer coordinates are transformed to be compared with a horizontal line
					return ((pointer.x > obj.abs_x - D - origin.x) && (pointer.x < obj.abs_x + D - origin.x) && (pointer.y > obj.abs_y - obj.strokeWeight / 2 - origin.y) && (pointer.y < obj.abs_y + obj.strokeWeight / 2 - origin.y));
				} else
				
				// Point
				if (obj.type === "point") {
					var pointer = this.transformPointerPosition(obj.rotation, obj.abs_x, obj.abs_y, 0, pointerObject),
						origin = obj.getOrigin();
					return ((pointer.x === obj.abs_x - origin.x) && (pointer.y === obj.abs_y - origin.y));
				} else
				
				// Text
				if (obj.type === "text") {
					var pointer = this.transformPointerPosition(obj.rotation, obj.abs_x + (obj.width / 2), obj.abs_y + (obj.height / 2), 0, pointerObject),
						origin = obj.getOrigin(),
						left, right, top, bottom;
					
					// Find left and right positions based on the text alignment
					if (obj.align === "left") {
						left = obj.abs_x;
						right = obj.abs_x + obj.width;
					} else if (obj.align === "center") {
						left = obj.abs_x - obj.width / 2;
						right = obj.abs_x + obj.width / 2;
					} else if (obj.align === "right") {
						left = obj.abs_x - obj.width;
						right = obj.abs_x;
					} else if (obj.align === "start") {
						if (this.core.canvasElement.dir === "rtl") {
							left = obj.abs_x - obj.width;
							right = obj.abs_x;
						} else {
							left = obj.abs_x;
							right = obj.abs_x + obj.width;
						}
					} else if (obj.align === "end") {
						if (this.core.canvasElement.dir === "rtl") {
							left = obj.abs_x;
							right = obj.abs_x + obj.width;
						} else {
							left = obj.abs_x - obj.width;
							right = obj.abs_x;
						}
					}
					
					// Find the top and bottom positions based on the text baseline
					if (obj.baseline === "top") {
						top = obj.abs_y;
					} else if (obj.baseline === "hanging") {
						top = obj.abs_y - obj.height * 0.19;
					} else if (obj.baseline === "middle") {
						top = obj.abs_y - obj.height * 0.5;
					} else if (obj.baseline === "alphabetic") {
						top = obj.abs_y - obj.height * 0.79;
					} else if (obj.baseline === "ideographic") {
						top = obj.abs_y - obj.height * 0.84;
					} else if (obj.baseline === "bottom") {
						top = obj.abs_y - obj.height;
					}
					bottom = top + obj.height;
					
					return ((pointer.x > left - origin.x) && (pointer.x < right - origin.x) && (pointer.y > top - origin.y) && (pointer.y < bottom - origin.y));
				} else
				
				// Rectangle
				if (obj.shapeType === "rectangular") {
					var origin = obj.getOrigin(),
						pointer = this.transformPointerPosition(obj.rotation, obj.abs_x, obj.abs_y, 0, pointerObject);
					
					return ((pointer.x > obj.abs_x - origin.x) && (pointer.x < obj.abs_x + obj.width - origin.x) && (pointer.y > obj.abs_y - origin.y) && (pointer.y < obj.abs_y + obj.height - origin.y));
				} else
				
				// Circle
				if (obj.type === "ellipse" && obj.radius_x === obj.radius_y) {
					var pointer = this.transformPointerPosition(obj.rotation, obj.abs_x, obj.abs_y, 0, pointerObject),
						origin = obj.getOrigin(),
						D = Math.sqrt(Math.pow(pointer.x - obj.abs_x + origin.x, 2) + Math.pow(pointer.y - obj.abs_y + origin.y, 2));
					return (D < obj.radius_x);
				} else
				
				// Ellipse
				if (obj.type === "ellipse") {
					var pointer = this.transformPointerPosition(obj.rotation, obj.abs_x, obj.abs_y, 0, pointerObject),
						origin = obj.getOrigin(),
						a = obj.radius_x,
						b = obj.radius_y;
					pointer.x -= obj.abs_x + origin.x;
					pointer.y -= obj.abs_y + origin.y;
					
					return ((pointer.x * pointer.x) / (a * a) + (pointer.y * pointer.y) / (b * b) < 1);
				} else
				
				// Polygon
				if (obj.type === "polygon") {
					var pointer = this.transformPointerPosition(obj.rotation, obj.abs_x, obj.abs_y, 0, pointerObject),
						origin = obj.getOrigin(),
						points = obj._.points,
						length = points.length,
						j = length-1,
						odd = false,
						i;
					
					for (i = 0; i < length; i++) {
						if ( ((points[i].y < pointer.y) && (points[j].y >= pointer.y)) || ((points[j].y < pointer.y) && (points[i].y >= pointer.y)) ) {
							if (points[i].x + (pointer.y - points[i].y) / (points[j].y - points[i].y) * (points[j].x - points[i].x) < pointer.x) {
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
					var pointer = this.transformPointerPosition(obj.rotation, obj.abs_x, obj.abs_y, obj.start * -1, pointerObject),
						origin = obj.getOrigin(),
						D = Math.sqrt(Math.pow(pointer.x - obj.abs_x, 2) + Math.pow(pointer.y - obj.abs_y, 2)),
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
							
							if (pointer.y < eP.y && pointer.x < eP.x) {
								angle = a - Math.acos(Math.abs(pointer.y - eP.y) / Math.sqrt(Math.pow(pointer.x - eP.x, 2) + Math.pow(pointer.y - eP.y, 2))) * 180 / Math.PI;
							} else 
							if (pointer.y > eP.y && pointer.x >= eP.x) {
								angle = aRight - Math.acos(Math.abs(pointer.x - eP.x) / Math.sqrt(Math.pow(pointer.x - eP.x, 2) + Math.pow(pointer.y - eP.y, 2))) * 180 / Math.PI;
							} else
							if (pointer.y < obj.abs_y && pointer.x >= eP.x) {
								return false;
							} else {
								angle = -1000000;
							}
							
							
							if (angle <= 0 && pointer.x >= p1.x && pointer.y > eP.y && pointer.y < obj.abs_y) {
								return true;
							} else if (angle <= 0 && pointer.y <= obj.abs_y && D <= radius) {
								return true;
							} else if (D <= radius && ((pointer.x <= p1.x && pointer.y <= obj.abs_y) || (pointer.y >= obj.abs_y)) ) {
								return true;
							} else {
								return false;
							}
						} else if (angleRange === 180) {
							if (pointer.y >= obj.abs_y && D <= radius) {
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
							
							var a_ = Math.acos(Math.abs(pointer.x - eP.x) / Math.sqrt(Math.pow(pointer.x - eP.x, 2) + Math.pow(pointer.y - eP.y, 2))) * 180 / Math.PI,
								angle = 90 - a - a_;
							
							if (angle <= 0 && pointer.y > eP.y) {
								return true;
							} else if (angle >= 0 && pointer.y < eP.y && pointer.x > eP.x) {
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