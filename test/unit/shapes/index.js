var expect = require('expect.js');
var shapes = require('../../../shapes');
var Rectangle = require('../../../shapes/Rectangle');

describe('shapes', function() {

  describe('.Rectangle', function() {

    it('should be the Rectangle class', function() {
      expect(shapes.Rectangle).to.equal(Rectangle);
      expect(shapes.Rectangle).to.be.a('function');
    });

  });

});
