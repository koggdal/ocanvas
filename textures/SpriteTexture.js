/**
 * @module ocanvas/textures/SpriteTexture
 */
'use strict';

var ImageTexture = require('./ImageTexture');

var inherit = require('../utils/inherit');
var defineProperties = require('../utils/defineProperties');
var isInstanceOf = require('../utils/isInstanceOf');

/**
 * @classdesc The SpriteTexture class handles textures based on a sprite image.
 *
 * @property {number} width The width of the texture image (of the current
 *     frame). Default is 0.
 * @property {number} height The height of the texture image (of the current
 *     frame). Default is 0.
 *
 * @constructor
 * @augments module:ocanvas/textures/ImageTexture~ImageTexture
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 */
function SpriteTexture(opt_properties) {
  ImageTexture.call(this);

  var internalVars = {};

  // Since ImageTexture sets the dimensions to the dimensions of the source
  // image when loaded, we need to reset the dimensions to not render the full
  // sprite sheet.
  this.on('load', function handler() {
    updateFrameProperties(this, this.frames, this.frame, internalVars);
  });

  defineProperties(this, {
    frames: {
      value: null,
      set: function(value, currentValue, privateVars) {
        if (!Array.isArray(value)) return currentValue;
        updateFrameProperties(this, value, this.frame, internalVars);
      }
    },
    frame: {
      value: 0,
      set: function(value, currentValue, privateVars) {
        if (typeof value !== 'number') return currentValue;
        updateFrameProperties(this, this.frames, value, internalVars);
      }
    },
    style: {
      value: 'transparent',
      get: function(value, privateVars) {
        if (!internalVars.isStyleValid && this.imageElement) {
          privateVars.style = updateStyle(this, privateVars, internalVars);
        }
        return privateVars.style;
      }
    }
  }, {enumerable: true});

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(SpriteTexture, ImageTexture);

/**
 * Generate frames from the texture image based on the specified options. This
 * will set the `frames` property on the texture.
 *
 * @param  {Object} options Object with options. Available options are:
 *     'columns' (number): Amount of columns in the sprite sheet. Default is 1.
 *     'rows' (number): Amount of rows in the sprite sheet. Default is 1.
 *     'amount' (number): Total amount of frames in the sprite sheet. Default
 *       is `columns * rows`.
 */
SpriteTexture.prototype.generateFrames = function(options) {
  var columns = options.columns || 1;
  var rows = options.rows || 1;
  var frameWidth = this.sourceWidth / columns;
  var frameHeight = this.sourceHeight / rows;
  var amount = options.amount || (columns * rows);

  var frames = new Array(amount);

  for (var i = 0, row, col; i < amount; i++) {
    row = Math.floor(i / columns);
    col = i % columns;
    frames[i] = {
      x: col * frameWidth,
      y: row * frameHeight,
      width: frameWidth,
      height: frameHeight
    };
  }

  this.frames = frames;
};

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
SpriteTexture.className = 'SpriteTexture';

var repeatModes = {
  'both': 'repeat',
  'none': 'no-repeat',
  'x': 'repeat-x',
  'y': 'repeat-y'
};

function updateStyle(texture, privateVars, internalVars) {
  internalVars.isStyleValid = true;

  if (!privateVars.styleCanvas) {
    privateVars.styleCanvas = global.document.createElement('canvas');
  }

  var imageElement = texture.imageElement;
  var styleCanvas = privateVars.styleCanvas;
  var sx = texture.sourceX;
  var sy = texture.sourceY;
  var sw = texture.width;
  var sh = texture.height;
  var repeatMode = repeatModes[texture.repeat];

  styleCanvas.width = texture.width;
  styleCanvas.height = texture.height;

  var context = styleCanvas.getContext('2d');
  context.drawImage(imageElement, sx, sy, sw, sh, 0, 0, sw, sh);

  return context.createPattern(styleCanvas, repeatMode);
}

function updateFrameProperties(texture, frames, frameIndex, internalVars) {
  var frame = frames && frames[frameIndex];
  texture.sourceX = frame ? frame.x : 0;
  texture.sourceY = frame ? frame.y : 0;
  texture.width = frame ? frame.width : 0;
  texture.height = frame ? frame.height : 0;
  internalVars.isStyleValid = false;
}

module.exports = SpriteTexture;
