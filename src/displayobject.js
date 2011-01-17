(function(oCanvas, window, document, undefined){

	// Define the class
	var displayObject = function () {
	
		// Method for setting a stroke property. Updates both obj.stroke and obj.property
		var setStrokeProperty = function (_this, property, value, objectProperty, thecore) {
			var stroke = thecore.style.getStroke(_this.stroke);
			stroke[property] = value;
			_this._.stroke = thecore.style.getStroke(stroke, "string");
			_this._[objectProperty] = value;
		};
		
		// Return an object when instantiated
		return {
			// Method used by oCanvas to give this object access to the current instance of the core object
			setCore: function (thecore) {
				this.core = thecore;
			},

			// Properties
			id: 0,
			type: "rectangular",
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			origin: {
				x: 0,
				y: 0
			},
			rotation: 0,
			fill: "",
			drawn: false,
			events: {},
			children: [],
			
			_: {
				stroke: "",
				strokeColor: "",
				strokeWeight: 0,
				strokePosition: "outside"
			},
			
			// Setter for stroke color
			set strokeColor (color) {
				setStrokeProperty(this, "color", color, "strokeColor", this.core);
			},
			
			// Setter for stroke weight
			set strokeWeight (weight) {
				setStrokeProperty(this, "weight", weight, "strokeWeight", this.core);
			},
			
			// Setter for stroke position
			set strokePosition (pos) {
				setStrokeProperty(this, "pos", pos, "strokePosition", this.core);
			},
			
			// Setter for stroke
			set stroke (value) {
			
				// Convert the value to a correct string if it is not a string
				if (typeof value !== "string") {
					value = this.core.style.getStroke(value, "string");
				}
				
				// Get stroke object and set styles
				var stroke = this.core.style.getStroke(value);
				this._.strokeColor = stroke.color;
				this._.strokeWeight = stroke.weight;
				this._.strokePosition = stroke.pos;
				this._.stroke = value;
			},
			
			// Getter for stroke
			get stroke () {
				return this._.stroke;
			},
			
			// Getter for stroke color
			get strokeColor () {
				return this._.strokeColor;
			},
			
			// Getter for stroke weight
			get strokeWeight () {
				return this._.strokeWeight;
			},
			
			// Getter for stroke position
			get strokePosition () {
				return this._.strokePosition;
			},
			
			// Method for binding an event to the object
			bind: function (type, handler) {
				this.core.events.bind(this, type, handler);
				
				return this;
			},
			
			// Method for unbinding an event from the object
			unbind: function (type, handler) {
				this.core.events.unbind(this, type, handler);
				
				return this;
			},
			
			// Method for adding the object to the canvas
			add: function () {
				if (this.drawn === false) {
					this.id = this.core.draw.add(this);
					this.draw();
					this.drawn = true;
				}
				
				return this;
			},
			
			// Method for removing the object from the canvas
			remove: function () {
				this.core.draw.remove(this.id);
				this.drawn = false;
				
				return this;
			},
			
			// Method for drawing the shape
			draw: function () {
				
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
				var scale = this.getArgs(x, y, 1, 1);
				this.width *= scale.x;
				this.height *= scale.y;
				
				return this;
			},
			
			// Method for scaling to a specific size
			scaleTo: function (width, height) {
				var size = this.getArgs(width, height, this.width, this.height)
				this.width = size.x;
				this.height = size.y;
				
				return this;
			},
			
			// Method for getting the current origin coordinates
			getOrigin: function () {
				var oX, oY;
				
				// Get x position
				if (this.origin.x === "center") {
					oX = this.width / 2;
				} else {
					oX = this.origin.x;
				}
				
				// Get y position
				if (this.origin.y === "center") {
					oY = this.height / 2;
				} else {
					oY = this.origin.y;
				}
				
				// Return the coordinates
				return {
					x: oX,
					y: oY
				};
			},
			
			setOrigin: function (x, y, global) {
			
				// Update x/y variables if assigned x/y are relative to the top left corner of the canvas
				if (global === true) {
					x -= this.x - this.origin.x;
					y -= this.y - this.origin.y;
				}
				
				// Get the old origin and Update the origin property
				var oldOrigin = this.getOrigin();
				this.origin.x = x;
				this.origin.y = y;
				
				// Get values of x/y if they are set to "center"
				if (x === "center") {
					x = this.width / 2;
				}
				if (y === "center") {
					y = this.height / 2;
				}
				
				if(x > 0 || y > 0){
					var d = Math.sqrt(x*x+y*y),
						angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
						changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
						changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
						oldSX = this.x-oldOrigin.x,
						oldSY = this.y-oldOrigin.y;
					
					this.x = oldSX+changeX;
					this.y = oldSY+changeY;
				}else{
					if(x < 0)
						this.x -= oldOrigin.x - x;
					else
						this.x -= oldOrigin.x;
					if(y < 0)
						this.y -= oldOrigin.y - y;
					else
						this.y -= oldOrigin.y;
				}
				
				return this;
			},
			
			// Method for adding a child to the display object
			// Children will transform accordingly when this display object transforms
			addChild: function (childObj) {
				// Return the index of the added object
				return this.children.push(childObj) - 1;
			},
			
			// Method for removing a child
			removeChild: function (childObj) {
				var index = this.children.indexOf(childObj);
				if (~index) {
					this.removeChildAt(index);
				}
			},
			
			// Method for removing a child at a specific index
			removeChildAt: function (index) {
				if (this.children[index] !== undefined) {
					this.children.splice(index, 1);
				}
			}
		};
	};
	
	// Register the module
	oCanvas.registerModule("displayObject", displayObject);
	
	// Second namespace where objects gets placed
	oCanvas.registerModule("display", { wrapper: true });
	
	
	
	// Add method to oCanvas to enable display objects to be added
	oCanvas.registerDisplayObject = function (name, obj, init) {
	
		// Register the object as a submodule to display
		oCanvas.registerModule("display."+name, {
		
			// Method for getting the core instance
			setCore: function (thecore) {
			
				// Method that core.display.rectangle() will call
				return function (settings) {
				
					// Create a new rectangle object that inherits from displayObject
					var retObj = oCanvas.extend(Object.create(displayObject()), new obj(settings, thecore));
					
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