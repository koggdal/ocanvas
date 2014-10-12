/**
 * @module ocanvas/textures/ColorTexture
 */
'use strict';

var Texture = require('./Texture');

var inherit = require('../utils/inherit');
var defineProperties = require('../utils/defineProperties');

/**
 * @classdesc The ColorTexture class handles textures based on solid colors.
 *
 * @property {string} color A CSS color value. See specification:
 *     http://dev.w3.org/csswg/css-color/
 *
 * @constructor
 * @augments {Texture}
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 */
function ColorTexture(opt_properties) {
  Texture.call(this);

  this.color = 'transparent';

  defineProperties(this, {
    style: {
      value: null,
      get: function() {
        return this.color;
      },
      set: function(value) {
        if (typeof value === 'string') {
          this.color = value;
        }
      }
    }
  }, {enumerable: true});

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
inherit(ColorTexture, Texture);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
ColorTexture.className = 'ColorTexture';

module.exports = ColorTexture;
