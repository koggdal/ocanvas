(function(oCanvas, window, document, undefined){

	// Define the class
	var scenes = function () {
		
		// Return an object when instantiated
		return {
			
			// Set properties
			current: "none",
			scenes: {},

			// Method for creating a new scene
			create: function (name, init) {
				this.scenes[name] = Object.create(this.scenesBase());
				this.scenes[name].name = name;
				
				init.call(this.scenes[name]);
				
				return this.scenes[name];
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
						
						// Add the object to canvas if the scene is loaded
						if (this.loaded) {
							obj.add();
						}
						
						return this;
					},
					
					// Method for removing an object from the scene
					remove: function (obj) {
						var index = this.objects.indexOf(obj);
						if (~index) {
							this.objects.splice(index, 1);
								
							// Remove the object from canvas if the scene is loaded
							if (this.loaded) {
								obj.remove();
							}
						}
						
						return this;
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
								objects[i].add(false);
							}
						}
						
						this.loaded = true;
						
						return this;
					},
					
					// Method for unloading the scene (removes all added objects from the canvas)
					unload: function () {
						var objects = this.objects,
							i, l = objects.length;
							
						// Loop through all added objects
						for (i = 0; i < l; i++) {
							if (objects[i] !== undefined) {
								// Remove the object from canvas
								objects[i].remove(false);
							}
						}
						
						this.loaded = false;
						
						return this;
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

				this.core.draw.redraw();

				return this;
			},
			
			// Method for unloading a specific scene
			unload: function (name) {
				this.current = "none";
				this.scenes[name].unload();

				this.core.draw.redraw();

				return this;
			}
		};
	};

	// Register the module
	oCanvas.registerModule("scenes", scenes);

})(oCanvas, window, document);