/**
 * @module ocanvas/shapes/base/CanvasObject
 */
'use strict';

var Collection = require('../../classes/Collection');
var defineProperties = require('../../utils/defineProperties');
var jsonHelpers = require('../../utils/json');
var Matrix = require('../../classes/Matrix');

/**
 * @classdesc The CanvasObject class is a base class that different objects
 *     can inherit from. It is generic enough to handle all different kinds
 *     of objects. A canvas object that an end user will use probably
 *     inherits from a middle class as well (that in its turn inherits from
 *     this class), that specifies things for the shape type. oCanvas
 *     provides two of these middle classes: RectangularCanvasObject and
 *     RadialCanvasObject.
 *
 * @property {number} x The x coordinate, relative to the origin of the
 *     parent object.
 * @property {number} y The y coordinate, relative to the origin of the
 *     parent object.
 * @property {number|string} originX The X coordinate for the origin position,
 *     relative to the default origin of an object. Can be set to either
 *     numeric value, or one of these keywords: 'left', 'center' or 'right'.
 * @property {number|string} originY The Y coordinate for the origin position,
 *     relative to the default origin of an object. Can be set to either
 *     numeric value, or one of these keywords: 'top', 'center' or 'bottom'.
 * @property {number} rotation The rotation of the object, in degrees.
 * @property {string|Camera} fill The fill value for the object. Any color
 *     value or a Camera instance. If a Camera instance, it will render what
 *     that camera sees, but it will only render recursively the amount of
 *     times specified by the 'maxRenderDepth' property on the Canvas instance.
 * @property {string} stroke The stroke value, in the format '5px #ff0000'. The
 *     color can be any normal color format. The only supported width unit is
 *     'px'.
 * @property {number} opacity The opacity of the object, 0–1.
 * @property {Collection} children A collection of children objects.
 * @property {?CanvasObject|function} clippingMask If set, the object will be
 *     clipped to the shape of either the provided canvas object, or to what's
 *     drawn by the provided function. If a function is provided, it will be
 *     called with two arguments: canvas (Canvas instance) and context (the
 *     CanvasRenderingContext2D instance that belongs to the canvas element).
 *     If a canvas object is provided, it will call the renderPath method on
 *     the object, which means that method must be implemented.
 * @property {Object} matrixCache Object with matrix data for this object.
 *     It contains four properties: `combined`, `translation`, `rotation` and
 *     `scaling`, where each of them is an object with the properties `valid`
 *     (boolean) and `matrix` (Matrix instance or null). The matrixCache object
 *     also has a function `invalidate` which takes a type as argument (like
 *     object.matrixCache.invalidate('translation'); ). If no argument is
 *     passed, all types of matrices will be invalidated.
 *
 * @constructor
 *
 * @example
 * var CanvasObject = require('ocanvas/shapes/base/CanvasObject');
 * var inherit = require('ocanvas/utils/inherit');
 *
 * function MyObject() {
 *   CanvasObject.call(this);
 * }
 * inherit(MyObject, CanvasObject);
 */
function CanvasObject(opt_properties) {
  var self = this;

  this.constructorName = 'CanvasObject';
  this.matrixCache = {
    combined: {valid: false, matrix: null},
    translation: {valid: false, matrix: null},
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

  this.originX = 0;
  this.originY = 0;
  this.fill = '';
  this.stroke = '';
  this.opacity = 1;

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
    scalingX: {
      value: 1,
      set: function() { this.matrixCache.invalidate('scaling'); }
    },
    scalingY: {
      value: 1,
      set: function() { this.matrixCache.invalidate('scaling'); }
    },

    clippingMask: {
      value: null,
      set: function(value) {
        if (value instanceof CanvasObject) return value;
        if (typeof value === 'function') return value;
        return null;
      }
    },

    // By defining a setter for the children collection, we allow instantiation
    // of the class, and at a later point set the children property to a new
    // collection. With this setter, the collection is not switched out, but
    // the items are copied over to the existing collection, keeping the event
    // listeners on the collection intact.
    children: {
      value: new Collection(),
      set: function(value, privateVars) {
        var children = privateVars.children;

        if (!(value instanceof Collection)) {
          return children;
        }

        children.length = 0;
        value.forEach(function(item) {
          children.add(item);
        });
      }
    }
  }, {enumerable: true});

  this.children.on('insert', function(event) {
    event.item.parent = self;
  });
  this.children.on('remove', function(event) {
    event.item.parent = null;
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
CanvasObject.objectProperties = [
  'x',
  'y',
  'originX',
  'originY',
  'scalingX',
  'scalingY',
  'rotation',
  'fill',
  'stroke',
  'opacity',
  'children',
  'clippingMask'
];

/**
 * Create a new CanvasObject instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 *
 * @return {CanvasObject} A CanvasObject instance.
 */
CanvasObject.fromObject = function(object) {
  return jsonHelpers.fromObject(object);
};

/**
 * Create a new CanvasObject instance from a JSON string. This string
 * must have the structure that the toJSON method creates.
 *
 * @param {string} json A plain object represented as a JSON string.
 *
 * @return {CanvasObject} A CanvasObject instance.
 */
CanvasObject.fromJSON = function(json) {
  return jsonHelpers.fromJSON(json);
};

/**
 * Convert the CanvasObject instance to a plain object.
 * This plain object can be converted to a JSON string.
 *
 * @return {Object} An object that represents this canvas object.
 */
CanvasObject.prototype.toObject = function() {
  return jsonHelpers.toObject(this, CanvasObject.objectProperties, this.constructorName);
};

/**
 * Convert the CanvasObject instance to JSON.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
CanvasObject.prototype.toJSON = function(opt_space) {
  return jsonHelpers.toJSON(this, CanvasObject.objectProperties, this.constructorName, opt_space);
};

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
CanvasObject.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Calculate the origin in pixels from the default origin of an object.
 * The method will use the originX and originY properties, which can
 * contain special strings like 'left' or 'top'. It will then calculate
 * the real values based on that.
 *
 * Empty function which needs implementation in a subclass.
 *
 * @return {Object.<string, number>} An object with properties x and y.
 */
CanvasObject.prototype.calculateOrigin = function() {
  var message = 'CanvasObject does not have an implementation of the ' +
      'calculateOrigin method. Please use a subclass of ' +
      'CanvasObject that has an implementation of it.';
  var error = new Error(message);
  error.name = 'ocanvas-needs-subclass';
  throw error;
};

/**
 * Render the object to a canvas.
 * This needs implementation in a subclass, where the method in
 * the subclass should call this method as the first thing.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
CanvasObject.prototype.render = function(canvas) {
  var context = canvas.context;

  context.globalAlpha *= this.opacity;

  if (this.clippingMask) {
    context.beginPath();
    if (this.clippingMask instanceof CanvasObject) {
      context.save();
      canvas.transformContextToObject(this.clippingMask, this);
      this.clippingMask.renderPath(canvas);
      context.restore();
    } else if (typeof this.clippingMask === 'function') {
      this.clippingMask(canvas, context);
    }
    context.closePath();
    context.clip();
  }
};

/**
 * Render the path of the object to a canvas.
 * This needs implementation in a subclass. You should not call this
 * super method in the subclass.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
CanvasObject.prototype.renderPath = function(canvas) {
  var message = 'CanvasObject does not have an implementation of the ' +
      'renderPath method. Please use a subclass of ' +
      'CanvasObject that has an implementation of it.';
  var error = new Error(message);
  error.name = 'ocanvas-needs-subclass';
  throw error;
};

/**
 * Render the object and all of the children trees to a canvas.
 * This will call the render method of this object, which needs
 * implementation in a subclass. It will also call the renderTree method
 * of all children.
 *
 * @param {Canvas} canvas The Canvas instance to render to.
 */
CanvasObject.prototype.renderTree = function(canvas) {
  var context = canvas.context;

  // If the opacity is 0, it's not necessary to render this object or
  // any of its children, since they won't be visible anyway.
  if (this.opacity === 0) return;

  this.render(canvas);

  var children = this.children;
  for (var i = 0, l = children.length; i < l; i++) {
    var object = children.get(i);
    context.save();
    context.translate(object.x, object.y);
    context.rotate(object.rotation * Math.PI / 180);
    context.scale(object.scalingX, object.scalingY);
    object.renderTree(canvas);
    context.restore();
  }
};

/**
 * Get a transformation matrix for this object. It will be a combined matrix
 * for all transformations (translation, rotation and scaling).
 * If the matrix cache is still valid, it will not update the matrix.
 *
 * @return {Matrix} A Matrix instance representing the transformations.
 */
CanvasObject.prototype.getTransformationMatrix = function() {
  var cache = this.matrixCache;

  if (cache.combined.valid) return cache.combined.matrix;

  if (!cache.combined.matrix) cache.combined.matrix = new Matrix(3, 3);
  if (!cache.translation.matrix) cache.translation.matrix = new Matrix(3, 3);
  if (!cache.rotation.matrix) cache.rotation.matrix = new Matrix(3, 3);
  if (!cache.scaling.matrix) cache.scaling.matrix = new Matrix(3, 3);

  if (!cache.translation.valid) {
    cache.translation.matrix.setData(
      1, 0, this.x,
      0, 1, this.y,
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
      this.scalingX, 0, 0,
      0, this.scalingY, 0,
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

module.exports = CanvasObject;
