(function(oCanvas, window, document, undefined){

	// Define the class
	var background = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},

			// Set properties
			bg: "",
			type: "transparent",
			loaded: false,
			
			// Method for setting the background
			set: function (value) {
				var _this = this;
				
				// Get background type (transparent, color or image)
				this.type = (value === "transparent") ? "transparent" : (this.core.style === undefined ? "color" : (this.core.style && this.core.style.isColor(value) ? "color" : "image"));
				
				if (this.type === "color") {
				
					// Set color as background
					this.bg = value;
					if (_this.core.timeline && !_this.core.timeline.running) {
						this.redraw();
					}
					this.loaded = true;
				}
				
				else if (this.type === "image") {
				
					// Set image as background
					this.bg = new Image();
					this.bg.onload = function () {
						_this.loaded = true;
						if (_this.core.timeline && !_this.core.timeline.running) {
							_this.redraw();
						}
					};
					this.bg.src = value;
				}
				
				else {
					// Background type is transparent, redraw the background (clears the canvas)
					this.redraw();
					this.loaded = true;
				}
			},
			
			// Method for getting the background data
			get: function(){
				return {
					type: this.type,
					value: this.bg
				};
			},
			
			// Method for redrawing the background (replaces everything thas has been drawn)
			redraw: function(){
				var core = this.core;
				
				// Clear the canvas
				core.canvas.clearRect(0, 0, core.width, core.height);
				
				if (this.type === "color" && this.bg !== "") {
					// Fill canvas with the background color
					core.canvas.fillStyle = this.bg;
					core.canvas.fillRect(0, 0, core.width, core.height);
				}
				else if (this.type === "image") {
					// Fill the canvas with the image (the image will be stretched)
					core.canvas.drawImage(this.bg, 0, 0, core.width, core.height);
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("background", background);

})(oCanvas, window, document);