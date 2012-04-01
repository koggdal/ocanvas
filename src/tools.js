(function(oCanvas, window, document, undefined){

	// Define the class
	var tools = function () {
		
		// Return an object when instantiated
		return {
			
			// Method for transforming the pointer position to the current object's transformation
			transformPointerPosition: function (obj, cX, cY, extraAngle, pointer) {
				extraAngle = extraAngle || 0;
				pointer = pointer || this.core.pointer;
				
				// All calls that come from isPointerInside() will pass the display object as its first argument
				// This method will then do multiple transforms for each object in the parent chain to get the correct result
				if (typeof obj === "object") {
					var parent = obj.parent,
						objectChain = [],
						pos = { x: 0, y: 0 },
						last, object, n, l, origin;
					
					// Get all objects in the parent chain, including this one
					objectChain.push(obj);
					while (parent && parent !== this.core) {
						objectChain.push(parent);
						parent = parent.parent;
					}
					
					// Reverse the array so the top level parent comes first, and ends with the current object
					objectChain.reverse();
					
					// Loop through all objects in the parent chain
					last = pointer;
					for (n = 0, l = objectChain.length; n < l; n++) {
						object = objectChain[n];
						
						// If the object has a rotation, get the transformed mouse position for that rotation
						pos = this.transformPointerPosition(object.rotation, object.abs_x, object.abs_y, 0, last);
						
						// Save the current position so that the next iteration can use that as the pointer
						last = pos;
					}
					
					// Rotate an extra angle if specified
					if (extraAngle !== 0) {
						origin = obj.getOrigin();
						pos = this.transformPointerPosition(extraAngle * -1, cX - origin.x, cY - origin.y, 0, last);
					}
					
					// Return the correct position after all transforms
					return {
						x: pos.x,
						y: pos.y
					};
				}
				
				// If the first argument is not an object, it is the rotation passed in above
				else {
					var rotation = obj;
				}
				
				var topright = (pointer.x >= cX && pointer.y <= cY),
					bottomright = (pointer.x >= cX && pointer.y >= cY),
					bottomleft = (pointer.x <= cX && pointer.y >= cY),
					topleft = (pointer.x <= cX && pointer.y <= cY),
					D = Math.sqrt(Math.pow(pointer.x - cX, 2) + Math.pow(pointer.y - cY, 2)),
					rotation = ((rotation / 360) - Math.floor(rotation / 360)) * 360 - extraAngle,
					c, x, y,
					b = (D === 0) ? 0 : Math.abs(pointer.y - cY) / D;
				
				// When pointer is in top right or bottom left corner
				if ( topright || bottomleft ) {
					c = (180 - rotation - Math.asin(b) * 180 / Math.PI) * Math.PI / 180;
					
					x = cX + Math.cos(c) * D * (topright ? -1 : 1);
					y = cY + Math.sin(c) * D * (topright ? -1 : 1);
				}
				
				// When pointer is in top left or bottom right corner
				else if (topleft || bottomright) {
					c = (Math.asin(b) * 180 / Math.PI - rotation) * Math.PI / 180;
					
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
			
				var origin = obj.getOrigin();
			
				// Line
				if (obj.type === "line") {
				
					// Get angle difference relative to if it had been horizontal
					var dX = Math.abs(obj.end.x - obj.abs_x),
						dY = Math.abs(obj.end.y - obj.abs_y),
						D = Math.sqrt(dX * dX + dY * dY),
						s = obj.start,
						e = obj.end,
						factor = (s.x < e.x && s.y < e.y) || (s.x > e.x && s.y > e.y) ? -1 : 1,
						angle = Math.asin(dY / D) * (180 / Math.PI) * factor,
						
						// Transform the pointer position with the angle correction
						pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, angle, pointerObject);
					
					// Check if pointer is inside the line
					// Pointer coordinates are transformed to be compared with a horizontal line
					return ((pointer.x > obj.abs_x - D - origin.x) && (pointer.x < obj.abs_x + D - origin.x) && (pointer.y > obj.abs_y - obj.strokeWidth / 2 - origin.y) && (pointer.y < obj.abs_y + obj.strokeWidth / 2 - origin.y));
				} else
				
				// Text
				if (obj.type === "text") {
					var pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, 0, pointerObject),
						stroke = obj.strokeWidth / 2,
						lines = obj._.lines,
						numLines = lines.length,
						lineHeight = obj.size * obj.lineHeight,
						align = obj.align,
						rtl = this.core.canvasElement.dir === "rtl",
						baselines, i, aligns, left, right, top, bottom, isInside;

					baselines = {
						"top":         obj.size *  0.05,
						"hanging":     obj.size * -0.12,
						"middle":      obj.size * -0.47,
						"alphabetic":  obj.size * -0.78,
						"ideographic": obj.size * -0.83,
						"bottom":      obj.size * -1.00
					};

					for (i = 0; i < numLines; i++) {

						// Calculate the different positions for different aligns
						aligns = {
							"start":  rtl ? (obj.width - lines[i].width) : 0,
							"left":   0,
							"center": (obj.width - lines[i].width) / 2,
							"end":    rtl ? 0 : (obj.width - lines[i].width),
							"right":  (obj.width - lines[i].width)
						};

						// Find the left and right edges
						left = obj.abs_x + aligns[align];
						right = left + lines[i].width;

						// Find the top and bottom positions based on the text baseline
						top = obj.abs_y + (lineHeight * i) + baselines[obj.baseline];
						bottom = top + lineHeight + (numLines > 0 && i < numLines - 1 ? 1 : 0);

						isInside = ((pointer.x > left - origin.x - stroke) && (pointer.x < right - origin.x + stroke) && (pointer.y > top - origin.y - stroke) && (pointer.y < bottom - origin.y + stroke));

						if (isInside) {
							return true;
						}
					}
					
					return false;
				} else
				
				// Rectangle
				if (obj.shapeType === "rectangular") {
					var pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, 0, pointerObject),
						stroke = (obj.strokePosition === "outside") ? obj.strokeWidth : ((obj.strokePosition === "center") ? obj.strokeWidth / 2 : 0);
					
					return ((pointer.x > obj.abs_x - origin.x - stroke) && (pointer.x < obj.abs_x + obj.width - origin.x + stroke) && (pointer.y > obj.abs_y - origin.y - stroke) && (pointer.y < obj.abs_y + obj.height - origin.y + stroke));
				} else
				
				// Circle
				if (obj.type === "ellipse" && obj.radius_x === obj.radius_y) {
					var pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, 0, pointerObject),
						D = Math.sqrt(Math.pow(pointer.x - obj.abs_x + origin.x, 2) + Math.pow(pointer.y - obj.abs_y + origin.y, 2));
					return (D < obj.radius_x + obj.strokeWidth / 2);
				} else
				
				// Ellipse
				if (obj.type === "ellipse") {
					var pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, 0, pointerObject),
						a = obj.radius_x + obj.strokeWidth / 2,
						b = obj.radius_y + obj.strokeWidth / 2;
					pointer.x -= obj.abs_x + origin.x;
					pointer.y -= obj.abs_y + origin.y;
					
					return ((pointer.x * pointer.x) / (a * a) + (pointer.y * pointer.y) / (b * b) < 1);
				} else
				
				// Polygon
				if (obj.type === "polygon") {
					var pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, 0, pointerObject),
						radius = obj.radius + obj.strokeWidth / 2,
						length = obj.sides,
						j = length - 1,
						odd = false,
						i, thisPoint, prevPoint;
						
					for (i = 0; i < length; i++) {
					
						// Calulate positions for the points
						thisPoint = {
							x: (obj.abs_x - origin.x + (radius * Math.cos(i * 2 * Math.PI / length))),
							y: (obj.abs_y - origin.y + (radius * Math.sin(i * 2 * Math.PI / length)))
						};
						prevPoint = {
							x: (obj.abs_x - origin.x + (radius * Math.cos(j * 2 * Math.PI / length))),
							y: (obj.abs_y - origin.y + (radius * Math.sin(j * 2 * Math.PI / length)))
						};
						
						// Check how many edges we cross using odd parity
						if ( ((thisPoint.y < pointer.y) && (prevPoint.y >= pointer.y)) || ((prevPoint.y < pointer.y) && (thisPoint.y >= pointer.y)) ) {
							if (thisPoint.x + (pointer.y - thisPoint.y) / (prevPoint.y - thisPoint.y) * (prevPoint.x - thisPoint.x) < pointer.x) {
								odd = !odd;
							}
						}
						j = i;
					}
					
					return odd;
				} else
				
				// Arc
				// Filled arcs, stroked arcs, stroked arcs that look like pie chart pieces
				if (obj.type === "arc") {
					var angleDiff = obj.end - obj.start,
						angleRange = (obj.direction === "clockwise") ? (angleDiff < 0 ? 360 : 0) + angleDiff % 360 : Math.abs(angleDiff),
						extraAngle = (obj.direction === "clockwise" ? obj.start * -1 : obj.end * -1),
						pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, extraAngle, pointerObject),
						D = Math.sqrt(Math.pow(pointer.x - obj.abs_x + origin.x, 2) + Math.pow(pointer.y - obj.abs_y + origin.y, 2)),
						radius = obj.radius,
						eP = {},
						p1 = {},
						a, y_, z, angle;
					
					// Cancel if the distance between pointer and origin is longer than the radius
					if ((obj.strokeWidth === 0 && D > radius) || (obj.strokeWidth > 0 && D > radius + obj.strokeWidth / 2)) {
						return false;
					}
					
					// If the arc is made like a pie chart piece
					// (desired radius is set as stroke width and actual radius is set to half that size)
					if (radius === obj.strokeWidth / 2) {
					
						if (angleRange > 180) {
						
							var pX, pY, pD, pA;
							
							// Calculate the distance between the pointer and origin, to find the angle
							pX = Math.abs(obj.abs_x - origin.x - pointer.x),
							pY = Math.abs(obj.abs_y - origin.y - pointer.y),
							pD = Math.sqrt(pX * pX + pY * pY),
							pA = Math.acos(pX / pD) * 180 / Math.PI;
							
							if (pointer.y >= obj.abs_y - origin.y && D <= obj.strokeWidth) {
								return true;
							} else if (pointer.y < obj.abs_y - origin.y && pointer.x < obj.abs_x - origin.x && pA <= (angleRange - 180)) {
								return true;
							} else {
								return false;
							}
						
						} else if (angleRange === 180) {
							
							// Inside if pointer is below the origin
							if (pointer.y >= obj.abs_y - origin.y && D <= obj.strokeWidth) {
								return true;
							} else {
								return false;
							}
							
						} else if (angleRange < 180) {
							
							// Rotate the pointer position so that the angle is aligned in the bottom like a U
							extraAngle = (90 - angleRange / 2 - (obj.direction === "clockwise" ? obj.start : obj.end));
							pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, extraAngle, pointerObject);
							
							var d, pX, pY, pD, pA;
							
							// Fix the radius for this type of arc
							radius *= 2;
							
							// Calculate the distance from the origin to the y value of the end points
							d = Math.cos(angleRange / 2 * Math.PI / 180) * radius;
							
							// Calculate the distance between the pointer and origin, to find the angle
							pX = Math.abs(obj.abs_x - origin.x - pointer.x)
							pY = Math.abs(obj.abs_y - origin.y - pointer.y);
							pD = Math.sqrt(pX * pX + pY * pY);
							pA = Math.asin(pX / pD) * 180 / Math.PI;
							
							if (pointer.y >= obj.abs_y - origin.y + d) {
								return true;
							} else if (pointer.y >= obj.abs_y - origin.y && pA <= angleRange / 2) {
								return true;
							} else {
								return false;
							}
						}
					}
					
					// If it's a normal arc
					else {
						
						if (angleRange > 180) {
							a = (360 - angleRange) / 2;
							y_ = Math.cos(a * Math.PI / 180) * radius;
							
							eP.x = obj.abs_x - origin.x + Math.cos(a * Math.PI / 180) * y_;
							eP.y = obj.abs_y - origin.y - Math.sin(a * Math.PI / 180) * y_;
							
							
							z = 180 - 2 * a;
							
							p1.x = obj.abs_x - origin.x - Math.cos(z * Math.PI / 180) * radius;
							p1.y = obj.abs_y - origin.y - Math.sin(z * Math.PI / 180) * radius;
							
							var aRight = 90 - (90 - z) - (90 - a);
							
							if (pointer.y < eP.y && pointer.x < eP.x) {
								angle = a - Math.acos(Math.abs(pointer.y - eP.y) / Math.sqrt(Math.pow(pointer.x - eP.x, 2) + Math.pow(pointer.y - eP.y, 2))) * 180 / Math.PI;
							} else 
							if (pointer.y > eP.y && pointer.x >= eP.x) {
								angle = aRight - Math.acos(Math.abs(pointer.x - eP.x) / Math.sqrt(Math.pow(pointer.x - eP.x, 2) + Math.pow(pointer.y - eP.y, 2))) * 180 / Math.PI;
							} else
							if (pointer.y < obj.abs_y - origin.y && pointer.x >= eP.x) {
								return false;
							} else {
								angle = -1000000;
							}

							if ((obj.fill === "" || obj.fill === "transparent") && (obj.strokeWidth > 0) && (D < radius - obj.strokeWidth / 2)) {
								return false;
							}
							
							if (angle <= 0 && pointer.x >= p1.x && pointer.y > eP.y && pointer.y < obj.abs_y - origin.y) {
								return true;
							} else if (angle <= 0 && pointer.y <= obj.abs_y - origin.y && D <= radius) {
								return true;
							} else if (((obj.strokeWidth === 0 && D <= radius) || (obj.strokeWidth > 0 && D <= radius + obj.strokeWidth / 2)) && ((pointer.x <= p1.x && pointer.y <= obj.abs_y - origin.y) || (pointer.y >= obj.abs_y - origin.y)) ) {
								return true;
							} else {
								return false;
							}
						} else if (angleRange === 180) {
						
							// Inside if pointer is below the origin
							if (pointer.y >= obj.abs_y - origin.y && ((obj.strokeWidth === 0 && D <= radius) || (obj.strokeWidth > 0 && D <= radius + obj.strokeWidth / 2))) {
								return true;
							} else {
								return false;
							}
						} else if (angleRange < 180) {
						
							// Rotate the pointer position so that the angle is aligned in the bottom like a U
							extraAngle = (90 - angleRange / 2 - (obj.direction === "clockwise" ? obj.start : obj.end));
							pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, extraAngle, pointerObject);
							
							var r, d;
							
							// Make it a bit more accurate when there is only a stroke
							r = (obj.fill === "") ? radius - obj.strokeWidth / 2 : radius;
							
							// Calculate the distance from the origin to the y value of the end points
							d = Math.cos(angleRange / 2 * Math.PI / 180) * r;
							
							// If there is only a stroke
							if (obj.fill === "" && obj.strokeWidth > 0) {
							
								// It has to be lower than the end points, and between the edges of the stroke
								if (pointer.y >= obj.abs_y - origin.y + d && D >= radius - obj.strokeWidth / 2 && D <= radius + obj.strokeWidth / 2) {
									return true;
								} else {
									return false;
								}
							}
							
							// If there is a fill and the y position of the pointer is below the end points
							else if (pointer.y >= obj.abs_y - origin.y + d) {
							
								// If there is also a stroke
								if (obj.strokeWidth > 0) {
									
									// If the distance from origin to pointer is less than to the outer edge of the stroke
									if (D <= radius + obj.strokeWidth / 2) {
										return true;
									} else {
										return false;
									}
								}
								
								// If no stroke, it is inside
								else {
									return true;
								}
							}
							
							// If the y position of the pointer is above the end points
							else {
								return false;
							}
						}
					}
				} else
				
				// Generic radial object
				if (obj.shapeType === "radial") {
					var radius = obj.radius ? obj.radius : 0;
					
					if (radius > 0) {
						var pointer = this.transformPointerPosition(obj, obj.abs_x, obj.abs_y, 0, pointerObject),
							origin = obj.getOrigin(),
							D = Math.sqrt(Math.pow(pointer.x - obj.abs_x + origin.x, 2) + Math.pow(pointer.y - obj.abs_y + origin.y, 2));
							
						return (D < radius);
					}
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("tools", tools);

})(oCanvas, window, document);
