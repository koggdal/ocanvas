/**
 * @module ocanvas/classes/EventEmitter
 */
'use strict';

/**
 * @classdesc This class can be used to get an object where you can emit and
 *     listen for custom events. Another class can also inherit from this
 *     class to get event capabilities.
 *
 * @constructor
 */
function EventEmitter() {
  this._listeners = {};
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
    if (!this._listeners[event]) { this._listeners[event] = []; }
    this._listeners[event].push(listener);
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
    listeners = this._listeners[event];
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
  var i, l, n, len, event, e, listeners;
  for (i = 0, l = events.length; i < l; i++) {
    event = events[i];
    e = opt_eventObject ? Object.create(opt_eventObject) : {};
    e.type = event;
    listeners = this._listeners[event];
    if (listeners) {
      for (n = 0, len = listeners.length; n < len; n++) {
        listeners[n].call(this, e);
      }
    }
  }
};

module.exports = EventEmitter;
