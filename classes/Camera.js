/**
 * @module ocanvas/classes/Camera
 */
'use strict';

var defineProperties = require('../utils/defineProperties');
var jsonHelpers = require('../utils/json');
var Cache = require('../classes/Cache');
var Matrix = require('../classes/Matrix');
var matrixUtils = require('../utils/matrix');
var isInstanceOf = require('../utils/isInstanceOf');

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
 * @property {Cache} cache A Cache instance storing cached matrices and
 *     vertices to speed up calculations.
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

  this.world = null;

  defineProperties(this, this.propertyDescriptors, {enumerable: true});

  this.initCache();

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

  if (!opt_properties || !('x' in opt_properties)) this.x = this.width / 2;
  if (!opt_properties || !('y' in opt_properties)) this.y = this.height / 2;
}

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Camera.className = 'Camera';

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
 * Property descriptors for this class. These properties will be defined in the
 * constructor of this class with the accessors specified here.
 *
 * @type {Object}
 */
Camera.prototype.propertyDescriptors = {
  x: {
    value: 0,
    set: function() { this.cache.invalidate('translation'); }
  },
  y: {
    value: 0,
    set: function() { this.cache.invalidate('translation'); }
  },
  rotation: {
    value: 0,
    set: function() { this.cache.invalidate('rotation'); }
  },
  zoom: {
    value: 1,
    set: function() { this.cache.invalidate('scaling'); }
  },
  width: {
    value: 0,
    set: function(value, privateVars) {
      this.cache.invalidate('vertices');
      privateVars.aspectRatio = privateVars.height ? (value / privateVars.height) || 1 : 1;
    }
  },
  height: {
    value: 0,
    set: function(value, privateVars) {
      this.cache.invalidate('vertices');
      privateVars.aspectRatio = value ? (privateVars.width / value) || 1 : 1;
    }
  },
  aspectRatio: {
    value: 1,
    set: function(value, privateVars) {
      this.cache.invalidate('vertices');
      privateVars.width = privateVars.height * value;
    }
  }
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
 * Initialize the cache (used for matrices, vertices etc).
 * This should only be called once, which happens in the constructor. Calling
 * it more times will create a new cache that replaces the old one.
 */
Camera.prototype.initCache = function() {
  var self = this;

  this.cache = new Cache();

  // Matrices
  this.cache.define(['translation', 'rotation', 'scaling']);
  this.cache.define('transformations', {
    dependencies: ['translation', 'rotation', 'scaling']
  });
  this.cache.define('point');
  this.cache.define('globalPoint', {
    dependencies: ['point', 'transformations']
  });

  // Vertices
  this.cache.define('vertices');
  this.cache.define('globalVertices', {
    dependencies: ['vertices', 'transformations']
  });

  this.cache.onInvalidate = function(unit) {
    if (unit === 'transformations') {
      if (self.world) {
        var objects = self.world.objects;
        for (var i = 0, l = objects.length; i < l; i++) {
          objects.get(i).cache.invalidate('combinedTransformations');
        }
      }
    }
  };
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

  // When the camera rotates clockwise, the rendered image from the camera
  // should be rotated counterclockwise since the canvas is static and does
  // not rotate.
  context.rotate(-1 * this.rotation * Math.PI / 180);

  this.world.render(canvas);

  context.restore();
};

/**
 * Get a transformation matrix for this camera. It will be a combined matrix
 * for translation, rotation and scaling.
 * If the matrix cache is still valid, it will not update the matrix.
 *
 * @param {Canvas=} opt_reference Reference to which the matrix will be created
 *     for. If this is a Canvas instance, the matrix will be adapted for
 *     rendering on the canvas. This means the rotation will change sign
 *     (rotation * -1) and the scaling will use the zoom value directly.
 *     If no reference is specified, it will use the rotation value directly,
 *     but it will use the inverse of the zoom value (1 / zoom).
 *
 * @return {Matrix} A Matrix instance representing the transformations.
 */
Camera.prototype.getTransformationMatrix = function(opt_reference) {
  var cache = this.cache;
  var transformations = cache.get('transformations');
  var reference = opt_reference || null;

  if (transformations.reference !== reference) {
    cache.invalidate('transformations');
  }

  transformations.reference = reference;

  if (transformations.isValid) return transformations.matrix;

  var translation = cache.get('translation');
  var rotation = cache.get('rotation');
  var scaling = cache.get('scaling');

  if (!translation.isValid) {
    var x = this.x, y = this.y;
    var w = this.width, h = this.height;
    translation.matrix = matrixUtils.getTranslationMatrix(x, y,
        translation.matrix);
    translation.matrixOrigin = matrixUtils.getTranslationMatrix(w / 2, h / 2,
        translation.matrixOrigin);
    cache.update('translation');
  }

  if (!rotation.isValid) {
    if (isInstanceOf(reference, 'Canvas')) {
      rotation.matrix = matrixUtils.getRotationMatrix(this.rotation * -1,
        rotation.matrix);
    } else {
      rotation.matrix = matrixUtils.getRotationMatrix(this.rotation,
        rotation.matrix);
    }
    cache.update('rotation');
  }

  if (!scaling.isValid) {
    if (isInstanceOf(reference, 'Canvas')) {
      scaling.matrix = matrixUtils.getScalingMatrix(this.zoom, this.zoom,
        scaling.matrix);
    } else {
      scaling.matrix = matrixUtils.getScalingMatrix(1 / this.zoom,
        1 / this.zoom, scaling.matrix);
    }
    cache.update('scaling');
  }

  transformations.matrix = matrixUtils.getTransformationMatrix(
    translation.matrix, rotation.matrix, scaling.matrix,
    transformations.matrix
  );
  transformations.matrixInverted = matrixUtils.getTransformationMatrix(
    translation.matrix, rotation.matrix, scaling.matrix,
    transformations.matrixInverted
  );
  transformations.matrixInverted.invert();
  cache.update('transformations');

  return transformations.matrix;
};

/*
 * Get a global point from a local point.
 * A local point is a coordinate inside this camera, with no regards to any
 * transformations. The global point will take all transformations from the
 * camera into account, to give a point relative to the world.
 *
 * @param {number} x The local X position.
 * @param {number} y The local Y position.
 * @param {Object=} opt_point Optional object to put the point properties in.
 *
 * @return {Object} An object with properties x and y.
 */
Camera.prototype.getGlobalPoint = function(x, y, opt_point) {
  var cache = this.cache;
  var localPoint = cache.get('point');
  var globalPoint = cache.get('globalPoint');
  var globalPointMatrix;

  if (localPoint.x !== x || localPoint.y !== y) {
    cache.invalidate('point');
  }

  if (!globalPoint.isValid) {

    if (!localPoint.matrix) localPoint.matrix = new Matrix(3, 3, false);
    if (!globalPoint.matrix) globalPoint.matrix = new Matrix(3, 3, false);

    if (!localPoint.isValid) {
      localPoint.matrix = matrixUtils.getTranslationMatrix(x, y,
          localPoint.matrix);
      localPoint.x = x;
      localPoint.y = y;
      cache.update('point');
    }

    // Get a matrix that represents the local point in global space, after it's
    // been transformed by all the objects in the parent chain (including the
    // camera).
    globalPointMatrix = globalPoint.matrix;
    globalPointMatrix.setIdentityData();
    globalPointMatrix.multiply(this.getTransformationMatrix(),
        localPoint.matrix);
    cache.update('globalPoint');

  } else {
    globalPointMatrix = globalPoint.matrix;
  }

  var output = opt_point || {x: 0, y: 0};
  output.x = globalPointMatrix[2];
  output.y = globalPointMatrix[5];

  // Extract the 2D coordinate from the matrix and return it
  return output;
};

/**
 * Get the vertices for this camera. The coordinates will be relative
 * to the center of this camera and are not affected by any transformations.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
Camera.prototype.getVertices = function() {
  var cache = this.cache.get('vertices');

  if (cache.isValid) return cache.vertices;

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

  this.cache.update('vertices');

  return vertices;
};

/**
 * Get the global vertices for this camera. The coordinates will be relative
 * to the world.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
Camera.prototype.getGlobalVertices = function() {
  var cache = this.cache.get('globalVertices');

  if (cache.isValid) return cache.vertices;

  if (!cache.vertices) cache.vertices = new Array(4);

  var localVertices = this.getVertices();
  var left = localVertices[0].x;
  var right = localVertices[1].x;
  var top = localVertices[0].y;
  var bottom = localVertices[2].y;

  var vertices = cache.vertices;
  vertices[0] = this.getGlobalPoint(left, top);
  vertices[1] = this.getGlobalPoint(right, top);
  vertices[2] = this.getGlobalPoint(right, bottom);
  vertices[3] = this.getGlobalPoint(left, bottom);

  this.cache.update('globalVertices');

  return vertices;
};

module.exports = Camera;
