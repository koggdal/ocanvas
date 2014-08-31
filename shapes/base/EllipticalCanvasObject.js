/**
 * @module ocanvas/shapes/base/EllipticalCanvasObject
 */
'use strict';

var CanvasObject = require('./CanvasObject');

var inherit = require('../../utils/inherit');
var defineProperties = require('../../utils/defineProperties');
var isInstanceOf = require('../../utils/isInstanceOf');
var jsonHelpers = require('../../utils/json');
var matrixUtils = require('../../utils/matrix');
var getClassName = require('../../utils/getClassName');

/**
 * @classdesc This is a class that a canvas object class can inherit from,
 *     to get common properties and methods for an elliptical object. To be
 *     seen as an elliptical object, it must define its size with the radiusX
 *     and radiusY properties. An elliptical object will have its origin in the
 *     center.
 *
 * @property {number} radiusX The horisontal radius of the object.
 * @property {number} radiusY The vertical radius of the object.
 *
 * @constructor
 * @augments {module:ocanvas/shapes/base/CanvasObject~CanvasObject}
 *
 * @example
 * var EllipticalCanvasObject =
 *     require('ocanvas/shapes/base/EllipticalCanvasObject');
 * var inherit = require('ocanvas/utils/inherit');
 *
 * function MyObject() {
 *   EllipticalCanvasObject.call(this);
 * }
 * inherit(MyObject, EllipticalCanvasObject);
 */
function EllipticalCanvasObject(opt_properties) {
  CanvasObject.call(this);

  defineProperties(this, {
    radiusX: {
      value: 0,
      set: function() {
        this.cache.invalidate('vertices-local');
        this.cache.invalidate('vertices-reference');
      }
    },
    radiusY: {
      value: 0,
      set: function() {
        this.cache.invalidate('vertices-local');
        this.cache.invalidate('vertices-reference');
      }
    }
  }, {enumerable: true});

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(EllipticalCanvasObject, CanvasObject);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
EllipticalCanvasObject.className = 'EllipticalCanvasObject';

/**
 * Properties that should be included in the plain object created by toObject.
 *
 * @type {Array}
 */
EllipticalCanvasObject.objectProperties = CanvasObject.objectProperties.concat([
  'radiusX',
  'radiusY'
]);

/**
 * Create a new EllipticalCanvasObject instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {EllipticalCanvasObject} An EllipticalCanvasObject instance.
 */
EllipticalCanvasObject.fromObject = CanvasObject.fromObject;

/**
 * Create a new EllipticalCanvasObject instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {EllipticalCanvasObject} An EllipticalCanvasObject instance.
 */
EllipticalCanvasObject.fromJSON = CanvasObject.fromJSON;

/**
 * Convert the EllipticalCanvasObject instance to a plain object.
 * This plain object can be converted to a JSON string.
 *
 * @return {Object} An object that represents this canvas object.
 */
EllipticalCanvasObject.prototype.toObject = function() {
  var props = EllipticalCanvasObject.objectProperties;
  return jsonHelpers.toObject(this, props, getClassName(this.constructor));
};

/**
 * Convert the EllipticalCanvasObject instance to a JSON string.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
EllipticalCanvasObject.prototype.toJSON = function(opt_space) {
  var props = EllipticalCanvasObject.objectProperties;
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
EllipticalCanvasObject.prototype.calculateOrigin = function(opt_axis) {
  var x = 0;
  var y = 0;

  var shouldGetX = !opt_axis || opt_axis === 'x';
  var shouldGetY = !opt_axis || opt_axis === 'y';

  if (shouldGetX) {
    switch (this.originX) {
      case 'left': x = -this.radiusX; break;
      case 'center': x = 0; break;
      case 'right': x = this.radiusX; break;
      default: x = parseFloat(this.originX, 10) || 0; break;
    }
  }

  if (shouldGetY) {
    switch (this.originY) {
      case 'top': y = -this.radiusY; break;
      case 'center': y = 0; break;
      case 'bottom': y = this.radiusY; break;
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
EllipticalCanvasObject.prototype.getVertices = function(opt_reference) {
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

  if (!localCache.isSetup) {
    localCache.isSetup = true;
    localCache.vertices = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0},
        {x: 0, y: 0}];
  }

  if (!referenceCache.isSetup) {
    referenceCache.isSetup = true;
    referenceCache.vertices = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0},
        {x: 0, y: 0}];
    referenceCache.matrix = matrixUtils.getIdentityMatrix();
    referenceCache.sizeMatrix = matrixUtils.getIdentityMatrix();
    referenceCache.matrixList = [];
  }

  if (opt_reference) {
    cache.update('vertices-reference');
    return getReferenceVertices(this, referenceCache, opt_reference);
  } else {
    cache.update('vertices-local');
    return getLocalVertices(this, localCache);
  }
};

/**
 * Get the line width for an object's stroke.
 *
 * @param {EllipticalCanvasObject} object An elliptical object.
 *
 * @return {number} The line width.
 *
 * @private
 */
function getLineWidth(object) {
  var lineWidth = 0;
  if (object.stroke) {
    var parts = object.stroke.split(' ');
    lineWidth = parseFloat(parts[0], 10);
  }
  return lineWidth;
}

/**
 * Get the vertices for the passed ellipse, in local coordinate space.
 *
 * @param {EllipticalCanvasObject} object An elliptical object.
 * @param {Object} cache A cache unit.
 *
 * @return {Array} Array of vertices. This is the same object as cache.vertices.
 *
 * @private
 */
function getLocalVertices(object, cache) {
  var lineWidth = getLineWidth(object);
  var radiusX = object.radiusX + lineWidth;
  var radiusY = object.radiusY + lineWidth;
  var centerX = -object.calculateOrigin('x');
  var centerY = -object.calculateOrigin('y');
  var left = centerX - radiusX;
  var right = centerX + radiusX;
  var top = centerY - radiusY;
  var bottom = centerY + radiusY;

  var vertices = cache.vertices;
  vertices[0].x = centerX;
  vertices[0].y = top;
  vertices[1].x = right;
  vertices[1].y = centerY;
  vertices[2].x = centerX;
  vertices[2].y = bottom;
  vertices[3].x = left;
  vertices[3].y = centerY;

  return vertices;
}

/**
 * Get the vertices for the passed ellipse, in the coordinate space for the
 * reference.
 *
 * @param {EllipticalCanvasObject} object An elliptical object.
 * @param {Object} cache A cache unit.
 * @param {CanvasObject|Scene|Canvas} reference The reference object.
 *
 * @return {Array} Array of vertices. This is the same object as cache.vertices.
 *
 * @private
 */
function getReferenceVertices(object, cache, reference) {

  // Get an empty array to store matrices in
  var matrices = cache.matrixList;
  matrices.length = 0;

  // Add a matrix for the ellipse size
  var lineWidth = getLineWidth(object);
  var radiusX = object.radiusX + lineWidth;
  var radiusY = object.radiusY + lineWidth;
  var sizeMatrix = cache.sizeMatrix;
  sizeMatrix.setData(radiusX, 0, 0, 0, radiusY, 0, 0, 0, 1);
  matrices.push(sizeMatrix);

  // Get an identity matrix
  var transformationMatrix = cache.matrix;
  transformationMatrix.setIdentityData();

  // Add the matrix of each object in the parent chain up until the reference
  // (including this object). Each matrix will be added to the front of the
  // array, as we want it in the order 'outermost object to innermost object'.
  var obj = object;
  var ref = obj;
  while (isInstanceOf(obj, 'CanvasObject') && obj !== reference) {
    matrices.unshift(obj.getTransformationMatrix());
    ref = obj;
    obj = obj.parent;
  }
  object.cache.get('combinedTransformations').reference = ref;
  object.cache.update('combinedTransformations');

  var camera;
  var canvas;
  if (isInstanceOf(reference, 'Camera')) camera = reference;
  if (isInstanceOf(reference, 'Canvas')) {
    canvas = reference;
    camera = canvas.camera;
  }

  if (camera) {
    camera.getTransformationMatrix(); // This creates the inverted matrix
    var cameraMatrix = camera.cache.get('transformations').matrixInverted;
    matrices.unshift(cameraMatrix);
  }

  if (canvas) matrices.unshift(canvas.getTransformationMatrix());

  // Add the output matrix to the front of the array, as the array will be used
  // with Function#apply (this array will be used as the first argument).
  matrices.unshift(transformationMatrix);

  // Multiply all matrices together and get the product of it all. The function
  // will use the first matrix as the target matrix, and it will also return it.
  var m = matrixUtils.setProduct.apply(matrixUtils, matrices);

  // Calculate the minimum and maximum coordinates, relative to the reference.
  // More on this here:
  // http://tavianator.com/2014/06/exact-bounding-boxes-for-spheres-ellipsoids/
  var xMin = m[2] - Math.sqrt(m[0] * m[0] + m[1] * m[1]);
  var xMax = m[2] + Math.sqrt(m[0] * m[0] + m[1] * m[1]);
  var yMin = m[5] - Math.sqrt(m[3] * m[3] + m[4] * m[4]);
  var yMax = m[5] + Math.sqrt(m[3] * m[3] + m[4] * m[4]);

  // Set the coordinates in the vertex objects
  var vertices = cache.vertices;
  vertices[0].x = xMin;
  vertices[0].y = yMin;
  vertices[1].x = xMax;
  vertices[1].y = yMin;
  vertices[2].x = xMax;
  vertices[2].y = yMax;
  vertices[3].x = xMin;
  vertices[3].y = yMax;

  return vertices;
}

module.exports = EllipticalCanvasObject;
