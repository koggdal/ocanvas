/**
 * @module ocanvas/keyboard/KeyboardEvent
 */
'use strict';

var inherit = require('../utils/inherit');
var ObjectEvent = require('../classes/ObjectEvent');

/**
 * @classdesc Keyboard event object for a canvas.
 *
 * @property {number} keyCode The numeric representation of the key.
 * @property {string} key The string representation of the key. The value is one
 *     of the valid values from the DOM Level 3 Events specification:
 *     https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-key.html
 * @property {?Event} originalEvent A reference to the original DOM event where
 *     the event originated from. This can be null.
 *
 * @constructor
 * @augments {module:ocanvas/classes/ObjectEvent~ObjectEvent}
 *
 * @param {Object=} opt_properties Optional properties to set on the object.
 */
function KeyboardEvent(opt_properties) {
  ObjectEvent.call(this, opt_properties);

  if (!this.hasOwnProperty('keyCode')) this.keyCode = 0;
  if (!this.hasOwnProperty('key')) this.key = '';
  if (!this.hasOwnProperty('originalEvent')) this.originalEvent = null;
}
inherit(KeyboardEvent, ObjectEvent);

/**
 * Prevent the default action of the event. oCanvas events have no default
 * action, but this will prevent any default action in the DOM event.
 */
KeyboardEvent.prototype.preventDefault = function() {
  if (this.originalEvent && this.originalEvent.preventDefault) {
    this.originalEvent.preventDefault();
  }
};

/**
 * oCanvas keyboard event types.
 *
 * @type {Object}
 */
KeyboardEvent.TYPES = {
  'keydown': {},
  'keyup': {},
  'keypress': {}
};

module.exports = KeyboardEvent;
