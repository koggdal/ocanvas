/**
 * @module ocanvas/utils/mixin
 */
'use strict';

/**
 * Mix in properties from a source object to a target object.
 *
 * @param {Object} target The target object.
 * @param {...Object} source The source object. The function
 *     accepts multiple arguments, and all except the first
 *     argument will be used as sources.
 */
function mixin(target, source) {
  var sources = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, l = sources.length; i < l; i++) {
    source = sources[i];
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  }
  return target;
}

module.exports = mixin;
