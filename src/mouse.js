(function(oCanvas, window, document, undefined){

	// Define the class
	var mouse = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},
			
			// List of all events that are added
			eventList: {
				mousemove: [],
				mouseenter: [],
				mouseleave: [],
				click: [],
				mousedown: [],
				mouseup: [],
				drag: []
			},
			
			last_event: {},
			
			// Method for initializing the module
			init: function () {
				var _this = this,
					core = this.core,
					canvasElement = core.canvasElement;
				
				// Define properties
				this.x = 0;
				this.y = 0;
				this.buttonState = 'up';
				this.canvasFocused = false;
				this.canvasHovered = false;
				
				// Add event listeners to the canvas element
				canvasElement.addEventListener('mousemove', function (e) { _this.mousemove.call(_this, e); }, false);
				canvasElement.addEventListener('click', function (e) { _this.click.call(_this, e); }, false);
				canvasElement.addEventListener('mousedown', function (e) { _this.mousedown.call(_this, e); }, false);
				canvasElement.addEventListener('mouseup', function (e) { _this.mouseup.call(_this, e); }, false);
				
				if (core.settings.disableScrolling) {
					// Add event listener to prevent scrolling on touch devices
					canvasElement.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
				}
				
				// Add event listeners to the canvas element (used for settings states and trigger mouseup events)
				document.addEventListener('mouseup', function (e) { _this.docmouseup.call(_this, e); }, false);
				document.addEventListener('mouseover', function (e) { _this.docmouseover.call(_this, e); }, false);
				document.addEventListener('click', function (e) { _this.docclick.call(_this, e); }, false);
			},
			
			// Method for adding an event to the event list
			addEvent: function (type, handler) {
				return this.eventList[type].push(handler) - 1;
			},
			
			// Method for removing an event from the event list
			removeEvent: function (type, id) {
				this.eventList[type].splice(id,1);
			},
			
			// Method for updating the mouse position relative to the canvas top left corner
			updatePos: function (e, update) {
				var x, y;
				
				// Browsers supporting pageX/pageY
				if (e.pageX && e.pageY) {
					x = e.pageX - this.core.canvasElement.offsetLeft;
					y = e.pageY - this.core.canvasElement.offsetTop;
				}
				// Browsers not supporting pageX/pageY
				else if (e.clientX && e.clientY) {
					x = e.clientX + document.documentElement.scrollLeft - this.core.canvasElement.offsetLeft;
					y = e.clientY + document.documentElement.scrollTop - this.core.canvasElement.offsetTop;
				}
				
				if (update !== false) {
					this.x = x;
					this.y = y;
				}
				
				return { x: x, y: y };
			},
			
			// Method for getting the current mouse position relative to the canvas top left corner
			getPos: function (e, update) {
				return this.updatePos(e, update);
			},
			
			// Method for checking if the mouse pointer is inside the canvas
			onCanvas: function (e) {
				e = e || this.last_event;
				var pos = e ? this.getPos(e, false) : {x:this.x, y:this.y};
				
				// Check boundaries => (left) && (right) && (top) && (bottom)
				if ( (pos.x > 0) && (pos.x < this.core.width) && (pos.y > 0) && (pos.y < this.core.height) ) {
					this.canvasHovered = true;
					this.updatePos(e);
					return true;
				} else {
					this.canvasHovered = false;
					return false;
				}
			},
			
			// Method for triggering all events of a specific type
			triggerEvents: function (type, e, force) {
				force = force || false;
				var events = this.eventList[type],
					i, event;
				
				for (i = events.length; i--;) {
					event = events[i];
					if (typeof event === "function") {
						event(e, force);
					}
				}
			},
			
			// Method that triggers all mousemove events that are added
			// Also handles parts of drag and drop
			mousemove: function (e) {
				this.last_event = e;
				this.updatePos(e);
				this.canvasHovered = true;
				
				this.triggerEvents("mousemove", e);
				this.triggerEvents("mouseenter", e);
				this.triggerEvents("mouseleave", e);
				this.triggerEvents("drag", e);
			},
			
			// Method that triggers all click events that are added
			click: function (e) {
				this.canvasFocused = true;
				this.last_event = e;
				
				this.triggerEvents("click", e);
			},
			
			// Method that triggers all mousedown events that are added
			mousedown: function (e) {
				this.canvasFocused = true;
				this.last_event = e;
				
				this.triggerEvents("mousedown", e);
				
				return false;
			},
			
			// Method that triggers all mouseup events that are added
			mouseup: function (e) {
				this.last_event = e;
				this.triggerEvents("mouseup", e);
			},
			
			// Method that triggers all mouseleave events that are added (gets triggered by mouse::docmouseover)
			mouseleave: function(e){
				this.triggerEvents("mouseleave", e, true);
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
					this.mouseleave(e);
				}
			},
			
			// Method that sets the focus state when pointer is pressed down outside the canvas
			docclick: function (e) {
				this.last_event = e;
				if (!this.onCanvas(e)) {
					this.canvasFocused = false;
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("mouse", mouse);
	oCanvas.registerInit("mouse", "init");

})(oCanvas, window, document);