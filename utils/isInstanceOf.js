/**
 * @module ocanvas/utils/isInstanceOf
 */
'use strict';

var getClassName = require('./getClassName');

/**
 * Check if the object is an instance of a class with the provided name.
 * This allows type checking without including the actual class.
 *
 * @param {Object} object Any object.
 * @param {string} className The name of the class.
 *
 * @example
 * isInstanceOf(object, 'Object'); // true or false
 */
module.exports = function(object, className) {
  var type = typeof object;

  // It needs to be an object or a function.
  if (object && type !== 'function' && type !== 'object') {
    return false;
  }

  while (object) {
    var prototype = Object.getPrototypeOf(object);
    var constructor = prototype && prototype.constructor;
    if (constructor && getClassName(constructor) === className) {
      return true;
    }
    object = prototype;
  }

  return false;
};
