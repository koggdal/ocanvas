(function(oCanvas, window, document, undefined){
    // Define the class
    var mspointer = function () {
        // Return an object when instantiated
        return {

            x: 0,
            y: 0,
            mspState: "up",
            canvasFocused: false,
            canvasHovered: false,
            isMSPointer: window.navigator.msPointerEnabled ? true : false,
            dblInterval: 500,

            init: function () {
                var core, canvasElement;

                core = this.core;
                canvasElement = core.canvasElement;

                core.events.addEventTypes("MSPointer", {
                    move: "MSPointerMove",
                    enter: "MSPointerOver",
                    leave: "MSPointerOut",
                    cancel: "MSPointerCancel",
                    down: "MSPointerDown",
                    up: "MSPointerUp",
                    singleClick: "click",
                    doubleClick: "dblclick"
                });

                this.types = {
                    "MSPointerMove": "move",
                    "MSPointerDown": "down",
                    "MSPointerUp": "up",
                    "dblclick": "doubleClick"
                };

                if (this.isMSPointer) {
                    core.pointer = this;
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

                    if (window.parent !== window) {
                        oCanvas.addDOMEventHandler(core, window.parent.document, type, function (e) {
                            self.docHandler(e);
                        }, false);
                    }
                }

                // Add event listener to prevent scrolling on touch devices
                if (this.core.settings.disableScrolling) {
                    oCanvas.addDOMEventHandler(core, canvasElement, "MSPointerMove", function (e) {
                        e.preventDefault();
                    }, false);
                }
            },

            canvasHandler: function (e, fromDoc) {
                var events, onCanvas, frontObject, now, sameObj, interval;

                events = this.core.events;
                onCanvas = this.onCanvas(e);

                // Trigger only touchend events if pointer is outside the canvas
                if (e.type === "MSPointerUp" && !onCanvas && !this.canvasUpEventTriggered) {

                    events.triggerPointerEvent(this.types["MSPointerUp"], events.frontObject, "MSPointer", e);
                    events.triggerPointerEvent(this.types["MSPointerUp"], this.core.canvasElement, "MSPointer", e);
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

                if (e.type === "MSPointerDown") {
                    this.canvasUpEventTriggered = false;
                    this.canvasFocused = true;
                    this.mspState = "down";
                }
                if (e.type === "MSPointerUp") {
                    this.mspState = "up";
                }

                // Get the front object for pointer position, among all added objects
                frontObject = (fromDoc || !onCanvas) ? undefined : events.getFrontObject("MSPointer");

                // Trigger events
                if (fromDoc && events.frontObject) {
                    events.triggerChain(events.getParentChain(events.frontObject, true, true), ["MSPointerOut"]);
                    events.frontObject = null;
                } else if (fromDoc) {
                    
                    events.triggerHandlers(this.core.canvasElement, ["MSPointerOut"]);
                } else {
                    events.triggerPointerEvent(this.types[e.type], frontObject, "MSPointer", e);
                }
            },

            docHandler: function (e) {
                var onCanvas = this.onCanvas(e);

                if (!onCanvas) {

                    if (this.core.canvasElement.events.hasEntered) {
                        if (e.type === "MSPointerMove") {
                            this.canvasHandler(e, true);
                        }

                    } else {
                        if (e.type === "MSPointerUp") {
                            if (this.mspState === "down") {
                                this.canvasHandler(e, true);
                            }
                        }
                        if (e.type === "MSPointerDown") {
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
                var pointerType = e.pointerType,
                    pos = this.getPos(e);

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
    oCanvas.registerModule("mspointer", mspointer, "init");

})(oCanvas, window, document);