(function(oCanvas, window, document, undefined){

	// Define Object.create if not available
	if (typeof Object.create !== "function") {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
	
	// Method for reversing the order of an object's properties
	oCanvas.reverseObject = function (obj) {
	
		// Cancel without errors if the passed variable is not an object
		if (typeof obj !== "object") {
			return obj;
		}
		
		// Vars
		var temp_array = [],
			new_object = {},
			p, i, l;
		
		// Add all properties of the object to a temporary array
		for (p in obj) {
			temp_array.push([p, obj[p]]);
		}
		
		// Arrays can be reversed
		temp_array.reverse();
		l = temp_array.length;
		
		// Remove and re-add all properties in the original object, but now in reverse order
		for (i = 0; i < l; i++) {
			delete obj[temp_array[i][0]];
			obj[temp_array[i][0]] = temp_array[i][1];
		}
		
		// Return reference to the object
		return obj;
	};

	// usage: log('inside coolFunc',this,arguments);
	// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	window.log = function () {
		log.history = log.history || [];	// store logs to an array for reference
		log.history.push(arguments);
		if (this.console) {
			var i, args = Array.prototype.slice.call(arguments), l = args.length;
			for (i = 0; i < l; i++) {
				console.log(args[i]);
			}
		}
	};

	// Extend an object with new properties and replace values for existing properties
	oCanvas.extend = function () {
	
		// Get first two args
		var args = Array.prototype.slice.call(arguments),
			destination = args.splice(0, 1)[0],
			current = args.splice(0, 1)[0],
			x, getter, setter;
		
		// Add members from second object to the first
		for (x in current) {
			getter = current.__lookupGetter__(x);
			setter = current.__lookupSetter__(x);
			
			if (getter || setter) {
				if (getter) {
					destination.__defineGetter__(x, getter);
				}
				if (setter) {
					destination.__defineSetter__(x, setter);
				}
			} else {
				destination[x] = current[x];
			}
		}
		
		// If there are more objects passed in, run once more, otherwise return the first object
		if (args.length > 0) {
			return oCanvas.extend.apply(this, [destination].concat(args));
		} else {
			return destination;
		}
	};

})(oCanvas, window, document);