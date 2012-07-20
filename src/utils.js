(function(oCanvas, window, document, undefined){

	// Define Object.create if not available
	if (typeof Object.create !== "function") {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}

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
			last = args[args.length - 1],
			destination = args.splice(0, 1)[0],
			current = args.splice(0, 1)[0],
			x, exclude = [],
			descriptor;
		
		// If the last object is an exclude object, get the properties
		if (last.exclude && (JSON.stringify(last) === JSON.stringify({exclude:last.exclude}))) {
			exclude = last.exclude;
		}
		
		// Do the loop unless this object is an exclude object
		if (current !== last || exclude.length === 0) {
			
			// Add members from second object to the first
			for (x in current) {
			
				// Exclude specified properties
				if (~exclude.indexOf(x)) {
					continue;
				}
				
				descriptor = Object.getOwnPropertyDescriptor(current, x);
				
				if (descriptor.get || descriptor.set) {
					Object.defineProperty(destination, x, descriptor);
				} else {
					destination[x] = current[x];
				}
			}
		}
		
		// If there are more objects passed in, run once more, otherwise return the first object
		if (args.length > 0) {
			return oCanvas.extend.apply(this, [destination].concat(args));
		} else {
			return destination;
		}
	};

	oCanvas.addDOMEventHandler = function (core, domObject, eventName, handler, useCapture) {
		core.domEventHandlers.push({
			obj: domObject,
			event: eventName,
			handler: handler,
			useCapture: !!useCapture
		});
		domObject.addEventListener(eventName, handler, useCapture);
	};

	oCanvas.removeDOMEventHandler = function (core, index) {
		var data = core.domEventHandlers[index];
		data.obj.removeEventListener(data.event, data.handler, data.useCapture);
	};

})(oCanvas, window, document);
