(function(oCanvas, window, document, undefined){

	// Define the class
	var style = function () {
		
		// Return an object when instantiated
		return {

			// Method for converting a stroke to either an object or a string
			// Fixes errors if found
			getStroke: function (value, return_type) {
				return_type = (return_type === "string") ? "string" : "object";
			
				// Convert object to string with default values if unspecified
				if (typeof value === "object" && return_type === "string") {
					var val = value;
					value = (typeof val.pos === "string") ? val.pos : "center";
					value += " " + (typeof val.width === "number" ? val.width+"px" : "1px");
					value += " " + (typeof val.color === "string" ? val.color : "#000000");
				}

				// Get stroke components
				var stroke = value.split(" ");

				// Handle color values with parentheses, because they can contain spaces,
				// that would be split by the line above. The color value needs to be in
				// one entry in the stroke array.
				var parenStart, parenEnd;
				for (var i = 0, l = stroke.length; i < l; i++) {
					if (!parenStart && stroke[i].indexOf("(") > -1) parenStart = i;
					if (stroke[i].indexOf(")") > -1) parenEnd = i;
				}
				var color = parenEnd ? stroke.splice(parenStart, parenEnd - parenStart + 1) : undefined;
				if (color) stroke.push(color.join(" "));
			
				// Get stroke settings
				var strokePositions = ["outside", "center", "inside"];
				var fixed_color = '', i, num_splits = stroke.length;
				var strokePos, width, color, only_color;
				
				// If there are more than 2 splits
				if (num_splits >= 3) {
					
					// If first split is not a valid stroke position
					if (!~strokePositions.indexOf(stroke[0])) {
					
						// Boolean that says if only a color is specified
						only_color = isNaN(parseInt(stroke[0]));
						
						// Loop through all the splits and concatenate the split color values
						for (i = (only_color ? 0 : 1); i < num_splits; i++) {
							fixed_color += stroke[i] + (i === num_splits - 1 ? " " : "");
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
								fixed_color += stroke[i] + (i === num_splits - 1 ? " " : "");
							}
							stroke = [stroke[0], stroke[1], fixed_color];
						}
						
						// Set the stroke object with correct values
						stroke = {
							pos: stroke[0],
							width: parseFloat(stroke[1]),
							color: stroke[2]
						};
					}
				}
				
				// If there are only two splits ( [width, color] )
				if (num_splits === 2) {
					
					// Set the stroke object
					stroke = {
						pos: "center",
						width: parseFloat(stroke[0]),
						color: stroke[1]
					};
				}
				
				// If stroke is still an array (empty stroke value was passed in)
				if (stroke.length) {
					stroke = {
						pos: "center",
						width: 0,
						color: ""
					};
				}
				
				if (return_type === "string") {
					return stroke.pos + " " + stroke.width + "px " + stroke.color;
				}
				else if (return_type === "object") {
					return stroke;
				}
			},
			
			// Method for converting a gradient string to a gradient object
			getGradient: function (value, x, y, width, height) {

				if (~value.indexOf("linear")) {
					return this.getLinearGradient(value, x, y, width, height);
					
				} else if (~value.indexOf("radial")) {
					return this.getRadialGradient(value, x, y, width, height);
					
				} else {
					return "transparent";
				}
			},
			
			// Method for converting a CSS style linear gradient to a CanvasGradient object
			getLinearGradient: function (value, x, y, width, height) {
				var gradient,
					args, pos_parts, pos = [], i, start, sX, sY, eX, eY,
					positions = ["top", "bottom", "left", "right"],
					matchedColor, colorIndex, parenColors = [], colorStops, s;
			
				// Get arguments of the linear-gradient function, while preserving color values like hsla() and such
				args = /\((.*)\)/.exec(value)[1];
				while (matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args)) {
					colorIndex = parenColors.push(matchedColor[1]) - 1;
					args = args.substring(0, matchedColor.index) + "###" + colorIndex + "###" + args.substring(matchedColor.index + matchedColor[1].length, args.length);
				}
				args = args.split(",");
				
				// Get position keywords
				pos_parts = args[0].split(" ");
				
				// If the first keyword is a position, add it
				if (~positions.indexOf(pos_parts[0]) || ~pos_parts[0].indexOf("deg")) {
					pos.push(pos_parts[0]);
				}
				// If the second keyword is a position, add it
				if (pos_parts.length > 1 && ~positions.indexOf(pos_parts[1])) {
					pos.push(pos_parts[1]);
				}
				// Add default value if none is specified
				if (pos.length === 0) {
					pos.push("top");
				} else {
					start = 1;
				}
				
				// Get coordinates for start and ending points, based on the above position
				// Get horizontal, vertical or degree specified coordinates
				if (pos.length === 1) {
					if (pos[0] === "top") {
						sX = x + width / 2;
						sY = y;
						eX = x + width / 2;
						eY = y + height;
					} else if (pos[0] === "right") {
						sX = x + width;
						sY = y + height / 2;
						eX = x;
						eY = y + height / 2;
					} else if (pos[0] === "bottom") {
						sX = x + width / 2;
						sY = y + height;
						eX = x + width / 2;
						eY = y;
					} else if (pos[0] === "left") {
						sX = x;
						sY = y + height / 2;
						eX = x + width;
						eY = y + height / 2;
					} else if (~pos[0].indexOf("deg")) {
						var alpha, a, beta, cornerDistance, endDistance, cornerX, cornerY, cY,
							pi = Math.PI,
							centerX = x + width / 2,
							centerY = y + height / 2;
						
						// Convert the angle to the range 0 - 359 degrees and then convert it to radians
						alpha = (parseFloat(pos) % 360) * pi / 180;
						a = alpha;
						
						// Upper right corner
						if (alpha >= 0 && alpha < pi / 2) {
							cornerX = x + width;
							cornerY = y;
						}
						
						// Upper left corner
						else if (alpha >= pi / 2 && alpha < pi) {
							cY = centerY;
							centerY = centerX;
							cornerY = x;
							cornerX = cY;
							centerX = y;
						}
						
						// Bottom left corner
						else if (alpha >= pi && alpha < pi * 1.5) {
							cY = centerY;
							cornerX = centerX;
							centerX = x;
							centerY = y + height;
							cornerY = cY;
						}
						
						// Bottom right corner
						else if (alpha >= pi * 1.5 && alpha < pi * 2) {
							cY = centerY;
							centerY = x + width;
							cornerY = centerX;
							cornerX = y + height;
							centerX = cY;
						}
						
						
						// Convert the angle to the range 0 - 89
						alpha = alpha % (pi / 2);
						
						// Get angle between baseline and the line between the corner and the center
						beta = Math.atan(Math.abs(centerY - cornerY) / Math.abs(cornerX - centerX));
						
						// Get the distance between the corner and the center
						cornerDistance = Math.sqrt(Math.pow(centerY - cornerY, 2) + Math.pow(centerX - cornerX, 2));
						
						// Get the distance between the end point and the center
						endDistance = cornerDistance * Math.cos(beta - (alpha));
						
						// Get end point and start point
						// Upper right corner
						if (a >= 0 && a < pi / 2) {
							eX = centerX + endDistance * Math.cos(alpha);
							eY = centerY - endDistance * Math.sin(alpha);
							sX = centerX * 2 - eX;
							sY = centerY * 2 - eY;
						}
						
						// Upper left corner
						else if (a >= pi / 2 && a < pi) {
							eX = centerY - endDistance * Math.cos(pi / 2 - alpha);
							eY = cornerX - endDistance * Math.sin(pi / 2 - alpha);
							sX = centerY * 2 - eX;
							sY = cornerX * 2 - eY;
						}
						
						// Bottom left corner
						else if (a >= pi && a < pi * 1.5) {
							eX = cornerX + endDistance * Math.cos(pi - alpha);
							eY = cornerY + endDistance * Math.sin(pi - alpha);
							sX = cornerX * 2 - eX;
							sY = cornerY * 2 - eY;
						}
						
						// Bottom right corner
						else if (a >= pi * 1.5 && a < pi * 2) {
							eX = cornerY - endDistance * Math.cos(pi * 1.5 - alpha);
							eY = centerX - endDistance * Math.sin(pi * 1.5 - alpha);
							sX = cornerY * 2 - eX;
							sY = centerX * 2 - eY;
						}
					}
					
				// Get diagonal coordinates
				} else {
					if (~pos.indexOf("top") && ~pos.indexOf("left")) {
						sX = x;
						sY = y;
						eX = x + width;
						eY = y + height;
					} else if (~pos.indexOf("top") && ~pos.indexOf("right")) {
						sX = x + width;
						sY = y;
						eX = x;
						eY = y + height;
					} else if (~pos.indexOf("bottom") && ~pos.indexOf("left")) {
						sX = x;
						sY = y + height;
						eX = x + width;
						eY = y;
					} else if (~pos.indexOf("bottom") && ~pos.indexOf("right")) {
						sX = x + width;
						sY = y + height;
						eX = x;
						eY = y;
					}
				}
				
				// Create the gradient object
				gradient = this.core.canvas.createLinearGradient(sX, sY, eX, eY);
				
				// Get the color stops
				colorStops = this.getColorStops(gradient, args.slice(start), parenColors);
				
				// Add the color stops to the gradient object
				for (s = 0; s < colorStops.length; s++) {
					gradient.addColorStop(colorStops[s].pos / 100, colorStops[s].color);
				}
				
				// Return the gradient object
				return gradient;
			},
			
			// Method for converting a CSS style radial gradient to a CanvasGradient object
			getRadialGradient: function (value, x, y, width, height) {
				var gradient,
					bg_position_keywords_x = ["left", "center", "right"],
					bg_position_keywords_y = ["top", "center", "bottom"],
					bg_position_sizes_x = { "left": x, "center": (x + width / 2), "right": (x + width) },
					bg_position_sizes_y = { "top": y, "center": (y + height / 2), "bottom": (y + height) },
					sizes = ["closest-side", "closest-corner", "farthest-side", "farthest-corner", "contain", "cover"],
					args, i, l, matchedColor, colorIndex, parenColors = [], colorStops, s,
					pos_arg, num_pos_args = 0, circles = [{x:undefined,y:undefined,r:0}, {x:undefined,y:undefined,r:undefined}], p, p_key,
					size_arg, size, size_set = false;
				
				// Get arguments of the radial-gradient function, while preserving color values like hsla() and such
				args = /\((.*)\)/.exec(value)[1];
				while (matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args)) {
					colorIndex = parenColors.push(matchedColor[1]) - 1;
					args = args.substring(0, matchedColor.index) + "###" + colorIndex + "###" + args.substring(matchedColor.index + matchedColor[1].length, args.length);
				}
				args = args.split(/\s*,\s*/);
				l = args.length;
				
				// Get position for start and end circles
				for (i = 0; i < 2; i++) {
					
					// If the argument has two values
					if (~args[i].indexOf(" ")) {
						pos_arg = args[i].split(" ");
						
						// Get the different keywords
						// Center
						if (pos_arg[0] === "center") {
							circles[i].x = pos_arg[0];
							circles[i].y = pos_arg[1];
							num_pos_args = i + 1;
						}
						
						// Interpret X position for first value of the argument
						else if (~bg_position_keywords_x.indexOf(pos_arg[0])) {
							circles[i].x = pos_arg[0];
							num_pos_args = i + 1;
							
							// Interpret Y position for second value of the argument
							if (~bg_position_keywords_y.indexOf(pos_arg[1])) {
								circles[i].y = pos_arg[1];
							}
						}
						
						// Interpret Y position for first value of the argument
						else if (~bg_position_keywords_y.indexOf(pos_arg[0])) {
							circles[i].y = pos_arg[0];
							num_pos_args = i + 1;
							
							// Interpret Y position for second value of the argument
							if (~bg_position_keywords_x.indexOf(pos_arg[1])) {
								circles[i].x = pos_arg[1];
							}
						}
						
						// Interpret X position for first value of the argument and the value is numeric
						else if (!isNaN(parseFloat(pos_arg[0]))) {
							circles[i].x = pos_arg[0];
							num_pos_args = i + 1;
							
							// Interpret Y position for second value of the argument (could be either keyword or numeric)
							if (~bg_position_keywords_y.indexOf(pos_arg[1]) || !isNaN(parseFloat(pos_arg[1]))) {
								circles[i].y = pos_arg[1];
							}
						}
						
						// Add the missing position values
						if (!circles[i].x) {
							circles[i].x = "center";
						}
						if (!circles[i].y) {
							circles[i].y = "center";
						}
					}
					
					// If only one value was passed in as the argument
					else {
						
						// Add position if it's a keyword for either an X or Y position
						if (~bg_position_keywords_x.indexOf(args[i])) {
							circles[i].x = args[i];
							num_pos_args = i + 1;
						} else if (~bg_position_keywords_y.indexOf(args[i])) {
							circles[i].y = args[i];
							num_pos_args = i + 1;
						}
						
						// If the position is not a valid keyword and this is the end circle,
						// add the same position as the first circle has
						else if (i === 1) {
							circles[i].x = circles[0].x;
						}
						
						// Add default position for the first value if nothing valid was passed in
						else {
							circles[i].x = "center";
						}
						
						
						// Since only one value was passed in, the second must be added here
						// If this is the second position (end circle), use the first circle's position
						if (i === 1) {
							circles[i].y = circles[0].y;
						}
						
						// Add default value if nothing value was passed in
						else {
							circles[i].y = "center";
						}
					}
				}
			
			
				// Get the size
				
				// Check for keywords
				if (~sizes.indexOf(args[num_pos_args])) {
					size = args[num_pos_args];
					size_set = true;
				}
				
				// Check for pixel or percentage value
				if (/\d+(%|px)\s/.test(args[num_pos_args])) {
					size = parseFloat(args[num_pos_args]);
					size_set = true;
					if (isNaN(size)) {
						size = 0;
					}
				}
				
				// Defaults if no correct values were passed in
				if (size === undefined) {
					size = "cover";
				}
				
				
				
				// Convert all positions to actual pixel sizes relative to the top left corner of the canvas
				for (i = 0; i < 2; i++) {
				
					// Get pixel sizes for keywords
					circles[i].abs_x = bg_position_sizes_x[circles[i].x];
					circles[i].abs_y = bg_position_sizes_y[circles[i].y];
					
					// Loop through both x and y
					for (p = 0; p < 2; p++) {
					
						p_key = "abs_" + (p === 0 ? "x" : "y");
					
						// If the value was not found, it is not a keyword – it is probably a number
						if (circles[i][p_key] === undefined) {
						
							// Get the number
							circles[i][p_key] = parseFloat(circles[i][(p_key === "abs_x" ? "x" : "y")]);
							
							// If it was not a number, get the center value
							if (isNaN(circles[i][p_key])) {
								circles[i][p_key] = (p_key === "abs_x") ? bg_position_sizes_x.center - x : bg_position_sizes_y.center - y;
							}
							
							// If it was a percentage, convert it to an actual pixel size
							if (~circles[i][(p_key === "abs_x" ? "x" : "y")].indexOf("%")) {
								circles[i][p_key] = (circles[i][p_key] / 100) * (p_key === "abs_x" ? width : height);
							}
							
							// Add the x offset to make the position relative to the left corner of the canvas
							circles[i][p_key] += (p_key === "abs_x") ? x : y;
						}
					}
				}
				
				
				// Convert the size to actual pixels
				
				// Check for keywords
				if (~sizes.indexOf(size)) {
					if (size === "closest-side" || size === "contain") {
						size = Math.min(
							Math.abs(circles[1].abs_y - y),
							Math.abs(y + height - circles[1].abs_y),
							Math.abs(circles[1].abs_x - x),
							Math.abs(x + width - circles[1].abs_y)
						);
					} else if (size === "closest-corner") {
						size = Math.min(
							Math.sqrt(Math.pow((circles[1].abs_x - x), 2) + Math.pow((circles[1].abs_y - y), 2)),
							Math.sqrt(Math.pow((x + width - circles[1].abs_x), 2) + Math.pow((circles[1].abs_y - y), 2)),
							Math.sqrt(Math.pow((x + width - circles[1].abs_x), 2) + Math.pow((y + height - circles[1].abs_y), 2)),
							Math.sqrt(Math.pow((circles[1].abs_x - x), 2) + Math.pow((y + height - circles[1].abs_y), 2))
						);
					} else if (size === "farthest-corner" || size === "cover") {
						size = Math.max(
							Math.sqrt(Math.pow((circles[1].abs_x - x), 2) + Math.pow((circles[1].abs_y - y), 2)),
							Math.sqrt(Math.pow((x + width - circles[1].abs_x), 2) + Math.pow((circles[1].abs_y - y), 2)),
							Math.sqrt(Math.pow((x + width - circles[1].abs_x), 2) + Math.pow((y + height - circles[1].abs_y), 2)),
							Math.sqrt(Math.pow((circles[1].abs_x - x), 2) + Math.pow((y + height - circles[1].abs_y), 2))
						);
					} else if (size === "farthest-side") {
						size = Math.max(
							Math.abs(circles[1].abs_y - y),
							Math.abs(y + height - circles[1].abs_y),
							Math.abs(circles[1].abs_x - x),
							Math.abs(x + width - circles[1].abs_y)
						);
					} else {
						size = 0;
					}
				}
				
				// Check for a percentage
				if (~args[num_pos_args].indexOf("%")) {
					
					// Convert it to pixels relative to the specified dimension. Defaults to width
					if (~args[num_pos_args].indexOf(" ")) {
						size_arg = args[num_pos_args].split(" ")[1] === "height" ? height : width;
					} else {
						size_arg = width;
					}
					size = (size / 100) * size_arg;
				}
				
				// Set the radius for the end circle
				circles[1].r = size;
				
				// Create the gradient object
				gradient = this.core.canvas.createRadialGradient(circles[0].abs_x, circles[0].abs_y, circles[0].r, circles[1].abs_x, circles[1].abs_y, circles[1].r);
				
				// Get the color stops
				colorStops = this.getColorStops(gradient, args.slice(num_pos_args + (size_set ? 1 : 0)), parenColors);
				
				// Add the color stops to the gradient object
				for (s = 0; s < colorStops.length; s++) {
					gradient.addColorStop(colorStops[s].pos / 100, colorStops[s].color);
				}
				
				return gradient;
			},
			
			// Method for getting color stops
			getColorStops: function (gradient, stops, parenColors) {
			
				var i, l = stops.length,
					colorStop, stop_parts, color, color_pos, colorStops = [];
			
				// Loop through all color stops
				for (i = 0; i < l; i++) {
					colorStop = stops[i].trim();
					
					// If the last position was more than or equal to 100 %,
					// the following would not be visible anyway, so setting it is unnecessary
					if (color_pos >= 100) {
						break;
					}
					
					// Split the color stop value to separate the color from the position
					// Using space is OK, since hsla() values and such are stripped away up at the top
					// Positions outside the range 0 - 100 % are not supported at the moment
					if (~colorStop.indexOf(" ")) {
						stop_parts = colorStop.split(" ");
						color = stop_parts[0];
						color_pos = stop_parts[1];
						
						// Convert a pixel value to a percentage
						if (~color_pos.indexOf("px")) {
							color_pos = parseFloat(color_pos) / Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2)) * 100;
						} else {
							color_pos = parseFloat(color_pos);
						}
					}
					
					// No position was specified, so one will be generated
					else {
						color = colorStop;
						
						// Set first position to 0 if not set before
						if (color_pos === undefined) {
							color_pos = 0;
						}
						
						// Set the next position if it's not the first one
						else {
							color_pos = color_pos || 0;
							color_pos = color_pos + ((100 - color_pos) / (l - i));
						}
					}
					
					// Get the saved color value if the color contained parentheses when passed in to this method
					if (~color.indexOf("###")) {
						color = parenColors[/###(\d+)###/.exec(color)[1]];
					}
					
					// Add color data to an array with all color stops
					colorStops.push({
						pos: color_pos,
						color: color
					});
				}
				
				return colorStops;
			},
			
			// Method for converting a font to either a string or an object
			getFont: function (value, return_type) {
				return_type = (return_type === "string") ? "string" : "object";
				
				// Convert object to string with default values if unspecified
				if (typeof value === "object" && return_type === "string") {
					var val = value;
					value = (typeof val.style === "string" ? val.style : "normal");
					value += " " + (typeof val.variant === "string" ? val.variant : "normal");
					value += " " + (typeof val.weight === "string" ? val.weight : "normal");
					value += " " + (typeof val.size === "number" ? (~~(val.size * 10 + 0.5) / 10)+"px" : "16px");
					value += "/" + (typeof val.lineHeight === "number" ? (~~(val.lineHeight * 10 + 0.5) / 10) :
						(typeof val.lineHeight === "string" ? (val.lineHeight.indexOf("px") > -1 ? val.lineHeight : 1) : 1));
					value += " " + (typeof val.family === "string" ? val.family : "sans-serif");
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
								font_object.lineHeightUnit = splits[1].indexOf("px") > -1 ? "px" : "relative";
							}
						} else
						
						if (!font_object.size && /\d+[a-z]{2}(?!\/)/.test(value)) {
							// Font size
							if (!isNaN(parseInt(value))) {
								font_object.size = parseInt(value);
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
				font.size = font.size !== undefined ? font.size : 16;
				font.lineHeight = font.lineHeight !== undefined ? font.lineHeight : 1;
				font.lineHeightUnit = font.lineHeightUnit !== undefined ? font.lineHeightUnit : "relative";
				font.family = font.family ? font.family : "sans-serif";
				
				if (return_type === "string") {
					return font.style + " " + font.variant + " " + font.weight + " " + font.size + "px/" +
						font.lineHeight + (font.lineHeightUnit === "px" ? "px" : "") + " " + font.family;
				}
				else if (return_type === "object") {
					return font;
				}
			},
			
			// Method for converting a shadow to either an object or a string
			getShadow: function (value, return_type) {
				var shadow = {}, values;
				
				// Correct errors if any when an object is passed in
				if (typeof value === "object") {
					shadow.offsetX = !isNaN(parseFloat(value.offsetX)) ? parseFloat(value.offsetX) : 0;
					shadow.offsetY = !isNaN(parseFloat(value.offsetY)) ? parseFloat(value.offsetY) : 0;
					shadow.blur = !isNaN(parseFloat(value.blur)) ? parseFloat(value.blur) : 0;
					shadow.color = this.isColor(value.color) ? value.color : "#000";
				}
				
				// Parse the values if a string was passed in
				else if (typeof value === "string") {
					
					var values = /^(.*?)\s(.*?)\s(.*?)\s(.*?)$/.exec(value);
					shadow.offsetX = !isNaN(parseFloat(values[1])) ? parseFloat(values[1]) : 0;
					shadow.offsetY = !isNaN(parseFloat(values[2])) ? parseFloat(values[2]) : 0;
					shadow.blur = !isNaN(parseFloat(values[3])) ? parseFloat(values[3]) : 0;
					shadow.color = this.isColor(values[4]) ? values[4] : "#000";
				}
				
				if (return_type === "string") {
					return shadow.offsetX + "px " + shadow.offsetY + "px " + shadow.blur + "px " + shadow.color;
				} else {
					return shadow;
				}
			},
			
			// Method for checking if a value is a color or not
			isColor: function (value) {
				if (typeof value === "string" && (value[0] === "#" || value.substr(0, 4) === "rgb(" || value.substr(0, 5) === "rgba(" || value.substr(0, 4) === "hsl(" || value.substr(0, 5) === "hsla(")) {
					return true;
				} else {
					return false;
				}
			}
		};
	};

	// Register the module
	oCanvas.registerModule("style", style);

})(oCanvas, window, document);
