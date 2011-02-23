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
			
			type: "text",
			shapeType: "rectangular",
			
			// Default properties
			align: "start",
			baseline: "top",
			_: oCanvas.extend(Object.create(thecore.displayObject._), {
				font: "normal normal normal 16px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif",
				style: "normal",
				variant: "normal",
				weight: "normal",
				size: 16,
				lineHeight: 1.5,
				family: "'Helvetica Neue', Arial, Helvetica, sans-serif",
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
				
				this.setDimensions();
			},
			set style (style) {
				setFontProperty(this, "style", style, "style", this.core);
				this.setDimensions();
			},
			set variant (variant) {
				setFontProperty(this, "variant", variant, "variant", this.core);
				this.setDimensions();
			},
			set weight (weight) {
				setFontProperty(this, "weight", weight, "weight", this.core);
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
			
			// Method for drawing the object to the canvas
			draw: function (cb) {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					lines, i;
				
				canvas.beginPath();
				
				canvas.font = this.font;
				canvas.textAlign = this.align;
				canvas.textBaseline = this.baseline;
				
				// Draw the text as a stroke if a stroke is specified
				if (this.strokeWeight > 0) {
					canvas.lineWidth = this.strokeWeight;
					canvas.strokeStyle = this.strokeColor;
					canvas.strokeText(this.text, x, y);
					canvas.stroke();
				}
				
				// Draw the text normally if a fill color is specified
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					
					// Draw the text with support for multiple lines
					lines = this.text.toString().split("\n");
					for (i = 0; i < lines.length; i++) {
						canvas.fillText(lines[i], x, y + (i * this.lineHeight * this.height));
					}
					canvas.fill();
				}
				
				canvas.closePath();
				
				if (cb) {
					cb.call(this);
				}
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("text", text, "init");
	
})(oCanvas, window, document);