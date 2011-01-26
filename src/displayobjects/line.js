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
				end_y: 0
			},
			
			// Getters and setters
			set start (values) {
				this._.start_x = values.x;
				this._.start_y = values.y;
			},
			
			set end (values) {
				this._.end_x = values.x;
				this._.end_y = values.y;
			},
			
			get start () {
				return { x: this._.start_x, y: this._.start_y };
			},
			
			get end () {
				return { x: this._.end_x, y: this._.end_y };
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
	oCanvas.registerDisplayObject("line", line);
	
})(oCanvas, window, document);