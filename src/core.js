(function(window, document, undefined){

	// Define the oCanvas object
	var oCanvas = {
	    
		// Version number of this oCanvas release.
		version: "2.8.5",
		
		// Array containing all canvases created by oCanvas on the current page
		canvasList: [],
		
		// Object containing all the registered modules
		modules: {},
		
		// Object containing all the registered init methods
		inits: {},
		
		// Object containing all the registered plugins
		plugins: {},
		
		// Define the core class
		core: function (options) {
			this.isCore = true;
		
			// Add the canvas to the canvas list on the global object
			this.id = oCanvas.canvasList.push(this) - 1;
			
			// A number which is used to give new objects an ID
			this.lastObjectID = 0;

			// Initialize a list of all objects added directly to the canvas
			this.children = [];

			// Initialize a list of all DOM event handlers
			this.domEventHandlers = [];
			
			// Add the registered modules to the new instance of core
			for (var m in oCanvas.modules) {
				if (typeof oCanvas.modules[m] === "function") {
					this[m] = oCanvas.modules[m]();
				} else {
					this[m] = Object.create(oCanvas.modules[m]);
				}
			}
			
			// Set up default settings
			this.settings = {
				fps: 30, // Deprecated value, will soon be changed to 60
				background: "transparent",
				clearEachFrame: true,
				drawEachFrame: true,
				disableScrolling: false,
				plugins: []
			};

			// Update the settings with the user specified settings
			oCanvas.extend(this.settings, options);

			// Save these settings in case the core instance is reset
			this.originalSettings = oCanvas.extend({}, this.settings);
			
			// Set canvas to specified element
			if (this.settings.canvas.nodeName && this.settings.canvas.nodeName.toLowerCase() === "canvas") {
				this.canvasElement = this.settings.canvas;
			}
			
			// Set canvas to the element specified using a selector
			else if (typeof this.settings.canvas === "string") {
				this.canvasElement = document.querySelector(this.settings.canvas);
			}
			
			// Return false if no canvas was specified
			else {
				return false;
			}
			
			// Get the canvas context and dimensions
			this.canvas = this.canvasElement.getContext("2d");
			var width = this.canvasElement.width;
			var height = this.canvasElement.height;
			Object.defineProperty(this, "width", {
				enumerable: true,
				configurable: true,
				set: function (value) {
					width = !isNaN(parseFloat(value)) ? parseFloat(value) : width;
					this.canvasElement.width = width;
					this.background.set(this.settings.background);
					this.redraw();
				},
				get: function () {
					return width;
				}
			});
			Object.defineProperty(this, "height", {
				enumerable: true,
				configurable: true,
				set: function (value) {
					height = !isNaN(parseFloat(value)) ? parseFloat(value) : height;
					this.canvasElement.height = height;
					this.background.set(this.settings.background);
					this.redraw();
				},
				get: function () {
					return height;
				}
			});
		
			// Set the core instance in all modules to enable access of core properties inside of modules
			for (var m in oCanvas.modules) {
			
				// Add core access to modules in a wrapper module (like display objects that reside in the wrapper display)
				if (this[m].wrapper === true) {
					for (var wm in this[m]) {
						if (typeof this[m][wm] === "object" && typeof this[m][wm].setCore === "function") {
							this[m][wm] = this[m][wm].setCore(this);
						}
						else if (typeof this[m][wm].setCore === "function") {
							this[m][wm].setCore(this);
						}
						
						this[m].core = this;
					}
				}
				
				// Add core access to modules that reside directly in the core
				this[m].core = this;
			}
			
			// Initialize added modules that have registered init methods
			for (var name in oCanvas.inits) {
			
				// Modules directly on the oCanvas object
				if ((typeof oCanvas.inits[name] === "string") && (typeof this[name][oCanvas.inits[name]] === "function")) {
					this[name][oCanvas.inits[name]]();
				}
				
				// Modules that are parts of a wrapper module
				else if (oCanvas.inits[name] === "object") {
					for (var subname in oCanvas.inits[name]) {
						if (typeof this[name][oCanvas.inits[name][subname]] === "function") {
							this[name][oCanvas.inits[name][subname]]();
						}
					}
				}
			}
			
			// Run plugins if any have been specified
			var plugins = this.settings.plugins;
			if (plugins.length > 0) {
				for (var i = 0, l = plugins.length; i < l; i++) {
					if (typeof oCanvas.plugins[plugins[i]] === "function") {
						oCanvas.plugins[plugins[i]].call(this);
					}
				}
			}
		},
		
		// Method for registering a new module
		registerModule: function (name, module, init) {
			if (~name.indexOf(".")) {
				var parts = name.split(".");
				oCanvas.modules[parts[0]][parts[1]] = module;
				
				if (init !== undefined) {
					if (!oCanvas.inits[parts[0]]) {
						oCanvas.inits[parts[0]] = {};
					}
					oCanvas.inits[parts[0]][parts[1]] = init;
				}
			} else {
				oCanvas.modules[name] = module;
				if (init !== undefined) {
					oCanvas.inits[name] = init;
				}
			}
		},
		
		// Method for registering a new plugin
		// The plugin will not be run until a new core instance is being created,
		// and the instance requests the plugin, thus allowing a plugin to change
		// things in the library for just one instance
		registerPlugin: function (name, plugin) {
			oCanvas.plugins[name] = plugin;
		},
		
		// Function for creating a new instance of oCanvas
		create: function (settings) {
		
			// Create the new instance and return it
			return new oCanvas.core(settings);
		},

		// Function for checking when the DOM is ready for interaction
		domReady: function (func) {
			func = func || function () {};

			this.domReadyHandlers.push(func);

			if (this.isDomReadyListening) {
				return false;
			}

			if (this.isDomReady) {
				oCanvas.triggerDomReadyHandlers();
				return true;
			}

			var checkState = function (e) {
				if (document.readyState === "complete" || (e && e.type === "DOMContentLoaded")) {
					oCanvas.isDomReadyListening = false;
					oCanvas.isDomReady = true;
					oCanvas.triggerDomReadyHandlers();
					document.removeEventListener("readystatechange", checkState, false);
					document.removeEventListener("DOMContentLoaded", checkState, false);
				}
			};

			if (checkState()) {
				return true;
			} else if (!this.isDomReadyListening) {
				oCanvas.isDomReadyListening = true;
				document.addEventListener("readystatechange", checkState, false);
				document.addEventListener("DOMContentLoaded", checkState, false);
				return false;
			}
		},
		isDomReady: false,
		isDomReadyListening: false,
		domReadyHandlers: [],
		triggerDomReadyHandlers: function () {
			var handlers, i, l, handler;
			handlers = this.domReadyHandlers;
			for (i = 0, l = handlers.length; i < l; i++) {
				handler = handlers[i];
				if (handler) {
					delete handlers[i];
					handler();
				}
			}
		}

	};
	
	
	// Methods the core instances will have access to
	oCanvas.core.prototype = {
		
		// Method for adding an object to the canvas
		addChild: function (displayobj, redraw) {
			displayobj.add(redraw);
			
			return this;
		},
		
		// Method for removing an object from the canvas
		removeChild: function (displayobj, redraw) {
			displayobj.remove(redraw);
			
			return this;
		},
		
		// Shorthand method for clearing the canvas
		clear: function (keepBackground) {
			this.draw.clear(keepBackground);
			
			return this;
		},
		
		// Shorthand method for redrawing the canvas
		redraw: function () {
			this.draw.redraw();
			
			return this;
		},
		
		// Method for binding an event to the canvas
		bind: function (types, handler) {
			this.events.bind(this.canvasElement, types.split(" "), handler);
			
			return this;
		},
		
		// Method for unbinding an event from the object
		unbind: function (types, handler) {
			this.events.unbind(this.canvasElement, types.split(" "), handler);
			
			return this;
		},
			
		// Method for triggering all events added to the object
		trigger: function (types, eventObject) {
			var events = this.events;
			events.triggerHandlers(this.canvasElement, types.split(" "), events.fixEventObject(eventObject));

			return this;
		},

		// Method for resetting the core instance to its initial state
		reset: function () {

			// Remove all objects
			var children = this.children;
			for (var i = 0, l = children.length; i < l; i++) {
				children[i].remove();
				i--; l--;
			}
			children.length = 0;
			this.lastObjectID = 0;

			// Remove all oCanvas event handlers
			var eventTypes = this.canvasElement.events;
			for (var type in eventTypes) {
				if (eventTypes[type] instanceof Array) {
					this.unbind(type, eventTypes[type]);
				}
			}

			// Reset the settings
			this.settings = oCanvas.extend({}, this.originalSettings);
		},

		// Method for destroying the core instance, to clear up memory etc
		destroy: function () {
			this.reset();

			// Remove all DOM event handlers
			for (var i = 0, l = this.domEventHandlers.length; i < l; i++) {
				oCanvas.removeDOMEventHandler(this, i);
			}
			this.domEventHandlers.length = 0;

			// Remove the core instance from the global list of core instances
			oCanvas.canvasList[this.id] = null;
		}
	};

	// Attach the oCanvas object to the window object for access outside of this file
	window.oCanvas = oCanvas;

	oCanvas.domReady();
	
})(window, document);
