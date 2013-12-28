/**
 * @module ocanvas/classes/Camera
 */
'use strict';

var defineProperties = require('../utils/defineProperties');
var jsonHelpers = require('../utils/json');
var Matrix = require('../classes/Matrix');

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
 * @property {Object} matrixCache Object with matrix data for this camera.
 *     It contains four properties: `translation`, `rotation`, `scaling`,
 *     and `combined`, where each of them is an object with the properties
 *     `valid` (boolean) and `matrix` (Matrix instance or null). The
 *     matrixCache object also has a function `invalidate` which takes a type
 *     as argument (like camera.matrixCache.invalidate('translation'); ). If
 *     no argument is passed, all types of matrices will be invalidated.
 * @property {Object} vertexCache Object with vertex data for this camera.
 *     It contains one property: `local`, which is an object with the
 *     properties `valid` (boolean) and `vertices` (array or null). The
 *     vertexCache object also has a function `invalidate` which takes a type
 *     as argument (like camera.vertexCache.invalidate('local'); ). If no
 *     argument is passed, all types of vertices will be invalidated.
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
  this.id = (opt_properties && opt_properties.id) || Camera.generateID();
  if (Camera.cache[this.id]) {
    return Camera.cache[this.id];
  }
  Camera.cache[this.id] = this;

  this.matrixCache = {
    combined: {valid: false, matrix: null},
    translation: {valid: false, matrix: null, matrixReverse: null},
    rotation: {valid: false, matrix: null},
    scaling: {valid: false, matrix: null},
    invalidate: function(type) {
      if (!type) {
        this.translation.valid = false;
        this.rotation.valid = false;
        this.scaling.valid = false;
      } else if (this[type]) {
        this[type].valid = false;
      }
      this.combined.valid = false;
    }
  };
  this.vertexCache = {
    local: {valid: false, vertices: null},
    invalidate: function(type) {
      if (!type) {
        this.local.valid = false;
      } else if (this[type]) {
        this[type].valid = false;
      }
    }
  };

  this.world = null;

  defineProperties(this, {
    x: {
      value: 0,
      set: function() { this.matrixCache.invalidate('translation'); }
    },
    y: {
      value: 0,
      set: function() { this.matrixCache.invalidate('translation'); }
    },
    rotation: {
      value: 0,
      set: function() { this.matrixCache.invalidate('rotation'); }
    },
    zoom: {
      value: 1,
      set: function() { this.matrixCache.invalidate('scaling'); }
    },
    width: {
      value: 0,
      set: function(value, privateVars) {
        this.vertexCache.invalidate();
        privateVars.aspectRatio = privateVars.height ? (value / privateVars.height) || 1 : 1;
        this.x += (value - privateVars.width) / 2;
      }
    },
    height: {
      value: 0,
      set: function(value, privateVars) {
        this.vertexCache.invalidate();
        privateVars.aspectRatio = value ? (privateVars.width / value) || 1 : 1;
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
  if (!opt_properties || !opt_properties.aspectRatio) this.aspectRatio = this.height ? (this.width / this.height) || 1 : 1;
  if (!opt_properties || !opt_properties.width) this.width = 300;
  if (!opt_properties || !opt_properties.height) this.height = 150;

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}

/**
 * Cache of camera instances.
 * Stored by ID (each camera instance has an `id` property, which is used as key
 * here in the cache).
 * The cache is used mainly by the JSON loaders, to keep track of the same
 * camera instance, since it can be referenced in multiple places.
 *
 * @type {Object}
 */
Camera.cache = {};

/**
 * Properties that should be included in the plain object created by toObject.
 *
 * @type {Array}
 */
Camera.objectProperties = [
  'id',
  'x',
  'y',
  'width',
  'height',
  'aspectRatio',
  'zoom',
  'rotation'
];

/**
 * Generate a new unique ID.
 *
 * @return {string} An ID.
 */
Camera.generateID = function() {
  return (++ID).toString(36);
};
var ID = 0;

/**
 * Create a new Camera instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {Camera} A Camera instance.
 */
Camera.fromObject = function(object) {
  var cache = Camera.cache;
  var cachedObject = cache[object.id];

  var camera = cachedObject || new this();

  if (!cachedObject && object.id) {
    delete cache[camera.id];
    camera.id = object.id;
    cache[camera.id] = camera;
  }

  return jsonHelpers.setProperties(camera, object);
};

/**
 * Create a new Camera instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {Camera} A Camera instance.
 */
Camera.fromJSON = function(json) {
  return this.fromObject(JSON.parse(json));
};

/**
 * Convert the Camera instance to a plain object.
 * This plain object can be converted to a JSON string.
 *
 * @return {Object} An object that represents this camera.
 */
Camera.prototype.toObject = function() {
  return jsonHelpers.toObject(this, Camera.objectProperties, 'Camera');
};

/**
 * Convert the Camera instance to JSON.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
Camera.prototype.toJSON = function(opt_space) {
  return jsonHelpers.toJSON(this, Camera.objectProperties, 'Camera', opt_space);
};

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
Camera.prototype.setProperties = function(properties) {

  // Some properties needs to be set before others.
  // For example, the width property has a setter that sets the x property
  // as well. If the x property is specified in the input properties, it will
  // get the wrong value if we don't treat width before x.
  if ('aspectRatio' in properties) {
    this.aspectRatio = properties.aspectRatio;
    delete properties.aspectRatio;
  }
  if ('width' in properties) {
    this.width = properties.width;
    delete properties.width;
  }
  if ('height' in properties) {
    this.height = properties.height;
    delete properties.height;
  }

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

/**
 * Get a transformation matrix for this camera. It will be a combined matrix
 * for translation, rotation and scaling.
 * If the matrix cache is still valid, it will not update the matrix.
 *
 * @return {Matrix} A Matrix instance representing the transformations.
 */
Camera.prototype.getTransformationMatrix = function() {
  var cache = this.matrixCache;

  if (cache.combined.valid) return cache.combined.matrix;

  if (!cache.combined.matrix) cache.combined.matrix = new Matrix(3, 3, false);
  if (!cache.rotation.matrix) cache.rotation.matrix = new Matrix(3, 3, false);
  if (!cache.scaling.matrix) cache.scaling.matrix = new Matrix(3, 3, false);
  if (!cache.translation.matrix)
      cache.translation.matrix = new Matrix(3, 3, false);
  if (!cache.translation.matrixReverse)
      cache.translation.matrixReverse = new Matrix(3, 3, false);

  if (!cache.translation.valid) {
    cache.translation.matrix.setData(
      1, 0, this.x,
      0, 1, this.y,
      0, 0, 1
    );
    cache.translation.matrixReverse.setData(
      1, 0, -this.x,
      0, 1, -this.y,
      0, 0, 1
    );
    cache.translation.valid = true;
  }

  if (!cache.rotation.valid) {
    var rotation = this.rotation * Math.PI / 180;
    cache.rotation.matrix.setData(
      Math.cos(rotation), -Math.sin(rotation), 0,
      Math.sin(rotation), Math.cos(rotation), 0,
      0, 0, 1
    );
    cache.rotation.valid = true;
  }

  if (!cache.scaling.valid) {
    cache.scaling.matrix.setData(
      this.zoom, 0, 0,
      0, this.zoom, 0,
      0, 0, 1
    );
    cache.scaling.valid = true;
  }

  cache.combined.matrix.setIdentityData();
  cache.combined.matrix.multiply(
    cache.translation.matrix,
    cache.rotation.matrix,
    cache.scaling.matrix
  );
  cache.combined.valid = true;

  return cache.combined.matrix;
};

/**
 * Get the vertices for this camera. The coordinates will be relative
 * to the center of this camera and are not affected by any transformations.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
Camera.prototype.getVertices = function() {
  var cache = this.vertexCache.local;

  if (cache.valid) return cache.vertices;

  if (!cache.vertices) {
    cache.vertices = new Array(4);
    cache.vertices[0] = {x: 0, y: 0};
    cache.vertices[1] = {x: 0, y: 0};
    cache.vertices[2] = {x: 0, y: 0};
    cache.vertices[3] = {x: 0, y: 0};
  }

  var right = this.width / 2;
  var left = -right;
  var bottom = this.height / 2;
  var top = -bottom;

  var vertices = cache.vertices;

  vertices[0].x = left;
  vertices[0].y = top;
  vertices[1].x = right;
  vertices[1].y = top;
  vertices[2].x = right;
  vertices[2].y = bottom;
  vertices[3].x = left;
  vertices[3].y = bottom;

  cache.valid = true;

  return vertices;
};

module.exports = Camera;
