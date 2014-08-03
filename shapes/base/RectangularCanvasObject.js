/**
 * @module ocanvas/shapes/base/RectangularCanvasObject
 */
'use strict';

var CanvasObject = require('./CanvasObject');

var inherit = require('../../utils/inherit');
var defineProperties = require('../../utils/defineProperties');
var jsonHelpers = require('../../utils/json');
var getClassName = require('../../utils/getClassName');

/**
 * @classdesc This is a class that a canvas object class can inherit from,
 *     to get common properties and methods for a rectangular object. To be
 *     seen as a rectangular object, it must define its size with the width
 *     and height properties.
 *
 * @property {number} width The width of the object.
 * @property {number} height The height of the object.
 *
 * @constructor
 * @augments {module:ocanvas/shapes/base/CanvasObject~CanvasObject}
 *
 * @example
 * var RectangularCanvasObject = require('ocanvas/shapes/base/RectangularCanvasObject');
 * var inherit = require('ocanvas/utils/inherit');
 *
 * function MyObject() {
 *   RectangularCanvasObject.call(this);
 * }
 * inherit(MyObject, RectangularCanvasObject);
 */
function RectangularCanvasObject(opt_properties) {
  CanvasObject.call(this);

  defineProperties(this, {
    width: {
      value: 0,
      set: function() { this.cache.invalidate('vertices-local'); }
    },
    height: {
      value: 0,
      set: function() { this.cache.invalidate('vertices-local'); }
    }
  }, {enumerable: true});

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(RectangularCanvasObject, CanvasObject);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
RectangularCanvasObject.className = 'RectangularCanvasObject';

/**
 * Properties that should be included in the plain object created by toObject.
 *
 * @type {Array}
 */
RectangularCanvasObject.objectProperties = CanvasObject.objectProperties.concat([
  'width',
  'height'
]);

/**
 * Create a new RectangularCanvasObject instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {RectangularCanvasObject} A RectangularCanvasObject instance.
 */
RectangularCanvasObject.fromObject = CanvasObject.fromObject;

/**
 * Create a new RectangularCanvasObject instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {RectangularCanvasObject} A RectangularCanvasObject instance.
 */
RectangularCanvasObject.fromJSON = CanvasObject.fromJSON;

/**
 * Convert the RectangularCanvasObject instance to a plain object.
 * This plain object can be converted to a JSON string.
 *
 * @return {Object} An object that represents this canvas object.
 */
RectangularCanvasObject.prototype.toObject = function() {
  var props = RectangularCanvasObject.objectProperties;
  return jsonHelpers.toObject(this, props, getClassName(this.constructor));
};

/**
 * Convert the RectangularCanvasObject instance to a JSON string.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
RectangularCanvasObject.prototype.toJSON = function(opt_space) {
  var props = RectangularCanvasObject.objectProperties;
  return jsonHelpers.toJSON(this, props, getClassName(this.constructor), opt_space);
};

/**
 * Calculate the origin in pixels from the default origin of an object.
 * The method will use the originX and originY properties, which can
 * contain special strings like 'left' or 'top'. It will then calculate
 * the real values based on that.
 *
 * @param {string=} opt_axis Coordinate axis to calculate for. Can be either
 *     'x', 'y' or left out. If not provided, it will default to calculate both.
 *
 * @return {number|Object.<string, number>} If an axis was passed in, this will
 *     return a number. If no axis was passed in, an object with properties `x`
 *     and `y` will be returned.
 */
RectangularCanvasObject.prototype.calculateOrigin = function(opt_axis) {
  var x = 0;
  var y = 0;

  var shouldGetX = !opt_axis || opt_axis === 'x';
  var shouldGetY = !opt_axis || opt_axis === 'y';

  if (shouldGetX) {
    switch (this.originX) {
      case 'left': x = 0; break;
      case 'center': x = this.width / 2; break;
      case 'right': x = this.width; break;
      default: x = parseFloat(this.originX, 10) || 0; break;
    }
  }

  if (shouldGetY) {
    switch (this.originY) {
      case 'top': y = 0; break;
      case 'center': y = this.height / 2; break;
      case 'bottom': y = this.height; break;
      default: y = parseFloat(this.originY, 10) || 0; break;
    }
  }

  if (shouldGetX && shouldGetY) return {x: x, y: y};
  if (shouldGetX) return x;
  if (shouldGetY) return y;

  // Return 0 for an invalid axis
  return 0;
};

/**
 * Render the path of the object to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
RectangularCanvasObject.prototype.renderPath = function(canvas) {
  var context = canvas.context;

  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  context.rect(x, y, this.width, this.height);
};

/**
 * Get the vertices for this object. The coordinates will be relative to the
 * coordinate space of the specified reference. If no reference is specified,
 * the coordinates will be relative to this object, without any transformations
 * applied.
 *
 * @param {Canvas|Camera|Scene|CanvasObject=} opt_reference The coordinate space
 *     the vertices should be relative to. If a canvas object is provided, it
 *     must exist in the parent chain for this object.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
RectangularCanvasObject.prototype.getVertices = function(opt_reference) {
  var cache = this.cache;
  var localCache = cache.get('vertices-local');
  var referenceCache = cache.get('vertices-reference');

  if (!opt_reference) {
    if (localCache.isValid) return localCache.vertices;
  } else {
    if (referenceCache.isValid) {
      if (referenceCache.reference === opt_reference) {
        return referenceCache.vertices;
      } else {
        cache.invalidate('vertices-reference');
      }
    }
    referenceCache.reference = opt_reference;
  }

  if (!localCache.vertices) {
    localCache.vertices = [
      {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}
    ];
  }

  if (!referenceCache.vertices) {
    referenceCache.vertices = [
      {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}
    ];
  }

  var lineWidth = 0;
  if (this.stroke) {
    var parts = this.stroke.split(' ');
    lineWidth = parseFloat(parts[0], 10);
  }

  var left = -this.calculateOrigin('x') - lineWidth;
  var right = left + this.width + lineWidth * 2;
  var top = -this.calculateOrigin('y') - lineWidth;
  var bottom = top + this.height + lineWidth * 2;

  var localVertices = localCache.vertices;

  localVertices[0].x = left;
  localVertices[0].y = top;
  localVertices[1].x = right;
  localVertices[1].y = top;
  localVertices[2].x = right;
  localVertices[2].y = bottom;
  localVertices[3].x = left;
  localVertices[3].y = bottom;

  cache.update('vertices-local');

  if (!opt_reference) return localVertices;

  var reference = opt_reference;
  var referenceVertices = referenceCache.vertices;
  this.getPointIn(reference, left, top, referenceVertices[0]);
  this.getPointIn(reference, right, top, referenceVertices[1]);
  this.getPointIn(reference, right, bottom, referenceVertices[2]);
  this.getPointIn(reference, left, bottom, referenceVertices[3]);

  this.cache.update('vertices-reference');

  return referenceVertices;
};

module.exports = RectangularCanvasObject;
