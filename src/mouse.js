(function(oCanvas, window, document, undefined){

	// Define the class
	var mouse = function () {
		
		// Return an object when instantiated
		return {

			x: 0,
			y: 0,
			buttonState: "up",
			canvasFocused: false,
			canvasHovered: false,
			cursorValue: "default",

			init: function () {

				this.core.events.addEventTypes("mouse", {
					move: "mousemove",
					enter: "mouseenter",
					leave: "mouseleave",
					down: "mousedown",
					up: "mouseup",
					singleClick: "click",
					doubleClick: "dblclick"
				});

				this.types = {
					"mousemove": "move",
					"mousedown": "down",
					"mouseup": "up",
					"dblclick": "doubleClick"
				};

				this.core.pointer = this;

				// Only bind events for mouse if touch is not available
				//  This is to enable developers to bind to both touch and mouse,
				//  but still only trigger handlers once (for the right input device)
				if (!this.core.touch || !this.core.touch.isTouch) {
					this.bindHandlers();
				}
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
					if (type === "mousemove") {
						type = "mouseover";
					}
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
			},

			canvasHandler: function (e, fromDoc) {
				var events, onCanvas, type, frontObject;

				events = this.core.events;
				onCanvas = this.onCanvas(e);

				// Trigger only mouseup events if pointer is outside the canvas
				if (e.type === "mouseup" && !onCanvas && !this.canvasUpEventTriggered) {
					events.triggerPointerEvent(this.types["mouseup"], events.frontObject, "mouse", e);
					events.triggerPointerEvent(this.types["mouseup"], this.core.canvasElement, "mouse", e);
					this.canvasUpEventTriggered = true;
					return;
				}

				// Abort the handler if the pointer started inside the canvas and is now outside
				if (!fromDoc && !onCanvas) {
					return;
				}

				type = (fromDoc && e.type === "mouseover") ? "mousemove" : e.type;

				if (!fromDoc) {
					this.canvasHovered = true;
				}

				if (type === "mousedown") {
					this.canvasUpEventTriggered = false;
					this.canvasFocused = true;
					this.buttonState = "down";
				}
				if (type === "mouseup") {
					this.buttonState = "up";
				}

				// Get the front object for pointer position, among all added objects
				frontObject = (fromDoc || !onCanvas) ? undefined : events.getFrontObject("mouse");

				// Trigger events
				if (fromDoc && events.frontObject) {
					events.triggerChain(events.getParentChain(events.frontObject, true, true), ["mouseleave"]);
					events.frontObject = null;
				} else if (fromDoc) {
					events.triggerHandlers(this.core.canvasElement, ["mouseleave"]);
				} else {
					events.triggerPointerEvent(this.types[type], frontObject, "mouse", e);
				}
			},

			docHandler: function (e) {
				var onCanvas = this.onCanvas(e);

				if (!onCanvas) {

					if (this.core.canvasElement.events.hasEntered) {
						if (e.type === "mouseover") {
							this.canvasHandler(e, true);
						}

					} else {
						if (e.type === "mouseup") {
							if (this.buttonState === "down") {
								this.canvasHandler(e, true);
							}
						}
						if (e.type === "mousedown") {
							this.canvasFocused = false;
						}
					}

				}
			},
			
			getPos: function (e) {
				var canvas = this.core.canvasElement;
				var boundingRect = canvas.getBoundingClientRect();
				var scaleX = canvas.width / canvas.clientWidth;
				var scaleY = canvas.height / canvas.clientHeight;

				// Calculate the mouse position relative to the viewport.
				// e.clientX exists, but has been incorrect in older versions of webkit.
				var clientX = e.pageX - window.pageXOffset;
				var clientY = e.pageY - window.pageYOffset;

				var x = scaleX * (clientX - Math.round(boundingRect.left));
				var y = scaleY * (clientY - Math.round(boundingRect.top));

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
			},

			hide: function () {
				this.core.canvasElement.style.cursor = "none";
			},

			show: function () {
				this.core.canvasElement.style.cursor = this.cursorValue;
			},

			cursor: function (value) {
				if (~value.indexOf("url(")) {
					var m = /url\((.*?)\)(\s(.*?)\s(.*?)|)($|,.*?$)/.exec(value),
						options = m[5] ? m[5] : "";
					value = "url(" + m[1] + ") " + (m[3] ? m[3] : 0) + " " + (m[4] ? m[4] : 0) + (options !== "" ? options :  ", default");
				}
				this.core.canvasElement.style.cursor = value;
				this.cursorValue = value;
			}

		};
	};

	// Register the module
	oCanvas.registerModule("mouse", mouse, "init");

})(oCanvas, window, document);
