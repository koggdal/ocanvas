(function(window, document, undefined){

	// Define the oCanvas object
	var oCanvas = {
	
		// Function for checking when the DOM is ready
		DOMready: function (func) {
			if (!document.body) {
				return setTimeout("oCanvas.DOMready("+func+")", 10);
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
		
		// Define the core class
		core: function () {
			
			// Add the registered modules to the new instance of core
			for (var m in oCanvas.modules) {
				if (typeof oCanvas.modules[m] === "function") {
					this[m] = Object.create(oCanvas.modules[m]());
				} else {
					this[m] = Object.create(oCanvas.modules[m]);
				}
			}
			
			// Add properties and methods to the core object
			var obj = oCanvas.extend({
			
				// Set up default settings
				settings: {
					fps: 30,
					background: "transparent",
					clearEachFrame: false,
					drawEachFrame: true,
					disableScrolling: false
				},
				
				// Method for setting up the new object with custom settings
				setup: function (options) {
	
					// Update the settings with the user specified settings
					oCanvas.extend(obj.settings, options);
					
					// Set canvas to specified element
					if (obj.settings.canvas.nodeName.toLowerCase() === "canvas") {
						obj.canvasElement = obj.settings.canvas;
					}
					
					// Set canvas to the element specified using a selector
					else if (typeof obj.settings.canvas === "string") {
						obj.canvasElement = document.querySelector(obj.settings.canvas);
					}
					
					// Return false if no canvas was specified
					else {
						return false;
					}
					
					// Get the canvas context and dimensions
					obj.canvas = obj.canvasElement.getContext("2d");
					obj.width = obj.canvasElement.width;
					obj.height = obj.canvasElement.height;
					
					// Method for setting the function to be called for each frame
					obj.setLoop = function(callback){
						obj.settings.mainLoop = callback;
						return obj.timeline ? obj.timeline : false;
					};
					
					// Initialize added modules that have registered init methods
					for (var name in oCanvas.inits) {
						if (typeof obj[name][oCanvas.inits[name]] === "function") {
							obj[name][oCanvas.inits[name]]();
						}
					}
					
					// Set background to the specified background
					if (obj.background) {
						obj.background.set(obj.settings.background);
					}
					
					// Add plugins if specified
					//if (obj.settings.plugins !== undefined)
					//	oCanvas.utils.addPluginsToCanvas(obj.settings.plugins, obj.settings.canvasID);
				},
				
				// Method for adding an object to the canvas
				addChild: function (displayobj) {
					displayobj.add();
				},
				
				// Method for removing an object from the canvas
				removeChild: function (displayobj) {
					displayobj.remove();
				},
				
				// Shorthand method for clearing the canvas
				clear: function (keepBackground) {
					obj.draw.clear(keepBackground);
				},
				
				// Method for binding an event to the canvas
				bind: function (type, handler) {
					obj.events.bind(obj.canvasElement, type, handler);
				},
				
				// Method for unbinding an event from the object
				unbind: function (type, handler) {
					obj.events.unbind(obj.canvasElement, type, handler);
				},
				
			}, this);
			
			// Set the core instance in all modules to enable access of core properties inside of modules
			for (var m in oCanvas.modules) {
			
				// Add core access to modules in a wrapper module (like display objects that reside in the wrapper display)
				if (this[m].wrapper === true) {
					for (var wm in this[m]) {
						if (typeof this[m][wm] === "object" && typeof this[m][wm].setCore === "function") {
							this[m][wm] = this[m][wm].setCore(obj);
						}
						else if (typeof this[m][wm].setCore === "function") {
							this[m][wm].setCore(obj);
						}
					}
				}
				
				// Add core access to modules that reside directly in the core
				if (typeof this[m].setCore === "function") {
					this[m].setCore(obj);
				}
			}
			
			// Return the new instance of core
			return obj;
		},
		
		// Method for registering a new module
		registerModule: function (name, module) {
			if (~name.indexOf(".")) {
				var parts = name.split(".");
				oCanvas.modules[parts[0]][parts[1]] = module;
			} else {
				oCanvas.modules[name] = module;
			}
		},
		
		// Method for registering a new init method to be run on creation
		registerInit: function (name, init) {
			oCanvas.inits[name] = init;
		},
		
		// Function for creating a new instance of oCanvas
		newCanvas: function (func) {
		
			// Create the new instance and put it in the canvas list
			var canvas = new oCanvas.core(),
				canvasID = oCanvas.canvasList.push(canvas) - 1;
			canvas.settings.canvasID = canvasID;
			
			// Trigger the callback if specified
			if (typeof func === "function")
				func(canvas);
			
			// Return the new instance
			return canvas;
		}
	};

	// Attach the oCanvas object to the window object for access outside of this file
	window.oCanvas = oCanvas;
	
})(window, document);