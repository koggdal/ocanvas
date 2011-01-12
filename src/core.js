(function(window, document, undefined){

	// Define Object.create if not available
	if (typeof Object.create !== "function") {
		Object.create = function (o) {
			function F() {}
			F.prototype = (typeof o === "function") ? new o() : o;
			return new F();
		}
	}

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
		
		// Define the core class
		core: function () {
			
			// Add the registered modules to the new instance of core
			for (var m in oCanvas.modules) {
				this[m] = new oCanvas.modules[m]();
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
				
				setup: function(options) {
	
					// Update the settings with the user specified settings
					oCanvas.extend(obj.settings, options);
					
					// Set canvas to specified element
					if (obj.settings.canvas.nodeName === "CANVAS") {
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
					};
					
					// Initialize modules
					//obj.scenes = Object.create(obj.scenesCanvas());
					//obj.timeline.init();
					//obj.mouse.init();
					//obj.keyboard.init();
					//obj.play = obj.timeline.start;
					//obj.pause = obj.timeline.stop;
					//obj.background.set(obj.settings.background);
					
					// Add plugins if specified
					//if (obj.settings.plugins !== undefined)
					//	oCanvas.utils.addPluginsToCanvas(obj.settings.plugins, obj.settings.canvasID);
				}
				
			}, oCanvas.extend(this, oCanvas.core.prototype));
			
			// Set the core instance in all modules to enable access of core properties inside of modules
			for (var m in oCanvas.modules) {
				if (typeof this[m].setCore === "function") {
					this[m].setCore(obj);
				}
			}
			
			// Return the new instance of core
			return obj;
		},
		
		// Method for registering a new module
		registerModule: function (name, module) {
			oCanvas.modules[name] = module;
		},
		
		// Function for creating a new instance of oCanvas
		newCanvas: function (func) {
		
			// Create the new instance and put it in the canvas list
			var canvas = Object.create(oCanvas.core),
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