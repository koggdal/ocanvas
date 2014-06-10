/**
 * @module ocanvas/classes/KeyboardEvent
 */
'use strict';

var inherit = require('../utils/inherit');
var ObjectEvent = require('./ObjectEvent');

/**
 * @classdesc Keyboard event object for a canvas.
 *
 * @property {number} keyCode The numeric representation of the key.
 * @property {string} key The string representation of the key. The value is one
 *     of the valid values from the DOM Level 3 Events specification:
 *     https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-key.html
 * @property {Event?} originalEvent A reference to the original DOM event where
 *     the event originated from. This can be null.
 *
 * @constructor
 * @augments {module:ocanvas/classes/ObjectEvent~ObjectEvent}
 *
 * @param {Object|string} opt_properties Optional properties to set on the
 *     object. If this is a string, it will be used as the event type.
 */
function KeyboardEvent(opt_properties) {
  var properties = opt_properties || {};
  var type = properties;
  if (typeof properties === 'string') {
    properties = {};
  } else {
    type = properties.type;
  }
  ObjectEvent.call(this, type);

  this.keyCode = 0;
  this.key = '';
  this.originalEvent = null;

  for (var prop in properties) {
    this[prop] = properties[prop];
  }
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
