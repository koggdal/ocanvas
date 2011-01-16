(function(oCanvas, window, document, undefined){

	// Define the class
	var draw = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},

			// Set properties
			objects: {},
			drawn: {},
			lastObjectID: 0,
			
			// Method for adding a new object to the object list that will be drawn
			add: function (obj) {
				var id = ++this.lastObjectID;
				this.objects[id - 1] = obj;
				this.drawn[id - 1] = false;
				
				return id;
			},
			
			// Method for removing an object from the object list
			remove: function (id) {
				this.objects[id -1].drawn = false;
				delete this.objects[id - 1];
				delete this.drawn[id - 1];
				this.redraw();
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
			},
			
			// Method for drawing all objects in the object list
			redraw: function(){
				var objects = this.objects,
					i, obj;
				
				// Clear the canvas (keep the background)
				this.clear();
				
				// Loop through all objects
				for (i in objects) {
					obj = objects[i];
					if (obj !== undefined) {
						if (typeof obj.draw === "function") {
						
							// Update the object's properties if an update method is available
							if (typeof obj.update === "function") {
								obj.update();
							}
							
							// Temporarily move the canvas origin and rotation
							//this.core.transform.transformCanvas(obj.x, obj.y, obj.rotation);
							
							// Draw the object
							obj.draw();
							this.drawn[i] = true;
							
							// Reset the origin and rotation
							//this.core.transform.transformCanvas(0, 0, 0);
						}
					}
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("draw", draw);

})(oCanvas, window, document);