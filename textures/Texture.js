/**
 * @module ocanvas/textures/Texture
 */
'use strict';

var EventEmitter = require('../mixins/EventEmitter');

var mixin = require('../utils/mixin');

/**
 * @classdesc The Texture class needs to be subclassed for different kinds of
 *     textures.
 *
 * @property {string|CanvasGradient|CanvasPattern} style A value that can be
 *     used in fillStyle/strokeStyle of a CanvasRenderingContext2D.
 *
 * @constructor
 * @mixes module:ocanvas/mixins/EventEmitter~EventEmitter
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 */
function Texture(opt_properties) {
  this.style = 'transparent';

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}
mixin(Texture.prototype, EventEmitter);

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
Texture.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Texture.className = 'Texture';

module.exports = Texture;
