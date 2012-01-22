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
							delete handlers[index];
						}
					}
				}
			},

			getFrontObject: function (pointerName) {
				var objects, numObjects, pointer, i, obj, frontObject;

				objects = this.core.draw.objects;
				numObjects = objects.length;
				pointer = this.core[pointerName];

				// Get the front object for the current pointer position
				for (i = numObjects; i--;) {
					obj = objects[i];
					if (obj.isPointerInside(pointer)) {
						frontObject = obj;
						break;
					}
				}

				return frontObject;
			},

			triggerPointerEvent: function (type, frontObject, pointerName, e) {

				// Abort if events are disabled
				if (!this.enabled) {
					return;
				}

				// Get a fixed event object
				this.lastPointerEventObject = this.fixEventObject(e, pointerName);

				// Was any front object found?
				if (frontObject) {

					// Is this a different object than the current front object?
					if (frontObject !== this.frontObject) {

						// Is there a current front object?
						if (this.frontObject) {

							// Trigger all leave handlers for the current front object
							this.triggerHandlers(this.frontObject, this.eventTypes[pointerName].leave);
						}

						// Set this object as new front object and trigger all enter handlers for it
						this.frontObject = frontObject;
						this.triggerHandlers(frontObject, this.eventTypes[pointerName].enter);
					}

					// Trigger all handlers for the event that actually happened
					this.triggerHandlers(frontObject, this.eventTypes[pointerName][type]);

					// If the pointer is pressed down, save which the front object is
					if (type === "down") {
						this.lastDownObject = frontObject;
					}

					// If the pointer is released, trigger click handlers if the front object is
					//  the same as the object the pointer was pressed down on
					if (type === "up") {
						if (this.core[pointerName].cancelClick) {
							this.core[pointerName].cancelClick = false;

						} else if (frontObject === this.lastDownObject) {
							this.triggerHandlers(frontObject, this.eventTypes[pointerName].singleClick);
						}
						this.lastDownObject = {};
					}

				} else {

					// Is there a current front object?
					if (this.frontObject) {

						// Trigger all leave handlers for the current front object and reset the front object
						this.triggerHandlers(this.frontObject, this.eventTypes[pointerName].leave);
						this.frontObject = null;
					}
				}

				// Trigger canvas leave handlers if the canvas is not hovered
				if (!this.core[pointerName].canvasHovered) {
					this.triggerHandlers(this.core.canvasElement, this.eventTypes[pointerName].leave);
					this.core[pointerName].canvasLeaveEventTriggered = true;
					this.core[pointerName].canvasEnterEventTriggered = false;
				}

				// Trigger canvas enter handlers if the canvas is hovered and no enter event has been triggered
				else if (!this.core[pointerName].canvasEnterEventTriggered) {
					this.triggerHandlers(this.core.canvasElement, this.eventTypes[pointerName].enter);
					this.core[pointerName].canvasEnterEventTriggered = true;
				}

				// Trigger canvas handlers for the specified type if the canvas is hovered
				if (this.core[pointerName].canvasHovered) {
					this.triggerHandlers(this.core.canvasElement, this.eventTypes[pointerName][type]);
				}
			},

			triggerHandlers: function (obj, types) {
				var i, handlers, numHandlers, n, e;

				for (i = 0; i < types.length; i++) {
					handlers = obj.events[types[i]];
					e = ~types[i].indexOf("key") ? this.lastKeyboardEventObject : this.lastPointerEventObject;
					e.type = types[i];

					if (handlers) {
						numHandlers = handlers.length;
						for (n = 0; n < numHandlers; n++) {
							handlers[n].call(obj, e);
						}
					}
				}
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