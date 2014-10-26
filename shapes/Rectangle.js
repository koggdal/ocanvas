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
 * Render a color fill to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 * @param {string} fill A valid CSS color.
 */
Rectangle.prototype.renderColorFill = function(canvas, fill) {
  if (!fill) return;

  var context = canvas.context;
  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  context.fillStyle = fill;
  context.fillRect(x, y, this.width, this.height);
};

/**
 * Render an image texture fill to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 * @param {ImageTexture} fill An ImageTexture instance.
 */
Rectangle.prototype.renderImageTextureFill = function(canvas, fill) {
  var element = fill.imageElement;
  if (!element) return;

  var context = canvas.context;
  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  context.save();

  // Don't draw anything outside the rectangle
  context.beginPath();
  context.rect(x, y, this.width, this.height);
  context.closePath();
  context.clip();

  this.renderImageTextureSized(canvas, fill, this.width, this.height);

  context.restore();
};

/**
 * Render a texture fill to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 * @param {Texture} fill A Texture instance.
 */
Rectangle.prototype.renderTextureFill = function(canvas, fill) {
  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  // Move the texture up to the top left corner.
  // Not doing this puts it in the wrong place, but also causes Chrome
  // to render the edge as being dragged out.
  var context = canvas.context;
  context.save();
  context.translate(x, y);
  context.fillStyle = fill.style;
  context.fillRect(0, 0, this.width, this.height);
  context.restore();
};

/**
 * Render a camera fill to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 * @param {Camera} fill A Camera instance.
 */
Rectangle.prototype.renderCameraFill = function(canvas, fill) {
  var context = canvas.context;
  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  context.save();
  context.beginPath();
  context.rect(x, y, this.width, this.height);
  context.closePath();
  context.clip();
  fill.render(canvas);
  context.restore();
};

/**
 * Render a color stroke to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 * @param {number} strokeWidth The stroke thickness in pixels.
 * @param {string} color A valid CSS color.
 */
Rectangle.prototype.renderColorStroke = function(canvas, strokeWidth, color) {
  if (!color || !strokeWidth) return;

  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  var width = this.width + strokeWidth;
  var height = this.height + strokeWidth;
  x -= strokeWidth / 2;
  y -= strokeWidth / 2;

  var context = canvas.context;
  context.lineWidth = strokeWidth;
  context.strokeStyle = color;
  context.strokeRect(x, y, width, height);
};

module.exports = Rectangle;
