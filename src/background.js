(function(oCanvas, window, document, undefined){

	// Define the class
	var background = function () {
		
		// Return an object when instantiated
		return {

			// Set properties
			bg: "",
			value: "",
			type: "transparent",
			loaded: false,
			
			init: function () {
				this.set(this.core.settings.background);
			},
			
			// Method for setting the background
			set: function (value) {
				var _this = this;
				if (typeof value !== "string") {
					value = "";
				}
				
				this.value = value;
				
				// Get background type (gradient, image, color or transparent)
				if (~value.indexOf("gradient")) {
					this.type = "gradient";
				} else if (~value.indexOf("image")) {
					this.type = "image";
				} else if (this.core.style && this.core.style.isColor(value)) {
					this.type = "color";
				} else {
					this.type = "transparent";
				}
				
				// Handle the different background types
				if (this.type === "color") {
				
					// Set color as background
					this.bg = value;
					if (this.core.timeline && !this.core.timeline.running) {
						this.core.draw.redraw(true);
					}
					this.loaded = true;
				}
				else if (this.type === "gradient") {
				
					// Get gradient object and set it as background
					this.bg = this.core.style ? this.core.style.getGradient(value, 0, 0, this.core.width, this.core.height) : "";
					if (this.core.timeline && !this.core.timeline.running) {
						this.core.draw.redraw(true);
					}
					this.loaded = true;
				}
				else if (this.type === "image") {
				
					// Parse image string
					var matches = /image\((.*?)(,(\s|)(repeat|repeat-x|repeat-y|no-repeat)|)\)/.exec(value),
						path = matches[1],
						repeat = matches[4] || "repeat",
						image = new Image();
				
					// Set image as background
					image.src = path;
					image.onload = function () {
						_this.bg = _this.core.canvas.createPattern(this, repeat);
						_this.loaded = true;
						if (_this.core.timeline && !_this.core.timeline.running) {
							_this.core.redraw(true);
						}
					};
				}
				
				else {
					// Background type is transparent, redraw the background (clears the canvas)
					this.redraw(true);
					this.loaded = true;
				}
				
				return this;
			},
			
			// Method for redrawing the background (replaces everything thas has been drawn)
			redraw: function () {
				var core = this.core;
				
				// Fill canvas with the background color if it's not transparent
				if (this.type !== "transparent") {
					core.canvas.fillStyle = this.bg;
					core.canvas.fillRect(0, 0, core.width, core.height);
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("background", background, "init");

})(oCanvas, window, document);