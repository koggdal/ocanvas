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
			
			// Default properties
			text: "",
			align: "start",
			baseline: "alphabetic",
			_: {
				font: "normal normal normal 16px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif",
				style: "_normal",
				variant: "_normal",
				weight: "_normal",
				size: 16,
				lineHeight: 1.5,
				family: "'Helvetica Neue', Arial, Helvetica, sans-serif"
			},
			
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
			},
			set style (style) {
				setFontProperty(this, "style", style, "style", this.core);
			},
			set variant (variant) {
				setFontProperty(this, "variant", variant, "variant", this.core);
			},
			set weight (weight) {
				setFontProperty(this, "weight", weight, "weight", this.core);
			},
			set size (size) {
				setFontProperty(this, "size", size, "size", this.core);
			},
			set lineHeight (lineHeight) {
				setFontProperty(this, "lineHeight", lineHeight, "lineHeight", this.core);
			},
			set family (family) {
				setFontProperty(this, "family", family, "family", this.core);
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
			
			// Method for drawing the object to the canvas
			draw: function () {
				var canvas = this.core.canvas;
				
				canvas.font = this.font;
				canvas.textAlign = this.align;
				canvas.textBaseline = this.baseline;
				
				// Draw the text as a stroke if a stroke is specified
				if (this.strokeWeight > 0) {
					canvas.lineWidth = this.strokeWeight;
					canvas.strokeStyle = this.strokeColor;
					canvas.strokeText(this.text, this.x, this.y);
					canvas.stroke();
				}
				
				// Draw the text normally if a fill color is specified
				if (this.fill !== "") {
					canvas.fillStyle = this.fill;
					canvas.fillText(this.text, this.x, this.y);
					canvas.fill();
				}
				
				
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("text", text);
	
})(oCanvas, window, document);