var expect = require('expect.js');
var Texture = require('../../../textures/Texture');
var ColorTexture = require('../../../textures/ColorTexture');

describe('ColorTexture', function() {

  it('should inherit from Texture', function() {
    var object = new ColorTexture();
    expect(ColorTexture.prototype instanceof Texture).to.equal(true);
    expect(object instanceof Texture).to.equal(true);
  });

  describe('ColorTexture constructor', function() {

    var texture = new ColorTexture({name: 'ColorTexture'});

    it('should set any properties passed in', function() {
      expect(texture.name).to.equal('ColorTexture');
    });

    it('should set the default value of property `style` to transparent', function() {
      expect(texture.style).to.equal('transparent');
    });

    it('should set the default value of property `color` to transparent', function() {
      expect(texture.color).to.equal('transparent');
    });

    it('should override default value for `style`', function() {
      var texture = new ColorTexture({style: 'blue'});
      expect(texture.style).to.equal('blue');
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var texture = new ColorTexture();
      expect(texture.name).to.equal(undefined);
      texture.setProperties({name: 'ColorTexture'});
      expect(texture.name).to.equal('ColorTexture');
    });

  });

  describe('#color', function() {

    it('should allow setting it to a string', function() {
      var texture = new ColorTexture({color: 'red'});
      expect(texture.color).to.equal('red');
      texture.color = 'blue';
      expect(texture.color).to.equal('blue');
    });

    it('should not allow setting it to something else than a string', function() {
      var texture = new ColorTexture({color: 'red'});
      expect(texture.color).to.equal('red');
      texture.color = [];
      expect(texture.color).to.equal('red');
    });

  });

  describe('#style', function() {

    it('should get the value of `color`', function() {
      var texture = new ColorTexture({color: 'red'});
      expect(texture.color).to.equal('red');
      expect(texture.style).to.equal('red');
      texture.color = 'blue';
      expect(texture.color).to.equal('blue');
      expect(texture.style).to.equal('blue');
    });

    it('should allow setting it to a string', function() {
      var texture = new ColorTexture({style: 'red'});
      expect(texture.style).to.equal('red');
      texture.style = 'blue';
      expect(texture.style).to.equal('blue');
    });

    it('should set `color` when setting this', function() {
      var texture = new ColorTexture({style: 'red'});
      expect(texture.style).to.equal('red');
      expect(texture.color).to.equal('red');
      texture.style = 'blue';
      expect(texture.style).to.equal('blue');
      expect(texture.color).to.equal('blue');
    });

    it('should not allow setting it to something else than a string', function() {
      var texture = new ColorTexture({style: 'red'});
      expect(texture.style).to.equal('red');
      texture.style = [];
      expect(texture.style).to.equal('red');
    });

  });

});
