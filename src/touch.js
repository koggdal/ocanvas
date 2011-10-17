(function(oCanvas, window, document, undefined){
	
	// Define the class
	var touch = function () {
		
		// Return an object when instantiated
		return {
			
			// List of all events that are added
			eventList: {
				touchstart: { last: -1, length: 0 },
				touchend: { last: -1, length: 0 },
				touchmove: { last: -1, length: 0 },
				touchenter: { last: -1, length: 0 },
				touchleave: { last: -1, length: 0 },
				tap: { last: -1, length: 0 }
			},
			
			last_event: {},
			
			// Method for initializing the module
			init: function () {
				var _this = this,
					core = this.core,
					canvasElement = core.canvasElement,
					types,
					isTouch = ("ontouchstart" in window || "createTouch" in document);
				
				// Register pointer
				core.events.types.touch = types = ["touchstart", "touchend", "touchmove", "touchenter", "touchleave", "tap"];
				core.events.pointers.touch = function (type, doAdd) {
					if (~types.indexOf(type) && isTouch) {
						doAdd("touch", "tap");
					}
				};
				if (isTouch) {
					core.pointer = this;
					
					// Set iOS specific settings to prevent selection of the canvas element
					canvasElement.style.WebkitUserSelect = "none";
					canvasElement.style.WebkitTouchCallout = "none";
					canvasElement.style.WebkitTapHighlightColor = "rgba(0,0,0,0)";
				}
				
				// Define properties
				this.x = -1;
				this.y = -1;
				this.touchState = 'up';
				this.canvasFocused = false;
				this.canvasHovered = false;
				this.cancel();
				
				// Add event listeners to the canvas element
				canvasElement.addEventListener('touchmove', function (e) { _this.touchmove.call(_this, e); }, false);
				canvasElement.addEventListener('touchstart', function (e) { _this.touchstart.call(_this, e); }, false);
				canvasElement.addEventListener('touchend', function (e) { _this.touchend.call(_this, e); }, false);
				
				if (core.settings.disableScrolling) {
					// Add event listener to prevent scrolling on touch devices
					canvasElement.addEventListener('touchmove', function (e) { _this.doctouchmove.call(_this, e); e.preventDefault(); }, false);
				}
				
				// Add event listeners to the canvas element (used for setting states and trigger touchend events)
				document.addEventListener('touchend', function (e) { _this.doctouchend.call(_this, e); }, false);
				document.addEventListener('touchmove', function (e) { _this.doctouchmove.call(_this, e); }, true);
				document.addEventListener('touchstart', function (e) { _this.doctouch.call(_this, e); }, true);
			},
			
			// Method for adding an event to the event list
			addEvent: function (type, handler) {
				this.eventList[type].last++;
				this.eventList[type].length++;
				var index = this.eventList[type].last;
				this.eventList[type][index] = handler;
				return index;
			},
			
			// Method for removing an event from the event list
			removeEvent: function (type, index) {
				delete this.eventList[type][index];
				this.eventList[type].length--;
			},
			
			// Method for getting the current touch position relative to the canvas top left corner
			getPos: function (e) {
				var x, y;
				
				if (e.touches !== undefined) {
					var boundingRect = this.core.canvasElement.getBoundingClientRect(),
						l = e.touches.length;
	
					if (e.touches.length > 0) {
						e = e.touches[0];
							
						// Browsers supporting pageX/pageY
						if (e.pageX && e.pageY) {
							x = e.pageX - (Math.round(boundingRect.left) < 0 ? 0 : Math.round(boundingRect.left));
							y = e.pageY - (Math.round(boundingRect.top) < 0 ? 0 : Math.round(boundingRect.top));
						} else {
							x = this.x;
							y = this.y;
						}
					}
				} else {
					x = this.x;
					y = this.y;
				}
				
				return { x: x, y: y };
			},
			
			// Method for updating the touch position relative to the canvas top left corner
			updatePos: function (e) {
				var pos = this.getPos(e);
				this.x = pos.x;
				this.y = pos.y;
				
				return pos;
			},
			
			// Method for checking if the touch is inside the canvas
			onCanvas: function (e) {
				e = e || this.last_event;
				
				// Get pointer position
				var pos = e ? this.getPos(e) : {x:this.x, y:this.y};
				
				// Check boundaries => (left) && (right) && (top) && (bottom)
				if ( (pos.x >= 0) && (pos.x <= this.core.width) && (pos.y >= 0) && (pos.y <= this.core.height) ) {
					this.canvasHovered = true;
					this.updatePos(e);
					return true;
				} else {
					this.canvasHovered = false;
					return false;
				}
			},
			
			// Method for triggering all events of a specific type
			triggerEvents: function (type, e, forceLeave) {
				forceLeave = forceLeave || false;

				// Abort if events are disabled
				if (!this.core.events.enabled) {
					return;
				}

				// Get a modified event object
				var eventObject = this.core.events.modifyEventObject(e, type);
						
				// Add new properties to the event object
				eventObject.x = this.x;
				eventObject.y = this.y;
				eventObject.which = 0;
				
				// Trigger event handlers, but only on the front object
				this.core.events.triggerPointerHandlers(this.eventList[type], eventObject, forceLeave);
			},
			
			// Method that triggers all touchmove events that are added
			touchmove: function (e) {
				this.last_event = e;
				
				if (this.onCanvas(e)) {
					this.canvasHovered = true;
					
					this.triggerEvents("touchenter", e);
					this.triggerEvents("touchmove", e);
					this.triggerEvents("touchleave", e);
				}
			},
			
			// Method that triggers all touchstart events that are added
			touchstart: function (e) {
				this.canvasFocused = true;
				this.last_event = e;
				
				if (this.onCanvas(e)) {
					this.start_pos = this.updatePos(e);
					this.touchState = "down";
					
					this.triggerEvents("touchenter", e);
					this.triggerEvents("touchstart", e);
				}
				return false;
			},
			
			// Method that triggers all touchend events that are added
			touchend: function (e) {
				this.last_event = e;
				this.touchState = "up";
				
				this.triggerEvents("touchleave", e, true);
				this.triggerEvents("touchend", e);
				this.triggerEvents("tap", e);
				
				this.cancel();
			},
			
			// Method that triggers all touchend events when touch was pressed down on canvas and released outside
			doctouchend: function (e) {
				if (this.touchState === "down" && !this.onCanvas(e)) {
					this.touchend(e);
				}
			},
			
			// Method that triggers all touchleave events when touch is outside the canvas
			doctouchmove: function (e) {
				if (this.canvasHovered && !this.onCanvas(e)) {
					this.triggerEvents("touchleave", e, true);
				}
			},
			
			// Method that sets the focus state when touch is pressed down outside the canvas
			doctouch: function (e) {
				if (!this.onCanvas(e)) {
					this.canvasFocused = false;
				}
			},
			
			// Method that cancels the tap event
			// A tap is triggered if both the start pos and end pos is within the object,
			// so resetting the start_pos cancels the tap
			cancel: function () {
				this.start_pos = {x:-10,y:-10};
				
				return this;
			}
			
		};
	};

	// Register the module
	oCanvas.registerModule("touch", touch, "init");

})(oCanvas, window, document);
