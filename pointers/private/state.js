/**
 * @module ocanvas/pointers/private/state
 * @private
 */
'use strict';

var isInstanceOf = require('../../utils/isInstanceOf');
var sceneUtils = require('./scene');

var pointersEnteredCanvas = {};
var frontObjects = {};
var pressedObjects = {};
var clickedObjects = [];

/**
 * Save what the current front object is for the pointer.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {CanvasObject|Scene=} opt_object A canvas object.
 */
function setFrontObject(pointer, opt_object) {
  if (opt_object) {
    frontObjects[pointer.id] = opt_object;
  } else {
    delete frontObjects[pointer.id];
  }
}

/**
 * Save what the current front object is for the pointer.
 *
 * @param {PointerData} pointer Pointer object.
 *
 * @return {CanvasObject|Scene?} An object or null if not found.
 */
function getFrontObject(pointer) {
  return frontObjects[pointer.id] || null;
}

/**
 * Store that the pointer has entered the canvas.
 *
 * @param {PointerData} pointer Pointer object.
 */
function enterCanvas(pointer) {
  pointersEnteredCanvas[pointer.id] = true;
}

/**
 * Store that the pointer has left the canvas.
 *
 * @param {PointerData} pointer Pointer object.
 */
function leaveCanvas(pointer) {
  delete pointersEnteredCanvas[pointer.id];
}

/**
 * Check if the pointer has entered the canvas.
 *
 * @param {PointerData} pointer Pointer object.
 *
 * @return {boolean} True if it has entered, false otherwise.
 */
function hasEnteredCanvas(pointer) {
  return !!pointersEnteredCanvas[pointer.id];
}

/**
 * Get the number of pointers that have the specified object as a target.
 *
 * @param {CanvasObject} object A canvas object.
 *
 * @return {number} The number of pointers.
 */
function getPointerCountForObject(object) {
  var counter = 0;

  if (isInstanceOf(object, 'Canvas', 'Scene')) {
    for (var x in pointersEnteredCanvas) {
      counter++;
    }

  } else {
    for (var id in frontObjects) {
      if (frontObjects[id] === object) {
        counter++;
      } else if (sceneUtils.isParentOf(object, frontObjects[id])) {
        counter++;
      }
    }
  }

  return counter;
}

/**
 * Save the state for a specific pointer as being pressed.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {CanvasObject|Scene} object A canvas object.
 */
function pressPointer(pointer, object) {
  pressedObjects[pointer.id] = object;
}

/**
 * Save the state for a specific pointer as being not pressed.
 *
 * @param {PointerData} pointer Pointer object.
 */
function releasePointer(pointer) {
  delete pressedObjects[pointer.id];
}

/**
 * Get which object the pointer is currently pressed on.
 *
 * @param {PointerData} pointer Pointer object.
 * @return {CanvasObject|Scene?} A canvas object or null if not pressed on any object.
 */
function getPressedObject(pointer) {
  return pressedObjects[pointer.id] || null;
}

/**
 * Register a click for the specific pointer.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {CanvasOject|Scene} object A canvas object or a scene.
 *
 * @return {number} The click count after this click has been registered.
 */
function registerClick(pointer, object) {
  var clickData = getClickData(object);
  if (!clickData) {
    clickData = {object: object, counter: 0};
    clickedObjects.push(clickData);
  }

  clickData.counter++;

  // Automatically decrease the counter after a timeout.
  // This will make sure that objects are cleaned up and not stored forever.
  //
  // It is also used for emulating a double click for touch events, since the
  // Touch Event API does not support the concept of a double click. The timer
  // is then used as the time allowed between two clicks. Normally, this time
  // is configurable in the operating system (on Mac OS up to 5 seconds), but
  // since there's no API to get that interval from the OS, and not all
  // operating systems have this setting, we will use a specific interval for
  // touch events.

  setTimeout(function() {
    var index = clickedObjects.indexOf(clickData);
    if (index === -1) return;

    if (--clickData.counter === 0) {
      clickedObjects.splice(index, 1);
    }
  }, pointer.type === 'touch' ? 500 : 5000);

  return clickData.counter;
}

/**
 * Get metadata about the currently clicked canvas object.
 *
 * @param {CanvasObject|Scene} object A canvas object.
 *
 * @return {Object?} An object of data, or null if not found.
 */
function getClickData(object) {
  for (var i = 0, l = clickedObjects.length; i < l; i++) {
    if (clickedObjects[i] && clickedObjects[i].object === object) {
      return clickedObjects[i];
    }
  }
  return null;
}

/**
 * Get the number of clicks that have happened recently on the specified object.
 *
 * @param {CanvasObject|Scene} object A canvas object.
 *
 * @return {number} The number of clicks.
 */
function getClickCount(object) {
  var data = getClickData(object);
  return data ? data.counter : 0;
}

/**
 * Clear clicks for an object.
 *
 * @param {CanvasObject|Scene} object A canvas object.
 */
function clearClicks(object) {
  for (var i = 0, l = clickedObjects.length; i < l; i++) {
    if (clickedObjects[i] && clickedObjects[i].object === object) {
      clickedObjects.splice(i, 1);
      return;
    }
  }
}

/**
 * Reset all state stored in this module.
 */
function reset() {
  pointersEnteredCanvas = exports.pointersEnteredCanvas = {};
  frontObjects = exports.frontObjects = {};
  pressedObjects = exports.pressedObjects = {};
  clickedObjects = exports.clickedObjects = [];
}

exports.setFrontObject = setFrontObject;
exports.getFrontObject = getFrontObject;

exports.enterCanvas = enterCanvas;
exports.leaveCanvas = leaveCanvas;
exports.hasEnteredCanvas = hasEnteredCanvas;

exports.getPointerCountForObject = getPointerCountForObject;

exports.pressPointer = pressPointer;
exports.releasePointer = releasePointer;
exports.getPressedObject = getPressedObject;

exports.registerClick = registerClick;
exports.clearClicks = clearClicks;
exports.getClickCount = getClickCount;

exports.reset = reset;

exports.pointersEnteredCanvas = pointersEnteredCanvas;
exports.frontObjects = frontObjects;
exports.pressedObjects = pressedObjects;
exports.clickedObjects = clickedObjects;
