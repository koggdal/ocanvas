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
			pointers: {},

			// Method for binding an event to a specific object
			bind: function (obj, types, handler) {
				var core = this.core,
					length, wrapper, index,
					mouseTypes = this.types.mouse,
					touchTypes = this.types.touch,
					keyboardTypes = this.types.keyboard,
					types = types.split(" "),
					t, type,
					p;
				
				for (t = 0; t < types.length; t++) {
				
					type = types[t];
					
					for (p in this.pointers) {
						this.pointers[p](type, (function(type) {
							return function (pointer, clickName) {
								
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
										if (type !== pointer + "leave") {
										
											// Only trigger mouseenter the first time event is triggered after pointer enters the object
											if (type === pointer + "enter" && obj.events[pointer + "ontarget"]) {
												return;
											}
											
											// Don't trigger click events if the pointer was pressed down outside the object
											if (type === clickName && !obj.isPointerInside(core.pointer.start_pos)) {
												return;
											}
											
											// Set status and trigger callback
											obj.events[pointer + "ontarget"] = true;
											handler.call(obj, e);
										}
									}
									
									// If pointer is not inside the object right now, but just was
									else if (type === pointer + "leave" && obj.events[pointer + "ontarget"]) {
									
										// Reset status and trigger callback for mouseleave
										obj.events[pointer + "ontarget"] = false;
										handler.call(obj, e);
									}
								};
								
								// Add the handler to the event list in the mouse module
								index = core[pointer].addEvent(type, wrapper);
								obj.events[type][index] = handler;
							};
						})(type));
					}
				}
			},
			
			// Method for removing an event handler from an object
			unbind: function (obj, types, handler) {
				var t, type, x, pointer, i, index;
				
				types = types.split(" ");
				
				for (t = 0; t < types.length; t++) {
				
					type = types[t];
					
					// Ignore event type if the object doesn't have any events of that type
					if (obj.events[type] === undefined) {
						continue;
					}
					
					// Find pointer type
					for (x in this.types) {
						if (~this.types[x].indexOf(type)) {
							pointer = x;
							break;
						}
					}
					
					// Find the index for the specified handler
					for (i in obj.events[type]) {
						if (obj.events[type][i] === handler) {
							index = i;
						}
					}
					
					// If index was found, remove the handler
					if (index !== undefined) {
						delete obj.events[type][index];
						this.core[pointer].removeEvent(type, index);
					}
				}
			},
			
			
			// Method for triggering events that has been added to an object
			trigger: function (obj, types) {
				var t, type, i;
				
				types = types.split(" ");
				
				// Loop through the specified event types
				for (t = 0; t < types.length; t++) {
					type = types[t];
					
					
					// If the event type exists on the object
					if (obj[type] !== undefined) {
						
						// Trigger all events of this type on this object
						for (i = 0; i < obj[type].length; i++) {
							obj[type][i].call(obj, this.core.pointer.last_event);
						}
					}
					
					// If the event type is a cancel event
					else if (~type.indexOf("cancel")) {
						this.core[type.replace("cancel","")].cancel();
					}
				}
			}
			
		};
	};

	// Register the module
	oCanvas.registerModule("events", events);

})(oCanvas, window, document);