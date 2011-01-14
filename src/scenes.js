(function(oCanvas, window, document, undefined){

	// Define the class
	var scenes = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},
			
			// Set properties
			current: "none",
			scenes: {},

			// Method for creating a new scene
			create: function (name, loadMethod) {
				this.scenes[name] = oCanvas.extend({ load: loadMethod }, Object.create(this.scenesBase));
			},
			
			// Object base that will be instantiated for each new scene
			scenesBase: {
			
				// Container for all objects that are added to the scene
				objects: [],
				
				// Method for adding objects to the scene
				add: function (obj) {
					return this.objects[this.objects.push(obj) - 1];
				},
				
				// Method for unloading the scene (removes all added objects from the canvas)
				unload: function () {
					var objects = this.objects,
						i;
					
					// Loop through all added objects
					for (i = objects.length; i--;) {
						if (objects[i] !== null) {
						
							// Remove the object from canvas, object list and memory
							objects[i].remove();
							objects[i] = null;
							delete objects[i];
						}
					}
					
					// Reset the object list
					this.objects = [];
				}
			},
			
			// Method for loading a specific scene
			load: function (name) {
				// Unload last scene if not done already
				if (this.current !== "none") {
					this.unload(this.current);
				}
				this.current = name;
				this.scenes[name].load.call(this.scenes[name]);
			},
			
			// Method for unloading a specific scene
			unload: function (name) {
				this.current = "none";
				this.scenes[name].unload();
			}
		};
	};

	// Register the module
	oCanvas.registerModule("scenes", scenes);

})(oCanvas, window, document);