(function(oCanvas, window, document, undefined){

	// Define the class
	var style = function () {
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},

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
			
			// Method for checking if a value is a color or not
			isColor: function (value) {
				return true;
			}
		};
	};

	// Register the module
	oCanvas.registerModule("style", style);

})(oCanvas, window, document);