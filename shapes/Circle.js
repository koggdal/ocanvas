/**
 * @module ocanvas/shapes/Circle
 */
'use strict';

var EllipticalCanvasObject = require('./base/EllipticalCanvasObject');
var inherit = require('../utils/inherit');
var isInstanceOf = require('../utils/isInstanceOf');
var defineProperties = require('../utils/defineProperties');

/**
 * @classdesc A circle canvas object, used to draw a circle.
 *
 * @property {number} radius The radius of the circle. This value is tied to
 *     both `radiusX` and `radiusY`. Changing any of these three properties will
 *     change all of them to the new value.
 *
 * @constructor
 *
 * @example
 * var Scene = require('ocanvas/classes/Scene');
 * var Circle = require('ocanvas/shapes/Circle');
 *
 * var scene = new Scene();
 * var circle = new Circle({
 *   x: 30,
 *   y: 30,
 *   radius: 100,
 *   fill: 'red'
 * });
 * scene.objects.add(circle);
 */
function Circle(opt_properties) {
  EllipticalCanvasObject.call(this);

  var radiusSetter = function(value, privateVars) {
    privateVars.radiusX = value;
    privateVars.radiusY = value;
    privateVars.radius = value;
  };

  defineProperties(this, {
    radius: {
      value: 0,
      set: radiusSetter
    },
    radiusX: {
      value: 0,
      set: radiusSetter
    },
    radiusY: {
      value: 0,
      set: radiusSetter
    }
  }, {enumerable: true});

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(Circle, EllipticalCanvasObject);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Circle.className = 'Circle';

/**
 * Properties that should be included in the plain object created by toObject.
 *
 * @type {Array}
 */
Circle.objectProperties = EllipticalCanvasObject.objectProperties.concat([
  'radius'
]);

/**
 * Create a new Circle instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {Circle} A Circle instance.
 */
Circle.fromObject = EllipticalCanvasObject.fromObject;

/**
 * Create a new Circle instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {Circle} A Circle instance.
 */
Circle.fromJSON = EllipticalCanvasObject.fromJSON;

/**
 * Render the path of the object to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
Circle.prototype.renderPath = function(canvas) {
  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');

  drawCircle(x, y, this.radius, canvas);
};

/**
 * Render the object to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
Circle.prototype.render = function(canvas) {
  EllipticalCanvasObject.prototype.render.call(this, canvas);

  var context = canvas.context;

  var x = -this.calculateOrigin('x');
  var y = -this.calculateOrigin('y');
  var radius = this.radius;

  context.beginPath();

  if (isInstanceOf(this.fill, 'Camera')) {
    context.save();
    context.beginPath();
    drawCircle(x, y, radius, canvas);
    context.closePath();
    context.clip();
    this.fill.render(canvas);
    context.restore();
  } else if (this.fill) {
    drawCircle(x, y, radius, canvas);
    context.fillStyle = this.fill;
    context.fill();
  }

  context.closePath();

  if (this.stroke) {
    var parts = this.stroke.split(' ');
    var lineWidth = parseFloat(parts[0], 10);
    var color = parts[1];

    context.beginPath();
    drawCircle(x, y, radius + lineWidth / 2, canvas);
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
    context.closePath();
  }
};

/**
 * Draw the circle to a canvas.
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

module.exports = Circle;
