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
 * @param {...string} className The name of the class. If many classes, they
 *     should be specified as multiple arguments and it will then return true
 *     if it's an instance of any of the classes.
 *
 * @example
 * isInstanceOf(object, 'Object'); // true or false
 */
module.exports = function(object, className) {
  var type = typeof object;

  var classNames = Array.prototype.slice.call(arguments, 1);

  // It needs to be an object or a function.
  if (object && type !== 'function' && type !== 'object') {
    return false;
  }

  while (object) {
    var prototype = Object.getPrototypeOf(object);
    var constructor = prototype && prototype.constructor;
    if (constructor && classNames.indexOf(getClassName(constructor)) > -1) {
      return true;
    }
    object = prototype;
  }

  return false;
};
