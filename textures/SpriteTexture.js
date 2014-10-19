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
 * @augments {ImageTexture}
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 */
function SpriteTexture(opt_properties) {
  ImageTexture.call(this);

  // Since ImageTexture sets the dimensions to the dimensions of the source
  // image when loaded, we need to reset the dimensions to not render the full
  // sprite sheet.
  this.on('load', function handler() {
    var frame = this.frames && this.frames[this.frame];
    this.sourceX = frame ? frame.x : 0;
    this.sourceY = frame ? frame.y : 0;
    this.width = frame ? frame.width : 0;
    this.height = frame ? frame.height : 0;
  });

  defineProperties(this, {
    frames: {
      value: null,
      set: function(value, currentValue, privateVars) {
        if (!Array.isArray(value)) return currentValue;

        var frame = value[this.frame];
        this.sourceX = frame ? frame.x : 0;
        this.sourceY = frame ? frame.y : 0;
        this.width = frame ? frame.width : 0;
        this.height = frame ? frame.height : 0;
      }
    },
    frame: {
      value: 0,
      set: function(value, currentValue, privateVars) {
        if (typeof value !== 'number') return currentValue;

        var frame = this.frames && this.frames[value];
        this.sourceX = frame ? frame.x : 0;
        this.sourceY = frame ? frame.y : 0;
        this.width = frame ? frame.width : 0;
        this.height = frame ? frame.height : 0;
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

module.exports = SpriteTexture;
