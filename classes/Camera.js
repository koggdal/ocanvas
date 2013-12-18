/**
 * @module ocanvas/classes/Camera
 */
'use strict';

var defineProperties = require('../utils/defineProperties');

/**
 * @classdesc A camera is put inside a world and when it is connected to a
 *     canvas, it will render what the camera sees in the world to that canvas.
 *
 * @property {World} world An instance of World.
 * @property {number} x The x coordinate, referencing the center.
 * @property {number} y The y coordinate, referencing the center.
 * @property {number} rotation The rotation, around the center.
 * @property {number} zoom The zoom level. Default zoom is 0. Positive number
 *     is a closer zoom level, and a negative number is further away.
 * @property {number} width The width of the camera in pixels. If the zoom
 *     value is something else than 0, the actual width will not be this
 *     width, but rather the width after taking zoom into account. Setting
 *     the width will also update the aspect ratio accordingly.
 * @property {number} height The height of the camera in pixels. If the zoom
 *     value is something else than 0, the actual height will not be this
 *     height, but rather the height after taking zoom into account. Setting
 *     the height will also update the aspect ratio accordingly.
 * @property {number} aspectRatio The aspect ratio of the dimensions of
 *     the camera. Changing this number will change the width of the camera
 *     but keep the height.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 *
 * @example
 * var camera = new Camera();
 * camera.rotation = 45;
 * camera.zoom = 2;
 */
function Camera(opt_properties) {
  this.x = 0;
  this.y = 0;
  this.rotation = 0;
  this.world = null;

  defineProperties(this, {
    zoom: {
      value: 1,
      get: true,
      set: function(value) {
        return value;
      }
    },
    width: {
      value: 0,
      get: true,
      set: function(value, privateVars) {
        privateVars.aspectRatio = value / privateVars.height;
        this.x += (value - privateVars.width) / 2;
      }
    },
    height: {
      value: 0,
      get: true,
      set: function(value, privateVars) {
        privateVars.aspectRatio = privateVars.width / value;
        this.y += (value - privateVars.height) / 2;
      }
    },
    aspectRatio: {
      value: 1,
      get: true,
      set: function(value, privateVars) {
        privateVars.width = privateVars.height * value;
      }
    }
  });

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
Camera.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Render what the camera sees.
 *
 * @param {Canvas} canvas The canvas instance to draw to.
 */
Camera.prototype.render = function(canvas) {
  if (!this.world) return;

  var context = canvas.context;

  context.save();

  var zoom = Math.max(this.zoom, 0);
  context.translate(this.x, this.y);
  context.scale(zoom, zoom);
  context.rotate(this.rotation * Math.PI / 180);

  this.world.renderTree(canvas);

  context.restore();
};

module.exports = Camera;