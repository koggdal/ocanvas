/**
 * @module ocanvas/keyboard/controller
 * @private
 */
'use strict';

var KeyboardEvent = require('./KeyboardEvent');
var keys = require('./keys');
var raf = require('raf');

var pressedKeys = {};

/**
 * Handle a DOM keyboard event by delegating to specialized functions.
 *
 * @param {KeyboardEvent} event The DOM keyboard event object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handleEvent(event, canvas) {

  // By referencing the function on the exports object, we allow better testing,
  // since we can test each handler in isolation, and then test that this
  // function just delegates to the right method.
  switch (event.type) {
    case 'keydown': exports.handleKeyDown(event, canvas); break;
    case 'keyup': exports.handleKeyUp(event, canvas); break;
    case 'blur': exports.handleBlur(event, canvas); break;
  }
}

/**
 * Handle when a key is pressed down.
 *
 * @param {KeyboardEvent} event The DOM keyboard event object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handleKeyDown(event, canvas) {
  var keyCode = event.keyCode;

  // The keydown event in oCanvas is only triggered once when the key is pressed
  // down. If the desired effect is to get called multiple times while holding
  // the key down, use the keypress event instead.
  if (pressedKeys[keyCode]) {

    // The first keydown event for this key might have had the default action
    // prevented. Since repeated keydown events for the same key while holding
    // it down will be stopped here, we need to prevent the default action for
    // these as well, but only if the first one was prevented.
    if (pressedKeys[keyCode].defaultPrevented) {
      event.preventDefault();
    }
    return;
  }

  pressedKeys[keyCode] = event;

  emitEvent('keydown', event, canvas);

  // This should also emit keypress events until the key is released
  emitKeyPressEvents(event, canvas);
}

/**
 * Handle when a key is released.
 *
 * @param {KeyboardEvent} event The DOM keyboard event object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handleKeyUp(event, canvas) {

  // If the pressed key has already been released in the internal state,
  // abort here to prevent duplicated keyup events. Read more below about keyup.
  if (!pressedKeys[event.keyCode]) return;

  delete pressedKeys[event.keyCode];

  emitEvent('keyup', event, canvas);

  // Browsers seem to drop the keyup event for keys released while the Meta
  // key is pressed down. So when a keyup event happens for the meta key, we
  // need to emit keyup events for all other pressed keys, because they might
  // have been released while holding down the Meta key. If the other keys were
  // not released, we will be in an incorrect state, but this state is better
  // than thinking that keys are pressed when they are not.
  if ([224, 91, 92].indexOf(event.keyCode) > -1) {
    releaseAllKeys(event, canvas);
  }
}

/**
 * Handle when the window loses focus.
 *
 * @param {FocusEvent} event A DOM FocusEvent for blur.
 * @param {Canvas} canvas An oCanvas Canvas instance.
 */
function handleBlur(event, canvas) {
  releaseAllKeys(event, canvas);
}

/**
 * Release all keys in the internal state and emit keyup events for them.
 *
 * @param {Event} event A DOM event.
 * @param {Canvas} canvas An oCanvas Canvas instance.
 */
function releaseAllKeys(event, canvas) {
  for (var keyCode in pressedKeys) {
    var eventObject = new KeyboardEvent({
      type: 'keyup',
      keyCode: keyCode,
      key: keys.getKeyString(pressedKeys[keyCode]),
      originalEvent: event
    });

    delete pressedKeys[keyCode];

    canvas.emit('keyup', eventObject, canvas);
  }
}

/**
 * Create a new oCanvas KeyboardEvent object and emit an event on the canvas.
 *
 * @param {string} type An oCanvas keyboard event type.
 * @param {KeyboardEvent} event A DOM keyboard event object.
 * @param {Canvas} canvas An oCanvas Canvas instance.
 */
function emitEvent(type, event, canvas) {
  var eventObject = new KeyboardEvent({
    type: type,
    keyCode: event.keyCode,
    key: keys.getKeyString(event),
    originalEvent: event
  });

  canvas.emit(type, eventObject, canvas);
}

/**
 * Emit keypress events until the key is not pressed anymore.
 *
 * @param {KeyboardEvent} event A DOM keyboard event object.
 * @param {Canvas} canvas An oCanvas Canvas instance.
 */
function emitKeyPressEvents(event, canvas) {

  // Abort emitting any more keypress events if the key is released
  if (!pressedKeys[event.keyCode]) return;

  emitEvent('keypress', event, canvas);

  // Schedule the next keypress event on the next frame
  raf(function() {
    emitKeyPressEvents(event, canvas);
  });
}

exports.handleEvent = handleEvent;
exports.handleKeyDown = handleKeyDown;
exports.handleKeyUp = handleKeyUp;
exports.handleBlur = handleBlur;
exports.pressedKeys = pressedKeys;
