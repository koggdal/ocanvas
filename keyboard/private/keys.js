/**
 * @module ocanvas/keyboard/private/keys
 * @private
 */
'use strict';

/**
 * Get the string representation for a key based on an event.
 *
 * @param {KeyboardEvent} event A DOM event object from a key event.
 *
 * @return {string} One of the values specified in the DOM Level 3 Events spec:
 *     https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-key.html
 */
function getKeyString(event) {

  // Browser supports the `key` property from DOM Level 3 Events.
  if (event.key) return keysCorrection[event.key] || event.key;

  // Modifier keys and special keys.
  var key = keys[event.keyCode];
  if (key) return key;

  // Normal characters will be represented as the actual character.
  // This will cause wrong values for some characters, as keyCode is not exactly
  // the same as char codes. This will have to do for now though, since it's
  // quite complex to get the correct string in all cases.
  key = String.fromCharCode(event.keyCode);
  return key.toLocaleLowerCase();
}

// Early implementations of KeyboardEvent#key from DOM Level 3 Events had slight
// variations of some values, so this normalizes the values to the spec values.
var keysCorrection = {
  'Esc': 'Escape',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Scroll': 'ScrollLock'
};

// Conversions from key code to string representation for most common keys
var keys = {
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  20: 'CapsLock',
  27: 'Escape',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  91: 'OS',
  92: 'OS',
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta',
  225: 'AltGraph'
};

exports.getKeyString = getKeyString;
