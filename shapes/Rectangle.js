/**
 * @module ocanvas/shapes/Rectangle
 */
'use strict';

var RectangularCanvasObject = require('./base/RectangularCanvasObject');
var Camera = require('../classes/Camera');
var inherit = require('../utils/inherit');

/**
 * @classdesc A rectangle canvas object, used to draw a rectangle.
 *
 * @constructor
 *
 * @example
 * var World = require('ocanvas/classes/World');
 * var Rectangle = require('ocanvas/classes/Rectangle');
 *
 * var world = new World();
 * var rectangle = new Rectangle({
 *   x: 30,
 *   y: 30,
 *   width: 100,
 *   height: 50,
 *   fill: 'red'
 * });
 * world.objects.add(rectangle);
 */
function Rectangle(opt_properties) {
  RectangularCanvasObject.call(this);

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(Rectangle, RectangularCanvasObject);

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

  if (this.fill instanceof Camera) {
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
