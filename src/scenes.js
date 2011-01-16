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
				this.scenes[name] = oCanvas.extend(Object.create(this.scenesBase()), {
					name: name,
					load: function () {
						if (this.loaded) {
							this.unload();
						}
						this.loaded = true;
						loadMethod.call(this);
					}
				});
			},
			
			// Object base that will be instantiated for each new scene
			scenesBase: function () {
			
				return {
					name: "",
				
					// Container for all objects that are added to the scene
					objects: [],
					
					loaded: false,
					
					// Method for adding objects to the scene
					add: function (obj) {
						this.objects.push(obj);
						return obj;
					},
					
					// Method for unloading the scene (removes all added objects from the canvas)
					unload: function () {
						var objects = this.objects,
							i, l = objects.length;
							
						// Loop through all added objects
						for (i = 0; i < l; i++) {
							if (objects[i] !== undefined) {
								// Remove the object from canvas
								objects[i].remove();
							}
						}
						
						// Reset the object list
						this.objects = [];
						this.loaded = false;
					}
				};
			},
			
			// Method for loading a specific scene
			load: function (name, unload) {
				// Unload last scene if not done already
				if (unload === true && this.current !== "none") {
					this.unload(this.current);
				}
				this.current = name;
				this.scenes[name].load();
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