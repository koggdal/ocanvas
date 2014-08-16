/**
 * @module ocanvas/shapes/Rectangle
 */
'use strict';

var RectangularCanvasObject = require('./base/RectangularCanvasObject');
var inherit = require('../utils/inherit');
var isInstanceOf = require('../utils/isInstanceOf');

/**
 * @classdesc A rectangle canvas object, used to draw a rectangle.
 *
 * @constructor
 *
 * @example
 * var Scene = require('ocanvas/classes/Scene');
 * var Rectangle = require('ocanvas/shapes/Rectangle');
 *
 * var scene = new Scene();
 * var rectangle = new Rectangle({
 *   x: 30,
 *   y: 30,
 *   width: 100,
 *   height: 50,
 *   fill: 'red'
 * });
 * scene.objects.add(rectangle);
 */
function Rectangle(opt_properties) {
  RectangularCanvasObject.call(this);

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(Rectangle, RectangularCanvasObject);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Rectangle.className = 'Rectangle';

/**
 * Create a new Rectangle instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {Rectangle} A Rectangle instance.
 */
Rectangle.fromObject = RectangularCanvasObject.fromObject;

/**
 * Create a new Rectangle instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {Rectangle} A Rectangle instance.
 */
Rectangle.fromJSON = RectangularCanvasObject.fromJSON;

/**
 * Render the object to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
Rectangle.prototype.render = function(canvas) {
  RectangularCanvasObject.prototype.render.call(this, canvas);

  var context = canvas.context;

  var origin = this.calculateOrigin();
  var x = -origin.x;
  var y = -origin.y;

  context.beginPath();

  if (isInstanceOf(this.fill, 'Camera')) {
    context.save();
    context.beginPath();
    context.rect(x, y, this.width, this.height);
    context.closePath();
    context.clip();
    this.fill.render(canvas);
    context.restore();
  } else if (this.fill) {
    context.fillStyle = this.fill;
    context.fillRect(x, y, this.width, this.height);
  }

  if (this.stroke) {
    var parts = this.stroke.split(' ');
    var lineWidth = parseFloat(parts[0], 10);
    var color = parts[1];
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.strokeRect(x - lineWidth / 2, y - lineWidth / 2, this.width + lineWidth, this.height + lineWidth);
  }

  context.closePath();
};

module.exports = Rectangle;
