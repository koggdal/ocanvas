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
				var self, canvasElement, type;
				
				self = this;
				canvasElement = this.core.canvasElement;

				for (type in this.types) {

					// Add event listeners to the canvas element
					canvasElement.addEventListener(type, function (e) {
						self.canvasHandler(e);
					}, false);

					// Add event listeners to the document (used for setting states and trigger mouseup events)
					document.addEventListener(type, function (e) {
						self.docHandler(e);
					}, false);

					if (window.parent !== window) {
						window.parent.document.addEventListener(type, function (e) {
							self.docHandler(e);
						}, false);
					}
				}

				// Add event listener to prevent scrolling on touch devices
				if (this.core.settings.disableScrolling) {
					canvasElement.addEventListener("touchmove", function (e) {
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
				var x, y, boundingRect, touches, node, scrollElem, scrollX, scrollY, numTouches;

				touches = e.changedTouches;
				
				if (touches !== undefined) {
					boundingRect = this.core.canvasElement.getBoundingClientRect();
					node = document.documentElement || document.body.parentNode;
					scrollElem = (node && (typeof node.ScrollTop === "number") ? node : document.body);
					scrollX = window.scrollX !== undefined ? window.scrollX : (window.pageXOffset !== undefined ? window.pageXOffset : scrollElem.ScrollLeft);
					scrollY = window.scrollY !== undefined ? window.scrollY : (window.pageYOffset !== undefined ? window.pageYOffset : scrollElem.ScrollTop);
					numTouches = touches.length;
	
					if (touches.length > 0) {
						e = touches[0];
							
						// Browsers supporting pageX/pageY
						if (e.pageX && e.pageY) {
							x = e.pageX - scrollX - (Math.round(boundingRect.left) < 0 ? 0 : Math.round(boundingRect.left));
							y = e.pageY - scrollY - (Math.round(boundingRect.top) < 0 ? 0 : Math.round(boundingRect.top));
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
					this.updatePos(e);
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
