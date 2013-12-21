/**
 * @module ocanvas/classes/World
 */
'use strict';

var Collection = require('./Collection');
var jsonHelpers = require('../utils/json');

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
 * Properties that should be included in the plain object created by toObject.
 *
 * @type {Array}
 */
World.objectProperties = [
  'cameras',
  'objects'
];

/**
 * Create a new World instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {World} A World instance.
 */
World.fromObject = function(object) {
  var world = jsonHelpers.fromObject(object);

  var cameras = world.cameras;
  for (var i = 0, l = cameras.length; i < l; i++) {
    cameras.get(i).world = world;
  }

  return world;
};

/**
 * Create a new World instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {World} A World instance.
 */
World.fromJSON = function(json) {
  return this.fromObject(JSON.parse(json));
};

/**
 * Convert the World instance to a plain object.
 * This plain object can be converted to a JSON string.
 *
 * @return {Object} An object that represents this world.
 */
World.prototype.toObject = function() {
  return jsonHelpers.toObject(this, World.objectProperties, 'World');
};

/**
 * Convert the World instance to JSON.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
World.prototype.toJSON = function(opt_space) {
  return jsonHelpers.toJSON(this, World.objectProperties, 'World', opt_space);
};

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
World.prototype.render = function(canvas) {
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
