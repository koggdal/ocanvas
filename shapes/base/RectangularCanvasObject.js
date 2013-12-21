/**
 * @module ocanvas/shapes/base/RectangularCanvasObject
 */
'use strict';

var CanvasObject = require('./CanvasObject');
var inherit = require('../../utils/inherit');
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
  this.width = 0;
  this.height = 0;

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
  return jsonHelpers.toObject(this, props, 'RectangularCanvasObject');
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
  return jsonHelpers.toJSON(this, props, 'RectangularCanvasObject', opt_space);
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

module.exports = RectangularCanvasObject;
