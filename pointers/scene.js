/**
 * @module ocanvas/pointers/scene
 * @private
 */
'use strict';

/**
 * Find the front object for a collection of objects, based on x and y
 * coordinates relative to the canvas.
 *
 * @param {Canvas} canvas The Canvas instance.
 * @param {number} x The X coordinate.
 * @param {number} y The Y coordinate.
 * @param {Collection} objects Collection of canvas objects.
 *
 * @return {CanvasObject?} The canvas object that's in front for the specified
 *     coordinates, or null if not found.
 */
function findFrontObject(canvas, x, y, objects) {
  for (var i = objects.length; i--;) {
    var object = objects.get(i);
    if (object.isPointInsideTree(x, y, canvas)) {
      if (object.children.length > 0) {
        return findFrontObject(canvas, x, y, object.children) || object;
      } else {
        return object;
      }
    }
  }
  return null;
}

/**
 * Find the front object for a specific position in a canvas.
 *
 * @param {Canvas} canvas The Canvas instance.
 * @param {number} x The X coordinate.
 * @param {number} y The Y coordinate.
 *
 * @return {CanvasObject?} The canvas object that's in front for the specified
 *     coordinates, or null if not found.
 */
function findFrontObjectInCanvas(canvas, x, y) {
  var camera = canvas.camera;
  var scene = camera && camera.scene;
  var objects = scene && scene.objects;

  if (!objects) return null;

  return findFrontObject(canvas, x, y, objects);
}

/**
 * Test if an object is a parent of another object.
 *
 * @param {CanvasObject} parentCandidate The potential parent object.
 * @param {CanvasObject} object The potential child object.
 *
 * @return {boolean} True if the first object is a parent of the second, false
 *     otherwise.
 */
function isParentOf(parentCandidate, object) {
  if (parentCandidate === object) return false;

  while (object && object !== parentCandidate) {
    object = object.parent;
  }
  return object === parentCandidate;
}

/**
 * Get the parent chain from one object to another object.
 * The returned array will be ordered so that the first item is the innermost
 * object, and the last item is the outermost object.
 *
 * @param {CanvasObject} object Object to start at.
 * @param {CanvasObject=} opt_outerParent The outermost object. Will not be
 *     included in the final output array. If not provided, the array will
 *     contain all objects until there is no more parent.
 *
 * @return {Array.<CanvasObject|Scene>} An array of canvas objects and in most
 *     cases a Scene instance as the last object.
 */
function getParentChain(object, opt_outerParent) {
  var chain = [];
  while (object) {
    if (opt_outerParent && object === opt_outerParent) {
      break;
    }
    chain.push(object);
    object = object.parent;
  }
  return chain;
}

/**
 * Get the object that two other objects share as a common parent somewhere up
 * in the chain.
 *
 * @param {CanvasObject} object1 The first canvas object.
 * @param {CanvasObject} object2 The second canvas object.
 *
 * @return {CanvasObject|Scene?} The object (or Scene instance) that both objects
 *     share. If nothing that matches is found, null is returned.
 */
function findSharedParent(object1, object2) {
  var chain1 = getParentChain(object1);
  var chain2 = getParentChain(object2);

  var parent = null;

  for (var i = chain1.length, n = chain2.length; i--, n--;) {
    if (chain1[i] !== chain2[n]) break;
    parent = chain1[i];
  }

  return parent;
}

exports.findFrontObject = findFrontObject;
exports.findFrontObjectInCanvas = findFrontObjectInCanvas;
exports.isParentOf = isParentOf;
exports.getParentChain = getParentChain;
exports.findSharedParent = findSharedParent;
