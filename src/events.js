(function(oCanvas, window, document, undefined){

	// Define the class
	var events = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},
			
			types: {},

			// Method for binding an event to a specific object
			bind: function (obj, type, handler) {
				var length, wrapper, index,
					mouseTypes = this.types.mouse,
					touchTypes = this.types.touch,
					keyboardTypes = this.types.keyboard;
				
				// Mouse events
				if (~mouseTypes.indexOf(type)) {
				
					// Initialize the events object for specific event type
					if (obj.events[type] === undefined) {
						obj.events[type] = {};
					}
					
					// Create event wrapper
					wrapper = function (e, forceLeave) {
					
						// Cancel event if object is not drawn to canvas
						if (!obj.drawn) {
							return;
						}
					
						// If pointer is inside the object and we are not forced to trigger mouseleave
						if (obj.isPointerInside() && !forceLeave) {
						
							// Only trigger mouse events that are supposed to be triggered inside the object
							if (type !== "mouseleave") {
							
								// Only trigger mouseenter the first time event is triggered after pointer enters the object
								if (type === "mouseenter" && obj.events.mouseontarget) {
									return;
								}
								
								// Set status and trigger callback
								obj.events.mouseontarget = true;
								handler.call(obj, e);
							}
						}
						
						// If pointer is not inside the object right now, but just was
						else if (type === "mouseleave" && obj.events.mouseontarget) {
						
							// Reset status and trigger callback for mouseleave
							obj.events.mouseontarget = false;
							handler.call(obj, e);
						}
					};
					
					// Add the handler to the event list in the mouse module
					index = this.core.mouse.addEvent(type, wrapper);
					obj.events[type][index] = handler;
					
				} else
				
				// Keyboard events
				if (~keyboardTypes.indexOf(type)) {
					if (obj.events[type] === undefined) {
						obj.events[type] = {};
					}
				}
			},
			
			// Method for removing an event handler from an object
			unbind: function (obj, type, handler) {
				var i, l = obj.events[type].length,
					index;
					
				// Find the index for the specified handler
				for (i in obj.events[type]) {
					if (obj.events[type][i] === handler) {
						index = i;
					}
				}
				
				// If index was found, remove the handler
				if (index !== undefined) {
					delete obj.events[type][index];
					this.core.mouse.removeEvent(type, index);
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("events", events);

})(oCanvas, window, document);