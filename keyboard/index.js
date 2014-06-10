/**
 * @module ocanvas/keyboard
 */
'use strict';

var controller = require('./private/controller');
var keys = require('./private/keys');

var enabledCanvases = [];
var handlers = [];

/**
 * Enable keyboard events for a canvas.
 *
 * @param {module:ocanvas/classes/Canvas~Canvas} canvas A Canvas instance.
 */
exports.enableForCanvas = function(canvas) {

  // Prevent registration multiple times
  var index = enabledCanvases.indexOf(canvas);
  if (index > -1) return;

  var element = canvas.element;
  var handler = function(event) {
    controller.handleEvent(event, canvas);
  };

  enabledCanvases.push(canvas);
  handlers.push(handler);

  // Tab index needs to be set to a positive value to be able to navigate to it
  // with the keyboard. A tab index needs to be explicitly set to be able to
  // receive keyboard events on the element, so even setting it to the default
  // value will turn on the keyboard events (however, we want 0 in this case,
  // to include the element in the tab order).
  if (element.tabIndex === -1) {
    element.tabIndex = 0;
  }

  element.addEventListener('keydown', handler, false);
  element.addEventListener('keyup', handler, false);
  element.addEventListener('blur', handler, false);
};

/**
 * Disable keyboard events for a canvas.
 *
 * @param {module:ocanvas/classes/Canvas~Canvas} canvas A Canvas instance.
 */
exports.disableForCanvas = function(canvas) {

  // Can't disable a canvas that's not been enabled
  var index = enabledCanvases.indexOf(canvas);
  if (index === -1) return;

  var element = canvas.element;
  var handler = handlers[index];

  enabledCanvases.splice(index, 1);
  handlers.splice(index, 1);

  element.removeEventListener('keydown', handler, false);
  element.removeEventListener('keyup', handler, false);
  element.removeEventListener('blur', handler, false);
};

/**
 * Get the currently pressed down keys for a canvas.
 *
 * @return {Object} Object with two array properties: `codes` and `keys`.
 */
exports.getPressedKeys = function() {
  var codes = [];
  var keyNames = [];

  var pressed = controller.pressedKeys;
  for (var keyCode in pressed) {
    codes.push(parseInt(keyCode, 10));
    keyNames.push(keys.getKeyString(pressed[keyCode]));
  }

  return {
    codes: codes,
    keys: keyNames
  };
};
