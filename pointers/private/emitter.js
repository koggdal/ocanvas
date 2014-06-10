/**
 * @module ocanvas/pointers/private/emitter
 * @private
 */
'use strict';

var PointerEvent = require('../PointerEvent');
var state = require('./state');
var sceneUtils = require('./scene');
var positions = require('./positions');

/**
 * Raw function for emitting an event on a target object.
 * It will create a new PointerEvent object and use that when emitting.
 *
 * @param {string} type The public event type.
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {CanvasObject|Scene|Canvas} target The target object.
 */
function emitEvent(type, pointer, canvas, target) {
  var event = new PointerEvent({
    type: type,
    targetPointerCount: state.getPointerCountForObject(target),
    position: positions.get(pointer, canvas, target),
    keys: pointer.keys,
    buttons: pointer.buttons
  });

  target.emit(type, event, canvas);
}

/**
 * Emit an event on each object in a chain of objects.
 * If the type is 'enter', the loop will start from the last item in the array.
 *
 * @param {string} type The public event type.
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {Array} chain Array of objects.
 */
function emitEventForChain(type, pointer, canvas, chain) {
  var isEnter = type === 'enter';
  type = getPointerEventType(type);

  var i = isEnter ? chain.length : -1;
  while (chain[isEnter ? --i : ++i]) {
    emitEvent(type, pointer, canvas, chain[i]);
  }
}

/**
 * Emit an event on each object that is found between two objects (by looking
 * at the parent chain).
 *
 * @param {string} type The public event type.
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {CanvasObject|Scene|Canvas} target The target object.
 * @param {CanvasObject|Scene|Canvas} outerObject The outer object to stop at.
 *     This object will not be included in the chain of objects to emit the
 *     event for.
 */
function emitEventBetweenObjects(type, pointer, canvas, target, outerObject) {
  var chain = sceneUtils.getParentChain(target, outerObject);
  emitEventForChain(type, pointer, canvas, chain);
}

/**
 * Emit an event on each object that is found in the parent chain for an object.
 *
 * @param {string} type The public event type.
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {CanvasObject|Scene|Canvas} target The target object. Included in the
 *     chain of objects to emit the event for.
 */
function emitEventFromObject(type, pointer, canvas, target) {
  var chain = sceneUtils.getParentChain(target);
  chain.push(canvas);
  emitEventForChain(type, pointer, canvas, chain);
}

/**
 * Emit an event on the canvas and the scene associated with it.
 *
 * @param {string} type The public event type.
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 */
function emitEventForCanvas(type, pointer, canvas) {
  emitEventForChain(type, pointer, canvas, [canvas.camera.scene, canvas]);
}

/**
 * Emit an event on the target object.
 *
 * @param {string} type The public event type.
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {CanvasObject|Scene|Canvas} target The target object.
 */
function emitEventForTarget(type, pointer, canvas, target) {
  type = getPointerEventType(type);

  emitEvent(type, pointer, canvas, target);
}

/**
 * Convert a normalized event type to an event type for the public oCanvas 
 * pointer event API.
 * 
 * @param {string} type Normalized event type.
 *
 * @return {string} Pointer event type.
 */
function getPointerEventType(type) {
  switch (type) {
    case 'down': return 'pointerdown';
    case 'up': return 'pointerup';
    case 'move': return 'pointermove';
    case 'downmove': return 'pointerdownmove';
    case 'enter': return 'pointerenter';
    case 'leave': return 'pointerleave';
    case 'click': return 'pointerclick';
    case 'dblclick': return 'pointerdblclick';
    default: return type;
  }
}

exports.emit = emitEvent;
exports.emitForChain = emitEventForChain;
exports.emitBetweenObjects = emitEventBetweenObjects;
exports.emitFromObject = emitEventFromObject;
exports.emitForCanvas = emitEventForCanvas;
exports.emitForTarget = emitEventForTarget;
exports.getPointerEventType = getPointerEventType;
