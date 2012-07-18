(function(oCanvas, window, document, undefined){

	// Define the timeline class
	var timeline = function () {
	
		// Return an object when instantiated
		var module = {
			
			init: function () {
				var _this = this;
				
				// Method for setting the function to be called for each frame
				this.core.setLoop = function (callback) {
					_this.userLoop = callback;
					
					// Return the timeline object to enable methods like start() to be called directly
					return _this;
				};
			},
			
			// Set default values when initialized
			currentFrame: 1,
			timeline: 0,
			running: false,
			
			set fps (value) {
				this.core.settings.fps = value;
				
				// Restart the timer if the timeline is running
				if (this.running) {
					this.start();
				}
			},
			get fps () {
				return this.core.settings.fps;
			},
			
			// Method that will be called for each frame
			loop: function () {
				if (!this.running) {
					return;
				}

				// Set up a timer to respect the chosen fps,
				// but use RAF to decide when the next call should be made.
				setTimeout(function () {
					module.timeline = requestAnimationFrame(module.loopBound);

					var core = module.core;
				
					// If mainLoop has been defined
					if (typeof module.userLoop === "function") {

						// Clear the canvas if specified
						if (core.settings.clearEachFrame === true) {
							core.draw.clear();
						}

						// Trigger the user defined function mainLoop and set this to the current core instance
						module.userLoop.call(core, core.canvas);

						// Redraw the canvas if specified
						if (core.settings.drawEachFrame === true) {
							core.draw.redraw();
						}

						// Increment the frame count
						module.currentFrame++;
					}

				}, 1000 / module.fps);
			},

			// A wrapper function for the loop to bind this keyword
			loopBound: function () {
				module.loop();
			},
		
			// Method that starts the timeline
			start: function () {
				cancelAnimationFrame(module.timeline);
				module.running = true;
				module.loop();
				
				return this;
			},
			
			// Method that stops the timeline
			stop: function () {
				this.running = false;
				cancelAnimationFrame(module.timeline);
				
				return this;
			}
		};

		return module;
	};
	
	// Register the timeline module
	oCanvas.registerModule("timeline", timeline, "init");
	
})(oCanvas, window, document);