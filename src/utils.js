(function(oCanvas, window, document, undefined){

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
	oCanvas.extend = function (settings, options) {
		for (var x in options) {
			settings[x] = options[x];
		}
		
		return settings;
	};

})(oCanvas, window, document);