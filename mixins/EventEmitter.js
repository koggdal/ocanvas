/**
 * @module ocanvas/mixins/EventEmitter
 */
'use strict';

/**
 * This mixin provides event functionality.
 *
 * @mixin
 *
 * @example
 * var mixin = require('./utils/mixin');
 * var EventEmitter = require('./mixins/EventEmitter');
 *
 * function MyClass() {
 * }
 * mixin(MyClass.prototype, EventEmitter);
 */
var EventEmitter = {

  /**
   * An object storing all added event listeners, organized in different arrays
   * for each event type. This object contains properties for each added event
   * type, and the values are arrays of functions.
   *
   * @type {?Object}
   */
  listeners: null,

  /**
   * Add a listener for an event.
   *
   * @param {string} name Event name.
   * @param {function} listener Listener function.
   */
  on: function(name, listener) {
    if (!this.listeners) {
      this.listeners = {};
    }

    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }

    // Don't allow the same listener to be registered multiple times for the
    // same event name.
    if (this.listeners[name].indexOf(listener) > -1) return;

    this.listeners[name].push(listener);
  },

  /**
   * Remove a listener for an event.
   *
   * @param {string} name Event name.
   * @param {function} listener Listener function.
   */
  off: function(name, listener) {
    if (!this.listeners) return;

    var listeners = this.listeners[name];
    if (!listeners) return;

    var index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  },

  /**
   * Emit an event, which will invoke all the functions added for the event
   * type.
   *
   * @param {string} name Event name.
   * @param {Object=} opt_eventObject Object that gets sent to the listener
   *     function.
   */
  emit: function(name, opt_eventObject) {
    if (!this.listeners) return;

    var e = opt_eventObject || {};
    e.type = name;

    var listeners = this.listeners[name];
    if (listeners) {
      listeners = listeners.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].call(this, e);
      }
    }
  }

};

module.exports = EventEmitter;
