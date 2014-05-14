/**
 * @module ocanvas/pointers/positions
 * @private
 */
'use strict';

var isInstanceOf = require('../utils/isInstanceOf');

/**
 * Get data about the pointer position in different coordinate spaces.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {CanvasObject|World|Canvas} target The target object of the pointer.
 *
 * @return {Object} An object with the coordinate objects (each having `x` and
 *     `y` properties): `element`, `canvas`, `world`, `target`.
 */
function getPositions(pointer, canvas, target) {
  var elementPosition = getPositionForCanvasElement(pointer, canvas);
  var canvasPosition = getPositionForCanvas(pointer, canvas, elementPosition);
  var worldPosition = getPositionForWorld(pointer, canvas, canvasPosition);
  var targetPosition;

  if (isInstanceOf(target, 'Canvas')) {
    targetPosition = canvasPosition;
  } else if (isInstanceOf(target, 'World')) {
    targetPosition = worldPosition;
  } else {
    targetPosition = getPositionForTarget(pointer, canvas, target,
        worldPosition);
  }

  return {
    element: elementPosition,
    canvas: canvasPosition,
    world: worldPosition,
    target: targetPosition
  };
}

/**
 * Get data about the pointer position in the coordinate space of the canvas
 * element.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 *
 * @return {Object} An object with `x` and `y` properties.
 */
function getPositionForCanvasElement(pointer, canvas) {
  // While testing in node env, window is not available
  var pageXOffset = (global.window && global.window.pageXOffset) || 0;
  var pageYOffset = (global.window && global.window.pageYOffset) || 0;

  // Calculate the mouse position relative to the viewport.
  // pointer.clientX exists, but has been incorrect in older versions of WebKit.
  var viewportX = pointer.x - pageXOffset;
  var viewportY = pointer.y - pageYOffset;

  // Calculate pointer position with the canvas element,
  // and account for the position of the element within the viewport.
  var boundingRect = canvas.element.getBoundingClientRect();
  var x = viewportX - Math.round(boundingRect.left);
  var y = viewportY - Math.round(boundingRect.top);

  return {x: x, y: y};
}

/**
 * Get data about the pointer position in the coordinate space of the canvas
 * pixel space.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {Object=} opt_elementPosition Optional object for the position in the
 *     canvas element. If not provided, it will be calculated.
 *
 * @return {Object} An object with `x` and `y` properties.
 */
function getPositionForCanvas(pointer, canvas, opt_elementPosition) {
  var element = canvas.element;
  var elementPosition = opt_elementPosition;
  if (!elementPosition) {
    elementPosition = getPositionForCanvasElement(pointer, canvas);
  }

  // Calculate the scale of the canvas element.
  // The element could have been resized with CSS to
  // fit more pixels for retina, or just transformed.
  var scaleX = element.width / element.clientWidth;
  var scaleY = element.height / element.clientHeight;

  // Calculate the scaled position (the scale caused by the canvas pixel
  // storage being larger/smaller than the CSS size of the element).
  var scaledX = scaleX * elementPosition.x;
  var scaledY = scaleY * elementPosition.y;

  return {x: scaledX, y: scaledY};
}

/**
 * Get data about the pointer position in the coordinate space of the world.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {Object=} opt_canvasPosition Optional object for the position in the
 *     canvas surface. If not provided, it will be calculated.
 *
 * @return {Object} An object with `x` and `y` properties.
 */
function getPositionForWorld(pointer, canvas, opt_canvasPosition) {
  var element = canvas.element;
  var canvasPosition = opt_canvasPosition;
  if (!canvasPosition) {
    canvasPosition = getPositionForCanvas(pointer, canvas);
  }

  // Calculate the position in world coordinate space
  var camera = canvas.camera;
  var positionInCameraX = canvasPosition.x - element.width / 2;
  var positionInCameraY = canvasPosition.y - element.height / 2;
  var positionInWorld = camera.getPointIn(camera.world, positionInCameraX,
      positionInCameraY);

  return positionInWorld;
}

/**
 * Get data about the pointer position in the coordinate space of the world.
 *
 * @param {PointerData} pointer Pointer object.
 * @param {Canvas} canvas Canvas instance.
 * @param {CanvasObject} target Canvas object.
 * @param {Object=} opt_canvasPosition Optional object for the position in the
 *     canvas surface. If not provided, it will be calculated.
 *
 * @return {Object} An object with `x` and `y` properties.
 */
function getPositionForTarget(pointer, canvas, target, opt_worldPosition) {
  var world = canvas.camera.world;
  var worldPosition = opt_worldPosition;
  if (!worldPosition) {
    worldPosition = getPositionForWorld(pointer, canvas);
  }
  return target.getPointFrom(world, worldPosition.x, worldPosition.y);
}

exports.get = getPositions;
exports.getForCanvasElement = getPositionForCanvasElement;
exports.getForCanvas = getPositionForCanvas;
exports.getForWorld = getPositionForWorld;
exports.getForTarget = getPositionForTarget;
