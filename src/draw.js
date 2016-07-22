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

				// Clear all the image data on the canvas
				this.core.canvas.clearRect(0, 0, this.core.width, this.core.height);
				
				// Redraw the background if it should be kept
				if (keepBackground !== false) {
					this.core.background.redraw();
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
					i, l, obj, object, x, y, objectChain, lastX, lastY, n, len, parent, shadow, opacity;

				for (i = 0, l = objects.length; i < l; i++) {
					obj = objects[i];
					if ((obj !== undefined) && (typeof obj.draw === "function")) {

						// Reset canvas properties to their default values
						canvas.strokeStyle = "#000";
						canvas.fillStyle = "#000";
						canvas.globalAlpha = 1;
						canvas.lineWidth = 1;
						canvas.lineCap = "butt";
						canvas.lineJoin = "miter";
						canvas.miterLimit = 10;
						canvas.lineDashOffset = 0;
						canvas.shadowOffsetX = 0;
						canvas.shadowOffsetY = 0;
						canvas.shadowBlur = 0;
						canvas.shadowColor = 'rgba(0, 0, 0, 0)';
						canvas.globalCompositeOperation = 'source-over';
						canvas.font = '10px sans-serif';
						canvas.textAlign = 'start';
						canvas.textBaseline = 'alphabetic';
						canvas.direction = 'inherit';
						canvas.imageSmoothingEnabled = true;

						// Update the object's properties if an update method is available
						if (typeof obj.update === "function") {
							obj.update();
						}

						// Temporarily move the canvas origin and take children's positions into account, so they will rotate around the parent
						canvas.save();

						// Translate the canvas matrix to the position of the object
						canvas.translate(obj.x, obj.y);

						// If the object has a rotation, rotate the canvas matrix
						if (obj.rotation !== 0) {
							canvas.rotate(obj.rotation * Math.PI / 180);
						}

						// Scale the canvas for this object
						if (obj.scalingX !== 1 || obj.scalingY !== 1) {
							canvas.scale(obj.scalingX, obj.scalingY);
						}

						// Scale the opacity
						opacity = obj.opacity;
						var parent = obj.parent;
						while(parent && parent !== this.core) {
							opacity *= parent.opacity;
							parent = parent.parent;
						}

						// Save the translation so that display objects can access this if they need
						this.translation = { x: obj.abs_x, y: obj.abs_y };

						// Automatically adjust the abs_x/abs_y for the object
						// (objects not using these variables in the drawing process use the object created above)
						x = obj.abs_x;
						y = obj.abs_y;
						obj._.abs_x = 0;
						obj._.abs_y = 0;

						// Set the alpha to match the object's opacity
						canvas.globalAlpha = !isNaN(parseFloat(opacity)) ? parseFloat(opacity) : 1;

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

						// Loop children recursively to draw everything in the correct order
						if (obj.children.length > 0) {
							this.drawObjects(obj.children);
						}

						// Restore the old transformation
						canvas.restore();
						this.translation = { x: 0, y: 0 };
					}
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("draw", draw);

})(oCanvas, window, document);
