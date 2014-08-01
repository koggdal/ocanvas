/**
 * @module ocanvas/classes/TrackerAttractor
 */
'use strict';

/**
 * @classdesc The TrackerAttractor class represents an attractor for a tracker.
 *
 * @property {CanvasObject|Camera?} object The object that represents the
 *     attractor. This object must be added to the scene, but doesn't have to
 *     be visible. The default value is `null`.
 * @property {number} range A range around the object's position where the
 *     attractor will be active. This value is a radius that forms a circle
 *     around the object. The default value is 0.
 * @property {number} priority The importance of the attractor. The target that
 *     the tracker tracks will be assigned a priority of 100, for reference. The
 *     priority set here will be the maximum priority that will be used when the
 *     target object is at the same position as the attractor. The further away
 *     the target is, the lower priority is calculated for the attractor, to
 *     make the transition between interest points as smooth as possible. The
 *     default value is 100.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set on
 *     the object when instantiating it.
 *
 * @example
 * var attractor1 = new TrackerAttractor({
 *   object: canvasObject,
 *   range: 300,
 *   priority: 200
 * });
 * var attractor2 = new TrackerAttractor({
 *   object: canvasObject
 * });
 * var attractor3 = new TrackerAttractor();
 */
function TrackerAttractor(opt_properties) {
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
TrackerAttractor.className = 'TrackerAttractor';

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
TrackerAttractor.prototype.calculateTargetPosition = function(object, target) {

  // Return the position of the attractor object
  return {
    x: this.object.x,
    y: this.object.y
  };
};

module.exports = TrackerAttractor;
