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
			create: function (name, init) {
				this.scenes[name] = Object.create(this.scenesBase());
				this.scenes[name].name = name;
				
				init.call(this.scenes[name]);
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
					
					// Method for loading the scene's objects
					load: function () {
						if (this.loaded) {
							return;
						}
						
						var objects = this.objects,
							i, l = objects.length;
							
						// Loop through all added objects
						for (i = 0; i < l; i++) {
							if (objects[i] !== undefined) {
								objects[i].add();
							}
						}
						
						this.loaded = true;
						
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