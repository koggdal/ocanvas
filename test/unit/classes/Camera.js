var expect = require('expect.js');
var Camera = require('../../../classes/Camera');

describe('Camera', function() {

  describe('Camera constructor', function() {

    var camera = new Camera({name: 'Camera'});

    it('should set any properties passed in', function() {
      expect(camera.name).to.equal('Camera');
    });

    it('should set the default value of property `world` to null', function() {
      expect(camera.world).to.equal(null);
    });

    it('should set the default value of property `x` to 150', function() {
      expect(camera.x).to.equal(150);
    });

    it('should set the default value of property `y` to 75', function() {
      expect(camera.y).to.equal(75);
    });

    it('should set the default value of property `rotation` to 0', function() {
      expect(camera.rotation).to.equal(0);
    });

    it('should set the default value of property `zoom` to 1', function() {
      expect(camera.zoom).to.equal(1);
    });

    it('should set the default value of property `width` to 300', function() {
      expect(camera.width).to.equal(300);
    });

    it('should set the default value of property `height` to 150', function() {
      expect(camera.height).to.equal(150);
    });

    it('should set the default value of property `aspectRatio` to 2', function() {
      expect(camera.aspectRatio).to.equal(2);
    });

  });

  describe('#setProperties', function() {

    it('should set any properties passed in', function() {
      var camera = new Camera();
      expect(camera.name).to.equal(undefined);
      camera.setProperties({
        name: 'Camera'
      });
      expect(camera.name).to.equal('Camera');
    });

  });

});
