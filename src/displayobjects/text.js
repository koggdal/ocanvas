(function(oCanvas, window, document, undefined){

	// Define the class
	var text = function (settings, thecore) {
	
		// Method for setting a font property. Updates both obj.font and obj.property
		var setFontProperty = function (_this, property, value, objectProperty, thecore) {
			var font = thecore.style.getFont(_this.font);
			font[property] = value;
			_this._.font = thecore.style.getFont(font, "string");
			_this._[objectProperty] = value;
		};
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "rectangular",
			
			// Default properties
			align: "start",
			baseline: "top",
			_: oCanvas.extend({}, thecore.displayObject._, {
				font: "normal normal normal 16px/1 sans-serif",
				style: "normal",
				variant: "normal",
				weight: "normal",
				size: 16,
				lineHeight: 1,
				family: "sans-serif",
				text: "",
				width: 0,
				height: 0
			}),
			
			// Setters for font properties
			set font (value) {
			
				// Convert the value to a correct string if it is not a string
				if (typeof value !== "string") {
					value = this.core.style.getFont(value, "string");
				}
				
				// Get font object and set styles
				var font = this.core.style.getFont(value);
				value = this.core.style.getFont(font, "string");
				this._.style = font.style;
				this._.variant = font.variant;
				this._.weight = font.weight;
				this._.size = font.size;
				this._.lineHeight = font.lineHeight;
				this._.family = font.family;
				this._.font = value;
				
				this.initWebFont();
				this.setDimensions();
			},
			set style (style) {
				setFontProperty(this, "style", style, "style", this.core);
				this.initWebFont();
				this.setDimensions();
			},
			set variant (variant) {
				setFontProperty(this, "variant", variant, "variant", this.core);
				this.initWebFont();
				this.setDimensions();
			},
			set weight (weight) {
				setFontProperty(this, "weight", weight, "weight", this.core);
				this.initWebFont();
				this.setDimensions();
			},
			set size (size) {
				setFontProperty(this, "size", size, "size", this.core);
				this.initWebFont();
				this.setDimensions();
			},
			set lineHeight (lineHeight) {
				setFontProperty(this, "lineHeight", lineHeight, "lineHeight", this.core);
				this.initWebFont();
				this.setDimensions();
			},
			set family (family) {
				setFontProperty(this, "family", family, "family", this.core);
				this.initWebFont();
				this.setDimensions();
			},
			set text (text) {
				this._.text = text;
				this.initWebFont();
				this.setDimensions();
			},
			set width (value) {
				return;
			},
			set height (value) {
				return;
			},
			
			// Getters for font properties
			get font () {
				return this._.font;
			},
			get style () {
				return this._.style;
			},
			get variant () {
				return this._.variant;
			},
			get weight () {
				return this._.weight;
			},
			get size () {
				return this._.size;
			},
			get lineHeight () {
				return this._.lineHeight;
			},
			get family () {
				return this._.family;
			},
			get text () {
				return this._.text;
			},
			get width () {
				return this._.width;
			},
			get height () {
				return this._.height;
			},
			
			// Method for initializing the text and get dimensions
			init: function () {
				this._.initialized = true;
				this.initWebFont();
				this.setDimensions();
			},
			
			// Method for setting width/height when something has changed
			setDimensions: function () {
				if (this._.initialized) {
					var canvas = this.core.canvas,
						metrics;
					
					// Measure the text
					canvas.fillStyle = this.fill;
					canvas.font = this.font;
					metrics = canvas.measureText(this.text);
					
					// Set new dimensions
					this._.width = metrics.width;
					this._.height = this.size;
				}
			},

			// Method for initializing a web font.
			// Sometimes the font needs to be used once first to trigger it, before using it for the real text
			initWebFont: function () {
				var core = this.core,
					dummy;
				
				// Create a dummy element and set the current font
				dummy = document.createElement("span");
				dummy.style.font = "0px " + this.family;

				// Append it to the DOM. This will trigger the web font to be used and available to the canvas
				document.body.appendChild(dummy);

				// Remove it after a second to not litter the DOM
				// Also redraw the canvas so text that didn't show before now appears
				setTimeout(function () {
					document.body.removeChild(dummy);
					core.redraw();
				}, 1000);
			},
			
			getBaselineOffset: function () {
				var baseline = this.baseline,
					offset;
				
				if (baseline === "top") {
					offset = this.height * 0.82;
				} else if (baseline === "hanging") {
					offset = this.height * 0.65;
				} else if (baseline === "middle") {
					offset = this.height * 0.31;
				} else if (baseline === "alphabetic") {
					offset = 0;
				} else if (baseline === "ideographic") {
					offset = this.height * -0.05;
				} else if (baseline === "bottom") {
					offset = this.height * -0.22;
				}
				
				return offset;
			},
			
			// Method for drawing the object to the canvas
			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					baselineOffset = this.getBaselineOffset(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y + baselineOffset,
					lines, i;
				
				canvas.beginPath();
				
				canvas.font = this.font;
				canvas.textAlign = this.align;
				canvas.textBaseline = "alphabetic";
				
				// Draw the text as a stroke if a stroke is specified
				if (this.strokeWidth > 0) {
					canvas.lineWidth = this.strokeWidth;
					canvas.strokeStyle = this.strokeColor;

					// Draw the text with support for multiple lines
					lines = this.text.toString().split("\n");
					for (i = 0; i < lines.length; i++) {
						canvas.strokeText(lines[i], x, y + (i * this.lineHeight * this.height));
					}
				}
				
				// Draw the text normally if a fill color is specified
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					
					// Draw the text with support for multiple lines
					lines = this.text.toString().split("\n");
					for (i = 0; i < lines.length; i++) {
						canvas.fillText(lines[i], x, y + (i * this.lineHeight * this.height));
					}
				}
				
				canvas.closePath();
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("text", text, "init");
	
})(oCanvas, window, document);
