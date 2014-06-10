/**
 * @module ocanvas/pointers/private/normalizer
 * @private
 */
'use strict';

var handlers = [];
var elements = [];
var lastTouchStart = 0;

var eventTypes = {
  dblclick: ['dblclick'],
  mouse: ['mousedown', 'mouseup', 'mousemove', 'mouseout'],
  touch: ['touchstart', 'touchend', 'touchmove', 'touchcancel'],
  pointer: [
    'pointerdown', 'pointerup', 'pointermove', 'pointerout', 'pointercancel',
    'MSPointerDown', 'MSPointerUp', 'MSPointerMove', 'MSPointerOut',
    'MSPointerCancel'
  ]
};

/**
 * Add DOM event listeners for the provided canvas element.
 *
 * @param {HTMLCanvasElement} element A canvas element.
 * @param {Function} handler A function to be called for each event. Gets passed
 *     two arguments: the normalized event type and the regular event object.
 */
function addListeners(element, handler) {
  if (elements.indexOf(element) > -1) {
    return;
  }

  // The real DOM event handler, which does some normalizing of the events
  // (such as handling simulated mouse events etc) before it passes it on to
  // the provided handler function.
  var pointerHandler = function(event) {
    if (genericHandler(event)) {
      handler(normalizeType(event.type), event);
    }
  };

  elements.push(element);
  handlers.push({
    handler: handler, // used for identifying handler in tests
    pointer: pointerHandler,
    MSHoldVisual: function(event) { event.preventDefault(); }
  });
  var newHandlers = handlers[handlers.length - 1];

  var win = global.window || global;

  if (win.PointerEvent || win.MSPointerEvent) {
    addListenersForType('pointer', element, pointerHandler);

    // Prevent the hold visual that comes before a potential context menu.
    // This also prevents the context menu in IE10.
    element.addEventListener('MSHoldVisual', newHandlers.MSHoldVisual, false);

  } else {
    addListenersForType('mouse', element, pointerHandler);
    addListenersForType('touch', element, pointerHandler);
  }

  addListenersForType('dblclick', element, pointerHandler);
}

/**
 * Remove DOM event listeners for the provided canvas element.
 * If the provided canvas element has not been passed to addListeners
 * previously, this will do nothing.
 *
 * @param {HTMLCanvasElement} element A canvas element.
 */
function removeListeners(element) {
  var index = elements.indexOf(element);
  if (index === -1) return;
  var elementHandlers = handlers[index];

  handlers.splice(index, 1);
  elements.splice(index, 1);

  var win = global.window || global;

  if (win.PointerEvent || win.MSPointerEvent) {
    removeListenersForType('pointer', element, elementHandlers.pointer);
    element.removeEventListener('MSHoldVisual', elementHandlers.MSHoldVisual,
        false);
  } else {
    removeListenersForType('mouse', element, elementHandlers.pointer);
    removeListenersForType('touch', element, elementHandlers.pointer);
  }

  removeListenersForType('dblclick', element, elementHandlers.pointer);
}

/**
 * Add event listeners for a specific pointer type and element.
 *
 * @param {string} type The pointer type (one from eventTypes).
 * @param {HTMLCanvasElement} element A canvas element.
 * @param {Function} handler An event handler function.
 */
function addListenersForType(type, element, handler) {
  var events = eventTypes[type];
  if (!events) return;
  for (var i = 0, l = events.length; i < l; i++) {
    element.addEventListener(events[i], handler, false);
  }
}

/**
 * Remove event listeners for a specific pointer type and element.
 *
 * @param {string} type The pointer type (one from eventTypes).
 * @param {HTMLCanvasElement} element A canvas element.
 * @param {Function} handler An event handler function.
 */
function removeListenersForType(type, element, handler) {
  var events = eventTypes[type];
  if (!events) return;
  for (var i = 0, l = events.length; i < l; i++) {
    element.removeEventListener(events[i], handler, false);
  }
}

/**
 * Generic event listener for all pointer types. This will handle things like
 * emulated mouse events etc.
 *
 * @param {Event} event A DOM Event object.
 *
 * @return {boolean} True if everything is fine, false if the event should be
 *     stopped.
 */
function genericHandler(event) {
  var type = event.type.toLowerCase();

  // Most implementations will not trigger any emulated mouse events if
  // the touchend event is stopped.
  if (type === 'touchend') {
    event.preventDefault();
  }

  // Some implementations (mobile emulation in Chrome for example), will
  // send a mousedown event directly after touchstart, so we need to
  // stop that. The rest of the events are not triggered.
  if (type === 'touchstart') {
    lastTouchStart = new Date().getTime();
  }
  if (type === 'mousedown') {
    var timeDiff = new Date().getTime() - lastTouchStart;
    if (timeDiff < 600) {
      event.preventDefault();
      return false;
    }
  }

  return true;
}

/**
 * Normalize the event type from a specific one like 'mouseup' to a generic
 * one like 'up'. The supported input types are the following:
 *
 * @param {string} type Event type. One of the following:
 *     dblclick, mousedown, mouseup, mousemove, mouseout, touchstart, touchend,
 *     touchmove, touchcancel, pointerdown, pointerup, pointermove, pointerout,
 *     pointercancel, MSPointerDown, MSPointerUp, MSPointerMove, MSPointerOut,
 *     MSPointerCancel.
 *
 * @return {string} Normalized event type. One of 'down', 'up', 'move', 'out',
 *     'dblclick' and 'cancel'. Empty string if unrecognized type was passed in.
 */
function normalizeType(type) {
  type = type.toLowerCase();

  if (/down|start/.test(type)) {
    return 'down';
  }
  if (/up|end/.test(type)) {
    return 'up';
  }
  if (/move/.test(type)) {
    return 'move';
  }
  if (/out/.test(type)) {
    return 'out';
  }
  if (/cancel/.test(type)) {
    return 'cancel';
  }
  if (/dblclick/.test(type)) {
    return 'dblclick';
  }

  return '';
}

exports.handlers = handlers;
exports.elements = elements;
exports.eventTypes = eventTypes;

exports.addListeners = addListeners;
exports.removeListeners = removeListeners;

exports.addListenersForType = addListenersForType;
exports.removeListenersForType = removeListenersForType;

exports.genericHandler = genericHandler;

exports.normalizeType = normalizeType;
