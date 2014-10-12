var expect = require('expect.js');
var Texture = require('../../../textures/Texture');
var EventEmitter = require('../../../classes/EventEmitter');

describe('Texture', function() {

  it('should inherit from EventEmitter', function() {
    var object = new Texture();
    expect(Texture.prototype instanceof EventEmitter).to.equal(true);
    expect(object instanceof EventEmitter).to.equal(true);
  });

  describe('Texture constructor', function() {

    var texture = new Texture({name: 'Texture'});

    it('should set any properties passed in', function() {
      expect(texture.name).to.equal('Texture');
    });

    it('should set the default value of property `style` to transparent', function() {
      expect(texture.style).to.equal('transparent');
    });

    it('should override default value for `style`', function() {
      var texture = new Texture({style: 'blue'});
      expect(texture.style).to.equal('blue');
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var texture = new Texture();
      expect(texture.name).to.equal(undefined);
      texture.setProperties({name: 'Texture'});
      expect(texture.name).to.equal('Texture');
    });

  });

});
