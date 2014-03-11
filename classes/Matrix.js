/**
 * @module ocanvas/classes/Matrix
 *
 * @desc See documentation for the npm package matrixmath:
 *     {@link https://npmjs.org/package/matrixmath}
 */
'use strict';

var Matrix = require('matrixmath').Matrix;

module.exports = Matrix;

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Matrix.className = 'Matrix';