/**
 * @module ocanvas/utils/inherit
 */
'use strict';

/**
 * Inherit from another function object.
 *
 * @param {Function} SubClassConstructor The function that should inherit things.
 * @param {Function} Constructor The function that it should inherit things from.
 *
 * @example
 * var inherit = require('ocanvas/utils/inherit');
 *
 * function Base() {}
 * Base.prototype.someMethod = function () {};
 *
 * function Child() {
 *   Base.call(this);
 * }
 * inherit(Child, Base);
 */
module.exports = function(SubClassConstructor, Constructor) {
  function TempConstructor() {}
  TempConstructor.prototype = Constructor.prototype;
  SubClassConstructor.prototype = new TempConstructor();
  SubClassConstructor.prototype.constructor = SubClassConstructor;
};
