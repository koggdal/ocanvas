/**
 * @module ocanvas/shapes/base/RectangularCanvasObject
 */
'use strict';

var CanvasObject = require('./CanvasObject');
var inherit = require('../../utils/inherit');

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

  this.width = 0;
  this.height = 0;

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(RectangularCanvasObject, CanvasObject);

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
