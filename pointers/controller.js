/**
 * @module ocanvas/pointers/controller
 * @private
 */
'use strict';

var PointerData = require('./PointerData');
var state = require('./state');
var sceneUtils = require('./scene');
var positions = require('./positions');
var emitter = require('./emitter');

/**
 * Get data objects for a pointer event.
 *
 * @param {MouseEvent|TouchEvent} event Event object.
 *
 * @return {Array.<PointerData>} Array of PointerData instances, one for each
 *     pointer found in the event.
 */
function getPointers(event) {
  var pointers = [];
  var data;
  
  // Touch events contain multiple touch points
  if (event.type.indexOf('touch') === 0) {
    var touches = event.changedTouches;
    for (var i = 0, l = touches.length; i < l; i++) {
      data = new PointerData();
      data.setDataFromEvent(event, touches[i]);
      pointers.push(data);
    }

  // Mouse events and pointer events contain a single touch point
  } else {
    data = new PointerData();
    data.setDataFromEvent(event);
    pointers.push(data);
  }

  return pointers;
}

/**
 * Handle a DOM pointer event by delegating to specialized functions.
 *
 * @param {string} type Normalized pointer event type. One of 'cancel', 'down',
 *     'up', 'move', 'out' and 'dblclick'.
 * @param {MouseEvent|TouchEvent} event The DOM pointer event object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handleEvent(type, event, canvas) {
  var pointers = getPointers(event);

  // By referencing the function on the exports object, we allow better testing,
  // since we can test each handler in isolation, and then test that this
  // function just delegates to the right method.
  var methods = {
    'cancel': exports.handlePointerCancel,
    'down': exports.handlePointerDown,
    'up': exports.handlePointerUp,
    'move': exports.handlePointerMove,
    'out': exports.handlePointerOut,
    'dblclick': exports.handlePointerDblClick
  };
  var method = methods[type];
  if (!method) return;

  pointers.forEach(function(pointer) {
    method(pointer, canvas);
  });
}

/**
 * Handle when a pointer is cancelled. This can happen for example when a modal
 * window pops up while the user is pressing a pointer.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handlePointerCancel(pointer, canvas) {
  state.releasePointer(pointer);
  makePointerLeaveCanvas(pointer, canvas);
}

/**
 * Handle when a pointer is pressed down.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handlePointerDown(pointer, canvas) {
  var scene = canvas.camera && canvas.camera.scene;
  var currentFrontObject = state.getFrontObject(pointer);

  var canvasPosition = positions.getForCanvas(pointer, canvas);
  var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, canvasPosition.x,
      canvasPosition.y);

  state.pressPointer(pointer, frontObject || scene);

  if (!frontObject || frontObject !== currentFrontObject) {
    setNewFrontObject(frontObject, pointer, canvas);
  }

  emitter.emitForTarget('down', pointer, canvas, frontObject || scene);
}

/**
 * Handle when a pointer is released.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handlePointerUp(pointer, canvas) {
  var currentFrontObject = state.getFrontObject(pointer);
  var scene = canvas.camera && canvas.camera.scene;

  var canvasPosition = positions.getForCanvas(pointer, canvas);
  var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, canvasPosition.x,
      canvasPosition.y);

  var target = frontObject || scene;
  var pressedObject = state.getPressedObject(pointer);
  var shouldTriggerClick = pressedObject === target;
  if (!shouldTriggerClick && frontObject && pressedObject) {
    shouldTriggerClick = sceneUtils.isParentOf(pressedObject, frontObject);
  }

  state.releasePointer(pointer);

  emitter.emitForTarget('up', pointer, canvas, frontObject || scene);

  // Touch pointers will always leave their target when they're released,
  // as opposed to mouse pointers that are still within the target when the
  // mouse button is released.
  if (pointer.interactionType === 'touch') {
    state.setFrontObject(pointer, null);
    state.leaveCanvas(pointer);

    emitter.emitFromObject('leave', pointer, canvas, currentFrontObject || scene);
  }

  if (shouldTriggerClick) {
    emitter.emitForTarget('click', pointer, canvas, pressedObject);
    var clickCount = state.registerClick(pointer, pressedObject);

    // If there are now two clicks on the same object,
    // and the pointer is using touch events, we need to manually
    // trigger double click handling. Using a mouse, or touch with
    // a browser supporting the Pointer Events spec, a native 'dblclick'
    // event will be triggered. For the Touch Events spec, no native
    // 'dblclick' event will be triggered, so we need to trigger it
    // manually.
    if (pointer.type === 'touch' && clickCount >= 2) {
      handlePointerDblClick(pointer, canvas, target);
    }
  }
}

/**
 * Handle when a pointer is moved.
 * This will handle any movement (irregardless of the pressed state), and it
 * will trigger events for both unpressed move and pressed move.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handlePointerMove(pointer, canvas) {
  var scene = canvas.camera && canvas.camera.scene;
  var currentFrontObject = state.getFrontObject(pointer);

  var canvasPosition = positions.getForCanvas(pointer, canvas);
  var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, canvasPosition.x,
      canvasPosition.y);

  if (!frontObject || frontObject !== currentFrontObject) {
    setNewFrontObject(frontObject, pointer, canvas);
  }

  emitter.emitForTarget('move', pointer, canvas, frontObject || scene);
  if (state.getPressedObject(pointer) !== null) {
    emitter.emitForTarget('downmove', pointer, canvas, frontObject || scene);
  }
}

/**
 * Handle when a pointer is moved outside of the canvas element.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function handlePointerOut(pointer, canvas) {
  makePointerLeaveCanvas(pointer, canvas);
}

/**
 * Handle when the pointer is being double-clicked.
 * This is only possible for event specifications using the MouseEvent
 * interface, which is normal mouse events and Pointer Events. Touch Events do
 * not use the MouseEvent interface and does not support double-click. To
 * support double-click for touch events as well, we emulate that from two
 * clicks.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 * @param {CanvasObject|Scene=} opt_target Optional target object. If not
 *     provided, it will be calculated based on the pointer position.
 */
function handlePointerDblClick(pointer, canvas, opt_target) {
  var scene = canvas.camera && canvas.camera.scene;

  var canvasPosition = positions.getForCanvas(pointer, canvas);
  var frontObject = opt_target || sceneUtils.findFrontObjectInCanvas(canvas,
      canvasPosition.x, canvasPosition.y);

  var object = frontObject || scene;
  var clickCount = state.getClickCount(object);
  if (clickCount >= 2) {
    state.clearClicks(object);
    emitter.emitForTarget('dblclick', pointer, canvas, object);
  }
}

/**
 * Reset front object for the passed pointer and trigger a leave event.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function makePointerLeaveCanvas(pointer, canvas) {
  setNewFrontObject(null, pointer, canvas);

  state.leaveCanvas(pointer);
  emitter.emitForCanvas('leave', pointer, canvas);
}

/**
 * Set a new front object for a pointer and trigger event handlers for the
 * 'enter' and 'leave' events.
 *
 * @param {CanvasObject} object A canvas object.
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas The canvas instance the event is for.
 */
function setNewFrontObject(object, pointer, canvas) {
  var scene = canvas.camera && canvas.camera.scene;
  var currentFrontObject = state.getFrontObject(pointer);

  if (object) {
    state.setFrontObject(pointer, object);
  } else if (currentFrontObject) {
    state.setFrontObject(pointer, null);
  }

  if (currentFrontObject) {
    if (object) {

      if (sceneUtils.isParentOf(currentFrontObject, object)) {
        emitter.emitBetweenObjects('enter', pointer, canvas, object,
            currentFrontObject);

      } else if (sceneUtils.isParentOf(object, currentFrontObject)) {
        emitter.emitBetweenObjects('leave', pointer, canvas, currentFrontObject,
            object);

      } else {
        var parent = sceneUtils.findSharedParent(currentFrontObject, object);
        emitter.emitBetweenObjects('leave', pointer, canvas, currentFrontObject,
            parent);
        emitter.emitBetweenObjects('enter', pointer, canvas, object, parent);
      }
    } else {
      emitter.emitBetweenObjects('leave', pointer, canvas, currentFrontObject,
          scene);
    }
  } else {
    if (state.hasEnteredCanvas(pointer)) {
      if (object) {
        emitter.emitBetweenObjects('enter', pointer, canvas, object, scene);
      }
    } else {
      state.enterCanvas(pointer);
      if (object) {
        emitter.emitFromObject('enter', pointer, canvas, object);
      } else {
        emitter.emitForCanvas('enter', pointer, canvas);
      }
    }
  }
}

exports.getPointers = getPointers;
exports.handleEvent = handleEvent;
exports.handlePointerCancel = handlePointerCancel;
exports.handlePointerDown = handlePointerDown;
exports.handlePointerUp = handlePointerUp;
exports.handlePointerMove = handlePointerMove;
exports.handlePointerOut = handlePointerOut;
exports.handlePointerDblClick = handlePointerDblClick;
exports.makePointerLeaveCanvas = makePointerLeaveCanvas;
exports.setNewFrontObject = setNewFrontObject;
