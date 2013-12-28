/**
 * @module ocanvas/shapes/base/RectangularCanvasObject
 */
'use strict';

var CanvasObject = require('./CanvasObject');
var inherit = require('../../utils/inherit');
var defineProperties = require('../../utils/defineProperties');
var jsonHelpers = require('../../utils/json');

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

  this.constructorName = 'RectangularCanvasObject';

  defineProperties(this, {
    width: {
      value: 0,
      set: function() { this.vertexCache.invalidate(); }
    },
    height: {
      value: 0,
      set: function() { this.vertexCache.invalidate(); }
    }
  }, {enumerable: true});

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(RectangularCanvasObject, CanvasObject);

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
  return jsonHelpers.toObject(this, props, this.constructorName);
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
  return jsonHelpers.toJSON(this, props, this.constructorName, opt_space);
};


/**
 * Calculate the origin in pixels from the default origin of an object.
 * The method will use the originX and originY properties, which can
 * contain special strings like 'left' or 'top'. It will then calculate
 * the real values based on that.
 *
 * @return {Object.<string, number>} An object with properties x and y.
 */
RectangularCanvasObject.prototype.calculateOrigin = function() {
  var x = 0;
  var y = 0;

  switch (this.originX) {
    case 'left': x = 0; break;
    case 'center': x = this.width / 2; break;
    case 'right': x = this.width; break;
    default: x = parseFloat(this.originX, 10) || 0; break;
  }

  switch (this.originY) {
    case 'top': y = 0; break;
    case 'center': y = this.height / 2; break;
    case 'bottom': y = this.height; break;
    default: y = parseFloat(this.originY, 10) || 0; break;
  }

  return {
    x: x,
    y: y
  };
};

/**
 * Render the path of the object to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
RectangularCanvasObject.prototype.renderPath = function(canvas) {
  var context = canvas.context;

  var origin = this.calculateOrigin();
  var x = -origin.x;
  var y = -origin.y;

  context.rect(x, y, this.width, this.height);
};

/**
 * Get the vertices for this object. The coordinates will be relative
 * to the origin of this object and are not affected by any transformations.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
RectangularCanvasObject.prototype.getVertices = function() {
  var cache = this.vertexCache.local;

  if (cache.valid) return cache.vertices;

  if (!cache.vertices) {
    cache.vertices = new Array(4);
    cache.vertices[0] = {x: 0, y: 0};
    cache.vertices[1] = {x: 0, y: 0};
    cache.vertices[2] = {x: 0, y: 0};
    cache.vertices[3] = {x: 0, y: 0};
  }

  var origin = this.calculateOrigin();

  var lineWidth = 0;
  if (this.stroke) {
    var parts = this.stroke.split(' ');
    lineWidth = parseFloat(parts[0], 10);
  }

  var left = -origin.x - lineWidth;
  var right = left + this.width + lineWidth * 2;
  var top = -origin.y - lineWidth;
  var bottom = top + this.height + lineWidth * 2;

  var vertices = cache.vertices;

  vertices[0].x = left;
  vertices[0].y = top;
  vertices[1].x = right;
  vertices[1].y = top;
  vertices[2].x = right;
  vertices[2].y = bottom;
  vertices[3].x = left;
  vertices[3].y = bottom;

  cache.valid = true;

  return vertices;
};

module.exports = RectangularCanvasObject;
