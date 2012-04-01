(function(oCanvas, window, document, undefined){

	// Define the class
	var events = function () {
		
		// Return an object when instantiated
		return {

			enabled: true,
			eventTypes: {},

			init: function () {

				// Add core properties that this module needs to be able to add events directly to the canvas
				this.core.canvasElement.events = {};
			},

			addEventTypes: function (pointerName, types) {
				this.eventTypes[pointerName] = this.eventTypes[pointerName] || [];
				var eventTypes = this.eventTypes[pointerName];
				for (var group in types) {
					eventTypes[group] = eventTypes[group] || [];
					eventTypes[group].push(types[group]);
				}
			},

			bind: function (obj, types, handler) {
				for (var i = 0; i < types.length; i++) {
					obj.events[types[i]] = obj.events[types[i]] || [];
					obj.events[types[i]].push(handler);
				}
			},

			unbind: function (obj, types, handler) {
				var i, handlers, index;

				for (i = 0; i < types.length; i++) {
					handlers = obj.events[types[i]];

					// Remove all handlers if no specific handler is passed in
					if (handler === undefined) {
						delete obj.events[types[i]];
					}

					// Find the passed in handler and remove it
					else {
						index = handlers.indexOf(handler);
						if (~index) {
							handlers.splice(index, 1);
						}
					}
				}
			},

			findFrontObject: function (objects, pointer) {
				var i, obj, result;

				// No object can be found if there are no objects
				if (objects.length === 0) {
					return false;
				}

				// Go through each object, starting from the end.
				//  For each object, it will loop through that object's children recursively.
				//  That way we start with the front object for the root level (added to core)
				//  and dig through to the deepest child. If the pointer is inside that object,
				//  we break out of all loops and return that object to the original caller.
				//  If the pointer was not inside that object, we will go back out one step
				//  at a time and check the pointer against each object. If no object was
				//  detected and we reach the core child again, we will take the next core
				//  child and iterate through that child chain.
				for (i = objects.length; i--;) {
					obj = objects[i];
					result = this.findFrontObject(obj.children, pointer);
					if (result === false) {
						if (obj.pointerEvents && obj.isPointerInside(pointer)) {
							result = obj;
							break;
						}
					} else {
						break;
					}
				}

				// This function will return an object if the pointer is inside it, or false otherwise
				return result;
			},

			getFrontObject: function (pointerName) {
				return this.findFrontObject(this.core.children, this.core[pointerName]) || undefined;
			},

			triggerPointerEvent: function (type, frontObject, pointerName, e) {

				// Abort if events are disabled
				if (!this.enabled) {
					return;
				}

				var canvas, eventTypes, enterEvent, leaveEvent, typeEvent,
				    clickEvent, parentChain, chain, sharedParent, i, l;

				canvas = this.core.canvasElement;
				eventTypes = this.eventTypes[pointerName];
				enterEvent = eventTypes.enter;
				leaveEvent = eventTypes.leave;
				typeEvent = eventTypes[type];
				clickEvent = eventTypes.singleClick;

				// Get a fixed event object
				this.lastPointerEventObject = this.fixEventObject(e, pointerName);

				// Was any front object found?
				if (frontObject) {

					// Is this a different object than the current front object?
					if (frontObject !== this.frontObject) {

						// Is there a current front object?
						if (this.frontObject) {

							// Is the current front object not in the parent chain for this object?
							parentChain = this.getParentChain(frontObject);
							if (!~parentChain.indexOf(this.frontObject)) {
								this.triggerHandlers(this.frontObject, leaveEvent);

								// Is this object not in the parent chain for the current front object?
								parentChain = this.getParentChain(this.frontObject);
								if (!~parentChain.indexOf(frontObject)) {
									this.triggerChain(parentChain, leaveEvent);
								} else {

									// This object is in the parent chain, so we construct a new chain
									//   for all parents in between and trigger leave events for this chain
									chain = [];
									for (i = 0, l = parentChain.length; i < l; i++) {
										if (parentChain[i] === frontObject) {
											break;
										}
										chain.push(parentChain[i]);
									}
									this.triggerChain(chain, leaveEvent);
								}
							}
						}

						// Set this object as new front object
						this.frontObject = frontObject;

						// Has the pointer not entered the parent of this object?
						if (!(frontObject.parent || canvas).events.hasEntered) {

							// Trigger all enter handlers for all parents that the pointer hasn't entered (out to in)
							parentChain = this.findNonEnteredParentChain(frontObject);
							this.triggerChain(parentChain, enterEvent);
						}

						// Has the pointer not entered this object?
						if (!frontObject.events.hasEntered) {
							this.triggerHandlers(frontObject, enterEvent);
						}
					}

				} else {

					// Is there a current front object?
					if (this.frontObject) {

						// Get the parent chain for the object and add the current object to the beginning
						chain = this.getParentChain(this.frontObject, false, true);

						// Trigger all leave handlers for current front object and parent chain
						this.triggerChain(chain, leaveEvent);

						this.frontObject = null;

					} else {

						// Trigger all enter handlers for the canvas if it hasn't been entered
						if (!canvas.events.hasEntered) {
							this.triggerHandlers(canvas, enterEvent);
						}
					}

					frontObject = this.core.canvasElement;
				}

				// Save which object the pointer was last pressed down on
				if (type === "down") {
					this.lastDownObject = frontObject;
				}

				// Trigger all handlers of the current type, for the object and its parent chain, including canvas
				//   This will also respect stopPropagation(), since the event will not be an enter or leave event
				chain = this.getParentChain(frontObject, true, true);
				this.triggerChain(chain, typeEvent);

				// If this is an up event, we might also want to trigger click events
				if (type === "up") {

					// Is this object the last object the pointer was pressed down on?
					if (frontObject === this.lastDownObject) {

						// Trigger all click handlers for the object and its parent chain, including canvas
						this.triggerChain(chain, clickEvent);

					} else {

						// Get the shared parent for this object and the last object the pointer was pressed down
						sharedParent = this.getSharedParent(frontObject, this.lastDownObject);
						if (sharedParent) {

							// Trigger all click handlers for the shared parent and its parent chain, incl canvas
							chain = this.getParentChain(sharedParent, true, true);
							this.triggerChain(chain, clickEvent);
						}
					}

					this.lastDownObject = null;
				}
			},

			getSharedParent: function (obj1, obj2) {
				var obj1Chain, canvas, obj2Parent;

				obj1Chain = this.getParentChain(obj1, true, true);

				canvas = this.core.canvasElement;
				obj2Parent = obj2;

				while (obj2Parent) {
					if (~obj1Chain.indexOf(obj2Parent)) {
						break;
					}
					obj2Parent = obj2Parent.parent || (obj2Parent !== canvas ? canvas : undefined);
				}

				return obj2Parent;
			},

			findNonEnteredParentChain: function (obj) {
				var chain, canvas, parent;

				chain = [];
				canvas = this.core.canvasElement;
				parent = obj.parent;

				while (parent) {
					if (parent.events.hasEntered) {
						break;
					}
					chain.push(parent);
					parent = parent.parent;
				}

				if (!parent && !canvas.events.hasEntered) {
					chain.push(canvas);
				}

				return chain.reverse();
			},

			getParentChain: function (obj, includeCanvas, includeObj) {
				var chain, parent;
				chain = [];

				if (includeObj) {
					chain.push(obj);
				}

				parent = obj.parent;
				while (parent) {
					chain.push(parent);
					parent = parent.parent;
				}

				if (includeCanvas && obj !== this.core.canvasElement) {
					chain.push(this.core.canvasElement);
				}

				return chain;
			},

			triggerChain: function (chain, types) {
				var i, l, continuePropagation;
				for (i = 0, l = chain.length; i < l; i++) {
					continuePropagation = this.triggerHandlers(chain[i], types);
					if (!continuePropagation) {
						break;
					}
				}
			},

			triggerHandlers: function (obj, types) {
				var i, handlers, isEnter, isLeave, numHandlers, n, e;

				for (i = 0; i < types.length; i++) {
					handlers = obj.events[types[i]];
					isEnter = !!~types[i].indexOf("enter");
					isLeave = !!~types[i].indexOf("leave");
					e = ~types[i].indexOf("key") ? this.lastKeyboardEventObject : this.lastPointerEventObject;
					e.type = types[i];
					e.bubbles = (isEnter || isLeave) ? false : true;

					if (isEnter && !obj.events.hasEntered) {
						obj.events.hasEntered = true;
					} else if (isLeave && obj.events.hasEntered) {
						obj.events.hasEntered = false;
					}

					if (handlers) {
						numHandlers = handlers.length;
						for (n = 0; n < numHandlers; n++) {
							handlers[n].call(obj, e);
						}

						if (e.stoppingPropagation) {
							e.stoppingPropagation = false;
							return false;
						}
					}
				}

				return true;
			},

			fixEventObject: function (e, inputName) {
				var properties = "altKey ctrlKey metaKey shiftKey button charCode keyCode clientX clientY pageX pageY screenX screenY detail eventPhase isChar touches targetTouches changedTouches scale rotation".split(" "),
					numProps = properties.length,
					eventObject, i, property, buttonConversion;
				
				// Fix specific properties and methods
				eventObject = {
					originalEvent: e,
					timeStamp: (new Date()).getTime(),
					which: e.which === 0 ? e.keyCode : e.which,
					
					preventDefault: function () {
						e.preventDefault();
					},
					
					stopPropagation: function () {
						if (this.bubbles) {
							this.stoppingPropagation = true;
						}
						e.stopPropagation();
					}
				};
				
				// Set selected original properties
				for (i = 0; i < numProps; i++) {
					property = properties[i];
					if (e[property] !== undefined) {
						eventObject[property] = e[property];
					}
				}

				// Add pointer coordinates
				if (~"mouse touch".indexOf(inputName)) {
					eventObject.x = this.core[inputName].x;
					eventObject.y = this.core[inputName].y;
				}

				// Fix the which property for mouse events
				if (inputName === "mouse") {
					// 0: No button pressed
					// 1: Primary button (usually left)
					// 2: Secondary button (usually right)
					// 3: Middle (usually the wheel)
					buttonConversion = {
						0: 1,
						2: 2,
						1: 3,
						default: 0
					};
					eventObject.which = buttonConversion[eventObject.button] || buttonConversion.default;
				}

				// Fix the which property for touch events
				if (inputName === "touch") {
					eventObject.which = 0;
				}

				return eventObject;
			}
		};
	};

	// Register the module
	oCanvas.registerModule("events", events, "init");

})(oCanvas, window, document);
