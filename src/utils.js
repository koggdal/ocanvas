(function(oCanvas, core, window, document, undefined){

	// Extend an object with new properties and replace values for existing properties
	core.prototype.extend = function (settings, options) {
		for (var x in options) {
			settings[x] = options[x];
		}
	};

})(oCanvas, oCanvas.core, window, document);