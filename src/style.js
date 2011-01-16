(function(oCanvas, window, document, undefined){

	// Define the class
	var style = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},

			// Method for converting a stroke to either an object or a string
			// Fixes errors if found
			getStroke: function (value, return_type) {
				return_type = (return_type === "string") ? "string" : "object";
			
				// Convert object to string with default values if unspecified
				if (typeof value === "object" && return_type === "string") {
					var val = value;
					value = (typeof val.pos === "string") ? val.pos : "outside";
					value += " " + (typeof val.weight === "number" ? val.weight+"px" : "1px");
					value += " " + (typeof val.color === "string" ? val.color : "#000000");
				}
			
				// Get stroke settings
				var stroke = value.split(" "),
					strokePositions = ["outside", "center", "inside"],
					fixed_color = '', i, num_splits = stroke.length,
					strokePos, weight, color, only_color;
				
				// If there are more than 2 splits
				if (num_splits >= 3) {
					
					// If first split is not a valid stroke position
					if (!~strokePositions.indexOf(stroke[0])) {
					
						// Boolean that says if only a color is specified
						only_color = isNaN(parseInt(stroke[0]));
						
						// Loop through all the splits and concatenate the split color values
						for (i = (only_color ? 0 : 1); i < num_splits; i++) {
							fixed_color += stroke[i];
						}
						
						// Set the fixed stroke array
						if (only_color) {
							stroke = [1, fixed_color];
						} else {
							stroke = [stroke[0], fixed_color];
						}
						
						// Set number of splits so the if case further down is entered
						num_splits = 2;
						
					} else {
					
						// Fix color value
						if (num_splits > 3) {
							for (i = 2; i < num_splits; i++) {
								fixed_color += stroke[i];
							}
							stroke = [stroke[0], stroke[1], fixed_color];
						}
						
						// Set the stroke object with correct values
						stroke = {
							pos: stroke[0],
							weight: parseInt(stroke[1]),
							color: stroke[2]
						};
					}
				}
				
				// If there are only two splits ( [weight, color] )
				if (num_splits === 2) {
					
					// Set the stroke object
					stroke = {
						pos: "outside",
						weight: parseInt(stroke[0]),
						color: stroke[1]
					};
				}
				
				// If stroke is still an array (empty stroke value was passed in)
				if (stroke.length) {
					stroke = {
						weight: 0
					};
				}
				
				if (return_type === "string") {
					return stroke.pos + " " + stroke.weight + " " + stroke.color;
				}
				else if (return_type === "object") {
					return stroke;
				}
			},
			
			// Method for converting a font to either a string or an object
			getFont: function (value, return_type) {
				return_type = (return_type === "string") ? "string" : "object";
				
				// Convert object to string with default values if unspecified
				if (typeof value === "object" && return_type === "string") {
					var val = value;
					value = (typeof val.style === "string" ? val.style : "normal");
					value += " " + (typeof val.variant === "string" ? val.variant : "normal");
					value += " " + (typeof val.weight === "string" ? val.weight : "*normal");
					value += " " + (typeof val.size === "number" ? val.size+"px" : "16px");
					value += "/" + (typeof val.lineHeight === "number" ? val.lineHeight : 1.5);
					value += " " + (typeof val.family === "string" ? val.family : "'Helvetica Neue', Arial, Helvetica, sans-serif");
				}
				
				if (value.length > 0) {
				
					// Get font settings
					var font = value.split(" "),
						l = font.length,
						i, value, splits, n, family = "",
						styles = ["normal", "italic", "oblique"],
						variants = ["normal", "small-caps"],
						weights = ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
						font_object = {};
					
					for (i = 0; i < l; i++) {
						value = font[i];
						
						// Font style
						if (~styles.indexOf(value) && !font_object.style) {
							font_object.style = value;
						} else
						// Font variant
						if (~variants.indexOf(value) && !font_object.variant) {
							font_object.variant = value;
						} else
						// Font weight
						if (~weights.indexOf(value) && !font_object.weight) {
							font_object.weight = value;
						} else
	
						if (~value.indexOf("/") && !font_object.size && !font_object.lineHeight) {
							splits = value.split("/");
							// Font size
							if (!isNaN(parseInt(splits[0]))) {
								font_object.size = parseInt(splits[0]);
							}
							// Line height
							if (!isNaN(parseFloat(splits[1]))) {
								font_object.lineHeight = parseFloat(splits[1]);
							}
						} else
						
						// Font family
						if (isNaN(parseInt(value)) && !font_object.family) {
							family = "";
							for (n = i; n < l; n++) {
								family += font[n] + (n === l-1 ? "" : " ")
							}
							font_object.family = family;
						}
					}
				}

				// Set default values if unspecified
				font = font_object || {};
				font.style = font.style ? font.style : "normal";
				font.variant = font.variant ? font.variant : "normal";
				font.weight = font.weight ? font.weight : "normal";
				font.size = font.size ? font.size : 16;
				font.lineHeight = font.lineHeight ? font.lineHeight : 1.5;
				font.family = font.family ? font.family : "'Helvetica Neue', Arial, Helvetica, sans-serif";
				
				if (return_type === "string") {
					return font.style + " " + font.variant + " " + font.weight + " " + font.size + "px/" + font.lineHeight + " " + font.family;
				}
				else if (return_type === "object") {
					return font;
				}
			},
			
			// Method for checking if a value is a color or not
			isColor: function (value) {
				return true;
			}
		};
	};

	// Register the module
	oCanvas.registerModule("style", style);

})(oCanvas, window, document);