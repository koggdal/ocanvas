(function(oCanvas, window, document, undefined){

	// Define the class
	var touch = function () {
		
		// Return an object when instantiated
		return {

			x: 0,
			y: 0,
			touchState: "up",
			canvasFocused: false,
			canvasHovered: false,
			isTouch: ("ontouchstart" in window || "createTouch" in document),
			dblTapInterval: 500,

			init: function () {
				var core, canvasElement;

				core = this.core;
				canvasElement = core.canvasElement;

				core.events.addEventTypes("touch", {
					move: "touchmove",
					enter: "touchenter",
					leave: "touchleave",
					down: "touchstart",
					up: "touchend",
					singleClick: "tap",
					doubleClick: "dbltap"
				});

				this.types = {
					"touchmove": "move",
					"touchstart": "down",
					"touchend": "up"
				};

				if (this.isTouch) {
					core.pointer = this;
					
					// Set iOS specific settings to prevent selection of the canvas element
					canvasElement.style.WebkitUserSelect = "none";
					canvasElement.style.WebkitTouchCallout = "none";
					canvasElement.style.WebkitTapHighlightColor = "rgba(0,0,0,0)";
				}

				this.bindHandlers();
			},

			bindHandlers: function () {
				var self, core, canvasElement, type;
				
				self = this;
				core = this.core;
				canvasElement = core.canvasElement;

				for (type in this.types) {

					// Add event listeners to the canvas element
					oCanvas.addDOMEventHandler(core, canvasElement, type, function (e) {
						self.canvasHandler(e);
					}, false);

					// Add event listeners to the document (used for setting states and trigger mouseup events)
					oCanvas.addDOMEventHandler(core, document, type, function (e) {
						self.docHandler(e);
					}, false);

					// We also want to listen to events on the parent document to detect pointer movements
					// to and from this document.
					//
					// Wrap in try...catch in case the documents are of different origins (since that will
					// throw an exception). This functionality is not strictly needed, but if we can access
					// the parent document we can provide better pointer event detection between the
					// documents.
					var parentDocument = null;
					try {
						parentDocument = window.parent.document;
					} catch (e) {}
					if (parentDocument) {
						oCanvas.addDOMEventHandler(core, parentDocument, type, function (e) {
							self.docHandler(e);
						}, false);
					}
				}

				// Add event listener to prevent scrolling on touch devices
				if (this.core.settings.disableScrolling) {
					oCanvas.addDOMEventHandler(core, canvasElement, "touchmove", function (e) {
						e.preventDefault();
					}, false);
				}
			},

			canvasHandler: function (e, fromDoc) {
				var events, onCanvas, frontObject, now, sameObj, interval;

				events = this.core.events;
				onCanvas = this.onCanvas(e);

				// Trigger only touchend events if pointer is outside the canvas
				if (e.type === "touchend" && !onCanvas && !this.canvasUpEventTriggered) {
					events.triggerPointerEvent(this.types["touchend"], events.frontObject, "touch", e);
					events.triggerPointerEvent(this.types["touchend"], this.core.canvasElement, "touch", e);
					this.canvasUpEventTriggered = true;
					return;
				}

				// Abort the handler if the pointer started inside the canvas and is now outside
				if (!fromDoc && !onCanvas) {
					return;
				}

				if (!fromDoc) {
					this.canvasHovered = true;
				}

				if (e.type === "touchstart") {
					this.canvasUpEventTriggered = false;
					this.canvasFocused = true;
					this.touchState = "down";
				}
				if (e.type === "touchend") {
					this.touchState = "up";
				}

				// Get the front object for pointer position, among all added objects
				frontObject = (fromDoc || !onCanvas) ? undefined : events.getFrontObject("touch");

				// Trigger events
				if (fromDoc && events.frontObject) {
					events.triggerChain(events.getParentChain(events.frontObject, true, true), ["touchleave"]);
					events.frontObject = null;
				} else if (fromDoc) {
					events.triggerHandlers(this.core.canvasElement, ["touchleave"]);
				} else {
					events.triggerPointerEvent(this.types[e.type], frontObject, "touch", e);
				}

				// Log timestamps for events, to enable double taps
				if (e.type === "touchstart") {
					now = (new Date()).getTime();

					if (!this.dblTapStart || now - this.dblTapStart.timestamp > this.dblTapInterval) {
						this.dblTapStart = {
							timestamp: now,
							obj: frontObject,
							count: 1
						};
					} else {
						this.dblTapStart.count++;
					}
				}
				if (e.type === "touchend" && this.dblTapStart.count === 2) {
					now = (new Date()).getTime();
					sameObj = frontObject === this.dblTapStart.obj;
					interval = now - this.dblTapStart.timestamp;

					// If the second touchend event is on the same object as the first touchstart,
					//  and the time interval between the events is small enough,
					//  then trigger a double tap event
					if (sameObj && interval < this.dblTapInterval) {
						events.triggerPointerEvent("doubleClick", frontObject, "touch", e);
					}

					delete this.dblTapStart;
				}
			},

			docHandler: function (e) {
				var onCanvas = this.onCanvas(e);

				if (!onCanvas) {

					if (this.core.canvasElement.events.hasEntered) {
						if (e.type === "touchmove") {
							this.canvasHandler(e, true);
						}

					} else {
						if (e.type === "touchend") {
							if (this.touchState === "down") {
								this.canvasHandler(e, true);
							}
						}
						if (e.type === "touchstart") {
							this.canvasFocused = false;
						}
					}

				}
			},
			
			getPos: function (e) {
				var x, y;

				var touches = e.changedTouches;
				
				if (touches !== undefined && touches.length > 0) {
					e = touches[0];
					var canvas = this.core.canvasElement;
					var boundingRect = canvas.getBoundingClientRect();
					var scaleX = canvas.width / canvas.clientWidth;
					var scaleY = canvas.height / canvas.clientHeight;

					// Calculate the touch position relative to the viewport.
					// e.clientX exists, but has been incorrect in older versions of webkit.
					var clientX = e.pageX - window.pageXOffset;
					var clientY = e.pageY - window.pageYOffset;

					x = scaleX * (clientX - Math.round(boundingRect.left));
					y = scaleY * (clientY - Math.round(boundingRect.top));

				} else {
					x = this.x;
					y = this.y;
				}
				
				return { x: x, y: y };
			},

			updatePos: function (e) {
				var pos = this.getPos(e);
				this.x = pos.x;
				this.y = pos.y;
			},
			
			onCanvas: function (e) {
				e = e || (this.core.events.lastPointerEventObject && this.core.events.lastPointerEventObject.originalEvent);
				
				// Get pointer position
				var pos = e ? this.getPos(e) : { x: this.x, y: this.y };
				
				// Check boundaries => (left) && (right) && (top) && (bottom)
				if ( (pos.x >= 0) && (pos.x <= this.core.width) && (pos.y >= 0) && (pos.y <= this.core.height) ) {
					this.canvasHovered = true;
					if (e) this.updatePos(e);
					return true;
				} else {
					this.canvasHovered = false;
					return false;
				}
			},

			cancel: function () {
				this.core.events.lastDownObject = null;
			}

		};
	};

	// Register the module
	oCanvas.registerModule("touch", touch, "init");

})(oCanvas, window, document);
