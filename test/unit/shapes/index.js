var expect = require('expect.js');
var shapes = require('../../../shapes');
var Rectangle = require('../../../shapes/Rectangle');
var Ellipse = require('../../../shapes/Ellipse');

describe('shapes', function() {

  describe('.Rectangle', function() {

    it('should be the Rectangle class', function() {
      expect(shapes.Rectangle).to.equal(Rectangle);
      expect(shapes.Rectangle).to.be.a('function');
    });

  });

  describe('.Ellipse', function() {

    it('should be the Ellipse class', function() {
      expect(shapes.Ellipse).to.equal(Ellipse);
      expect(shapes.Ellipse).to.be.a('function');
    });

  });

});
