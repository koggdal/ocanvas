/**
 * @module ocanvas/classes/TrackerRepeller
 */
'use strict';

/**
 * @classdesc The TrackerRepeller class represents a repeller for a tracker.
 *
 * @property {?CanvasObject|Camera} object The object that represents the
 *     repeller. This object must be added to the scene, but doesn't have to
 *     be visible. The default value is `null`.
 * @property {number} range A range around the object's position where the
 *     repeller will be active. This value is a radius that forms a circle
 *     around the object. The default value is 0.
 * @property {number} priority The importance of the repeller. The target that
 *     the tracker tracks will be assigned a priority of 100, for reference. The
 *     priority set here will be the maximum priority that will be used when the
 *     target object is at the same position as the repeller. The further away
 *     the target is, the lower priority is calculated for the repeller, to
 *     make the transition between interest points as smooth as possible. The
 *     default value is 100.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set on
 *     the object when instantiating it.
 *
 * @example
 * var repeller1 = new TrackerRepeller({
 *   object: canvasObject,
 *   range: 300,
 *   priority: 200
 * });
 * var repeller2 = new TrackerRepeller({
 *   object: canvasObject
 * });
 * var repeller3 = new TrackerRepeller();
 */
function TrackerRepeller(opt_properties) {
  this.object = null;
  this.range = 0;
  this.priority = 100;

  if (opt_properties) {
    for (var prop in opt_properties) {
      this[prop] = opt_properties[prop];
    }
  }
}

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
TrackerRepeller.className = 'TrackerRepeller';

/**
 * Calculate the new target position based on the object that is tracking the
 * target and that target object.
 *
 * @param {CanvasObject|Camera} object The object tracking the target.
 * @param {CanvasObject|Camera} target The target object for the tracker.
 *
 * @return {Object} A position object with properties `x` and `y`, which are
 *     coordinates relative to the scene.
 */
TrackerRepeller.prototype.calculateTargetPosition = function(object, target) {

  // Get one of the angles in the diff triangle
  var diffX = this.object.x - object.x;
  var diffY = this.object.y - object.y;
  var angle = Math.atan(Math.abs(diffX) / Math.abs(diffY));

  // Get the new difference between the tracking object and the repeller
  var x = Math.sin(angle) * this.range;
  var y = Math.cos(angle) * this.range;

  // Flip the sign if needed, to move the object to the correct side
  x *= diffX < 0 ? 1 : -1;
  y *= diffY < 0 ? 1 : -1;

  // Add the current position of the repeller to get the new target position
  x += this.object.x;
  y += this.object.y;

  return {x: x, y: y};
};

module.exports = TrackerRepeller;
