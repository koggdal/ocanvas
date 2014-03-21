/**
 * @module ocanvas/utils/matrix
 */
'use strict';

var Matrix = require('../classes/Matrix');

/**
 * Get a matrix representing a translation.
 *
 * @param {number} x The X coordinate.
 * @param {number} y The Y coordinate.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance representing the translation.
 */
exports.getTranslationMatrix = function(x, y, opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3);

  matrix.setData(
    1, 0, x,
    0, 1, y,
    0, 0, 1
  );

  return matrix;
};

/**
 * Get a matrix representing a rotation.
 *
 * @param {number} rotation The rotation in degrees.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance representing the rotation.
 */
exports.getRotationMatrix = function(rotation, opt_matrix) {
  rotation = rotation * Math.PI / 180;

  var matrix = opt_matrix || new Matrix(3, 3);

  matrix.setData(
    Math.cos(rotation), -Math.sin(rotation), 0,
    Math.sin(rotation), Math.cos(rotation), 0,
    0, 0, 1
  );

  return matrix;
};

/**
 * Get a matrix representing a scaling.
 *
 * @param {number} x The scaling factor on the X axis.
 * @param {number} y The scaling factor on the Y axis.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance representing the scaling.
 */
exports.getScalingMatrix = function(x, y, opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3);

  matrix.setData(
    x, 0, 0,
    0, y, 0,
    0, 0, 1
  );

  return matrix;
};

/**
 * Get a matrix representing all transformations.
 *
 * @param {Matrix} translation The translation matrix.
 * @param {Matrix} rotation The rotation matrix.
 * @param {Matrix} scaling The scaling matrix.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance representing all the transformations.
 */
exports.getTransformationMatrix = function(t, r, s, opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3, false);

  matrix.setIdentityData();
  matrix.multiply(t, r, s);

  return matrix;
};


/**
 * Get an identity matrix.
 *
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance for the identity matrix.
 */
exports.getIdentityMatrix = function(opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3, false);

  matrix.setIdentityData();

  return matrix;
};
