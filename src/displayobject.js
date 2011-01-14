(function(oCanvas, window, document, undefined){

	// Define the class
	var displayObject = function () {
		
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
			drawn: false,
			events: {},
			
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
			}
		};
	};

	// Register the module
	oCanvas.registerModule("displayObject", displayObject);

})(oCanvas, window, document);