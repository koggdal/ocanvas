(function(oCanvas, window, document, undefined){

	// Define the class
	var line = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			shapeType: "radial",
			
			// Properties
			_: oCanvas.extend({}, thecore.displayObject._, {
				start_x: 0,
				start_y: 0,
				end_x: 0,
				end_y: 0,
				x: 0,
				y: 0,
				abs_x: 0,
				abs_y: 0
			}),
			children: [],
			
			// Getters and setters
			set start (values) {
				this._.start_x = values.x + (this.parent && !this.parent.isCore ? this.parent._.abs_x : 0);
				this._.start_y = values.y + (this.parent && !this.parent.isCore ? this.parent._.abs_y : 0);
				this.setPosition();
			},
			set end (values) {
				this._.end_x = values.x + (this.parent && !this.parent.isCore ? this.parent._.abs_x : 0);
				this._.end_y = values.y + (this.parent && !this.parent.isCore ? this.parent._.abs_y : 0);
				this.setPosition();
			},
			get start () {
				var offset = { x: 0, y: 0 };
				if (this.parent && !this.parent.isCore) {
					offset.x = this.parent._.abs_x;
					offset.y = this.parent._.abs_y;
				}
				var self = this;
				return {
					get x () { return self._.start_x - offset.x; },
					get y () { return self._.start_y - offset.y; },
					set x (value) {
						self._.start_x = value + (self.parent && !self.parent.isCore ? self.parent._.abs_x : 0);
						self.setPosition();
					},
					set y (value) {
						self._.start_y = value + (self.parent && !self.parent.isCore ? self.parent._.abs_y : 0);
						self.setPosition();
					}
				};
			},
			get end () {
				var offset = { x: 0, y: 0 };
				if (this.parent && !this.parent.isCore) {
					offset.x = this.parent._.abs_x;
					offset.y = this.parent._.abs_y;
				}
				var self = this;
				return {
					get x () { return self._.end_x - offset.x; },
					get y () { return self._.end_y - offset.y; },
					set x (value) {
						self._.end_x = value + (self.parent && !self.parent.isCore ? self.parent._.abs_x : 0);
						self.setPosition();
					},
					set y (value) {
						self._.end_y = value + (self.parent && !self.parent.isCore ? self.parent._.abs_y : 0);
						self.setPosition();
					}
				};
			},
			
			// Overwrite the setters that displayObject provides, to enable start/end coordinates to affect the position
			set x (value) {
				var diff, offsetX, objects, l, i;

				// Get delta length
				diff = this._.end_x - this._.start_x;

				// Get parent offset
				offsetX = this.parent && !this.parent.isCore ? this.parent._.abs_x : 0;
				
				// Assign new x positions for the object
				this._.x = value;
				this._.abs_x = value + offsetX;
				
				// Assign new x positions for start and end points
				this._.start_x = value - (diff / 2) + offsetX;
				this._.end_x = value + (diff / 2) + offsetX;
				
				// Update children
				objects = this.children;
				l = objects.length;
				for (i = 0; i < l; i++) {
					objects[i]._.abs_x = this.abs_x + objects[i].x;
					objects[i].x += 0;
				}
			},
			set y (value) {
				var diff, offsetY, objects, l, i;

				// Get delta length
				diff = this._.end_y - this._.start_y,
				
				// Get parent offset
				offsetY = this.parent && !this.parent.isCore ? this.parent._.abs_y : 0;
				
				// Assign new y positions for the object
				this._.y = value;
				this._.abs_y = value + offsetY;
				
				// Assign new y positions for start and end points
				this._.start_y = value - (diff / 2) + offsetY;
				this._.end_y = value + (diff / 2) + offsetY;
				
				// Update children
				objects = this.children;
				l = objects.length;
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
			
			set length (value) {
				var dX, dY, length, angle;
				
				// Find current length and angle
				dX = Math.abs(this._.end_x - this._.start_x);
				dY = Math.abs(this._.end_y - this._.start_y);
				length = Math.sqrt(dX * dX + dY * dY);
				angle = Math.asin(dX / length);
				
				// Calculate new values
				dX = Math.sin(angle) * value;
				dY = Math.cos(angle) * value;
				this._.end_x = this._.start_x + dX;
				this._.end_y = this._.start_y + dY;
				this.x += 0;
				this.y += 0;

				this.setPosition();
			},
			get length () {
				var dX, dY, length;
				
				dX = Math.abs(this._.end_x - this._.start_x);
				dY = Math.abs(this._.end_y - this._.start_y);
				length = Math.sqrt(dX * dX + dY * dY);
				
				return length;
			},
			
			set radius (value) {
				this.length = value * 2;
			},
			get radius () {
				return this.length / 2;
			},
			
			// Method for setting x/y coordinates (which will set abs_x/abs_y as specified by displayObject)
			setPosition: function () {
				var offset = { x: 0, y: 0 };
				if (this.parent && !this.parent.isCore) {
					offset.x = this.parent._.abs_x;
					offset.y = this.parent._.abs_y;
				}
				this.x = this._.start_x - offset.x + (this._.end_x - this._.start_x) / 2;
				this.y = this._.start_y - offset.y + (this._.end_y - this._.start_y) / 2;
			},
			
			// Method for initializing the dimensions
			init: function () {
				this.initialized = true;
				this.setPosition();
			},
			
			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					translation = this.core.draw.translation;
				
				
				canvas.lineWidth = this.strokeWidth;
				canvas.strokeStyle = this.strokeColor;
				canvas.beginPath();
				canvas.moveTo(this._.start_x - translation.x - origin.x, this._.start_y - translation.y - origin.y);
				canvas.lineTo(this._.end_x - translation.x - origin.x, this._.end_y - translation.y - origin.y);
				canvas.stroke();
				canvas.closePath();
				
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("line", line, "init");
	
})(oCanvas, window, document);
