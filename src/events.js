(function(oCanvas, window, document, undefined){

	// Define the class
	var events = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},

			// Method for binding an event to a specific object
			bind: function (obj, type, handler) {
				var mouse_events = ["mousemove", "mouseenter", "mouseleave", "mousedown", "mouseup", "click", "drag"],
					keyboard_events = ["keydown", "keyup", "keypress"],
					length;
				
				// Mouse events
				if (~mouse_events.indexOf(type)) {
				
					// Initialize the events object for specific event type
					if (obj.events[type] === undefined) {
						obj.events[type] = [];
					}
					
					// Add event handler
					length = obj.events[type].push(function (e, forceLeave) {
					
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
					});
					
					// Add the handler to the event list in the mouse module
					this.core.mouse.addEvent(type, obj.events[type][length - 1]);
					
				} else
				
				// Keyboard events
				if (~keyboard_events.indexOf(type)) {
					if (obj.events[type] === undefined) {
						obj.events[type] = [];
					}
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("events", events);

})(oCanvas, window, document);