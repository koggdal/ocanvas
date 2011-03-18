(function(oCanvas, window, document, undefined){

	// Define the class
	var draw = function () {
		
		// Return an object when instantiated
		return {

			// Set properties
			objects: {},
			drawn: {},
			lastObjectID: 0,
			translation: { x: 0, y: 0 },
			
			// Method for adding a new object to the object list that will be drawn
			add: function (obj) {
				var id = ++this.lastObjectID;
				this.objects[id] = obj;
				this.drawn[id] = false;
				
				return id;
			},
			
			// Method for removing an object from the object list
			remove: function (id) {
				if (this.objects[id] === undefined) {
					return;
				}
				this.objects[id].drawn = false;
				delete this.objects[id];
				delete this.drawn[id];
				this.redraw();
			},
			
			// Method for clearing the canvas from everything that has been drawn (bg can be kept)
			clear: function (keepBackground) {
				var objects = this.objects, i;
				
				if (keepBackground === undefined || keepBackground === true) {
					// The background is just redrawn over the entire canvas to remove all image data
					this.core.background.redraw();
				} else {
					// Clear all the image data on the canvas
					this.core.canvas.clearRect(0, 0, this.core.width, this.core.height);
				}
				
				// Set the drawn status of all objects
				for (i in objects) {
					objects[i].drawn = false;
				}
				
				return this;
			},
			
			// Method for drawing all objects in the object list
			redraw: function (forceClear) {
				forceClear = forceClear || false;
				var canvas = this.core.canvas,
					objects = this.objects,
					i, obj, object, x, y, objectChain, lastX, lastY, n, l, parent, shadow;
				
				// Clear the canvas (keep the background)
				if (this.core.settings.clearEachFrame || forceClear) {
					this.clear();
				}
				
				// Loop through all objects
				for (i in objects) {
					obj = objects[i];
					if (obj !== undefined) {
						if (typeof obj.draw === "function") {
						
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
							while (parent) {
								objectChain.push(parent);
								parent = parent.parent;
							}
							// Reverse the array so the top level parent comes first, and ends with the current object
							objectChain.reverse();
							
							// Loop through all objects in the parent chain
							lastX = 0; lastY = 0;
							for (n = 0, l = objectChain.length; n < l; n++) {
								object = objectChain[n];
							
								// Translate the canvas matrix to the position of the object
								canvas.translate(object.abs_x - lastX, object.abs_y - lastY);
								
								// If the object has a rotation, rotate the canvas matrix
								if (object.rotation !== 0) {
									canvas.rotate(object.rotation * Math.PI / 180);
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
							
							// Temporarily scale the canvas for this object
							if (obj.scalingX !== 1 || obj.scalingY !== 1) {
								canvas.scale(obj.scalingX, obj.scalingY);
							}
							
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
							this.drawn[i] = true;
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
						}
					}
				}
				
				return this;
			}
		};
	};

	// Register the module
	oCanvas.registerModule("draw", draw);

})(oCanvas, window, document);