/**
 * @module ocanvas/classes/EventEmitter
 */
'use strict';

/**
 * @classdesc This class can be used to get an object where you can emit and
 *     listen for custom events. Another class can also inherit from this
 *     class to get event capabilities.
 *
 * @property {Object} listeners An object storing all added event listeners,
 *     organized in different arrays for each event type. This object contains
 *     properties for each added event type, and the values are arrays of
 *     functions.
 *
 * @constructor
 */
function EventEmitter() {
  this.listeners = {};
}

/**
 * Add a listener for an event.
 *
 * @param {string} name Event name.
 * @param {function} listener Listener function.
 */
EventEmitter.prototype.on = function(name, listener) {
  if (!this.listeners[name]) {
    this.listeners[name] = [];
  }

  // Don't allow the same listener to be registered multiple times for the
  // same event name.
  if (this.listeners[name].indexOf(listener) > -1) return;

  this.listeners[name].push(listener);
};

/**
 * Remove a listener for an event.
 *
 * @param {string} name Event name.
 * @param {function} listener Listener function.
 */
EventEmitter.prototype.off = function(name, listener) {
  var listeners = this.listeners[name];
  if (listeners) {
    var index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  }
};

/**
 * Emit an event, which will invoke all the functions added for the event type.
 *
 * @param {string} name Event name.
 * @param {Object=} opt_eventObject Object that gets sent to the listener function.
 */
EventEmitter.prototype.emit = function(name, opt_eventObject) {
  var e = opt_eventObject || {};
  e.type = name;

  var listeners = this.listeners[name];
  if (listeners) {
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].call(this, e);
    }
  }
};

module.exports = EventEmitter;
