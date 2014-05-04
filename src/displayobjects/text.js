(function(oCanvas, window, document, undefined){

	var loadedFonts = [];

	// Define the class
	var text = function (settings, thecore) {
	
		// Method for setting a font property. Updates both obj.font and obj.property
		var setFontProperty = function (_this, property, value, objectProperty, thecore) {
			var font = thecore.style.getFont(_this.font);
			font[property] = value;
			_this._.font = thecore.style.getFont(font, "string");
			if (objectProperty === "lineHeight") {
				_this._.lineHeight = isNaN(parseInt(value, 10)) ? 1 : parseInt(value, 10);
				_this._.lineHeightUnit = typeof value === "string" ? (value.indexOf("px") > -1 ? "px" : "relative") : "relative";
			} else {
				_this._[objectProperty] = value;
			}
		};
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "rectangular",
			
			// Default properties
			align: "start",
			baseline: "top",
			_: oCanvas.extend({}, thecore.displayObject._, {
				hasBeenDrawn: false,
				font: "normal normal normal 16px/1 sans-serif",
				style: "normal",
				variant: "normal",
				weight: "normal",
				size: 16,
				lineHeight: 1,
				family: "sans-serif",
				text: "",
				width: 0,
				height: 0,
				lines: []
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
				this._.lineHeightUnit = font.lineHeightUnit;
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
				this.setDimensions();
			},
			set lineHeight (lineHeight) {
				setFontProperty(this, "lineHeight", lineHeight, "lineHeight", this.core);
				this.setDimensions();
			},
			set family (family) {
				setFontProperty(this, "family", family, "family", this.core);
				this.initWebFont();
				this.setDimensions();
			},
			set text (text) {
				this._.text = text;
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
				return this._.lineHeight + (this._.lineHeightUnit === "px" ? "px" : 0);
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
					var canvas, textLines, numLines, lineHeight, width, height, i, metrics, lines;

					canvas = this.core.canvas;
					
					// Set the text settings
					canvas.fillStyle = this.fill;
					canvas.font = this.font;
					textLines = this.text.toString().split("\n");
					numLines = textLines.length;
					width = 0;
					height = 0;
					lines = [];
					
					// Get the dimensions of all lines
					for (i = 0; i < numLines; i++) {
						metrics = canvas.measureText(textLines[i]);
						width = (metrics.width > width) ? metrics.width : width;
						if (this._.lineHeightUnit === "px") {
							lineHeight = this._.lineHeight;
						} else {
							lineHeight = this.size * this._.lineHeight;
						}
						height += lineHeight;
						lines.push({
							text: textLines[i],
							width: metrics.width,
							height: lineHeight
						});
					}

					// Set the dimensions
					this._.width = width;
					this._.height = height;
					this._.lines = lines;
				}
			},

			// Method for initializing a web font.
			// Sometimes the font needs to be used once first to trigger it, before using it for the real text
			initWebFont: function () {
				var font = this.style + " " + this.variant + " " + this.weight + " 0px " + this.family;

				if (loadedFonts.indexOf(font) > -1) return;
				loadedFonts.push(font);

				var self = this;
				var core = this.core,
					dummy;
				
				// Create a dummy element and set the current font
				dummy = document.createElement("span");
				dummy.style.font = font;

				// Append it to the DOM. This will trigger the web font to be used and available to the canvas
				document.body.appendChild(dummy);

				// Remove it after a second to not litter the DOM
				// Also redraw the canvas so text that didn't show before now appears
				setTimeout(function () {
					document.body.removeChild(dummy);
					if (self._.hasBeenDrawn) core.redraw();
				}, 1000);
			},

			getAlignOffset: function () {
				var aligns = {
					"start":  this.core.canvasElement.dir === "rtl" ? - this.width : 0,
					"end":    this.core.canvasElement.dir === "rtl" ? 0 : - this.width,
					"left":   0,
					"center": - this.width / 2,
					"right":  - this.width
				};

				return aligns[this.align] || 0;
			},
			
			getBaselineOffset: function () {
				var baselines = {
					"top":         this.size *  0.82,
					"hanging":     this.size *  0.65,
					"middle":      this.size *  0.31,
					"alphabetic":  0,
					"ideographic": this.size * -0.05,
					"bottom":      this.size * -0.22
				};

				return baselines[this.baseline] || 0;
			},
			
			// Method for drawing the object to the canvas
			draw: function () {
				var canvas, lines, alignOffset, baselineOffset, relativeLineHeight, lineHeightOffset, origin, x, y, i, numLines;

				canvas = this.core.canvas;
				lines = this._.lines;

				alignOffset = this.getAlignOffset();
				baselineOffset = this.getBaselineOffset();
				relativeLineHeight = this._.lineHeightUnit === "px" ? this._.lineHeight / this.size : this._.lineHeight;
				lineHeightOffset = (this.baseline !== "top") ? (this.size * (relativeLineHeight - 1)) / 2 : 0;

				origin = this.getOrigin();
				x = this.abs_x - origin.x - alignOffset;
				y = this.abs_y - origin.y + baselineOffset - lineHeightOffset;
				
				canvas.beginPath();
				
				canvas.font = this.font;
				canvas.textAlign = this.align;
				canvas.textBaseline = "alphabetic";
				
				// Draw the text as a stroke if a stroke is specified
				if (this.strokeWidth > 0) {
					canvas.lineWidth = this.strokeWidth;
					canvas.strokeStyle = this.strokeColor;

					// Draw the text with support for multiple lines
					for (i = 0, numLines = lines.length; i < numLines; i++) {
						canvas.strokeText(lines[i].text, x, y + (i * lines[i].height) + (lines[i].height - this.size) / 2);
					}
				}
				
				// Draw the text normally if a fill color is specified
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					
					// Draw the text with support for multiple lines
					for (i = 0, numLines = lines.length; i < numLines; i++) {
						canvas.fillText(lines[i].text, x, y + (i * lines[i].height) + (lines[i].height - this.size) / 2);
					}
				}
				
				canvas.closePath();

				this._.hasBeenDrawn = true;
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("text", text, "init");
	
})(oCanvas, window, document);
