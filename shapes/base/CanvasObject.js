/**
 * @module ocanvas/shapes/base/CanvasObject
 */
'use strict';

var Collection = require('../../classes/Collection');
var Cache = require('../../classes/Cache');
var Matrix = require('../../classes/Matrix');

var matrixUtils = require('../../utils/matrix');
var defineProperties = require('../../utils/defineProperties');
var jsonHelpers = require('../../utils/json');
var isInstanceOf = require('../../utils/isInstanceOf');

/**
 * @classdesc The CanvasObject class is a base class that different objects
 *     can inherit from. It is generic enough to handle all different kinds
 *     of objects. A canvas object that an end user will use probably
 *     inherits from a middle class as well (that in its turn inherits from
 *     this class), that specifies things for the shape type. oCanvas
 *     provides two of these middle classes: RectangularCanvasObject and
 *     RadialCanvasObject.
 *
 * @property {CanvasObject|World} parent The parent object or world.
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
 * @property {Cache} cache A Cache instance storing cached matrices and
 *     vertices to speed up calculations.
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
  this.fill = '';
  this.opacity = 1;
  this.parent = null;

  defineProperties(this, this.propertyDescriptors, {enumerable: true});

  this.initCache();

  this.children = new Collection();

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
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
CanvasObject.className = 'CanvasObject';

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
 * Property descriptors for this class. These properties will be defined in the
 * constructor of this class with the accessors specified here.
 *
 * @type {Object}
 */
CanvasObject.prototype.propertyDescriptors = {
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
  scalingX: {
    value: 1,
    set: function() { this.cache.invalidate('scaling'); }
  },
  scalingY: {
    value: 1,
    set: function() { this.cache.invalidate('scaling'); }
  },
  originX: {
    value: 0,
    set: function() { this.cache.invalidate('vertices'); }
  },
  originY: {
    value: 0,
    set: function() { this.cache.invalidate('vertices'); }
  },
  stroke: {
    value: '',
    set: function() { this.cache.invalidate('vertices'); }
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
    value: null,
    set: function(value, privateVars) {
      var children = privateVars.children;

      if (!(value instanceof Collection)) {
        return children;
      }

      if (children instanceof Collection) {
        children.length = 0;
        value.forEach(function(item) {
          children.add(item);
        });
      } else {
        privateVars.children = value;
      }
    }
  }
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
 * Initialize the cache (used for matrices, vertices etc).
 * This should only be called once, which happens in the constructor. Calling
 * it more times will create a new cache that replaces the old one.
 */
CanvasObject.prototype.initCache = function() {
  var self = this;

  this.cache = new Cache();

  // Matrices
  this.cache.define(['translation', 'rotation', 'scaling']);
  this.cache.define('transformations', {
    dependencies: ['translation', 'rotation', 'scaling']
  });
  this.cache.define('combinedTransformations', {
    dependencies: ['transformations']
  });
  this.cache.define('getPointIn-input');
  this.cache.define('getPointIn-output', {
    dependencies: ['getPointIn-input', 'combinedTransformations']
  });

  // Vertices
  this.cache.define('vertices');
  this.cache.define('globalVertices', {
    dependencies: ['vertices', 'combinedTransformations']
  });
  this.cache.define('treeVertices', {
    dependencies: ['globalVertices']
  });

  // Bounding Rectangles
  this.cache.define('boundingRectangle', {
    dependencies: ['globalVertices']
  });
  this.cache.define('boundingRectangleForTree', {
    dependencies: ['globalVertices']
  });

  this.cache.onInvalidate = function(unit) {

    // Matrices
    if (unit === 'combinedTransformations') {
      self.children.forEach(function(child) {
        child.cache.invalidate('combinedTransformations');
      });
    }
    else if (unit === 'getPointIn-output') {
      self.children.forEach(function(child) {
        child.cache.invalidate('getPointIn-output');
      });
    }

    // Vertices
    else if (unit === 'treeVertices') {
      if (self.parent && self.parent.cache) {
        self.parent.cache.invalidate('treeVertices');
      }
    }
    else if (unit === 'globalVertices') {
      self.children.forEach(function(child) {
        child.cache.invalidate('globalVertices');
      });
    }

    // Bounding Rectangles
    else if (unit === 'boundingRectangleForTree') {
      if (self.parent && self.parent.cache) {
        self.parent.cache.invalidate('boundingRectangleForTree');
      }
    }
  };
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

    if (canvas.boundingRectangleCulling && !object.isTreeInView(canvas)) {
      continue;
    }

    context.save();
    context.translate(object.x, object.y);
    context.rotate(object.rotation * Math.PI / 180);
    context.scale(object.scalingX, object.scalingY);
    object.renderTree(canvas);
    context.restore();
  }
};

/**
 * Test if the object itself (not with respect to its children) is in the view
 * that the provided canvas will render.
 *
 * @param {Canvas} canvas The Canvas instance to check against. Must have a
 *     Camera instance in the `camera` property.
 *
 * @return {boolean} True if the object is in view, false otherwise.
 */
CanvasObject.prototype.isInView = function(canvas) {
  var camera = canvas.camera;
  if (!camera) return false;

  var rect = this.getBoundingRectangle(canvas);
  var isLeft = rect.right < camera.x - camera.width / 2;
  var isRight = rect.left > camera.x + camera.width / 2;
  var isTop = rect.bottom < camera.y - camera.height / 2;
  var isBottom = rect.top > camera.y + camera.height / 2;

  // If the object is outside any of the sides, it's not visible.
  if (isLeft || isRight || isTop || isBottom) {
    return false;
  }

  // If it's not outside any of the sides, it is in view.
  return true;
};

/**
 * Test if the object or any of its children is in the view that the provided
 * canvas will render.
 *
 * @param {Canvas} canvas The Canvas instance to check against. Must have a
 *     Camera instance in the `camera` property.
 *
 * @return {boolean} True if the object is in view, false otherwise.
 */
CanvasObject.prototype.isTreeInView = function(canvas) {
  var camera = canvas.camera;
  if (!camera) return false;

  var rect = this.getBoundingRectangleForTree(canvas);
  var isLeft = rect.right < camera.x - camera.width / 2;
  var isRight = rect.left > camera.x + camera.width / 2;
  var isTop = rect.bottom < camera.y - camera.height / 2;
  var isBottom = rect.top > camera.y + camera.height / 2;

  // If the whole subtree of objects is outside the view of the camera.
  if (isLeft || isRight || isTop || isBottom) {
    return false;
  }

  // If it's not outside any of the sides, it is in view.
  return true;
};

/**
 * Get a transformation matrix for this object. It will be a combined matrix
 * for all transformations (translation, rotation and scaling). Depending on the
 * input, it will combine transformations for all objects in the parent chain
 * up until it reaches the reference (which is included).
 * If the matrix cache is still valid, it will not update the matrix.
 *
 * @param {Canvas|Camera|World|CanvasObject} reference The coordinate space the
 *     matrix will be made for. If a canvas object is provided, it must exist in
 *     the parent chain for this object.
 *
 * @return {Matrix} A Matrix instance representing the transformations.
 */
CanvasObject.prototype.getTransformationMatrix = function(reference) {
  var cache = this.cache;
  var transformations = cache.get('transformations');
  var combined = cache.get('combinedTransformations');

  if (!combined.matrix) combined.matrix = new Matrix(3, 3, false);

  if (!reference) {
    if (transformations.isValid) return transformations.matrix;
  } else {
    if (combined.isValid && combined.reference && combined.reference !== reference) {
      cache.invalidate('combinedTransformations');
    }
    combined.reference = reference;
  }

  var translation = cache.get('translation');
  var rotation = cache.get('rotation');
  var scaling = cache.get('scaling');

  if (!translation.isValid) {
    translation.matrix = matrixUtils.getTranslationMatrix(this.x, this.y,
        translation.matrix);
    cache.update('translation');
  }

  if (!rotation.isValid) {
    rotation.matrix = matrixUtils.getRotationMatrix(this.rotation,
        rotation.matrix);
    cache.update('rotation');
  }

  if (!scaling.isValid) {
    scaling.matrix = matrixUtils.getScalingMatrix(this.scalingX, this.scalingY,
      scaling.matrix);
    cache.update('scaling');
  }

  transformations.matrix = matrixUtils.getTransformationMatrix(
    translation.matrix, rotation.matrix, scaling.matrix,
    transformations.matrix
  );
  cache.update('transformations');

  // If there is no reference, we should not make a combined transformation
  // However, we need to update the cache to let other parts know that it's
  // up to date.
  if (!reference || reference === this) {
    combined.matrix.setIdentityData();
    combined.matrix.multiply(transformations.matrix);
    cache.update('combinedTransformations');
    return transformations.matrix;
  }

  var matrices = [];

  if (this.parent instanceof CanvasObject) {
    matrices.push(this.parent.getTransformationMatrix(reference));

  } else {
    var isCamera = isInstanceOf(reference, 'Camera');
    var isCanvas = isInstanceOf(reference, 'Canvas');
    if (isCamera || isCanvas) {
      var camera = isCamera ? reference : reference.camera;
      var canvas = isCanvas ? reference : undefined;
      matrices.push(camera.getTransformationMatrix(canvas));
    }
  }

  // Also add the local matrix for this object
  matrices.push(transformations.matrix);

  // Multiplying the global matrix for the parent chain with the local matrix
  // for this object will result in a global matrix for this object.
  combined.matrix.setIdentityData();
  combined.matrix.multiply.apply(combined.matrix, matrices);
  cache.update('combinedTransformations');

  return combined.matrix;
};

/**
 * Get the coordinates within the coordinate space of the specified reference
 * from a point inside this object. The input point inside this object should
 * not take any transformations into account. The return point will be
 * transformed up to the reference object (not inclusive), to make the return
 * point relative to the coordinate space of the reference.
 *
 * @param {Canvas|Camera|World|CanvasObject} reference The coordinate space you
 *     want the point in. If a canvas object is provided, it must exist in
 *     the parent chain for this object.
 * @param {number} x The local X position.
 * @param {number} y The local Y position.
 * @param {Object=} opt_point Optional object to put the point properties in.
 *
 * @return {Object} An object with properties x and y.
 */
CanvasObject.prototype.getPointIn = function(reference, x, y, opt_point) {
  var cache = this.cache;
  var inputPoint = cache.get('getPointIn-input');
  var outputPoint = cache.get('getPointIn-output');
  var outputPointMatrix;

  if (outputPoint.isValid && outputPoint.reference !== reference) {
    cache.invalidate('getPointIn-output');
  }
  outputPoint.reference = reference;

  if (inputPoint.x !== x || inputPoint.y !== y) {
    cache.invalidate('getPointIn-input');
  }

  if (!outputPoint.isValid) {

    if (!outputPoint.matrix) {
      outputPoint.matrix = new Matrix(3, 3, false);
    }

    if (!inputPoint.isValid) {
      inputPoint.matrix = matrixUtils.getTranslationMatrix(x, y,
          inputPoint.matrix);
      inputPoint.x = x;
      inputPoint.y = y;
      cache.update('getPointIn-input');
    }

    var isCanvasObject = isInstanceOf(reference, 'CanvasObject');
    var isWorld = isInstanceOf(reference, 'World');
    var isCamera = isInstanceOf(reference, 'Camera');
    var isCanvas = isInstanceOf(reference, 'Canvas');

    // When we get the transformation matrix needed to transform the point,
    // we need a matrix with the reference being one step closer than the
    // reference passed to this method. This is because we are looking for a
    // point within the reference, without applying the transformations of the
    // reference.
    var matrixReference = null;

    // For objects and the world as reference, we need to find the object that
    // is one step closer to the source object.
    if (isCanvasObject || isWorld) {
      var parent = this.parent;
      while (parent && parent !== reference) {
        matrixReference = parent;
        parent = parent.parent;
      }

    } else if (isCamera) {
      matrixReference = reference.world;

    } else if (isCanvas) {
      if (reference.camera) matrixReference = reference.camera.world;
    }

    var transformationMatrix;

    if (matrixReference) {
      transformationMatrix = this.getTransformationMatrix(matrixReference);
    } else {
      transformationMatrix = this.getTransformationMatrix();
    }


    // Reset the cached matrix instance for the output point
    outputPointMatrix = outputPoint.matrix;
    outputPointMatrix.setIdentityData();
    outputPointMatrix.multiply(transformationMatrix, inputPoint.matrix);

    if (isCamera || isCanvas) {
      var ref = reference;
      var camera = isCanvas ? ref.camera : ref;
      camera.getTransformationMatrix();
      var cameraTransformationCache = camera.cache.get('transformations');
      var cameraTransformationMatrix = cameraTransformationCache.matrixInverted;

      var i;

      if (isCanvas) {
        var cameraOriginCache = camera.cache.get('translation');
        var cameraOriginMatrix = cameraOriginCache.matrixOrigin;

        for (i = 0; i < 9; i++) {
          cameraOriginCache[i] = cameraOriginMatrix[i];
        }

        cameraOriginMatrix.multiply(cameraTransformationMatrix,
            outputPointMatrix);

        for (i = 0; i < 9; i++) {
          outputPointMatrix[i] = cameraOriginMatrix[i];
          cameraOriginMatrix[i] = cameraOriginCache[i];
          delete cameraOriginCache[i];
        }

      } else {

        for (i = 0; i < 9; i++) {
          cameraTransformationCache[i] = cameraTransformationMatrix[i];
        }

        cameraTransformationMatrix.multiply(outputPointMatrix);

        for (i = 0; i < 9; i++) {
          outputPointMatrix[i] = cameraTransformationMatrix[i];
          cameraTransformationMatrix[i] = cameraTransformationCache[i];
          delete cameraTransformationCache[i];
        }

      }

    }

    // Set cache as updated
    cache.update('getPointIn-output');

  } else {
    outputPointMatrix = outputPoint.matrix;
  }

  var output = opt_point || {x: 0, y: 0};
  output.x = outputPointMatrix[2];
  output.y = outputPointMatrix[5];

  return output;
};

/**
 * Get the vertices for this object. The coordinates will be relative
 * to the origin of this object and are not affected by any transformations.
 *
 * This needs implementation in a subclass. You should not call this
 * super method in the subclass.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
CanvasObject.prototype.getVertices = function() {
  var message = 'CanvasObject does not have an implementation of the ' +
      'getVertices method. Please use a subclass of ' +
      'CanvasObject that has an implementation of it.';
  var error = new Error(message);
  error.name = 'ocanvas-needs-subclass';
  throw error;
};

/**
 * Get the global vertices for this object. The coordinates will be relative
 * to the world.
 *
 * This needs implementation in a subclass. You should not call this
 * super method in the subclass.
 *
 * @param {Canvas} canvas The Canvas instance to use. Needed to get the camera.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
CanvasObject.prototype.getGlobalVertices = function(canvas) {
  var message = 'CanvasObject does not have an implementation of the ' +
      'getGlobalVertices method. Please use a subclass of ' +
      'CanvasObject that has an implementation of it.';
  var error = new Error(message);
  error.name = 'ocanvas-needs-subclass';
  throw error;
};

/**
 * Get the global vertices for this object and the tree of children. The
 * coordinates will be relative to the world.
 *
 * @param {Canvas} canvas The Canvas instance to use. Needed to get the camera.
 *
 * @return {Array} Array of objects, where each object has `x` and `y`
 *     properties representing the coordinates.
 */
CanvasObject.prototype.getGlobalVerticesForTree = function(canvas) {
  var cache = this.cache.get('treeVertices');

  if (cache.isValid) return cache.vertices;

  var vertices = cache.vertices || [];
  vertices.length = 0;
  vertices.push.apply(vertices, this.getGlobalVertices(canvas));

  var children = this.children;
  for (var i = 0, l = children.length; i < l; i++) {
    vertices.push.apply(vertices, children.get(i).getGlobalVerticesForTree(canvas));
  }

  cache.vertices = vertices;
  this.cache.update('treeVertices');

  return vertices;
};

/**
 * Get the bounding rectangle for this object.
 *
 * @param {Canvas} canvas A Canvas instance. Needed to get global coordinates.
 *
 * @return {Object} An object with data about the bounding rectangle. The
 *     positions are global and relative to the world. The properties of the
 *     returned object are: top, right, bottom, left, width, height
 */
CanvasObject.prototype.getBoundingRectangle = function(canvas) {
  var cache = this.cache.get('boundingRectangle');

  if (cache.isValid) return cache.data;

  if (!cache.data) cache.data = {};

  var vertices = this.getGlobalVertices(canvas);

  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  var vertex;

  for (var i = 0, l = vertices.length; i < l; i++) {
    vertex = vertices[i];

    if (vertex.x < minX) minX = vertex.x;
    if (vertex.x > maxX) maxX = vertex.x;
    if (vertex.y < minY) minY = vertex.y;
    if (vertex.y > maxY) maxY = vertex.y;
  }

  cache.data.top = minY;
  cache.data.right = maxX;
  cache.data.bottom = maxY;
  cache.data.left = minX;
  cache.data.width = maxX - minX;
  cache.data.height = maxY - minY;

  this.cache.update('boundingRectangle');

  return cache.data;
};

/**
 * Get the bounding rectangle for this object and all its children.
 *
 * @param {Canvas} canvas A Canvas instance. Needed to get global coordinates.
 *
 * @return {Object} An object with data about the bounding rectangle. The
 *     positions are global and relative to the world. The properties of the
 *     returned object are: top, right, bottom, left, width, height
 */
CanvasObject.prototype.getBoundingRectangleForTree = function(canvas) {
  var cache = this.cache.get('boundingRectangleForTree');

  if (cache.isValid) return cache.data;

  if (!cache.data) cache.data = {};

  var vertices = this.getGlobalVerticesForTree(canvas);

  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  var vertex;

  for (var i = 0, l = vertices.length; i < l; i++) {
    vertex = vertices[i];

    if (vertex.x < minX) minX = vertex.x;
    if (vertex.x > maxX) maxX = vertex.x;
    if (vertex.y < minY) minY = vertex.y;
    if (vertex.y > maxY) maxY = vertex.y;
  }

  cache.data.top = minY;
  cache.data.right = maxX;
  cache.data.bottom = maxY;
  cache.data.left = minX;
  cache.data.width = maxX - minX;
  cache.data.height = maxY - minY;

  this.cache.update('boundingRectangleForTree');

  return cache.data;
};

module.exports = CanvasObject;
