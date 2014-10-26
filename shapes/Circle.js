/**
 * @module ocanvas/shapes/Circle
 */
'use strict';

var Ellipse = require('./Ellipse');
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
  Ellipse.call(this);

  var radiusSetter = function(value, currentValue, privateVars) {
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
inherit(Circle, Ellipse);

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
Circle.objectProperties = Ellipse.objectProperties.concat([
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
Circle.fromObject = Ellipse.fromObject;

/**
 * Create a new Circle instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {Circle} A Circle instance.
 */
Circle.fromJSON = Ellipse.fromJSON;

module.exports = Circle;
