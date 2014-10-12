var expect = require('expect.js');
var textures = require('../../../textures');
var Texture = require('../../../textures/Texture');
var ColorTexture = require('../../../textures/ColorTexture');

describe('textures', function() {

  describe('.Texture', function() {

    it('should be the Texture class', function() {
      expect(textures.Texture).to.equal(Texture);
      expect(textures.Texture).to.be.a('function');
    });

  });

  describe('.ColorTexture', function() {

    it('should be the ColorTexture class', function() {
      expect(textures.ColorTexture).to.equal(ColorTexture);
      expect(textures.ColorTexture).to.be.a('function');
    });

  });

});
