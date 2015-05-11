var expect = require('expect.js');
var Texture = require('../../../textures/Texture');
var ImageTexture = require('../../../textures/ImageTexture');
var EventEmitter = require('../../../mixins/EventEmitter');

describe('ImageTexture', function() {

  it('should inherit from Texture', function() {
    var object = new ImageTexture();
    expect(ImageTexture.prototype instanceof Texture).to.equal(true);
    expect(object instanceof Texture).to.equal(true);
  });

  it('should mix in EventEmitter', function() {
    var texture = new ImageTexture();
    expect(texture.emit).to.equal(EventEmitter.emit);
    expect(texture.on).to.equal(EventEmitter.on);
    expect(texture.off).to.equal(EventEmitter.off);
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

    it('should set the default value of property `sourceWidth` to 0', function() {
      expect(texture.sourceWidth).to.equal(0);
    });

    it('should set the default value of property `sourceHeight` to 0', function() {
      expect(texture.sourceHeight).to.equal(0);
    });

    it('should set the default value of property `sourceX` to 0', function() {
      expect(texture.sourceX).to.equal(0);
    });

    it('should set the default value of property `sourceY` to 0', function() {
      expect(texture.sourceY).to.equal(0);
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

    it('should not allow setting of `sourceWidth`', function() {
      var texture = new ImageTexture();
      expect(texture.sourceWidth).to.equal(0);
      texture.sourceWidth = 100;
      expect(texture.sourceWidth).to.equal(0);
    });

    it('should not allow setting of `sourceHeight`', function() {
      var texture = new ImageTexture();
      expect(texture.sourceHeight).to.equal(0);
      texture.sourceHeight = 100;
      expect(texture.sourceHeight).to.equal(0);
    });

  });

  describe('#className', function() {

    it('should set the className property', function() {
      expect(ImageTexture.className).to.equal('ImageTexture');
    });

  });

});
