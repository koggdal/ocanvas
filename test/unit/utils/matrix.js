var expect = require('expect.js');
var matrixUtils = require('../../../utils/matrix');
var Matrix = require('../../../classes/Matrix');

describe('matrix', function() {

  describe('.getTranslationMatrix()', function() {

    it('should return a new Matrix instance if one is not provided', function() {
      var matrix = matrixUtils.getTranslationMatrix(0, 0);
      expect(matrix instanceof Matrix).to.equal(true);
    });

    it('should return the same Matrix instance if one is provided', function() {
      var matrix = new Matrix(3, 3);
      var matrix2 = matrixUtils.getTranslationMatrix(0, 0, matrix);
      expect(matrix).to.equal(matrix2);
    });

    it('should set the correct matrix data for the translation on a new matrix', function() {
      var matrix = matrixUtils.getTranslationMatrix(15, 25);
      expect(matrix.toArray()).to.eql([1, 0, 15, 0, 1, 25, 0, 0, 1]);
    });

    it('should set the correct matrix data for the translation on an existing matrix', function() {
      var matrix = matrixUtils.getTranslationMatrix(15, 25, new Matrix(3, 3));
      expect(matrix.toArray()).to.eql([1, 0, 15, 0, 1, 25, 0, 0, 1]);
    });

  });

  describe('.getRotationMatrix()', function() {

    it('should return a new Matrix instance if one is not provided', function() {
      var matrix = matrixUtils.getRotationMatrix(45);
      expect(matrix instanceof Matrix).to.equal(true);
    });

    it('should return the same Matrix instance if one is provided', function() {
      var matrix = new Matrix(3, 3);
      var matrix2 = matrixUtils.getRotationMatrix(45, matrix);
      expect(matrix).to.equal(matrix2);
    });

    it('should set the correct matrix data for the rotation on a new matrix', function() {
      var matrix = matrixUtils.getRotationMatrix(45);
      expect(matrix.toArray()).to.eql([
        0.7071067811865476,
        -0.7071067811865475,
        0,
        0.7071067811865475,
        0.7071067811865476,
        0,
        0,
        0,
        1
      ]);
    });

    it('should set the correct matrix data for the rotation on an existing matrix', function() {
      var matrix = matrixUtils.getRotationMatrix(45, new Matrix(3, 3));
      expect(matrix.toArray()).to.eql([
        0.7071067811865476,
        -0.7071067811865475,
        0,
        0.7071067811865475,
        0.7071067811865476,
        0,
        0,
        0,
        1
      ]);
    });

  });

  describe('.getScalingMatrix()', function() {

    it('should return a new Matrix instance if one is not provided', function() {
      var matrix = matrixUtils.getScalingMatrix(2, 4);
      expect(matrix instanceof Matrix).to.equal(true);
    });

    it('should return the same Matrix instance if one is provided', function() {
      var matrix = new Matrix(3, 3);
      var matrix2 = matrixUtils.getScalingMatrix(2, 4, matrix);
      expect(matrix).to.equal(matrix2);
    });

    it('should set the correct matrix data for the scaling on a new matrix', function() {
      var matrix = matrixUtils.getScalingMatrix(2, 4);
      expect(matrix.toArray()).to.eql([2, 0, 0, 0, 4, 0, 0, 0, 1]);
    });

    it('should set the correct matrix data for the scaling on an existing matrix', function() {
      var matrix = matrixUtils.getScalingMatrix(2, 4, new Matrix(3, 3));
      expect(matrix.toArray()).to.eql([2, 0, 0, 0, 4, 0, 0, 0, 1]);
    });

  });

  describe('.getTransformationMatrix()', function() {

    it('should return a new Matrix instance if one is not provided', function() {
      var t = matrixUtils.getTranslationMatrix(15, 25);
      var r = matrixUtils.getRotationMatrix(45);
      var s = matrixUtils.getScalingMatrix(2, 4);
      var matrix = matrixUtils.getTransformationMatrix(t, r, s);
      expect(matrix instanceof Matrix).to.equal(true);
    });

    it('should return the same Matrix instance if one is provided', function() {
      var matrix = new Matrix(3, 3);
      var t = matrixUtils.getTranslationMatrix(15, 25);
      var r = matrixUtils.getRotationMatrix(45);
      var s = matrixUtils.getScalingMatrix(2, 4);
      var matrix2 = matrixUtils.getTransformationMatrix(t, r, s, matrix);
      expect(matrix).to.equal(matrix2);
    });

    it('should set the correct matrix data for the transformations on a new matrix', function() {
      var t = matrixUtils.getTranslationMatrix(15, 25);
      var r = matrixUtils.getRotationMatrix(45);
      var s = matrixUtils.getScalingMatrix(2, 4);
      var matrix = matrixUtils.getTransformationMatrix(t, r, s);
      expect(matrix.toArray()).to.eql([
        1.4142135623730951,
        -2.82842712474619,
        15,
        1.414213562373095,
        2.8284271247461903,
        25,
        0,
        0,
        1
      ]);
    });

    it('should set the correct matrix data for the transformations on an existing matrix', function() {
      var t = matrixUtils.getTranslationMatrix(15, 25);
      var r = matrixUtils.getRotationMatrix(45);
      var s = matrixUtils.getScalingMatrix(2, 4);
      var matrix = matrixUtils.getTransformationMatrix(t, r, s, new Matrix(3, 3));
      expect(matrix.toArray()).to.eql([
        1.4142135623730951,
        -2.82842712474619,
        15,
        1.414213562373095,
        2.8284271247461903,
        25,
        0,
        0,
        1
      ]);
    });

  });

  describe('.getIdentityMatrix()', function() {

    it('should return a new Matrix instance if one is not provided', function() {
      var matrix = matrixUtils.getIdentityMatrix();
      expect(matrix instanceof Matrix).to.equal(true);
    });

    it('should return the same Matrix instance if one is provided', function() {
      var matrix = new Matrix(3, 3, false);
      var matrix2 = matrixUtils.getIdentityMatrix(matrix);
      expect(matrix).to.equal(matrix2);
    });

    it('should set the identity matrix data on a new matrix', function() {
      var matrix = matrixUtils.getIdentityMatrix();
      expect(matrix.toArray()).to.eql([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    });

    it('should set the identity matrix data on an existing matrix', function() {
      var matrix = matrixUtils.getIdentityMatrix(new Matrix(3, 3, false));
      expect(matrix.toArray()).to.eql([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    });

  });

});
