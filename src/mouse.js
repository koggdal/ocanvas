(function(oCanvas, window, document, undefined){

	// Define the class
	var mouse = function () {
		
		// Return an object when instantiated
		return {
			
			// List of all events that are added
			eventList: {
				mousemove: { last: -1, length: 0 },
				mouseenter: { last: -1, length: 0 },
				mouseleave: { last: -1, length: 0 },
				click: { last: -1, length: 0 },
				dblclick: { last: -1, length: 0 },
				mousedown: { last: -1, length: 0 },
				mouseup: { last: -1, length: 0 }
			},
			
			last_event: {},
			cursorValue: "default",
			
			// Method for initializing the module
			init: function () {
				var _this = this,
					core = this.core,
					canvasElement = core.canvasElement,
					types;
				
				// Register pointer
				core.events.types.mouse = types = ["mousemove", "mouseenter", "mouseleave", "mousedown", "mouseup", "click", "dblclick"];
				core.events.pointers.mouse = function (type, doAdd) {
					if (~types.indexOf(type) && !("ontouchstart" in window || "createTouch" in document)) {
						doAdd("mouse", "click");
					}
				};
				core.pointer = this;
				
				// Define properties
				this.x = 0;
				this.y = 0;
				this.buttonState = 'up';
				this.canvasFocused = false;
				this.canvasHovered = false;
				this.cancel();
				
				// Add event listeners to the canvas element
				canvasElement.addEventListener('mousemove', function (e) { _this.mousemove.call(_this, e); }, false);
				canvasElement.addEventListener('mousedown', function (e) { _this.mousedown.call(_this, e); }, false);
				canvasElement.addEventListener('mouseup', function (e) { _this.mouseup.call(_this, e); }, false);
				canvasElement.addEventListener('dblclick', function (e) { _this.dblclick.call(_this, e); }, false);
				
				// Add event listeners to the document (used for setting states and trigger mouseup events)
				document.addEventListener('mouseup', function (e) { _this.docmouseup.call(_this, e); }, false);
				document.addEventListener('mouseover', function (e) { _this.docmouseover.call(_this, e); }, false);
				document.addEventListener('mousedown', function (e) { _this.docmousedown.call(_this, e); }, false);
				if (parent !== window) {
					// Add event listener for the parent document as well, if the canvas is within an iframe for example
					parent.document.addEventListener('mouseover', function (e) { _this.docmouseover.call(_this, e); }, false);
				}
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
			
			// Method for getting the current mouse position relative to the canvas top left corner
			getPos: function (e) {
				var x, y,
					boundingRect = this.core.canvasElement.getBoundingClientRect(),
					node = document.documentElement || document.body.parentNode,
					scrollElem = (node && (typeof node.ScrollTop === "number") ? node : document.body),
					scrollX = window.scrollX !== undefined ? window.scrollX : (window.pageXOffset !== undefined ? window.pageXOffset : scrollElem.ScrollLeft),
					scrollY = window.scrollY !== undefined ? window.scrollY : (window.pageYOffset !== undefined ? window.pageYOffset : scrollElem.ScrollTop);
					
				// Browsers supporting pageX/pageY
				if (e.pageX !== undefined && e.pageY !== undefined) {
					x = e.pageX - scrollX - Math.round(boundingRect.left);
					y = e.pageY - scrollY - Math.round(boundingRect.top);
				}
				// Browsers not supporting pageX/pageY
				else if (e.clientX !== undefined && e.clientY !== undefined) {
					x = e.clientX + scrollX - Math.round(boundingRect.left);
					y = e.clientY + scrollY - Math.round(boundingRect.top);
				}
				
				return { x: x, y: y };
			},
			
			// Method for updating the mouse position relative to the canvas top left corner
			updatePos: function (e) {
				var pos = this.getPos(e);
				this.x = pos.x;
				this.y = pos.y;
				
				return pos;
			},
			
			// Method for checking if the mouse pointer is inside the canvas
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
				
				// Fix the which property
				// 0: No button pressed
				// 1: Primary button (usually left)
				// 2: Secondary button (usually right)
				// 3: Middle (usually the wheel)
				if (eventObject.button === 0 && ~"mousedown mouseup click dblclick".indexOf(type)) {
					eventObject.which = 1;
				} else if (eventObject.button === 2) {
					eventObject.which = 2;
				} else if (eventObject.button === 1) {
					eventObject.which = 3;
				} else {
					eventObject.which = 0;
				}

				// Trigger event handlers, but only on the front object
				this.core.events.triggerPointerHandlers(this.eventList[type], eventObject, forceLeave);
			},
			
			// Method that triggers all mousemove events that are added
			mousemove: function (e) {
				this.last_event = e;
				this.updatePos(e);
				this.canvasHovered = true;
				
				this.triggerEvents("mouseenter", e);
				this.triggerEvents("mousemove", e);
				this.triggerEvents("mouseleave", e);
			},
			
			// Method that triggers all mousedown events that are added
			mousedown: function (e) {
				this.canvasFocused = true;
				this.last_event = e;
				this.start_pos = this.getPos(e);
				this.buttonState = "down";
				
				this.triggerEvents("mousedown", e);
				
				return false;
			},
			
			// Method that triggers all mouseup events that are added
			mouseup: function (e) {
				this.last_event = e;
				this.buttonState = "up";
				
				this.triggerEvents("mouseup", e);
				this.triggerEvents("click", e);
				
				this.cancel();
			},

			// Method that triggers all dblclick events that are added
			dblclick: function (e) {
				this.last_event = e;
				this.buttonState = "up";

				this.triggerEvents("dblclick", e);
			},
			
			// Method that triggers all mouseup events when pointer was pressed down on canvas and released outside
			docmouseup: function (e) {
				this.last_event = e;
				if (this.buttonState === "down" && !this.onCanvas(e)) {
					this.mouseup(e);
				}
			},
			
			// Method that triggers all mouseleave events when pointer is outside the canvas
			docmouseover: function (e) {
				this.last_event = e;
				if (!this.onCanvas(e)) {
					this.triggerEvents("mouseleave", e, true);
				}
			},
			
			// Method that sets the focus state when pointer is pressed down outside the canvas
			docmousedown: function (e) {
				this.last_event = e;
				if (!this.onCanvas(e)) {
					this.canvasFocused = false;
				}
			},
			
			// Method that cancels the click event
			// A click is triggered if both the start pos and end pos is within the object,
			// so resetting the start_pos cancels the click
			cancel: function () {
				this.start_pos = {x:-10,y:-10};
				
				return this;
			},
			
			// Method for hiding the cursor
			hide: function () {
				this.core.canvasElement.style.cursor = "none";
				
				return this;
			},
			
			// Method for showing the cursor
			show: function () {
				this.core.canvasElement.style.cursor = this.cursorValue;
				
				return this;
			},
			
			// Method for setting the mouse cursor icon
			cursor: function (value) {
				if (~value.indexOf("url(")) {
					var m = /url\((.*?)\)(\s(.*?)\s(.*?)|)($|,.*?$)/.exec(value),
						options = m[5] ? m[5] : "";
					value = "url(" + m[1] + ") " + (m[3] ? m[3] : 0) + " " + (m[4] ? m[4] : 0) + (options !== "" ? options :  ", default");
				}
				this.core.canvasElement.style.cursor = value;
				this.cursorValue = value;
				
				return this;
			}
		};
	};

	// Register the module
	oCanvas.registerModule("mouse", mouse, "init");

})(oCanvas, window, document);
