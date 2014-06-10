/**
 * @module ocanvas/classes/ObjectEventEmitter
 */
'use strict';

var ObjectEvent = require('./ObjectEvent');

/**
 * @classdesc This emitter class can be used for canvas objects to handle the
 *     scene graph event system with event capturing and bubbling.
 *
 * @property {Object} listeners An object storing all added event listeners,
 *     organized in different arrays for each event type and event phase. This
 *     object has two properties `capture` and `bubble`, where both contain
 *     properties for each added event type, and the values are arrays of
 *     functions.
 *
 * @constructor
 */
function ObjectEventEmitter() {
  this.listeners = {
    capture: {},
    bubble: {}
  };
}

/**
 * Add a listener for an event.
 *
 * @param {string} name Event name.
 * @param {function} listener Listener function.
 * @param {boolean=} opt_useCapture If true, it will register for the capture
 *     event phase instead of the bubbling phase.
 */
ObjectEventEmitter.prototype.on = function(name, listener, opt_useCapture) {
  var listeners = this.listeners[opt_useCapture ? 'capture' : 'bubble'];

  if (!listeners[name]) listeners[name] = [];

  // Don't allow the same listener to be registered multiple times for the
  // same event name.
  if (listeners[name].indexOf(listener) > -1) return;

  listeners[name].push(listener);
};

/**
 * Remove a listener for an event.
 *
 * @param {string} name Event name.
 * @param {function} listener Listener function.
 * @param {boolean=} opt_useCapture This must match what the listener was
 *     registered for when calling on().
 */
ObjectEventEmitter.prototype.off = function(name, listener, opt_useCapture) {
  var listeners = this.listeners[opt_useCapture ? 'capture' : 'bubble'];

  listeners = listeners[name];
  if (listeners) {
    var index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  }
};

/**
 * Emit an event, which will invoke all the functions added for the event type.
 *
 * @param {string} name Event name.
 * @param {ObjectEvent=} opt_eventObject Object that gets sent to the listener
 *     function.
 * @param {Canvas=} opt_canvas Canvas instance.
 */
ObjectEventEmitter.prototype.emit = function(name, opt_eventObject, opt_canvas) {
  var event = opt_eventObject || new ObjectEvent();
  event.type = name;
  event.target = this;
  event.canvas = opt_canvas || null;

  var chain = getObjectChain(this, opt_canvas);

  runEventPhase(event, 'capture', chain);

  if (event.bubbles) {
    runEventPhase(event, 'bubble', chain);
  } else {
    runEventPhase(event, 'bubble', [this]);
  }

  event.phase = 'idle';
};

function getObjectChain(object, opt_canvas) {
  var chain = [object];
  var canvas = opt_canvas && object !== opt_canvas ? opt_canvas : null;

  object = object.parent;
  while (object) {
    chain.push(object);
    object = object.parent;
  }

  if (canvas) chain.push(canvas);

  return chain;
}

function runEventPhase(event, phase, chain) {
  if (event.isPropagationStopped) return;

  event.phase = phase;

  var isCapture = phase === 'capture';

  var i = isCapture ? chain.length : -1;
  while (chain[isCapture ? --i : ++i]) {
    var obj = chain[i];
    var handlers = obj.listeners[isCapture ? 'capture' : 'bubble'][event.type];
    invokeHandlers(obj, handlers, event);
    if (event.isPropagationStopped) break;
  }
}

function invokeHandlers(object, handlers, event) {
  if (!handlers) return;

  event.currentTarget = object;

  for (var i = 0, l = handlers.length; i < l; i++) {
    handlers[i].call(object, event);
    if (event.isImmediatePropagationStopped) return;
  }
}

module.exports = ObjectEventEmitter;
