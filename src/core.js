(function(window, document, undefined){

	// Define the oCanvas object
	var oCanvas = {
		
		// Function for checking when the DOM is ready for interaction
		domReady: function (func) {
			if (/in/.test(document.readyState)) {
				setTimeout("oCanvas.domReady(" + func + ")", 10);
			} else {
				func();
			}
		},
		
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

			// Add the registered modules to the new instance of core
			for (var m in oCanvas.modules) {
				if (typeof oCanvas.modules[m] === "function") {
					this[m] = Object.create(oCanvas.modules[m]());
				} else {
					this[m] = Object.create(oCanvas.modules[m]);
				}
			}
			
			// Set up default settings
			this.settings = {
				fps: 30,
				background: "transparent",
				clearEachFrame: true,
				drawEachFrame: true,
				disableScrolling: false,
				plugins: []
			};

			// Update the settings with the user specified settings
			oCanvas.extend(this.settings, options);
			
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
			this.width = this.canvasElement.width;
			this.height = this.canvasElement.height;
			
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
				if (typeof this[m].setCore === "function") {
					this[m].setCore(this);
				}
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
		}
	};
	
	
	// Methods the core instances will have access to
	oCanvas.core.prototype = {
		
		// Method for adding an object to the canvas
		addChild: function (displayobj) {
			displayobj.add();
			
			return this;
		},
		
		// Method for removing an object from the canvas
		removeChild: function (displayobj) {
			displayobj.remove();
			
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
		bind: function (type, handler) {
			this.events.bind(this.canvasElement, type, handler);
			
			return this;
		},
		
		// Method for unbinding an event from the object
		unbind: function (type, handler) {
			this.events.unbind(this.canvasElement, type, handler);
			
			return this;
		},
			
		// Method for triggering all events added to the object
		trigger: function (types) {
			this.events.trigger(this.canvasElement, types);
			
			return this;
		}
	};

	// Attach the oCanvas object to the window object for access outside of this file
	window.oCanvas = oCanvas;
	
})(window, document);