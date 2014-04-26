/**
 * @module ocanvas/classes/PointerEvent
 */
'use strict';

var inherit = require('../utils/inherit');
var ObjectEvent = require('./ObjectEvent');

/**
 * @classdesc Pointer event object for canvas objects.
 *
 * @property {number} targetPointerCount The number of pointers that are
 *     currently active on the target object.
 * @property {Object} position Object for pointer coordinates. This object has
 *     coordinate objects for different coordinate spaces: `canvasElement` (CSS
 *     pixels), `canvas` (canvas pixels), `world` (relative to the world, no
 *     matter the camera rotation) and `target` (relative to the target object,
 *     no matter the transformations of all objects).
 * @property {Object} buttons Object containing flags for whether different
 *     pointer device buttons are pressed. It has the boolean properties
 *     `primary`, `secondary`, `auxiliary`, `extra1`, `extra2`, `extra3`.
 *     It also has a counter called `count` to let you know how many buttons
 *     are pressed.
 * @property {Object} keys Object containing flags for whether different
 *     modifier keys are pressed. It has the boolean properties `ctrl`, `alt`,
 *     `shift`, `meta`. It also has a counter called `count` to let you know
 *     how many keys are pressed.
 *
 * @constructor
 *
 * @param {Object|string} opt_properties Optional properties to set on the
 *     object. If this is a string, it will be used as the event type.
 */
function PointerEvent(opt_properties) {
  var properties = opt_properties || {};
  var type = properties;
  if (typeof properties === 'string') {
    properties = {};
  } else {
    type = properties.type;
  }
  ObjectEvent.call(this, type);

  this.position = properties.position || {
    element: {x: 0, y: 0},
    canvas: {x: 0, y: 0},
    world: {x: 0, y: 0},
    target: {x: 0, y: 0}
  };

  this.buttons = properties.buttons || {
    primary: false,
    secondary: false,
    auxiliary: false,
    extra1: false,
    extra2: false,
    extra3: false,
    count: 0
  };

  this.keys = properties.keys || {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    count: 0
  };

  this.targetPointerCount = properties.targetPointerCount || 0;

  if ('bubbles' in properties) {
    this.bubbles = properties.bubbles;
  } else if (this.type && PointerEvent.TYPES[this.type]) {
    this.bubbles = PointerEvent.TYPES[this.type].bubbles;
  }
}
inherit(PointerEvent, ObjectEvent);

PointerEvent.TYPES = {
  'pointerdown': {bubbles: true},
  'pointerup': {bubbles: true},
  'pointermove': {bubbles: true},
  'pointerdownmove': {bubbles: true},
  'pointerenter': {bubbles: false},
  'pointerleave': {bubbles: false},
  'pointerclick': {bubbles: true}
};

module.exports = PointerEvent;
