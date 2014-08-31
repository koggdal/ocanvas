/**
 * @module ocanvas/shapes/Ellipse
 */
'use strict';

var EllipticalCanvasObject = require('./base/EllipticalCanvasObject');
var inherit = require('../utils/inherit');
var isInstanceOf = require('../utils/isInstanceOf');

/**
 * @classdesc An ellipse canvas object, used to draw an ellipse.
 *
 * @constructor
 *
 * @example
 * var Scene = require('ocanvas/classes/Scene');
 * var Ellipse = require('ocanvas/shapes/Ellipse');
 *
 * var scene = new Scene();
 * var ellipse = new Ellipse({
 *   x: 30,
 *   y: 30,
 *   radiusX: 100,
 *   radiusY: 50,
 *   fill: 'red'
 * });
 * scene.objects.add(ellipse);
 */
function Ellipse(opt_properties) {
  EllipticalCanvasObject.call(this);

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(Ellipse, EllipticalCanvasObject);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Ellipse.className = 'Ellipse';

/**
 * Create a new Ellipse instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {Ellipse} A Ellipse instance.
 */
Ellipse.fromObject = EllipticalCanvasObject.fromObject;

/**
 * Create a new Ellipse instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {Ellipse} A Ellipse instance.
 */
Ellipse.fromJSON = EllipticalCanvasObject.fromJSON;

/**
 * Render the path of the object to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
Ellipse.prototype.renderPath = function(canvas) {
  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  drawShape(x, y, this.radiusX, this.radiusY, canvas);
};

/**
 * Render the object to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
Ellipse.prototype.render = function(canvas) {
  EllipticalCanvasObject.prototype.render.call(this, canvas);

  var context = canvas.context;

  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');
  var radiusX = this.radiusX;
  var radiusY = this.radiusY;

  context.beginPath();

  if (isInstanceOf(this.fill, 'Camera')) {
    context.save();
    context.beginPath();
    drawShape(x, y, radiusX, radiusY, canvas);
    context.closePath();
    context.clip();
    this.fill.render(canvas);
    context.restore();
  } else if (this.fill) {
    drawShape(x, y, radiusX, radiusY, canvas);
    context.fillStyle = this.fill;
    context.fill();
  }

  context.closePath();

  if (this.stroke) {
    var parts = this.stroke.split(' ');
    var lineWidth = parseFloat(parts[0], 10);
    var color = parts[1];

    context.beginPath();
    drawShape(x, y, radiusX + lineWidth / 2, radiusY + lineWidth / 2, canvas);
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
    context.closePath();
  }
};

/**
 * Draw the ellipse shape based on some data. If the horizontal radius and the
 * vertical radius are the same, it will use a cheaper way to draw a circle.
 *
 * @param {number} x The X coordinate for the object.
 * @param {number} y The Y coordinate for the object.
 * @param {number} radiusX The horizontal radius for the object.
 * @param {number} radiusY The vertical radius for the object.
 * @param {Canvas} canvas The Canvas instance to draw to.
 *
 * @private
 */
function drawShape(x, y, radiusX, radiusY, canvas) {
  if (radiusX === radiusY) {
    drawCircle(x, y, radiusX, canvas);
  } else {
    drawEllipse(x, y, radiusX, radiusY, canvas);
  }
}

/**
 * Draw the ellipse shape based on some data.
 *
 * @param {number} x The X coordinate for the object.
 * @param {number} y The Y coordinate for the object.
 * @param {number} radiusX The horizontal radius for the object.
 * @param {number} radiusY The vertical radius for the object.
 * @param {Canvas} canvas The Canvas instance to draw to.
 *
 * @private
 */
function drawEllipse(x, y, radiusX, radiusY, canvas) {
  var ellipseToBezierConstant = 0.276142374915397;
  var context = canvas.context;

  // Calculate values for the ellipse bezier control points
  var posX = radiusX * 2 * ellipseToBezierConstant;
  var posY = radiusY * 2 * ellipseToBezierConstant;
  
  // Move the cursor to the start (left edge, center vertically)
  context.moveTo(x - radiusX, y);

  // Draw top left section
  context.bezierCurveTo(
    x - radiusX, y - posY, // Control point 1
    x - posX, y - radiusY, // Control point 2
    x, y - radiusY // End point
  );

  // Draw top right section
  context.bezierCurveTo(
    x + posX, y - radiusY, // Control point 1
    x + radiusX, y - posY, // Control point 2
    x + radiusX, y // End point
  );

  // Draw bottom right section
  context.bezierCurveTo(
    x + radiusX, y + posY, // Control point 1
    x + posX, y + radiusY, // Control point 2
    x, y + radiusY // End point
  );

  // Draw bottom left section
  context.bezierCurveTo(
    x - posX, y + radiusY, // Control point 1
    x - radiusX, y + posY, // Control point 2
    x - radiusX, y // End point
  );
}

/**
 * Draw the ellipse shape using a cheap way to draw a circle. This is for when
 * the horizontal radius and the vertical radius are the same.
 *
 * @param {number} x The X coordinate for the object.
 * @param {number} y The Y coordinate for the object.
 * @param {number} radius The radius for the object.
 * @param {Canvas} canvas The Canvas instance to draw to.
 *
 * @private
 */
function drawCircle(x, y, radius, canvas) {
  canvas.context.arc(x, y, radius, 0, Math.PI * 2, false);
}

module.exports = Ellipse;
