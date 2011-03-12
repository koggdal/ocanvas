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
				this.objects[id - 1] = obj;
				this.drawn[id - 1] = false;
				
				return id;
			},
			
			// Method for removing an object from the object list
			remove: function (id) {
				if (this.objects[id -1] === undefined) {
					return;
				}
				this.objects[id -1].drawn = false;
				delete this.objects[id - 1];
				delete this.drawn[id - 1];
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
			},
			
			// Method for drawing all objects in the object list
			redraw: function(){
				var canvas = this.core.canvas,
					objects = this.objects,
					i, obj, x, y, shadow;
				
				// Clear the canvas (keep the background)
				if (this.core.settings.clearEachFrame) {
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
							
							// Temporarily move the canvas origin
							canvas.save();
							canvas.translate(obj.abs_x, obj.abs_y);
							
							// Set the translated position to enable display objects to access it when drawn
							this.translation = { x: obj.abs_x, y: obj.abs_y };
							
							// Automatically adjust the abs_x/abs_y for the object
							// (objects not using those variables in the drawing process use the object created above)
							x = obj.abs_x;
							y = obj.abs_y;
							obj._.abs_x = 0;
							obj._.abs_y = 0;
							
							// Temporarily scale the canvas for this object
							if (obj.scaling.x !== 1 || obj.scaling.y !== 1) {
								canvas.scale(obj.scaling.x, obj.scaling.y);
							}
							
							// Temporarily change the rotation
							if (obj.rotation !== 0) {
								canvas.rotate(obj.rotation * Math.PI / 180);
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
			}
		};
	};

	// Register the module
	oCanvas.registerModule("draw", draw);

})(oCanvas, window, document);