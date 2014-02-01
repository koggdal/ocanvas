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
 * Observe one or more events with a listener function.
 *
 * @param {string} events Event names. If many, separated by space.
 * @param {function} listener Listener function.
 */
EventEmitter.prototype.on = function(events, listener) {
  events = events.split(' ');
  for (var i = 0, l = events.length, event; i < l; i++) {
    event = events[i];
    if (!this.listeners[event]) { this.listeners[event] = []; }
    this.listeners[event].push(listener);
  }
};

/**
 * Remove a listener function for one or more events.
 *
 * @param {string} events Event names. If many, separated by space.
 * @param {function} listener Listener function.
 */
EventEmitter.prototype.off = function(events, listener) {
  events = events.split(' ');
  var i, l, event, listeners, index;
  for (i = 0, l = events.length; i < l; i++) {
    event = events[i];
    listeners = this.listeners[event];
    if (listeners) {
      index = listeners.indexOf(listener);
      if (~index) { listeners.splice(index, 1); }
    }
  }
};

/**
 * Emit one or more events and fire all the listener functions.
 *
 * @param {string} events Event names. If many, separated by space.
 * @param {Object=} opt_eventObject Object that gets sent to the listener function.
 */
EventEmitter.prototype.emit = function(events, opt_eventObject) {
  events = events.split(' ');
  var e = events.length > 1 ? null : opt_eventObject;

  var i, l, n, len, event, listeners;
  for (i = 0, l = events.length; i < l; i++) {
    event = events[i];
    e = e || (opt_eventObject ? Object.create(opt_eventObject) : {});
    e.type = event;
    listeners = this.listeners[event];
    if (listeners) {
      for (n = 0, len = listeners.length; n < len; n++) {
        listeners[n].call(this, e);
      }
    }
  }
};

module.exports = EventEmitter;
