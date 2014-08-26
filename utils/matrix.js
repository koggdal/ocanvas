/**
 * @module ocanvas/utils/matrix
 */
'use strict';

var Matrix = require('../classes/Matrix');

var productTempMatrix = new Matrix(3, 3, false);
var identityMatrix = new Matrix(3, 3);

/**
 * Get a matrix representing a translation.
 *
 * @param {number} x The X coordinate.
 * @param {number} y The Y coordinate.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance representing the translation.
 */
function getTranslationMatrix(x, y, opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3);

  matrix.setData(
    1, 0, x,
    0, 1, y,
    0, 0, 1
  );

  return matrix;
}

/**
 * Get a matrix representing a rotation.
 *
 * @param {number} rotation The rotation in degrees.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance representing the rotation.
 */
function getRotationMatrix(rotation, opt_matrix) {
  rotation = rotation * Math.PI / 180;

  var matrix = opt_matrix || new Matrix(3, 3);

  matrix.setData(
    Math.cos(rotation), -Math.sin(rotation), 0,
    Math.sin(rotation), Math.cos(rotation), 0,
    0, 0, 1
  );

  return matrix;
}

/**
 * Get a matrix representing a scaling.
 *
 * @param {number} x The scaling factor on the X axis.
 * @param {number} y The scaling factor on the Y axis.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance representing the scaling.
 */
function getScalingMatrix(x, y, opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3);

  matrix.setData(
    x, 0, 0,
    0, y, 0,
    0, 0, 1
  );

  return matrix;
}

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
function getTransformationMatrix(t, r, s, opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3, false);

  matrix.setIdentityData();
  matrix.multiply(t, r, s);

  return matrix;
}


/**
 * Get an identity matrix.
 *
 * @param {Matrix=} opt_matrix Optional Matrix instance to use.
 *
 * @return {Matrix} A Matrix instance for the identity matrix.
 */
function getIdentityMatrix(opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3, false);

  matrix.setIdentityData();

  return matrix;
}

/**
 * Clone a matrix into another matrix.
 *
 * @param {Matrix} matrixToClone Matrix instance to clone data from.
 * @param {Matrix=} opt_matrix Optional Matrix instance to use for output.
 *
 * @return {Matrix} A Matrix instance for the cloned data.
 */
function clone(matrixToClone, opt_matrix) {
  var matrix = opt_matrix || new Matrix(3, 3, false);

  for (var i = 0, l = matrixToClone.length; i < l; i++) {
    matrix[i] = matrixToClone[i];
  }

  return matrix;
}

/**
 * Calculate the product of the provided matrices and set the result in the
 * target matrix.
 *
 * @param {Matrix} targetMatrix The matrix that will get the result data.
 * @param {...Matrix} var_args Each argument is a matrix that will be used for
 *     calculations. None of these matrices will be modified.
 *
 * @return {Matrix} The target matrix.
 */
function setProduct(targetMatrix, var_args) {

  // Save the target matrix data in case that matrix is also an input matrix
  clone(targetMatrix, productTempMatrix);

  // Make the target matrix an identity matrix to start off clean
  clone(identityMatrix, targetMatrix);

  // Multiply each input matrix into the target matrix
  for (var i = 1, l = arguments.length; i < l; i++) {

    // If the input matrix is the target matrix, we must use the saved data
    // for that matrix, since the target matrix has been modified.
    if (targetMatrix === arguments[i]) {
      targetMatrix.multiply(productTempMatrix);

    // Other matrices are just multiplied in normally
    } else {
      targetMatrix.multiply(arguments[i]);
    }
  }

  return targetMatrix;
}

exports.getTranslationMatrix = getTranslationMatrix;
exports.getRotationMatrix = getRotationMatrix;
exports.getScalingMatrix = getScalingMatrix;
exports.getTransformationMatrix = getTransformationMatrix;
exports.getIdentityMatrix = getIdentityMatrix;
exports.clone = clone;
exports.setProduct = setProduct;
