/**
 * @module ocanvas/textures/ImageTexture
 */
'use strict';

var Texture = require('./Texture');

var inherit = require('../utils/inherit');
var defineProperties = require('../utils/defineProperties');
var isInstanceOf = require('../utils/isInstanceOf');

/**
 * @classdesc The ImageTexture class handles textures based on an image.
 *
 * @property {boolean} loaded True if image is loaded, false if not. Default is
 *     false.
 * @property {number} width The width of the part of the texture to render.
 *     Default is 0.
 * @property {number} height The height of the part of the texture to render.
 *     Default is 0.
 * @property {number} sourceWidth The width of the texture image. Default is 0.
 * @property {number} sourceHeight The height of the texture image. Default
 *     is 0.
 * @property {number} sourceX The X position of the top left corner of the
 *     rendered section of the image. Default is 0.
 * @property {number} sourceY The Y position of the top left corner of the
 *     rendered section of the image. Default is 0.
 * @property {HTMLImageElement?} imageElement The image DOM element. This is
 *     null from the start and an element when the image is initialized.
 * @property {string} repeat The repeat mode, one of 'both', 'x', 'y' and
 *     'none'. Default is 'both'.
 * @property {string} size The mode for sizing the texture. One of these:
 *     'source': The texture will be rendered with the dimensions of the
 *         texture's image. This is the only mode where the repeat mode is used.
 *     'stretch': The texture will be stretched to fit the object's dimensions.
 *     'cover': The texture will be sized so it covers the whole object, but
 *         without distorting the proportions.
 *     'contain': The texture will be sized so it fits inside the object, but
 *         without distorting the proportions.
 *     Default is 'source'.
 * @property {string|HTMLImageElement?} image A path to an image file, or an
 *     instance of HTMLImageElement. If the image is not loaded yet, rendering
 *     an object with this texture will not render the texture. Default is null.
 *
 * @fires module:ocanvas/textures/ImageTexture~ImageTexture#load
 * @fires module:ocanvas/textures/ImageTexture~ImageTexture#error
 *
 * @constructor
 * @augments {Texture}
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 */
function ImageTexture(opt_properties) {
  Texture.call(this);

  this.width = 0;
  this.height = 0;
  this.sourceX = 0;
  this.sourceY = 0;

  define(this, [
    'loaded',
    'sourceWidth',
    'sourceHeight',
    'imageElement',
    'repeat',
    'size',
    'image',
    'style'
  ]);

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(ImageTexture, Texture);

/**
 * Event for notifying that the image was loaded and the texture is ready for
 * use. This will be emitted every time the image source is changed and that
 * source is loaded.
 *
 * @event module:ocanvas/textures/ImageTexture~ImageTexture#load
 *
 * @example
 * var texture = new ImageTexture({image: 'image.png'});
 * texture.on('load', function() {});
 */

/**
 * Event for notifying that the image failed to load. This will be emitted every
 * time the image source is changed and that source failed to load.
 *
 * @event module:ocanvas/textures/ImageTexture~ImageTexture#error
 *
 * @example
 * var texture = new ImageTexture({image: 'image.png'});
 * texture.on('error', function() {});
 */

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
ImageTexture.className = 'ImageTexture';

/**
 * Property descriptors compatible with the `defineProperties` utility.
 *
 * @type {Object}
 * @private
 */
var propertyDescriptors = {
  loaded: {
    value: false,
    writable: false
  },
  sourceWidth: {
    value: 0,
    writable: false
  },
  sourceHeight: {
    value: 0,
    writable: false
  },
  imageElement: {
    value: null,
    writable: false
  },
  repeat: {
    value: 'both',
    set: function(value, currentValue, privateVars) {
      switch (value) {
        case 'both': privateVars.repeatMode = 'repeat'; break;
        case 'x': privateVars.repeatMode = 'repeat-x'; break;
        case 'y': privateVars.repeatMode = 'repeat-y'; break;
        case 'none': privateVars.repeatMode = 'no-repeat'; break;
        default: return currentValue;
      }

      if (privateVars.imageElement) {
        var canvas = global.document.createElement('canvas');
        var context = canvas.getContext('2d');
        var imageElement = privateVars.imageElement;
        var repeatMode = privateVars.repeatMode;
        this.style = context.createPattern(imageElement, repeatMode);
      }
    }
  },
  size: {
    value: 'source',
    set: function(value, currentValue) {
      switch (value) {
        case 'source': break;
        case 'cover': break;
        case 'contain': break;
        case 'stretch': break;
        default: return currentValue;
      }
    }
  },
  image: {
    value: null,
    set: function(value, currentValue, privateVars) {
      var isString = typeof value === 'string';
      var isImage = value instanceof global.HTMLImageElement;

      if (!isString && !isImage) return currentValue;

      privateVars.loaded = false;

      var image = value;
      if (isString) {
        image = global.document.createElement('img');
        image.src = value;
      }

      var texture = this;
      image.addEventListener('load', function() {
        if (privateVars.image !== value) return;

        privateVars.imageElement = image;
        privateVars.loaded = true;
        privateVars.sourceWidth = image.width;
        privateVars.sourceHeight = image.height;
        texture.width = image.width;
        texture.height = image.height;

        var canvas = global.document.createElement('canvas');
        var context = canvas.getContext('2d');
        var repeat = privateVars.repeatMode || 'repeat';
        texture.style = context.createPattern(image, repeat);
        texture.emit('load');
      });
      image.addEventListener('error', function() {
        if (privateVars.image !== value) return;
        texture.emit('error');
      });
    }
  },
  style: {
    value: 'transparent',
    set: function(value, currentValue) {
      if (!isInstanceOf(value, 'CanvasPattern')) return currentValue;
    }
  }
};

function define(object, properties) {
  var descriptors = {};
  for (var i = 0, l = properties.length; i < l; i++) {
    descriptors[properties[i]] = propertyDescriptors[properties[i]];
  }
  defineProperties(object, descriptors, {enumerable: true});
}

module.exports = ImageTexture;
