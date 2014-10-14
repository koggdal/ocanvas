var expect = require('expect.js');
var Texture = require('../../../textures/Texture');
var ImageTexture = require('../../../textures/ImageTexture');

describe('ImageTexture', function() {

  it('should inherit from Texture', function() {
    var object = new ImageTexture();
    expect(ImageTexture.prototype instanceof Texture).to.equal(true);
    expect(object instanceof Texture).to.equal(true);
  });

  describe('ImageTexture constructor', function() {

    var texture = new ImageTexture({name: 'ImageTexture'});

    it('should set any properties passed in', function() {
      expect(texture.name).to.equal('ImageTexture');
    });

    it('should set the default value of property `style` to transparent', function() {
      expect(texture.style).to.equal('transparent');
    });

    it('should set the default value of property `loaded` to false', function() {
      expect(texture.loaded).to.equal(false);
    });

    it('should set the default value of property `width` to 0', function() {
      expect(texture.width).to.equal(0);
    });

    it('should set the default value of property `height` to 0', function() {
      expect(texture.height).to.equal(0);
    });

    it('should set the default value of property `imageElement` to null', function() {
      expect(texture.imageElement).to.equal(null);
    });

    it('should set the default value of property `repeat` to `both`', function() {
      expect(texture.repeat).to.equal('both');
    });

    it('should set the default value of property `size` to `source`', function() {
      expect(texture.size).to.equal('source');
    });

    it('should set the default value of property `image` to null', function() {
      expect(texture.image).to.equal(null);
    });

    it('should override default value for `repeat`', function() {
      var texture = new ImageTexture({repeat: 'x'});
      expect(texture.repeat).to.equal('x');
    });

    it('should override default value for `size`', function() {
      var texture = new ImageTexture({size: 'cover'});
      expect(texture.size).to.equal('cover');
    });

    it('should not allow setting of `loaded`', function() {
      var texture = new ImageTexture();
      expect(texture.loaded).to.equal(false);
      texture.loaded = true;
      expect(texture.loaded).to.equal(false);
    });

    it('should not allow setting of `width`', function() {
      var texture = new ImageTexture();
      expect(texture.width).to.equal(0);
      texture.width = 100;
      expect(texture.width).to.equal(0);
    });

    it('should not allow setting of `height`', function() {
      var texture = new ImageTexture();
      expect(texture.height).to.equal(0);
      texture.height = 100;
      expect(texture.height).to.equal(0);
    });

  });

  describe('#className', function() {

    it('should set the className property', function() {
      expect(ImageTexture.className).to.equal('ImageTexture');
    });

  });

});
