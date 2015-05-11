/**
 * @module ocanvas/classes/Tracker
 */
'use strict';

var raf = require('raf');
var isInstanceOf = require('../utils/isInstanceOf');

var TARGET_PRIORITY = 100;

/**
 * @classdesc The Tracker class is used for controlling the tracking of an
 *     object. This can be a camera tracking another object or camera, or it can
 *     be an object tracking another object or camera.
 *
 * @property {?CanvasObject|Camera} object The object that is tracking the
 *     target. Default is null.
 * @property {?CanvasObject|Camera} target The primary target for the tracker.
 *     This will be given a priority of 100. Must have the same parent as
 *     the `object` to be positioned correctly. Default is null.
 * @property {string} axis Which axis to track the target on. One of the values
 *     'none', 'x', 'y' or 'both'. Default is 'both'.
 * @property {number} softness The softness of the tracker movements. A higher
 *     value means slower and softer movements. The value 0 means that it will
 *     track the exact position of the target at all times. Default is 10.
 * @property {?CanvasObject} window An object that represents a window which the
 *     target can move within without moving the tracker object. This window
 *     object must be added to the scene, but doesn't have to be visible. It
 *     must have the same parent as the target object. Default is null.
 * @property {?CanvasObject} boundaries An object that represents the boundaries
 *     for tracking. The tracking object will try its best to not move outside
 *     this area. When checking the boundaries, it will compare the bounding
 *     rectangles of both the tracking object and this object representing the
 *     boundaries. Default is null.
 * @property {number} pushX The amount to push the object in the X axis. It will
 *     first take the target and all attractors, repellers and pushers into
 *     account, and than add this value on top of that.
 * @property {number} pushY The amount to push the object in the Y axis. It will
 *     first take the target and all attractors, repellers and pushers into
 *     account, and than add this value on top of that.
 * @property {Array.<TrackerAttractor>} attractors Array of attractor
 *     definitions. An attractor is an object that will attract the tracker with
 *     a certain priority, which will be weighted against the other attractors,
 *     repellers, pushers and the target. Changes to this array (or even
 *     replacing the array with a new one) will be used in the next frame.
 * @property {Array.<TrackerRepeller>} repellers Array of repeller definitions.
 *     A repeller is an object that will repel the tracker with a certain
 *     priority, which will be weighted against the other attractors, repellers,
 *     pushers and the target. Changes to this array (or even replacing the
 *     array with a new one) will be used in the next frame.
 * @property {Array.<TrackerPusher>} pushers Array of pusher definitions.
 *     A pusher is an object that will push the tracker in a direction with a
 *     certain priority, which will be weighted against the other attractors,
 *     repellers, pushers and the target. Changes to this array (or even
 *     replacing the array with a new one) will be used in the next frame.
 * @property {boolean} active True if the tracker is currently active and false
 *     if it's stopped. This is meant to be a read-only value, changing this
 *     will not start/stop the tracker. Default is false.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set on
 *     the object when instantiating it.
 *
 * @example
 * var target = new CanvasObject();
 * var tracker = new Tracker({
 *   target: target,
 *   axis: 'x',
 *   softness: 15
 * });
 */
function Tracker(opt_properties) {
  this.object = null;
  this.target = null;
  this.window = null;
  this.boundaries = null;
  this.softness = 10;
  this.axis = 'both';
  this.pushX = 0;
  this.pushY = 0;
  this.attractors = [];
  this.repellers = [];
  this.pushers = [];
  this.active = false;

  if (opt_properties) {
    for (var prop in opt_properties) {
      this[prop] = opt_properties[prop];
    }
  }

  this._timerId = null;
  this._targetX = 0;
  this._targetY = 0;
}

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Tracker.className = 'Tracker';

/**
 * Start tracking the target.
 */
Tracker.prototype.start = function() {
  if (this.active) return;
  if (!this.object) return;
  if (!this.target) return;

  this.active = true;

  // Set the initial target position to the current position of the object.
  // This is because a locked axis should still move towards the last set target
  // position, but if it's locked from the beginning, the target position will
  // be set to the default values of 0, which will cause the object to move
  // towards 0.
  this._targetX = this.object.x;
  this._targetY = this.object.y;

  var tracker = this;

  function tick() {
    tracker._timerId = raf(tick);
    tickHandler(tracker);
  }

  this._timerId = raf(tick);
};

/**
 * Stop tracking the target.
 */
Tracker.prototype.stop = function() {
  this.active = false;

  if (this._timerId !== null) {
    raf.cancel(this._timerId);
    this._timerId = null;
  }
};

/**
 * Lock the specified axis.
 *
 * @param {string} axis An axis. One of the values 'x', 'y' or 'both'.
 */
Tracker.prototype.lock = function(axis) {
  switch (axis) {
    case 'both': this.axis = 'none'; break;
    case 'x':
      if (this.axis === 'x') this.axis = 'none';
      if (this.axis === 'both') this.axis = 'y';
      break;
    case 'y':
      if (this.axis === 'y') this.axis = 'none';
      if (this.axis === 'both') this.axis = 'x';
      break;
  }
};

/**
 * Unlock the specified axis.
 *
 * @param {string} axis An axis. One of the values 'x', 'y' or 'both'.
 */
Tracker.prototype.unlock = function(axis) {
  switch (axis) {
    case 'both': this.axis = 'both'; break;
    case 'x':
      if (this.axis === 'y') this.axis = 'both';
      if (this.axis === 'none') this.axis = 'x';
      break;
    case 'y':
      if (this.axis === 'x') this.axis = 'both';
      if (this.axis === 'none') this.axis = 'y';
      break;
  }
};

/**
 * Check if the axis is currently locked.
 *
 * @param {string} axis An axis. One of the values 'none', 'x', 'y' or 'both'.
 *
 * @return {boolean} True if the axis is locked, false otherwise.
 */
Tracker.prototype.isAxisLocked = function(axis) {
  switch (axis) {
    case 'none': return (this.axis === 'both');
    case 'x': return (this.axis === 'y' || this.axis === 'none');
    case 'y': return (this.axis === 'x' || this.axis === 'none');
    case 'both': return (this.axis === 'none');
  }
};

/**
 * Update the position on the specified axis.
 * This will respect the set softness and will not change the set axis, just
 * temporarily update the specified axis until the target is reached.
 *
 * @param {string} axis An axis. One of the values 'x', 'y' or 'both'.
 */
Tracker.prototype.update = function(axis) {
  var updateX = (axis === 'x' || axis === 'both') && this.isAxisLocked('x');
  var updateY = (axis === 'y' || axis === 'both') && this.isAxisLocked('y');

  var targetPosition = getTargetPosition(this);
  if (updateX) this._targetX = targetPosition.x;
  if (updateY) this._targetY = targetPosition.y;
};

/**
 * Find the scene instance from an object or camera.
 *
 * @param {CanvasObject|Camera} object Object to start looking from.
 *
 * @return {Scene} The Scene instance.
 *
 * @private
 */
function findSceneFromObject(object) {
  if (object.scene) return object.scene;

  while (object && !isInstanceOf(object, 'Scene')) {
    object = object.parent;
  }

  return object;
}

/**
 * Get the maximum priority value among all the influencers. The priority for
 * the target object will be taken into account as well.
 *
 * @param {Array} influencers Array of influencers (TrackerAttractor or
 *     TrackerRepeller).
 *
 * @return {number} The maximum priority value.
 *
 * @private
 */
function getMaxPriority(influencers) {
  var max = TARGET_PRIORITY;

  for (var i = 0, l = influencers.length; i < l; i++) {
    max = Math.max(max, influencers[i].priority);
  }

  return max;
}

/**
 * Get an array with all the influencers for the target.
 *
 * @param {Tracker} tracker The Tracker instance.
 *
 * @return {Array} An array of influencers.
 *
 * @private
 */
function getInfluencers(tracker) {
  var attractors = tracker.attractors;
  var repellers = tracker.repellers;
  var pushers = tracker.pushers;
  return attractors.concat(repellers, pushers);
}

/**
 * Calculate what priority to use for a specific influencer. The influencer
 * itself has a priority, but to make nice transitions, the value that will be
 * used will fade out the further away from the target it is. The full priority
 * value set in the influencer is only used when the target is in the same
 * position as the influencer.
 *
 * @param {TrackerAttractor|TargetRepeller} influencer An influencer object.
 * @param {CanvasObject|Camera} target The target object.
 *
 * @return {number} The calculated priority.
 *
 * @private
 */
function calculatePriority(influencer, target) {
  var priority = influencer.priority;

  if (influencer.range > 0) {
    var distanceX = Math.abs(target.x - influencer.object.x);
    var distanceY = Math.abs(target.y - influencer.object.y);
    var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance <= influencer.range) {
      priority = influencer.priority * (1 - distance / influencer.range);
    } else {
      priority = 0;
    }
  } else {
    priority = 0;
  }

  return priority;
}

/**
 * Update the window object for a tracker. This function assumes that the
 * tracker has a window object. It will update the position of the window object
 * if the target object has moved out of the window.
 *
 * @param {Tracker} tracker The Tracker instance to use.
 *
 * @return {boolean} True if the window was updated, false otherwise.
 *
 * @private
 */
function updateWindow(tracker) {
  var target = tracker.target;
  var windowObject = tracker.window;

  var targetRect = getBoundingRectangle(target);
  var windowRect = getBoundingRectangle(windowObject);

  var wasUpdated = false;

  var targetOriginX, targetOriginY;
  var winOriginX, winOriginY;

  // Target is below the window
  if (targetRect.bottom > windowRect.bottom) {
    targetOriginY = target.calculateOrigin('y');
    windowObject.y = target.y + targetRect.height - targetOriginY;
    wasUpdated = true;
  }

  // Target is above the window
  if (targetRect.top < windowRect.top) {
    targetOriginY = target.calculateOrigin('y');
    winOriginY = windowObject.calculateOrigin('y');
    windowObject.y = target.y - targetOriginY + winOriginY;
    wasUpdated = true;
  }

  // Target is to the right of the window
  if (targetRect.right > windowRect.right) {
    targetOriginX = target.calculateOrigin('x');
    winOriginX = windowObject.calculateOrigin('x');
    windowObject.x = target.x + targetRect.width - targetOriginX - winOriginX;
    wasUpdated = true;
  }

  // Target is to the left of the window
  if (targetRect.left < windowRect.left) {
    targetOriginX = target.calculateOrigin('x');
    winOriginX = windowObject.calculateOrigin('x');
    windowObject.x = target.x - targetOriginX + winOriginX;
    wasUpdated = true;
  }

  return wasUpdated;
}

/**
 * Get the target position for a tracker. This will take all influencers into
 * account, as well as the actual target object.
 *
 * @param {Tracker} tracker The Tracker instance.
 *
 * @return {Object} An object with `x` and `y` properties.
 *
 * @private
 */
function getTargetPosition(tracker) {
  var influencers = getInfluencers(tracker);
  var target = tracker.window || tracker.target;
  var object = tracker.object;
  var x = target.x;
  var y = target.y;

  if (influencers.length > 0) {

    // Get the maximum priority used by any object that will affect the position
    var maxPriority = getMaxPriority(influencers);

    var quotientSum = 0;
    var positionSumX = 0;
    var positionSumY = 0;

    // Start with the calculations for the target object
    var targetQuotient = TARGET_PRIORITY / maxPriority;
    quotientSum += targetQuotient;
    positionSumX += targetQuotient * target.x;
    positionSumY += targetQuotient * target.y;

    // Then continue with all the influencers
    for (var i = 0, l = influencers.length; i < l; i++) {
      var item = influencers[i];
      var priority = calculatePriority(item, target);

      if (priority > 0) {
        var quotient = priority / maxPriority;
        quotientSum += quotient;
        var targetPos = item.calculateTargetPosition(object, target);
        positionSumX += quotient * targetPos.x;
        positionSumY += quotient * targetPos.y;
      }
    }

    // Finally calculate the new target position based on all influencers
    x = positionSumX / quotientSum;
    y = positionSumY / quotientSum;
  }

  var pos = constrainPositionToBoundaries(tracker, x, y);

  return pos;
}

/**
 * Make sure that the position is constrained by the set boundaries (if set).
 *
 * @param {Tracker} tracker The Tracker instance.
 * @param {number} x The X coordinate.
 * @param {number} y The Y coordinate.
 *
 * @return {Object} An object with `x` and `y` properties.
 *
 * @private
 */
function constrainPositionToBoundaries(tracker, x, y) {
  if (!tracker.boundaries) return {x: x, y: y};

  var object = tracker.object;

  var objectRectangleZoom = getBoundingRectangle(object);
  var objectRectangleSize = getBoundingRectangleForSize(object);
  var boundsRect = getBoundingRectangle(tracker.boundaries);

  // Use the bounding rectangle for the object at the current position to
  // calculate where the edges of the bounding rectangle will be at the new
  // target position.
  var targetPosLeft = x - (object.x - objectRectangleZoom.left);
  var targetPosRight = x + (objectRectangleZoom.right - object.x);
  var targetPosTop = y - (object.y - objectRectangleZoom.top);
  var targetPosBottom = y + (objectRectangleZoom.bottom - object.y);
  var targetPosWidth = targetPosRight - targetPosLeft;
  var targetPosHeight = targetPosBottom - targetPosTop;

  var isToTheLeft = targetPosLeft < boundsRect.left;
  var isToTheRight = targetPosRight > boundsRect.right;
  var isToTheTop = targetPosTop < boundsRect.top;
  var isToTheBottom = targetPosBottom > boundsRect.bottom;

  // If the target is wider than the boundaries, make it centered horizontally
  if (targetPosWidth > boundsRect.width) {
    isToTheLeft = true; isToTheRight = true;
  }

  // If the target is taller than the boundaries, make it centered vertically
  if (targetPosHeight > boundsRect.height) {
    isToTheTop = true; isToTheBottom = true;
  }

  if (isToTheLeft && isToTheRight) {
    var boundsCenterX = (boundsRect.right - boundsRect.left) / 2;
    x = boundsRect.left + boundsCenterX;
  } else if (isToTheLeft) {
    x = boundsRect.left + (object.x - objectRectangleSize.left);
  } else if (isToTheRight) {
    x = boundsRect.right - (objectRectangleSize.right - object.x);
  }

  if (isToTheTop && isToTheBottom) {
    var boundsCenterY = (boundsRect.bottom - boundsRect.top) / 2;
    y = boundsRect.top + boundsCenterY;
  } else if (isToTheTop) {
    y = boundsRect.top + (object.y - objectRectangleSize.top);
  } else if (isToTheBottom) {
    y = boundsRect.bottom - (objectRectangleSize.bottom - object.y);
  }

  return {x: x, y: y};
}

/**
 * Update the position of an object. This will use the softness setting, so if
 * a softness higher than 0 is used, it will move the object to the next
 * position towards the final target position.
 *
 * @param {string} axis The axis to update. Valid values are 'x' or 'y'.
 * @param {number} targetPos The new target position for the specified axis.
 * @param {CanvasObject|Camera} object The object to move.
 * @param {number} softness The softness to use for smooth transitions.
 *
 * @private
 */
function updatePosition(axis, targetPos, object, softness) {

  // When softness is 0, there is no need to animate the transitions
  if (softness === 0) {
    object[axis] = targetPos;

  // Other softness values will animate to make smooth transitions
  } else {
    var doneAnimating = Math.abs(object[axis] - targetPos) < 1;

    if (doneAnimating) {
      object[axis] = targetPos;
    } else {
      object[axis] = object[axis] - (object[axis] - targetPos) / softness;
    }
  }
}

/**
 * The handler function for each tick of the tracker animation. This will:
 * - Update the window object if there is any.
 * - Check for any locked axis.
 * - Calculate a new target position based on the target and all influencers.
 * - Use the current push values to push the tracker in any direction.
 * - Move the object to a new position based on the softness setting
 *
 * @param {Tracker} tracker The Tracker instance.
 *
 * @private
 */
function tickHandler(tracker) {
  var shouldUpdateTarget = true;

  if (tracker.window) {
    var wasUpdated = updateWindow(tracker);

    // If the target only moved inside the window, there is no need to
    // calculate a new target position.
    if (!wasUpdated) {
      shouldUpdateTarget = false;
    }
  }

  if (shouldUpdateTarget) {
    var targetPosition = getTargetPosition(tracker);
    var shouldUpdateX = tracker.axis === 'x' || tracker.axis === 'both';
    var shouldUpdateY = tracker.axis === 'y' || tracker.axis === 'both';
    if (shouldUpdateX) tracker._targetX = targetPosition.x;
    if (shouldUpdateY) tracker._targetY = targetPosition.y;
  }

  var targetX = tracker._targetX + tracker.pushX;
  var targetY = tracker._targetY + tracker.pushY;

  var softness = tracker.softness;
  var object = tracker.object;

  updatePosition('x', targetX, object, softness);
  updatePosition('y', targetY, object, softness);
}

/**
 * Get the bounding rectangle for an object. This will try to get the rectangle
 * for the object's tree if possible, otherwise just for the object itself.
 *
 * @param {CanvasObject|Camera} object The object to get the rectangle for.
 *
 * @return {Object} An object with data about the bounding rectangle. The
 *     properties of the returned object are: top, right, bottom, left, width,
 *     height.
 *
 * @private
 */
function getBoundingRectangle(object) {
  var scene = findSceneFromObject(object);

  if (isInstanceOf(object, 'Camera')) {
    return object.getBoundingRectangle(scene, 'zoom');
  } else {
    return object.getBoundingRectangleForTree(scene);
  }
}

/**
 * Get the bounding rectangle for an object. This will try to get the rectangle
 * for the object's tree if possible, otherwise just for the object itself.
 *
 * @param {CanvasObject|Camera} object The object to get the rectangle for.
 *
 * @return {Object} An object with data about the bounding rectangle. The
 *     properties of the returned object are: top, right, bottom, left, width,
 *     height.
 *
 * @private
 */
function getBoundingRectangleForSize(object) {
  var scene = findSceneFromObject(object);

  if (isInstanceOf(object, 'Camera')) {
    return object.getBoundingRectangle(scene, 'size');
  } else {
    return object.getBoundingRectangleForTree(scene);
  }
}

module.exports = Tracker;
