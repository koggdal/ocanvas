(function(oCanvas, window, document, undefined){

	// Define the class
	var line = function (settings, thecore) {
		
		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,
			
			type: "line",
			shapeType: "radial",
			
			// Properties
			_: {
				start_x: 0,
				start_y: 0,
				end_x: 0,
				end_y: 0,
				x: 200,
				y: 0,
				abs_x: 0,
				abs_y: 0
			},
			children: [],
			
			// Getters and setters
			set start (values) {
				this._.start_x = values.x;
				this._.start_y = values.y;
				this.setPosition();
			},
			set end (values) {
				this._.end_x = values.x;
				this._.end_y = values.y;
				this.setPosition();
			},
			get start () {
				return { x: this._.start_x, y: this._.start_y };
			},
			get end () {
				return { x: this._.end_x, y: this._.end_y };
			},
			
			// Overwrite the setters that displayObject provides, to enable start/end coordinates to affect the position
			set x (value) {
				// Get delta length
				var diff = this._.end_x - this._.start_x;
				
				// Assign new x positions for the object
				this._.x = value;
				this._.abs_x = value + ((this.parent !== undefined) ? this.parent.abs_x : 0);
				
				// Assign new x positions for start and end points
				this._.start_x = value - (diff / 2) + (this._.abs_x - this._.x);
				this._.end_x = value + (diff / 2) + (this._.abs_x - this._.x);
				
				// Update children
				var objects = this.children,
					l = objects.length, i;
				for (i = 0; i < l; i++) {
					objects[i]._.abs_x = this.abs_x + objects[i].x;
					objects[i].x += 0;
				}
			},
			set y (value) {
				// Get delta length
				var diff = this._.end_y - this._.start_y;
				
				// Assign new y positions for the object
				this._.y = value;
				this._.abs_y = value + ((this.parent !== undefined) ? this.parent.abs_y : 0);
				
				// Assign new y positions for start and end points
				this._.start_y = value - (diff / 2) + (this._.abs_y - this._.y);
				this._.end_y = value + (diff / 2) + (this._.abs_y - this._.y);
				
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
			
			// Method for setting x/y coordinates (which will set abs_x/abs_y as specified by displayObject)
			setPosition: function () {
				if (this.initialized) {
					this.x = this._.start_x + (this._.end_x - this._.start_x) / 2;
					this.y = this._.start_y + (this._.end_y - this._.start_y) / 2;
				}
			},
			
			// Method for initializing the dimensions
			init: function () {
				this.initialized = true;
				this.setPosition();
			},
			
			draw: function (cb) {
				var canvas = this.core.canvas;
				
				canvas.lineWidth = this.strokeWeight;
				canvas.strokeStyle = this.strokeColor;
				canvas.beginPath();
				canvas.moveTo(this.start.x, this.start.y);
				canvas.lineTo(this.end.x, this.end.y);
				canvas.stroke();
				canvas.closePath();
				
				if (cb) {
					cb.call(this);
				}
				return this;
			}
			
		}, settings);
	};
	
	// Register the display object
	oCanvas.registerDisplayObject("line", line, "init");
	
})(oCanvas, window, document);