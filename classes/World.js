/**
 * @module ocanvas/classes/World
 */
'use strict';

var Collection = require('./Collection');
var defineProperties = require('../utils/defineProperties');
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

  defineProperties(this, {

    // By defining a setter for the collections, we allow instantiation
    // of the class, and at a later point set the property to a new
    // collection. With this setter, the collection is not switched out, but
    // the items are copied over to the existing collection, keeping the event
    // listeners on the collection intact.
    cameras: {
      value: new Collection(),
      set: function(value, privateVars) {
        var cameras = privateVars.cameras;

        if (!(value instanceof Collection)) {
          return cameras;
        }

        cameras.length = 0;
        value.forEach(function(item) {
          cameras.add(item);
        });
      }
    },
    objects: {
      value: new Collection(),
      set: function(value, privateVars) {
        var objects = privateVars.objects;

        if (!(value instanceof Collection)) {
          return objects;
        }

        objects.length = 0;
        value.forEach(function(item) {
          objects.add(item);
        });
      }
    }
  }, {enumerable: true});

  this.cameras.on('insert', function(event) {
    event.item.world = self;
  });
  this.cameras.on('remove', function(event) {
    event.item.world = null;
  });

  this.objects.on('insert', function(event) {
    event.item.parent = self;
  });
  this.objects.on('remove', function(event) {
    event.item.parent = null;
  });

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
World.className = 'World';

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
  return jsonHelpers.fromObject(object);
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
  return jsonHelpers.fromJSON(json);
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

      if (canvas.boundingRectangleCulling && !object.isTreeInView(camera)) {
        continue;
      }

      context.save();
      context.translate(object.x - camera.x, object.y - camera.y);
      context.rotate(object.rotation * Math.PI / 180);
      context.scale(object.scalingX, object.scalingY);
      object.renderTree(canvas);
      context.restore();
    }

  }

  canvas.renderDepth--;
};

module.exports = World;
