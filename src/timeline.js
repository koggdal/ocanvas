(function(oCanvas, window, document, undefined){

	// Define the timeline class
	var timeline = function () {
	
		// Return an object when instantiated; this allows the developer to do:
		//     canvas.timeline.start();
		return {
		
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},
			
			// Set default values when initalized
			currentFrame: 1,
			timeline: 0,
			running: false,
			
			// Method that will be called for each frame
			loop: function () {
				
				// If mainLoop has been defined
				if (typeof this.core.settings.mainLoop === "function") {
				
					// Clear the canvas if specified
					//if (this.core.settings.clearEachFrame === true) {
					//	this.core.clear();
					//}
					
					// Trigger the user defined function mainLoop and set this to the current core instance
					this.core.settings.mainLoop.call(this.core);
					
					// Redraw the canvas if specified
					//if (this.core.settings.drawEachFrame === true) {
					//	this.core.drawState.draw();
					//}
					
					// Increment the frame count
					this.currentFrame++;
				}
				
				return this;
			},
		
			// Method that starts the timeline
			start: function () {
				var timeline = this;
				
				// Reset the timer
				clearInterval(timeline.timeline);
				timeline.timeline = setInterval(function () { timeline.loop(); }, 1000 / timeline.core.settings.fps);
				timeline.running = true;
				
				return this;
			},
			
			// Method that stops the timeline
			stop: function () {
			
				// Remove the timer
				clearInterval(this.timeline);
				this.running = false;
				
				return this;
			},
			
			// Method that sets a new FPS to be used
			setFPS: function (fps) {
			
				// Set the new FPS
				this.core.settings.fps = fps;
				
				// Restart the timer if the timeline is running
				if (this.running) {
					this.start();
				}
				
				return this;
			},
			
			// Method that returns the current FPS
			getFPS: function () {
				return this.core.settings.fps;
			}
		};
	};
	
	// Register the timeline module
	oCanvas.registerModule("timeline", timeline);
	
})(oCanvas, window, document);