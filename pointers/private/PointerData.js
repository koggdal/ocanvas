/**
 * @module ocanvas/pointers/private/PointerData
 * @private
 */
'use strict';

/**
 * @classdesc Data about a pointer event.
 *
 * @property {string} id A unique identifier for the pointer.
 * @property {string} type The type of pointer event specification. Can be one
 *     of these: 'unknown', 'mouse', 'touch' or 'pointer'.
 * @property {string} interactionType The interaction type for the pointer. Can
 *     be one of these: 'unknown', 'mouse' or 'touch'.
 * @property {number} x The X coordinate relative to the whole document.
 * @property {number} y The Y coordinate relative to the whole document.
 * @property {Object} keys Hash with boolean values for different modifier keys
 *     that were pressed at the same time as the pointer event happened.
 *     Properties of this object are: `ctrl`, `alt`, `shift`, `meta` and `count`
 *     (number of modifier keys pressed).
 * @property {Object} buttons Hash with boolean values for different pointer
 *     buttons that were pressed at the same time as the pointer event happened.
 *     Properties of this object are: `primary`, `secondary`, `auxiliary`,
 *     `extra1`, `extra2`, `extra3` and `count` (number of buttons pressed).
 *
 * @constructor
 * @param {Object=} opt_properties Optional properties that will be set.
 */
function PointerData(opt_properties) {
  this.id = '';
  this.type = 'unknown';
  this.interactionType = 'unknown';
  this.x = 0;
  this.y = 0;
  this.keys = {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    count: 0
  };
  this.buttons = {
    primary: false,
    secondary: false,
    auxiliary: false,
    extra1: false,
    extra2: false,
    extra3: false,
    count: 0
  };

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
PointerData.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Set the data based on a pointer event object.
 *
 * @param {PointerEvent|MouseEvent|TouchEvent} event A pointer event object.
 * @param {Touch=} opt_touch An object for a specific touch point. Needed if the
 *     event object is a TouchEvent instance.
 */
PointerData.prototype.setDataFromEvent = function(event, opt_touch) {
  var type = this.getTypeFromEvent(event);
  var interactionType = this.getInteractionTypeFromEvent(event, type);
  var keys = this.getKeysFromEvent(event);
  var buttons = this.getButtonsFromEvent(event);

  var point = opt_touch || event;
  this.setProperties({
    type: type,
    interactionType: interactionType,
    id: (event.pointerId || point.identifier || 'mouse').toString(),
    x: point.pageX,
    y: point.pageY,
    keys: keys,
    buttons: buttons
  });
};

/**
 * Get the pointer type from an event object.
 *
 * @param {PointerEvent|MouseEvent|TouchEvent} event A pointer event object.
 *
 * @return {string} The type, one of: 'unknown', 'mouse', 'touch' or 'pointer'.
 */
PointerData.prototype.getTypeFromEvent = function(event) {
  var eventType = (event.type || '').toLowerCase();
  var type = 'unknown';
  if (eventType.indexOf('mouse') === 0) type = 'mouse';
  else if (eventType.indexOf('touch') === 0) type = 'touch';
  else if (eventType.indexOf('pointer') === 0) type = 'pointer';
  else if (eventType.indexOf('mspointer') === 0) type = 'pointer';
  else if (eventType.indexOf('click') > -1) type = 'mouse';
  return type;
};

/**
 * Get the interaction type from an event object.
 * The interaction type is how the pointer interacts with the surface. A touch
 * pointer leaves the target when released, but a mouse pointer stays at the
 * target when the mouse button is released.
 *
 * @param {PointerEvent|MouseEvent|TouchEvent} event A pointer event object.
 * @param {string=} opt_type Optional pointer type, a value from the method
 *     getTypeFromEvent.
 *
 * @return {string} The interaction type, one of: 'unknown', 'mouse' or 'touch'.
 */
PointerData.prototype.getInteractionTypeFromEvent = function(event, opt_type) {
  var type = opt_type || this.getTypeFromEvent(event);
  var interactionType = 'unknown';

  if (type === 'touch') interactionType = 'touch';
  else if (type === 'mouse') interactionType = 'mouse';
  else if (type === 'pointer') {
    switch (event.pointerType) {
      case 'touch': interactionType = 'touch'; break;
      case 'pen': interactionType = 'touch'; break;
      case 'mouse': interactionType = 'mouse'; break;
    }

    // IE10 used to have value with the `long` data type
    var win = global.window || global;
    var PointerEvent = win.PointerEvent || win.MSPointerEvent;
    if (PointerEvent && interactionType === 'unknown') {
      switch (event.pointerType) {
        case PointerEvent.MSPOINTER_TYPE_TOUCH:
          interactionType = 'touch'; break;
        case PointerEvent.MSPOINTER_TYPE_PEN:
          interactionType = 'touch'; break;
        case PointerEvent.MSPOINTER_TYPE_MOUSE:
          interactionType = 'mouse'; break;
      }
    }
  }

  return interactionType;
};

/**
 * Get the pressed modifier keys from an event object.
 *
 * @param {PointerEvent|MouseEvent|TouchEvent} event An event object.
 *
 * @return {Object} Object with boolean properties `ctrl`, `alt`, `shift`,
 *     `meta` and the integer `count` for how many of these are pressed.
 */
PointerData.prototype.getKeysFromEvent = function(event) {
  var keys = {
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey
  };

  var count = 0;
  for (var x in keys) if (keys[x]) count++;
  keys.count = count;

  return keys;
};

/**
 * Get the pressed pointer buttons from an event object.
 *
 * @param {PointerEvent|MouseEvent} event An event object.
 *
 * @return {Object} Object with boolean properties `primary`, `secondary`,
 *     `auxiliary`, `extra1`, `extra2`, `extra3` and the integer `count for how
 *     many of these are pressed.
 */
PointerData.prototype.getButtonsFromEvent = function(event) {
  var buttonsBitmask = this.normalizeButtonsFromEvent(event);

  var buttons = {
    primary: (buttonsBitmask & 1) !== 0,
    secondary: (buttonsBitmask & 2) !== 0,
    auxiliary: (buttonsBitmask & 4) !== 0,
    extra1: (buttonsBitmask & 8) !== 0,
    extra2: (buttonsBitmask & 16) !== 0,
    extra3: (buttonsBitmask & 32) !== 0
  };

  var count = 0;
  for (var x in buttons) if (buttons[x]) count++;
  buttons.count = count;

  return buttons;
};

/**
 * Normalize the browser differences in the pointer buttons we get from an event
 * object.
 *
 * @param {PointerEvent|MouseEvent} event An event object.
 *
 * @return {number} A bitmask number for the buttons. The values are as follows:
 *     0: No button
 *     1: Primary button
 *     2: Secondary button
 *     4: Auxiliary button
 *     8: Extra button 1
 *     16: Extra button 2
 *     32: Extra button 3
 *     A combination of these buttons can be made by combining the numbers. For
 *     example, 11 would mean primary, secondary and extra button 1 are pressed.
 */
PointerData.prototype.normalizeButtonsFromEvent = function(event) {

  // event.buttons is already using bitmasks correctly,
  // but it is not available in all supported browsers.
  if (event.buttons) return event.buttons;

  // Since event.button is 0 for the primary button, but
  // also when no button is pressed, we must test the
  // `which` property, where 0 means no button pressed.
  if (event.which === 0) return 0;

  // event.button is standardized across supported browsers.
  // (IE <9 reports other numbers, but as that version is not
  // supported anyway, we don't need to check that).
  switch (event.button) {
    case 0: return 1; // primary
    case 1: return 4; // auxiliary
    case 2: return 2; // secondary
  }

  // If all else fails
  return 0;
};

module.exports = PointerData;
