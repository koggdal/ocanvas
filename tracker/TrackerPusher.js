/**
 * @module ocanvas/classes/TrackerPusher
 */
'use strict';

/**
 * @classdesc The TrackerPusher class represents a pusher for a tracker. A
 *     pusher will push the object in the chosen direction when the target is
 *     close.
 *
 * @property {CanvasObject|Camera?} object The object that represents the
 *     pusher. This object must be added to the scene, but doesn't have to
 *     be visible. The default value is `null`.
 * @property {number} range A range around the object's position where the
 *     pusher will be active. This value is a radius that forms a circle
 *     around the object. The default value is 0.
 * @property {number} priority The importance of the pusher. The target that
 *     the tracker tracks will be assigned a priority of 100, for reference. The
 *     priority set here will be the maximum priority that will be used when the
 *     target object is at the same position as the pusher. The further away
 *     the target is, the lower priority is calculated for the pusher, to
 *     make the transition between interest points as smooth as possible. The
 *     default value is 100.
 * @property {number} angle The angle in degrees. The angle 0 points up.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set on
 *     the object when instantiating it.
 *
 * @example
 * var repeller1 = new TrackerPusher({
 *   object: canvasObject,
 *   range: 300,
 *   priority: 200,
 *   angle: 45
 * });
 * var repeller2 = new TrackerPusher({
 *   object: canvasObject
 * });
 * var repeller3 = new TrackerPusher();
 */
function TrackerPusher(opt_properties) {
  this.object = null;
  this.range = 0;
  this.priority = 100;
  this.angle = 0;

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
TrackerPusher.className = 'TrackerPusher';

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
TrackerPusher.prototype.calculateTargetPosition = function(object, target) {
  var angle = ((this.angle % 360) + 360) % 360;

  // Calculate the quadrant where the angle is pointing. The angle 0 is upwards
  // and in quadrant 1. We then need to calculate the angle for the direction
  // inside the quadrant to be able to calculate the X and Y offsets.
  var quadrant;
  if (angle < 90) quadrant = 1;
  else if (angle < 180) quadrant = 2;
  else if (angle < 270) quadrant = 3;
  else quadrant = 4;
  var quadrantAngle = angle - (quadrant - 1) * 90;
  var angleRadians = quadrantAngle * (Math.PI / 180);

  // Get the new difference between the tracking object and the repeller
  var a = Math.sin(angleRadians) * this.range;
  var b = Math.cos(angleRadians) * this.range;

  // Depending on which quadrant we're working in, sin and cos are switched
  var x = (quadrant === 1 || quadrant === 3) ? a : b;
  var y = (quadrant === 1 || quadrant === 3) ? b : a;

  // Flip the sign if needed, to move the object to the correct side
  x *= (quadrant === 1 || quadrant === 2) ? 1 : -1;
  y *= (quadrant === 2 || quadrant === 3) ? 1 : -1;

  // Add the current position of the repeller to get the new target position
  x += this.object.x;
  y += this.object.y;

  return {x: x, y: y};
};

module.exports = TrackerPusher;
