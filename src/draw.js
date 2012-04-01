(function(oCanvas, window, document, undefined){

	// Define the class
	var draw = function () {
		
		// Return an object when instantiated
		return {

			// Set properties
			objects: [],
			translation: { x: 0, y: 0 },

			changeZorder: function (obj, index1, index2) {
				var objects = obj.children,
					obj1 = objects[index1],
					obj2 = objects[index2],
					before, middle, after, newArray;

				// Cancel the change if the first object doesn't exist
				if (obj1 === undefined) {
					return;
				}

				// Cancel the change if the indexes are the same
				if (index1 === index2) {
					return;
				}

				// If the new index is larger than the last index, make it the last
				if (index2 > objects.length -1) {
					index2 = objects.length -1;
				}

				// If the new index is smaller than the first, make it the first
				if (index2 < 0) {
					index2 = 0;
				}

				// Change the order of the objects
				if (index2 > index1) {
					before = objects.slice(0, index1);
					after = objects.slice(index2 + 1, objects.length);
					middle = objects.slice(index1, index2 + 1);
					middle.shift();
					middle.push(obj1);
				} else {
					before = objects.slice(0, index2);
					after = objects.slice(index1 + 1, objects.length);
					middle = objects.slice(index2, index1 + 1);
					middle.pop();
					middle.unshift(obj1);
				}

				// Update the array with the new values
				obj.children = before.concat(middle).concat(after);
			},
			
			// Method for clearing the canvas from everything that has been drawn (bg can be kept)
			clear: function (keepBackground) {
				
				if (keepBackground === undefined || keepBackground === true) {
					// The background is just redrawn over the entire canvas to remove all image data
					this.core.background.redraw();
				} else {
					// Clear all the image data on the canvas
					this.core.canvas.clearRect(0, 0, this.core.width, this.core.height);
				}
				
				// Set a flag that will affect the value of the `drawn` property of display objects
				this.isCleared = true;

				return this;
			},
			
			// Method for drawing all objects in the object list
			redraw: function (forceClear) {
				forceClear = forceClear || false;
				
				// Clear the canvas (keep the background)
				if (this.core.settings.clearEachFrame || forceClear) {
					this.clear();
				}

				// Set a flag that will affect the value of the `drawn` property of display objects
				this.isCleared = false;

				// Draw all objects in the correct order
				this.drawObjects(this.core.children);
				
				return this;
			},

			drawObjects: function (objects) {
				var canvas = this.core.canvas,
					i, l, obj, object, x, y, objectChain, lastX, lastY, n, len, parent, shadow;

				for (i = 0, l = objects.length; i < l; i++) {
					obj = objects[i];
					if ((obj !== undefined) && (typeof obj.draw === "function")) {
						
						// Update the object's properties if an update method is available
						if (typeof obj.update === "function") {
							obj.update();
						}

						// Temporarily move the canvas origin and take children's positions into account, so they will rotate around the parent
						canvas.save();

						// Create an array of all the parents to this object
						objectChain = [];
						objectChain.push(obj);
						parent = obj.parent;
						while (parent && parent !== this.core) {
							objectChain.push(parent);
							parent = parent.parent;
						}
						// Reverse the array so the top level parent comes first, and ends with the current object
						objectChain.reverse();

						// Loop through all objects in the parent chain
						lastX = 0; lastY = 0;
						for (n = 0, len = objectChain.length; n < len; n++) {
							object = objectChain[n];

							// Translate the canvas matrix to the position of the object
							canvas.translate(object.abs_x - lastX, object.abs_y - lastY);
							
							// If the object has a rotation, rotate the canvas matrix
							if (object.rotation !== 0) {
								canvas.rotate(object.rotation * Math.PI / 180);
							}
							
							// Scale the canvas for this object
							if (object.scalingX !== 1 || object.scalingY !== 1) {
								canvas.scale(object.scalingX, object.scalingY);
							}
							
							// Save the current translation so that the next iteration can subtract that
							lastX = object.abs_x;
							lastY = object.abs_y;
						}

						// Save the translation so that display objects can access this if they need
						this.translation = { x: lastX, y: lastY };

						// Automatically adjust the abs_x/abs_y for the object
						// (objects not using these variables in the drawing process use the object created above)
						x = obj.abs_x;
						y = obj.abs_y;
						obj._.abs_x = 0;
						obj._.abs_y = 0;

						// Set the alpha to match the object's opacity
						canvas.globalAlpha = !isNaN(parseFloat(obj.opacity)) ? parseFloat(obj.opacity) : 1;

						// Set the composition mode
						canvas.globalCompositeOperation = obj.composition;

						// Set shadow properties if object has shadow
						shadow = obj.shadow;
						if (shadow.blur > 0) {
							canvas.shadowOffsetX = shadow.offsetX;
							canvas.shadowOffsetY = shadow.offsetY;
							canvas.shadowBlur = shadow.blur;
							canvas.shadowColor = shadow.color;
						}

						// Set stroke properties
						canvas.lineCap = obj.cap;
						canvas.lineJoin = obj.join;
						canvas.miterLimit = obj.miterLimit;

						// Draw the object
						obj.draw();
						obj.drawn = true;

						// Reset the abs_x/abs_y values
						obj._.abs_x = x;
						obj._.abs_y = y;

						// Reset stroke properties
						canvas.lineCap = "butt";
						canvas.lineJoin = "miter";
						canvas.miterLimit = 10;

						// Restore the old transformation
						canvas.restore();
						this.translation = { x: 0, y: 0 };

						// Loop children recursively to draw everything in the correct order
						if (obj.children.length > 0) {
							this.drawObjects(obj.children);
						}
					}
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("draw", draw);

})(oCanvas, window, document);
