/**
 * @module ocanvas/classes/Canvas
 */
'use strict';

var Cache = require('./Cache');

var defineProperties = require('../utils/defineProperties');
var jsonHelpers = require('../utils/json');
var isInstanceOf = require('../utils/isInstanceOf');
var matrixUtils = require('../utils/matrix');

/**
 * @classdesc A Canvas instance is connected to a canvas DOM element. It will
 *     render what a connected camera sees in a world.
 *
 * @property {number} width The width of the canvas in pixels. This will be set
 *     automatically by the canvas element. If the property is provided in
 *     the properties object passed to the constructor, it will set the width
 *     to that value. The default width for a canvas element is 300 px.
 * @property {number} height The height of the canvas in pixels. This will be set
 *     automatically by the canvas element. If the property is provided in
 *     the properties object passed to the constructor, it will set the height
 *     to that value. The default height for a canvas element is 150 px.
 * @property {string} background Background color. Default value is '', which
 *     means transparent.
 * @property {Camera?} camera A camera instance. Default is null.
 * @property {HTMLElement} element The canvas DOM element. Will be created if
 *     not provided in the initial properties to the constructor.
 * @property {CanvasRenderingContext2D} context The canvas 2D context object.
 *     This will be fetched from the element that is either set or created
 *     at the time the constructor runs. Changing the element requires you to
 *     manually update the context property as well.
 * @property {string} viewMode Decides how the contents of the camera
 *     is fitted inside the canvas. This only matters when the size of the
 *     camera does not match the size of the canvas. The possible values are:
 *     <ul>
 *       <li><b>'fit' (default):</b> Fit the whole camera, might leave space in
 *         the top/bottom or left/right sides of the canvas.</li>
 *       <li><b>'fit-x':</b> Fit the camera horizontally. This might leave
 *         space in the top/bottom or hide parts of the top/bottom of the
 *         camera, depending on the size of the canvas.</li>
 *       <li><b>'fit-y':</b> Fit the camera vertically. This might leave space
 *         in the left/right sides or hide parts of the left/right of the
 *         camera, depending on the size of the canvas.</li>
 *       <li><b>'stretch':</b> The camera will be scaled to fit exactly in the
 *         canvas, but the content might lose the proportions as it stretches
 *         it.</li>
 *     </ul>
 * @property {number} renderDepth Current render depth in the rendering phase.
 * @property {number} maxRenderDepth The maximum number of times the world
 *     will be rendered recursively (a shape with a camera fill will trigger
 *     the world to be rendered recursively one step).
 * @property {boolean} boundingRectanglesEnabled Whether the render method
 *     should render bounding rectangles for all objects as well. Default
 *     is false.
 * @property {boolean} boundingRectanglesWrapChildren Whether the bounding
 *     rectangles should wrap the children of the objects. Default is true.
 * @property {boolean} boundingRectanglesWrapSelf Whether the bounding
 *     rectangles should wrap the object itself. If both this and the setting
 *     for children is set to true, it will render two bounding boxes—one for
 *     the object itself and one that wraps all its children. If the setting
 *     for children is set to false and this is true, it will render only a
 *     rectangle around the object itself. If both are false, it won't render
 *     any bounding rectangles. Default is true.
 * @property {string} boundingRectanglesColor The color to use for the bounding
 *     rectangles. Default is 'red'.
 * @property {number} boundingRectanglesThickness The thickness in pixels for
 *     the bounding rectangle stroke. Default is 2.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 *
 * @example
 * var canvas = new Canvas();
 * document.body.appendChild(canvas.element);
 */
function Canvas(opt_properties) {
  this.background = '';
  this.camera = null;
  this.renderDepth = 0;
  this.maxRenderDepth = 5;
  this.boundingRectanglesEnabled = false;
  this.boundingRectanglesWrapChildren = true;
  this.boundingRectanglesWrapSelf = true;
  this.boundingRectanglesColor = 'red';
  this.boundingRectanglesThickness = 2;
  this.boundingRectangleCulling = true;

  this.initCache();

  defineProperties(this, {
    width: {
      value: 0,
      set: function(value) {
        if (this.element) this.element.width = value;
        this.cache.invalidate('translation');
        this.cache.invalidate('scaling');
      }
    },
    height: {
      value: 0,
      set: function(value) {
        if (this.element) this.element.height = value;
        this.cache.invalidate('translation');
        this.cache.invalidate('scaling');
      }
    },
    viewMode: {
      value: 'fit',
      set: function(value) {
        this.cache.invalidate('scaling');
      }
    }
  }, {enumerable: true});

  if (opt_properties) {
    this.setProperties(opt_properties);
  }

  this._createCanvas();
}

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Canvas.className = 'Canvas';

/**
 * Properties that should be included in the plain object created by toObject.
 *
 * @type {Array}
 */
Canvas.objectProperties = [
  'width',
  'height',
  'background',
  'camera',
  'viewMode',
  'maxRenderDepth'
];

/**
 * Create a new Canvas instance from a plain object. This object
 * must have the structure that the toObject method creates.
 *
 * @param {Object} object A plain object.
 * @param {HTMLCanvasElement=} opt_canvas Optional canvas element.
 *     The canvas element can't be stored in a JSON string, so to
 *     be able to create the canvas instance from that, the
 *     canvas element must be provided explicitly. If not provided,
 *     a canvas element will be created for you (and accessible from
 *     the `element` property).
 *
 * @return {Canvas} A Canvas instance.
 */
Canvas.fromObject = function(object, opt_canvas) {
  var canvas = new this({element: opt_canvas});
  return jsonHelpers.setProperties(canvas, object);
};

/**
 * Create a new Canvas instance from a JSON string representing a plain object.
 * This object must have the structure that the toObject method creates.
 *
 * @param {string} json A JSON string representing a plain object.
 * @param {HTMLCanvasElement=} opt_canvas Optional canvas element.
 *     The canvas element can't be stored in a JSON string, so to
 *     be able to create the canvas instance from that, the
 *     canvas element must be provided explicitly. If not provided,
 *     a canvas element will be created for you (and accessible from
 *     the `element` property).
 *
 * @return {Canvas} A Canvas instance.
 */
Canvas.fromJSON = function(json, opt_canvas) {
  var canvas = new this({element: opt_canvas});
  return jsonHelpers.setProperties(canvas, JSON.parse(json));
};

/**
 * Convert the canvas object and everything that is tied to it to a plain object.
 * This plain object can be converted to a JSON string.
 *
 * @return {Object} An object that represents this canvas.
 */
Canvas.prototype.toObject = function() {
  return jsonHelpers.toObject(this, Canvas.objectProperties, 'Canvas');
};

/**
 * Convert the canvas object and everything that is tied to it to JSON.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
Canvas.prototype.toJSON = function(opt_space) {
  return jsonHelpers.toJSON(this, Canvas.objectProperties, 'Canvas', opt_space);
};

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
Canvas.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Initialize the cache (used for matrices etc).
 * This should only be called once, which happens in the constructor. Calling
 * it more times will create a new cache that replaces the old one.
 */
Canvas.prototype.initCache = function() {
  var self = this;

  this.cache = new Cache();

  // Matrices
  this.cache.define(['translation', 'scaling']);
  this.cache.define('transformations', {
    dependencies: ['translation', 'scaling']
  });

  this.cache.onInvalidate = function(unit) {
    if (unit === 'transformations') {
      if (self.camera) {
        var cameraCache = self.camera.cache;
        if (cameraCache.get('transformations').reference === self) {
          cameraCache.invalidate('transformations');
        }
      }
    }
  };
};

/**
 * Clear the canvas surface.
 */
Canvas.prototype.clear = function() {
  this.context.clearRect(0, 0, this.width, this.height);
};

/**
 * Render what the camera sees. It will 
 * Before doing so, it clears the canvas.
 */
Canvas.prototype.render = function() {
  this.clear();

  if (!this.camera) {
    var message = 'You must set a camera on the canvas instance to render.';
    var error = new Error(message);
    error.name = 'ocanvas-no-camera';
    throw error;
  }

  var context = this.context;
  var camera = this.camera;

  context.save();

  // Draw the background for the canvas
  if (this.background && this.background !== 'transparent') {
    context.fillStyle = this.background;
    context.fillRect(0, 0, this.width, this.height);
  }

  // Get values based on the current view mode
  var viewModeValues = this._getViewModeValues();

  // Clip what is drawn to the box of the camera fitted inside
  // the camera view.
  var clipX = viewModeValues.x;
  var clipY = viewModeValues.y;
  var clipWidth = camera.width * viewModeValues.scaleX;
  var clipHeight = camera.height * viewModeValues.scaleY;
  context.beginPath();
  context.rect(clipX, clipY, clipWidth, clipHeight);
  context.closePath();
  context.clip();

  // Translate to the middle of the canvas
  // (the origin of the camera is in the center, and we want zoom etc
  // to happen around that center point)
  context.translate(this.width / 2, this.height / 2);

  // Scale the context proportionally based on the view mode setting
  context.scale(viewModeValues.scaleX, viewModeValues.scaleY);

  camera.render(this);

  context.restore();

  if (camera.world) {
    var bRectEnabled = this.boundingRectanglesEnabled;
    var bRectThickness = this.boundingRectanglesThickness;

    if (bRectEnabled && bRectThickness > 0) {
      context.save();
      context.translate(this.width / 2, this.height / 2);
      context.scale(viewModeValues.scaleX, viewModeValues.scaleY);
      context.translate(-camera.x, -camera.y);
      context.strokeStyle = this.boundingRectanglesColor;
      context.lineWidth = this.boundingRectanglesThickness;

      var objects = camera.world.objects;
      for (var i = 0, l = objects.length; i < l; i++) {
        this.renderBoundingRectangleForObject(objects.get(i));
      }

      context.restore();
    }
  }
};

/**
 * Get a transformation matrix for the canvas. It will be a combined matrix
 * for translation and scaling. Since the canvas can't be rotated, no rotation
 * will be included. Technically, the canvas can't be scaled or translated
 * either. However, the values used here for scaling are based on the needed
 * scaling for the content that the camera sees, if the size of the camera does
 * not match the size of the canvas. The translation values are based on half
 * the width and height, to move from the center of the camera to the top left
 * corner of the canvas.
 * If the matrix cache is still valid, it will not update the matrix.
 *
 * @return {Matrix} A Matrix instance representing the transformations.
 */
Canvas.prototype.getTransformationMatrix = function() {
  var cache = this.cache;
  var transformations = cache.get('transformations');

  if (transformations.isValid) return transformations.matrix;

  var translation = cache.get('translation');
  var scaling = cache.get('scaling');

  if (!translation.isValid) {
    var w = this.width, h = this.height;
    translation.matrix = matrixUtils.getTranslationMatrix(w / 2, h / 2,
        translation.matrix);
    cache.update('translation');
  }

  if (!scaling.isValid) {
    var viewModeValues = this._getViewModeValues();
    scaling.matrix = matrixUtils.getScalingMatrix(viewModeValues.scaleX,
      viewModeValues.scaleY, scaling.matrix);
    cache.update('scaling');
  }

  transformations.matrix = matrixUtils.getIdentityMatrix(
    transformations.matrix);
  transformations.matrix.multiply(translation.matrix, scaling.matrix);
  cache.update('transformations');

  return transformations.matrix;
};

/**
 * Transform the canvas context from the specified current object to the
 * specified target object. This assumes that the canvas has previously been
 * transformed to where the current object is (starting with the outermost
 * parent). It's advised to do `context.save()` before calling this, and
 * `context.restore()` when you're done.
 *
 * @param {CanvasObject} object The CanvasObject instance to transform to.
 * @param {CanvasObject} currentObject The CanvasObject instance to start from.
 *     This method will start by transforming out to the outermost parent from
 *     this object and then back in to the object specified in the first
 *     argument.
 */
Canvas.prototype.transformContextToObject = function(object, currentObject) {
  var context = this.context;
  var camera = this.camera;
  var x;
  var y;
  var obj;
  var parent;

  obj = currentObject;
  while (obj) {
    parent = isInstanceOf(obj.parent, 'CanvasObject') ? obj.parent : null;

    x = parent ? -obj.x : -(obj.x - camera.x);
    y = parent ? -obj.y : -(obj.y - camera.y);

    context.scale(1 / obj.scalingX, 1 / obj.scalingY);
    context.rotate(-obj.rotation * Math.PI / 180);
    context.translate(x, y);

    obj = parent;
  }

  obj = object;
  var chain = [];
  while (obj) {
    chain.push(obj);
    obj = isInstanceOf(obj.parent, 'CanvasObject') ? obj.parent : null;
  }
  chain.reverse();

  for (var i = 0, l = chain.length; i < l; i++) {
    obj = chain[i];
    parent = isInstanceOf(obj.parent, 'CanvasObject') ? obj.parent : null;
    x = parent ? obj.x : obj.x - camera.x;
    y = parent ? obj.y : obj.y - camera.y;
    context.translate(x, y);
    context.rotate(obj.rotation * Math.PI / 180);
    context.scale(obj.scalingX, obj.scalingY);
  }
};

/**
 * Render the bounding rectangle for an object, based on the settings set on
 * this canvas instance.
 *
 * @param {CanvasObject} object The canvas object to render the rectangle for.
 */
Canvas.prototype.renderBoundingRectangleForObject = function(object) {
  var rect1, rect2;

  if (this.boundingRectanglesWrapChildren) {
    rect1 = object.getBoundingRectangleForTree(this);
    if (this.boundingRectanglesWrapSelf) {
      rect2 = object.getBoundingRectangle(this);
    }
  } else if (this.boundingRectanglesWrapSelf) {
    rect1 = object.getBoundingRectangle(this);
  }

  var thickness = this.boundingRectanglesThickness;

  if (rect1) {
    var left1 = rect1.left - thickness / 2;
    var top1 = rect1.top - thickness / 2;
    var width1 = rect1.width + thickness;
    var height1 = rect1.height + thickness;
    this.context.strokeRect(left1, top1, width1, height1);
  }

  if (rect2) {
    var left2 = rect2.left - thickness / 2;
    var top2 = rect2.top - thickness / 2;
    var width2 = rect2.width + thickness;
    var height2 = rect2.height + thickness;
    this.context.strokeRect(left2, top2, width2, height2);
  }

  if (object.children.length > 0) {
    for (var i = 0, l = object.children.length; i < l; i++) {
      this.renderBoundingRectangleForObject(object.children.get(i));
    }
  }
};

/**
 * Get the values for scaling the context to fit the camera
 * contents into the canvas, based on the viewMode property.
 *
 * @private
 *
 * @return {Object} Object with properties x, y, scaleX, scaleY.
 */
Canvas.prototype._getViewModeValues = function() {
  var camera = this.camera;
  var x = 0;
  var y = 0;
  var scaleX = 1;
  var scaleY = 1;

  if (camera) {
    switch (this.viewMode) {
      case 'fit-x':
        scaleX = scaleY = this.width / camera.width;
        y = (this.height - (camera.height * scaleY)) / 2;
        break;

      case 'fit-y':
        scaleX = scaleY = this.height / camera.height;
        x = (this.width - (camera.width * scaleX)) / 2;
        break;

      case 'stretch':
        scaleX = this.width / camera.width;
        scaleY = this.height / camera.height;
        break;

      case 'fit':
      default:

        // Use logic for fit-x
        if (this.width / camera.width * camera.height < this.height) {
          scaleX = scaleY = this.width / camera.width;
          y = (this.height - camera.height * scaleY) / 2;

        // Use logic for fit-y
        } else {
          scaleX = scaleY = this.height / camera.height;
          x = (this.width - camera.width * scaleX) / 2;
        }

        break;
    }
  }

  return {
    x: x,
    y: y,
    scaleX: scaleX,
    scaleY: scaleY
  };
};

/**
 * Set up the canvas and context properties, either using
 * a provided canvas element, or a new canvas element. The provided
 * canvas element is read from the 'element' property.
 *
 * @private
 */
Canvas.prototype._createCanvas = function() {
  if (!this.element && global.document && document.createElement) {
    this.element = document.createElement('canvas');
  }

  var HTMLCanvasElement = global.HTMLCanvasElement;

  if (HTMLCanvasElement && this.element instanceof HTMLCanvasElement) {
    this.context = this.element.getContext('2d');

    // If width/height is already set on the object, set the canvas element
    // to that size. Otherwise, set the instance properties to the size of
    // the canvas element.
    if (this.width) this.element.width = this.width;
    else this.width = this.element.width;
    if (this.height) this.element.height = this.height;
    else this.height = this.element.height;

  // Set the dimensions to the default canvas element size if there is no
  // element provided.
  } else {
    if (!this.width) this.width = 300;
    if (!this.height) this.height = 150;
  }
};

module.exports = Canvas;
