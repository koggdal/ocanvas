/**
 * @module ocanvas/classes/Camera
 */
'use strict';

var defineProperties = require('../utils/defineProperties');

/**
 * @classdesc A camera is put inside a world and when it is connected to a
 *     canvas, it will render what the camera sees in the world to that canvas.
 *
 * @property {World?} world An instance of World.
 * @property {number} x The x coordinate, referencing the center.
 * @property {number} y The y coordinate, referencing the center.
 * @property {number} rotation The rotation, around the center.
 * @property {number} zoom The zoom level. Default zoom is 1. Number between
 *     0 and 1 will zoom out (world gets smaller), and larger number will
 *     zoom in (world gets bigger).
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
      writable: true
    },
    width: {
      value: 0,
      set: function(value, privateVars) {
        privateVars.aspectRatio = value / privateVars.height;
        this.x += (value - privateVars.width) / 2;
      }
    },
    height: {
      value: 0,
      set: function(value, privateVars) {
        privateVars.aspectRatio = privateVars.width / value;
        this.y += (value - privateVars.height) / 2;
      }
    },
    aspectRatio: {
      value: 1,
      set: function(value, privateVars) {
        privateVars.width = privateVars.height * value;
      }
    }
  }, {enumerable: true});

  // Set default dimensions for the camera
  // These numbers are the same as the default size for a canvas element
  // (as per the canvas specification). In the constructor for the Camera
  // we can't know the size of the canvas, so we can't default to that. One
  // camera can also be rendered to multiple canvases at once.
  // Setting the values here will invoke the setters above and set the
  // default position of the camera as well (to the center).
  if (!opt_properties || !opt_properties.width) this.width = 300;
  if (!opt_properties || !opt_properties.height) this.height = 150;
  if (!opt_properties || !opt_properties.aspectRatio) this.aspectRatio = this.width / this.height;

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
  if (!this.world) {
    var message = 'You must set a world on the camera instance to render.';
    message += ' This is done by `world.cameras.add(camera)`.';
    var error = new Error(message);
    error.name = 'ocanvas-no-world';
    throw error;
  }

  var context = canvas.context;

  context.save();

  var zoom = Math.max(this.zoom, 0);
  context.scale(zoom, zoom);
  context.rotate(this.rotation * Math.PI / 180);

  this.world.render(canvas);

  context.restore();
};

module.exports = Camera;
