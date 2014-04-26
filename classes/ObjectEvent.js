/**
 * @module ocanvas/classes/ObjectEvent
 */
'use strict';

/**
 * @classdesc Generic event object for canvas objects.
 *
 * @property {string?} type The event type.
 * @property {boolean} bubbles Whether the event should bubble.
 * @property {string} phase The event phase. Can be 'idle', 'capture' or
 *     'bubble'.
 * @property {Object?} target The object the event originally happened on.
 * @property {Object?} currentTarget The object the event is currently
 *     processing event listeners for. This changes while the event travels
 *     in the capture and bubble phases.
 * @property {Canvas} The Canvas instance that this event originates from.
 * @property {boolean} isPropagationStopped Whether event propagation has been
 *     stopped to not propagate to other objects.
 * @property {boolean} isImmediatePropagationStopped Whether event propagation
 *     has been stopped to not propagate to any other event handlers on the
 *     current object.
 *
 * @constructor
 *
 * @param {string=} opt_type Optional event type.
 */
function ObjectEvent(opt_type) {
  this.type = opt_type || null;
  this.bubbles = true;
  this.phase = 'idle';
  this.target = null;
  this.currentTarget = null;
  this.canvas = null;
  this.isPropagationStopped = false;
  this.isImmediatePropagationStopped = false;
}

/**
 * Stop the event from propagating further in the object chain.
 * This will continue to run any event handlers on the current target.
 */
ObjectEvent.prototype.stopPropagation = function() {
  this.isPropagationStopped = true;
};

/**
 * Stop the event from propagating further in the object chain.
 * This will not run any more event handlers on the current target.
 */
ObjectEvent.prototype.stopImmediatePropagation = function() {
  this.isPropagationStopped = true;
  this.isImmediatePropagationStopped = true;
};

module.exports = ObjectEvent;
