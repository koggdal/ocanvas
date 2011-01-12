(function(window, document, undefined){

	// Define Object.create if not available
	if (typeof Object.create !== "function") {
		Object.create = function (o) {
			function F() {}
			F.prototype = (typeof o == "function") ? new o() : o;
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
		
		// Define the core class
		core: function () {},
		
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
	
	// Set up default settings
	oCanvas.core.prototype.settings = {
		fps: 30,
		background: "transparent",
		clearEachFrame: false,
		drawEachFrame: true,
		disableScrolling: false
	};
	
	// Method for setting up the new canvas
	oCanvas.core.prototype.setup = function(options) {
		var core = this;
	
		// Update the settings with the user specified settings
		core.extend(core.settings, options);
		
		// Set canvas to specified element
		if (core.settings.canvas.nodeName === "CANVAS")
			core.canvasElement = core.settings.canvas;
		
		// Set canvas to the element specified using a selector
		else if (typeof core.settings.canvas === "string")
			core.canvasElement = document.querySelector(core.settings.canvas);
		
		// Return false if no canvas was specified
		else return false;
		
		// Get the canvas context and dimensions
		core.canvas = core.canvasElement.getContext("2d");
		core.width = core.canvasElement.width;
		core.height = core.canvasElement.height;
		
		// Initialize modules
		//core.scenes = Object.create(core.scenesCanvas());
		//core.timeline.init();
		//core.mouse.init();
		//core.keyboard.init();
		//core.play = core.timeline.start;
		//core.pause = core.timeline.stop;
		//core.background.set(core.settings.background);
		
		// Add plugins if specified
		//if (core.settings.plugins !== undefined)
		//	oCanvas.utils.addPluginsToCanvas(core.settings.plugins, core.settings.canvasID);
	};

	// Attach the oCanvas object to the window object for access outside of this file
	window.oCanvas = oCanvas;
	
	
})(window, document);