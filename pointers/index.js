/**
 * @module ocanvas/pointers
 */
'use strict';

var normalizer = require('./private/normalizer');
var controller = require('./private/controller');

/**
 * Enable pointer events for a canvas.
 *
 * @param {module:ocanvas/classes/Canvas~Canvas} canvas A Canvas instance.
 */
exports.enableForCanvas = function(canvas) {
  normalizer.addListeners(canvas.element, function(type, event) {
    controller.handleEvent(type, event, canvas);
  });
};

/**
 * Disable pointer events for a canvas.
 *
 * @param {module:ocanvas/classes/Canvas~Canvas} canvas A Canvas instance.
 */
exports.disableForCanvas = function(canvas) {
  normalizer.removeListeners(canvas.element);
};
