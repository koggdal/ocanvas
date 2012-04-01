(function(oCanvas, window, document, undefined){

	// Define the class
	var displayObject = function () {
	
		// Method for setting a stroke property. Updates both obj.stroke and obj.property
		var setStrokeProperty = function (_this, property, value, objectProperty, thecore) {
			var stroke = thecore.style.getStroke(_this.stroke);
			stroke[property] = value;
			_this.stroke = thecore.style.getStroke(stroke, "string");
		};
		
		// Return an object when instantiated
		return {

			// Properties
			id: 0,
			shapeType: "rectangular",
			type: "",
			origin: {
				x: 0,
				y: 0
			},
			events: {},
			children: [],
			added: false,
			opacity: 1,
			rotation: 0,
			composition: "source-over",
			scalingX: 1,
			scalingY: 1,
			pointerEvents: true,
			
			_: {
				x: 0,
				y: 0,
				abs_x: 0,
				abs_y: 0,
				rotation: 0,
				width: 0,
				height: 0,
				drawn: false,
				stroke: "",
				strokeColor: "",
				strokeWidth: 0,
				strokePosition: "center",
				cap: "butt",
				join: "miter",
				miterLimit: 10,
				fill: "",
				shadow: {
					offsetX: 0,
					offsetY: 0,
					blur: 0,
					color: "transparent"
				}
			},
			
			set strokeColor (color) {
				setStrokeProperty(this, "color", color, "strokeColor", this.core);
			},
			set strokeWidth (width) {
				setStrokeProperty(this, "width", width, "strokeWidth", this.core);
			},
			set strokePosition (pos) {
				setStrokeProperty(this, "pos", pos, "strokePosition", this.core);
			},
			set stroke (value) {
			
				// Convert the value to a correct string if it is not a string
				if (typeof value !== "string") {
					value = this.core.style.getStroke(value, "string");
				}
				
				// Get stroke object and set styles
				var stroke = this.core.style.getStroke(value);
				
				// Handle patterns
				if (~stroke.color.indexOf("image(")) {
					var matches = /image\((.*?)(,(\s|)(repeat|repeat-x|repeat-y|no-repeat)|)\)/.exec(stroke.color),
						path = matches[1],
						repeat = matches[4] || "repeat",
						image = new Image(),
						_this = this;
						
					image.src = path;
					this._.strokepattern_loading = true;
					this._.strokepattern_redraw = false;
					
					image.onload = function () {
						_this._.strokeColor = _this.core.canvas.createPattern(this, repeat);
						_this._.strokepattern_loading = false;
						
						if (_this._.strokepattern_redraw) {
							_this._.strokepattern_redraw = false;
							_this.redraw();
						}
					};
				} else {
					this._.strokeColor = stroke.color;
				}
				
				// Set other stroke properties
				this._.strokeWidth = stroke.width;
				this._.strokePosition = stroke.pos;
				this._.stroke = value;
			},
			set cap (value) {
				var possible_values = ["butt", "round", "square"];
				this._.cap = ~possible_values.indexOf(value) ? value : "butt";
			},
			set join (value) {
				var possible_values = ["round", "bevel", "miter"];
				this._.join = ~possible_values.indexOf(value) ? value : "miter";
			},
			set miterLimit (value) {
				this._.miterLimit = !isNaN(parseFloat(value)) ? parseFloat(value) : 10;
			},
			get stroke () {
				return this._.stroke;
			},
			get strokeColor () {
				if (this._.strokepattern_loading) {
					this._.strokepattern_redraw = true;
					return "";
				} else if (~this._.strokeColor.toString().indexOf("CanvasPattern")) {
					return this._.strokeColor;
				} else if (~this._.strokeColor.indexOf("gradient")) {
					var origin = this.getOrigin();
					if (this.shapeType === "rectangular") {
						var stroke = (this.strokePosition === "outside") ? this.strokeWidth : (this.strokePosition === "center" ? this.strokeWidth / 2 : 0);
						return this.core.style.getGradient(this._.strokeColor, this.abs_x - origin.x - stroke, this.abs_y - origin.y - stroke, this.width + stroke * 2, this.height + stroke * 2);
					} else if (this.shapeType === "radial") {
						var radius = this.radius + this.strokeWidth / 2;
						origin.x += this.radius;
						origin.y += this.radius;
						return this.core.style.getGradient(this._.strokeColor, this.abs_x - origin.x - this.radius, this.abs_y - origin.y - this.radius, radius * 2, radius * 2);
					}
				} else {
					return this._.strokeColor;
				}
			},
			get strokeWidth () {
				return this._.strokeWidth;
			},
			get strokePosition () {
				return this._.strokePosition;
			},
			get cap () {
				return this._.cap;
			},
			get join () {
				return this._.join;
			},
			get miterLimit () {
				return this._.miterLimit;
			},
			
			set fill (value) {
				if (~value.indexOf("image(")) {
					var matches = /image\((.*?)(,(\s|)(repeat|repeat-x|repeat-y|no-repeat)|)\)/.exec(value),
						path = matches[1],
						repeat = matches[4] || "repeat",
						image = new Image(),
						_this = this;
						
					image.src = path;
					this._.pattern_loading = true;
					this._.pattern_redraw = false;
					
					image.onload = function () {
						_this._.fill = _this.core.canvas.createPattern(this, repeat);
						_this._.pattern_loading = false;
						
						if (_this._.pattern_redraw) {
							_this._.pattern_redraw = false;
							_this.redraw();
						}
					};
				} else {
					this._.fill = value;
				}
			},
			get fill () {
				if (this._.pattern_loading) {
					this._.pattern_redraw = true;
					return "";
				} else if (~this._.fill.toString().indexOf("CanvasPattern")) {
					return this._.fill;
				} else if (~this._.fill.indexOf("gradient")) {
					var origin = this.getOrigin();
					if (this.shapeType === "rectangular") {
						return this.core.style.getGradient(this._.fill, this.abs_x - origin.x, this.abs_y - origin.y, this.width, this.height);
					} else if (this.shapeType === "radial") {
						return this.core.style.getGradient(this._.fill, this.abs_x - origin.x - this.radius, this.abs_y - origin.y - this.radius, this.radius * 2, this.radius * 2);
					}
				} else {
					return this._.fill;
				}
			},
			set shadow (value) {
			
				// Convert the value to a correct string if it is not a string
				if (typeof value !== "string") {
					value = this.core.style.getShadow(value, "string");
				}
				
				// Get shadow object and set styles
				var shadow = this.core.style.getShadow(value);
				this._.shadow = shadow;
			},
			set shadowOffsetX (value) {
				if (!isNaN(parseFloat(value))) {
					this._.shadow.offsetX = parseFloat(value);
				}
			},
			set shadowOffsetY (value) {
				if (!isNaN(parseFloat(value))) {
					this._.shadow.offsetY = parseFloat(value);
				}
			},
			set shadowBlur (value) {
				if (!isNaN(parseFloat(value))) {
					this._.shadow.blur = parseFloat(value);
				}
			},
			set shadowColor (value) {
				if (this.core.style.isColor(value)) {
					this._.shadow.color = value;
				}
			},
			get shadow () {
				return this._.shadow;
			},
			get shadowOffsetX () {
				return this._.shadow.offsetX;
			},
			get shadowOffsetY () {
				return this._.shadow.offsetY;
			},
			get shadowBlur () {
				return this._.shadow.blur;
			},
			get shadowColor () {
				return this._.shadow.color;
			},
			
			set x (value) {
				this._.x = value;
				this._.abs_x = value + ((this.parent !== undefined && this.parent !== this.core) ? this.parent.abs_x : 0);
				
				// Update children
				var objects = this.children,
					l = objects.length, i;
				for (i = 0; i < l; i++) {
					objects[i]._.abs_x = this.abs_x + objects[i].x;
					objects[i].x += 0;
				}
			},
			set y (value) {
				this._.y = value;
				this._.abs_y = value + ((this.parent !== undefined && this.parent !== this.core) ? this.parent.abs_y : 0);
				
				// Update children
				var objects = this.children,
					l = objects.length, i;
				for (i = 0; i < l; i++) {
					objects[i]._.abs_y = this.abs_y - objects[i].y;
					objects[i].y += 0;
				}
			},
			get x () {
				return this._.x;
			},
			get y () {
				return this._.y;
			},
			set abs_x (value) {
				return;
			},
			set abs_y (value) {
				return;
			},
			get abs_x () {
				return this._.abs_x;
			},
			get abs_y () {
				return this._.abs_y;
			},
			set width (value) {
				this._.width = value;
			},
			get width () {
				return this._.width;
			},
			set height (value) {
				this._.height = value;
			},
			get height () {
				return this._.height;
			},
			set zIndex (value) {
				if (!this.parent) {
					return;
				}

				// Get new z index based on keywords
				if (value === "front") {
					value = this.parent.children.length - 1;
				}
				if (value === "back") {
					value = 0;
				}

				// Change the z order
				this.core.draw.changeZorder(this.parent, this.zIndex, value);
			},
			get zIndex () {
				return this.parent && this.parent.children.indexOf(this);
			},
			get drawn () {
				return this.core.draw.isCleared ? false : this._.drawn;
			},
			set drawn (value) {
				this._.drawn = !!value;
			},
			
			// Method for binding an event to the object
			bind: function (types, handler) {
				this.core.events.bind(this, types.split(" "), handler);
				
				return this;
			},
			
			// Method for unbinding an event from the object
			unbind: function (types, handler) {
				this.core.events.unbind(this, types.split(" "), handler);
				
				return this;
			},
			
			// Method for triggering all events added to the object
			trigger: function (types) {
				this.core.events.triggerHandlers(this, types.split(" "));
				
				return this;
			},
			
			// Method for adding the object to the canvas
			add: function (redraw) {
				if (!this.added) {

					// Redraw by default, but leave it to the user to decide
					redraw = redraw !== undefined ? redraw : true;
				
					// Add this object
					this.core.children.push(this);
					this.added = true;
					this.parent = this.core;

					// Add it to a global list of all objects. Deprecated list, will be removed soon.
					this.core.draw.objects.push(this);
					
					// Redraw the canvas with the new object
					if (redraw) {
						this.core.draw.redraw();
					}
				}
				
				return this;
			},
			
			// Method for removing the object from the canvas
			remove: function (redraw) {

				// Redraw by default, but leave it to the user to decide
				redraw = redraw !== undefined ? redraw : true;

				// Get the index for this object within the parent's child list
				var index = this.parent.children.indexOf(this);
				if (~index) {
					this.parent.children.splice(index, 1);
					this.parent = undefined;
					this.added = false;
					this.drawn = false;

					// Remove it from a global list of all objects. Deprecated list, will be removed soon.
					var index2 = this.core.draw.objects.indexOf(this);
					if (~index2) {
						this.core.draw.objects.splice(i, 1);
					}

					// Set draw state for children of this object
					var objects = this.children;
					for (var i = 0, l = objects.length; i < l; i++) {
						objects[i].drawn = false;
						index2 = this.core.draw.objects.indexOf(objects[i]);
						if (~index2) {
							this.core.draw.objects.splice(index2, 1);
						}
					}

					// Redraw the canvas to actually remove the object
					if (redraw) {
						this.core.draw.redraw();
					}
				}
				
				return this;
			},
			
			// Method for drawing the shape
			draw: function () {
				
			},
			
			// Method for redrawing the canvas
			redraw: function () {
				this.core.draw.redraw();
				
				return this;
			},
			
			// Method for rotating the object
			rotate: function (angle) {
				this.rotation += angle;
				
				return this;
			},
			
			// Method for rotating to a specific angle
			rotateTo: function (angle) {
				this.rotation = angle;
				
				return this;
			},
			
			// Method for getting x/y arguments, with the ability to choose only one
			// Used by other methods
			//   Examples:
			//     obj.move(50, 100); // moves object 50px to the right and 100px down
			//     obj.move(50, "x"); // moves object 50px to the right
			//     obj.move(50); // moves object 50px to the right and down
			getArgs: function (x, y, default_x, default_y) {
				default_x = default_x || 0;
				default_y = default_y || 0;
				
				// Second argument is string 
				if (typeof y === "string") {
					var type = y,
						val = x;
					x = (type === "x") ? val : default_x;
					y = (type === "y") ? val : default_y;
				}
				else if (y === undefined) {
					y = x;
				}
				
				return {
					x: x,
					y: y
				};
			},
			
			// Method for moving the object
			move: function (x, y) {
				var change = this.getArgs(x, y);
				this.x += change.x;
				this.y += change.y;
				
				return this;
			},
			
			// Method for moving to a specific position
			moveTo: function (x, y) {
				var pos = this.getArgs(x, y, this.x, this.y);
				this.x = pos.x;
				this.y = pos.y;
				
				return this;
			},
			
			// Method for scaling the object
			scale: function (x, y) {
				var scaling = this.getArgs(x, y, 1, 1);
				this.scalingX = scaling.x;
				this.scalingY = scaling.y;
				
				return this;
			},
			
			// Method for scaling to a specific size
			scaleTo: function (width, height) {
				var currentWidth = (this.shapeType === "rectangular" ? this.width : this.radius),
					currentHeight = (this.shapeType === "rectangular" ? this.height : this.radius),
					size = this.getArgs(width, height, currentWidth, currentHeight);
					
				// Don't let the size be 0, because the native scale method doesn't support zero values
				size.x = size.x <= 0 ? 1 : size.x;
				size.y = size.y <= 0 ? 1 : size.y;
				
				// Set the scaling
				this.scalingX = size.x / currentWidth;
				this.scalingX = size.y / currentHeight;
				
				return this;
			},
			
			// Method for animating any numeric property
			animate: function () {
				this.core.animation.animate(this, arguments);
				
				return this;
			},
			
			// Method for clearing the object's animation queue and stop the animations
			stop: function () {
				this.core.animation.stop(this.id);
				
				return this;
			},

			// Method for clearing the animation queue and setting all final values
			finish: function () {
				this.core.animation.finish(this.id);

				return this;
			},
			
			// Method for changing the opacity property to 1 as an animation
			fadeIn: function () {
				var args = Array.prototype.slice.call(arguments);
				this.core.animation.animate(this, [{ opacity: 1 }].concat(args));
				
				return this;
			},
			
			// Method for changing the opacity property to 0 as an animation
			fadeOut: function () {
				var args = Array.prototype.slice.call(arguments);
				this.core.animation.animate(this, [{ opacity: 0 }].concat(args));
				
				return this;
			},
			
			// Method for changing the opacity property to a custom value as an animation
			fadeTo: function () {
				var args = Array.prototype.slice.call(arguments);
				this.core.animation.animate(this, [{ opacity: args.splice(0, 1)[0] }].concat(args));
				
				return this;
			},
			
			// Method for making drag and drop easier
			dragAndDrop: function (options) {
			
				options = (options === undefined) ? {} : options;
			
				// If false is passed as argument, remove all event handlers
				if (options === false && this.draggable === true) {
					this.draggable = false;
					
					this.unbind("mousedown touchstart", this._.drag_start)
					this.core.unbind("mouseup touchend", this._.drag_end);
					this.core.unbind("mousemove touchmove", this._.drag_move);
				}
				
				// Otherwise add event handlers, unless they have been added before
				else if (!this.draggable) {
				
					this.draggable = true;
					this.dragging = false;
				
					var _this = this,
						offset = { x: 0, y: 0 },
						startPos = { x: 0, y: 0 },
						start = { x: 0, y: 0 };
					
					this._.drag_start = function (e) {

						// Stop bubbling if specified
						if (options.bubble === false) {
							e.stopPropagation();
						}

						this.dragging = true;
						
						// Get the difference between pointer position and object position
						offset.x = e.x - this.x;
						offset.y = e.y - this.y;
						startPos.x = this.x;
						startPos.y = this.y;
						start = _this.core.tools.transformPointerPosition(_this, _this.abs_x, _this.abs_y, _this.rotation);

						// Change Z index if specified
						if (options.changeZindex === true) {
							this.zIndex = "front";
						}
						
						// Run user callback
						if (typeof options.start === "function") {
							options.start.call(this);
						}
						
						// Redraw the canvas if the timeline is not running
						if (!this.core.timeline.running) {
							this.core.draw.redraw();
						}
					};
					
					this._.drag_end = function (e) {
						if (_this.dragging) {

							// Stop bubbling if specified
							if (options.bubble === false) {
								e.stopPropagation();
							}

							_this.dragging = false;
							
							// Run user callback
							if (typeof options.end === "function") {
								options.end.call(_this);
							}
							
							// Redraw the canvas if the timeline is not running
							if (!_this.core.timeline.running) {
								_this.core.draw.redraw();
							}
						}
					};
					
					this._.drag_move = function (e) {
						if (_this.dragging) {

							// Stop bubbling if specified
							if (options.bubble === false) {
								e.stopPropagation();
							}
						
							var end = _this.core.tools.transformPointerPosition(_this, _this.abs_x, _this.abs_y, _this.rotation);

							_this.x = startPos.x + end.x - start.x;
							_this.y = startPos.y + end.y - start.y;
							
							// Run user callback
							if (typeof options.move === "function") {
								options.move.call(_this);
							}
							
							// Redraw the canvas if the timeline is not running
							if (!_this.core.timeline.running) {
								_this.core.draw.redraw();
							}
						}
					};
					
					// Bind event handlers
					this.bind("mousedown touchstart", this._.drag_start)
					this.core.bind("mouseup touchend", this._.drag_end);
					this.core.bind("mousemove touchmove", this._.drag_move);
				}
				
				return this;
			},
			
			// Method for setting the origin coordinates
			// Accepts pixel values or the following keywords:
			//     x: left | center | right
			//     y: top | center | bottom
			setOrigin: function (x, y) {
				this.origin.x = x;
				this.origin.y = y;
				
				return this;
			},
			
			// Method for getting the current origin coordinates in pixels
			getOrigin: function () {
				var x, y,
					origin = this.origin,
					shapeType = this.shapeType;
				
				// Get X coordinate in pixels
				if (origin.x === "center") {
					x = (shapeType === "rectangular") ? this.width / 2 : 0;
				} else if (origin.x === "right") {
					x = (shapeType === "rectangular") ? this.width : this.radius;
				} else if (origin.x === "left") {
					x = (shapeType === "rectangular") ? 0 : -this.radius;
				} else {
					x = !isNaN(parseFloat(origin.x)) ? parseFloat(origin.x) : 0;
				}
				
				// Get Y coordinate in pixels
				if (origin.y === "center") {
					y = (shapeType === "rectangular") ? this.height / 2 : 0;
				} else if (origin.y === "bottom") {
					y = (shapeType === "rectangular") ? this.height : this.radius;
				} else if (origin.y === "top") {
					y = (shapeType === "rectangular") ? 0 : -this.radius;
				} else {
					y = !isNaN(parseFloat(origin.y)) ? parseFloat(origin.y) : 0;
				}
				
				// Return pixel coordinates
				return {
					x: x,
					y: y
				};
			},
			
			// Method for adding a child to the display object
			// Children will transform accordingly when this display object transforms
			addChild: function (childObj, returnIndex) {
			
				// Check if the child object doesn't already have a parent
				if (childObj.parent === undefined) {
				
					// Add the object as a child
					var index = this.children.push(childObj) - 1;
					
					// Update child
					childObj.parent = this;
					childObj.x += 0;
					childObj.y += 0;

					// Add it to a global list of all objects. Deprecated list, will be removed soon.
					this.core.draw.objects.push(childObj);
					
					// Redraw the canvas if this object is drawn, to show the new child object
					if (this.drawn) {
						this.core.draw.redraw();
					}
					
					if (returnIndex) {
						return index;
					}
				} else if (returnIndex) {
					return false;
				}
				
				// Return the object itself if user chose to not get the index in return
				return this;
			},
			
			// Method for removing a child
			removeChild: function (childObj) {
				var index = this.children.indexOf(childObj);
				if (~index) {
					this.removeChildAt(index);
				}
				
				return this;
			},
			
			// Method for removing a child at a specific index
			removeChildAt: function (index) {
				if (this.children[index] !== undefined) {
					this.children[index].remove();
				}
				
				return this;
			},
			
			// Method for creating a clone of this object
			clone: function (settings) {
				settings = settings || {};
				settings.drawn = false;
				var newObj = this.core.display[this.type](settings),
					this_filtered = {},
					reject = ["core", "events", "children", "parent", "img", "fill", "strokeColor"],
					loopObject, x, stroke, i, children, child, dX, dY, descriptor;
				
				// Filter out the setter and getter methods, and also properties listed above
				loopObject = function (obj, destination) {
					for (x in obj) {
						if (~reject.indexOf(x)) {
							continue;
						}
						if (typeof obj[x] === "object") {
							destination[x] = (obj[x].constructor === Array) ? [] : {};
							loopObject(obj[x], destination[x]);
							continue;
						}
						descriptor = Object.getOwnPropertyDescriptor(obj, x);
						if (descriptor && descriptor.get === undefined) {
							destination[x] = obj[x];
						}
					}
				}
				loopObject(this, this_filtered);
				
				// Fix gradients and patterns
				this_filtered.fill = this._.fill;
				stroke = this.core.style.getStroke(this.stroke);
				this_filtered.strokeColor = stroke.color;
				
				// Extend the new object with this object's properties and then apply the custom settings
				newObj = oCanvas.extend(newObj, this_filtered, settings);
				newObj.id = ++this.core.lastObjectID;
				
				if (typeof newObj.init === "function") {
					newObj.init();
				}
				
				// Add children to the new clone
				children = this.children;
				if (children.length > 0) {
					for (i = 0; i < children.length; i++) {
						child = children[i].clone();
						newObj.children.push(child);
						child.parent = newObj;
						if (settings.x) {
							dX = Math.abs(children[i].abs_x - this.x);
							child.x = dX;
						}
						if (settings.y) {
							dY = Math.abs(children[i].abs_y - this.y);
							child.y = dY;
						}
					}
				}
				
				return newObj;
			},
			
			// Method for checking if the pointer is inside the object
			isPointerInside: function (pointer) {
				return this.core.tools.isPointerInside(this, pointer);
			}
		};
	},
	
	// Method for registering a custom display object at run time
	// It is only attached to the current core instance
	register = function (name, properties, draw, init) {
		var display = this,
			core = this.core,
			
			// The object that will be instantiated
			obj = function (settings, thecore) {
			
				// Return an object containing base properties, core access and a draw wrapper
				// The object is extended with properties set on register, and settings set on instantiation
				return oCanvas.extend({
					core: thecore,
					type: name,
					shapeType: "rectangular",
					
					// Wrapper for the draw method. This enables the callback to work internally and gives the user
					// access to the canvas context and the core
					draw: function () {
						draw.call(this, core.canvas, core);

						return this;
					}
				}, properties, settings);
			};
		
		// Add the constructor function to core.display.name
		this[name] = function (settings) {
		
			// Instantiate a new custom object with specified settings
			var retObj = oCanvas.extend(Object.create(displayObject()), new obj(settings, core));
			
			// Run initialization method if provided
			if (init !== undefined && typeof display[name][init] === "function") {
				display[name][init]();
			}
			
			// Return the new object
			return retObj;
		};
		
		return display;
	};
	
	// Register the module
	oCanvas.registerModule("displayObject", displayObject);
	
	// Second namespace where objects gets placed
	oCanvas.registerModule("display", { wrapper: true, register: register });
	
	
	
	// Add method to oCanvas to enable display objects to be added
	oCanvas.registerDisplayObject = function (name, obj, init) {
	
		// Register the object as a submodule to display
		oCanvas.registerModule("display."+name, {
		
			// Method for getting the core instance
			setCore: function (thecore) {
			
				// Method that core.display.objectname will refer to
				return function (settings) {
				
					// Create a new object that inherits from displayObject
					var retObj = oCanvas.extend(Object.create(displayObject()), new obj(settings, thecore));
					retObj.type = name;
					retObj.id = ++thecore.lastObjectID;
					
					// Trigger an init method if specified
					if (init !== undefined) {
						retObj[init]();
					}
					
					// Return the new object
					return retObj;
				};
			}
		});
	};

})(oCanvas, window, document);
