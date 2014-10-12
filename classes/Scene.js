/**
 * @module ocanvas/classes/Scene
 */
'use strict';

var ObjectEventEmitter = require('./ObjectEventEmitter');
var Collection = require('./Collection');

var inherit = require('../utils/inherit');
var defineProperties = require('../utils/defineProperties');
var jsonHelpers = require('../utils/json');

/**
 * @classdesc A scene is a stage where you put objects and cameras. The
 *     cameras can be moved around in the scene, and a canvas will display
 *     what the camera sees in the scene.
 *
 * @property {Collection} cameras Collection of Camera instances.
 * @property {Collection} objects Collection of CanvasObject instances.
 *
 * @constructor
 * @augments {module:ocanvas/classes/ObjectEventEmitter~ObjectEventEmitter}
 *
 * @param {Object=} opt_properties Properties to initially set on the instance.
 *
 * @example
 * var scene = new Scene();
 * scene.objects.add(object);
 */
function Scene(opt_properties) {
  ObjectEventEmitter.call(this);

  var self = this;

  defineProperties(this, {

    // By defining a setter for the collections, we allow instantiation
    // of the class, and at a later point set the property to a new
    // collection. With this setter, the collection is not switched out, but
    // the items are copied over to the existing collection, keeping the event
    // listeners on the collection intact.
    cameras: {
      value: new Collection(),
      set: function(value, currentValue, privateVars) {
        if (!(value instanceof Collection)) {
          return currentValue;
        }

        currentValue.length = 0;
        value.forEach(function(item) {
          currentValue.add(item);
        });
      }
    },
    objects: {
      value: new Collection(),
      set: function(value, currentValue, privateVars) {
        if (!(value instanceof Collection)) {
          return currentValue;
        }

        currentValue.length = 0;
        value.forEach(function(item) {
          currentValue.add(item);
        });
      }
    }
  }, {enumerable: true});

  this.cameras.on('insert', function(event) {
    event.item.scene = self;
  });
  this.cameras.on('remove', function(event) {
    event.item.scene = null;
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
inherit(Scene, ObjectEventEmitter);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Scene.className = 'Scene';

/**
 * Properties that should be included in the plain object created by toObject.
 *
 * @type {Array}
 */
Scene.objectProperties = [
  'cameras',
  'objects'
];

/**
 * Create a new Scene instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {Scene} A Scene instance.
 */
Scene.fromObject = function(object) {
  return jsonHelpers.fromObject(object);
};

/**
 * Create a new Scene instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {Scene} A Scene instance.
 */
Scene.fromJSON = function(json) {
  return jsonHelpers.fromJSON(json);
};

/**
 * Convert the Scene instance to a plain object.
 * This plain object can be converted to a JSON string.
 *
 * @return {Object} An object that represents this scene.
 */
Scene.prototype.toObject = function() {
  return jsonHelpers.toObject(this, Scene.objectProperties, 'Scene');
};

/**
 * Convert the Scene instance to JSON.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
Scene.prototype.toJSON = function(opt_space) {
  return jsonHelpers.toJSON(this, Scene.objectProperties, 'Scene', opt_space);
};

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
Scene.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Render all objects added to this scene to a canvas.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
Scene.prototype.render = function(canvas) {
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

module.exports = Scene;
