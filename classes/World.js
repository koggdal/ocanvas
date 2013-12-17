/**
 * @module ocanvas/classes/World
 */
'use strict';

var Collection = require('./Collection');

/**
 * @classdesc A world is a scene where you put objects and cameras. The
 *     cameras can be moved around in the world, and a canvas will display
 *     what the camera sees in the world.
 *
 * @property {Collection} cameras Collection of Camera instances in this
 *     world.
 * @property {Collection} objects Collection of CanvasObject instances in
 *     this world.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Properties to initially set on the instance.
 *
 * @example
 * var world = new World();
 * world.objects.add(object);
 */
function World(opt_properties) {
  var self = this;

  this.cameras = new Collection();
  this.objects = new Collection();

  this.cameras.on('insert', function(event) {
    event.item.world = self;
  });
  this.cameras.on('remove', function(event) {
    event.item.world = null;
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
World.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Render all objects added to this world to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
World.prototype.renderTree = function(canvas) {
  var camera = canvas.camera;
  var context = canvas.context;
  var objects = this.objects;

  canvas.renderDepth++;

  if (canvas.renderDepth <= canvas.maxRenderDepth) {

    for (var i = 0, l = objects.length; i < l; i++) {
      var object = objects.get(i);
      context.save();
      context.translate(object.x - camera.x, object.y - camera.y);
      context.rotate(object.rotation * Math.PI / 180);
      object.renderTree(canvas);
      context.restore();
    }

  }

  canvas.renderDepth--;
};

module.exports = World;
