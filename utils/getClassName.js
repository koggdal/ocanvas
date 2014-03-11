/**
 * @module ocanvas/utils/getClassName
 */
'use strict';

/**
 * Get the name of a constructor function.
 * This will use the className property of the function if it exists,
 * otherwise it will fall back to constructor.name which will fall back to
 * parsing the name of the function from the stringified function.
 *
 * @param {Function} constructor The constructor function.
 *
 * @example
 * // Recommended way:
 * function A() {}
 * A.className = 'A';
 * getClassName(A); // 'A'
 *
 * // Also handled, but dangerous when minifying code:
 * function B() {}
 * getClassName(B); // 'B'
 */
module.exports = function(constructor) {
  if (constructor.className) {
    return constructor.className;
  } else if (constructor.name) {
    return constructor.name;
  } else {
    var funcNameRegExp = /function\s+(.{1,})\s*\(/;
    var results = funcNameRegExp.exec(constructor.toString());
    return (results && results.length > 1) ? results[1] : '';
  }
};
