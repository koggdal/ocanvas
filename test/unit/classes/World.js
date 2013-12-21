var expect = require('expect.js');
var World = require('../../../classes/World');
var Collection = require('../../../classes/Collection');

describe('World', function() {

  describe('World constructor', function() {

    it('should set any properties passed in', function() {
      var world = new World({
        name: 'World'
      });
      expect(world.name).to.equal('World');
    });

    it('should set up a collection of cameras', function() {
      var world = new World();
      expect(world.cameras instanceof Collection).to.equal(true);
    });

    it('should set up a collection of objects', function() {
      var world = new World();
      expect(world.objects instanceof Collection).to.equal(true);
    });

    it('should set up an insert event listener for the cameras collection (to set the world property)', function() {
      var world = new World();
      var dummyCamera = {};
      world.cameras.add(dummyCamera);
      expect(dummyCamera.world).to.equal(world);
    });

    it('should set up a remove event listener for the cameras collection (to unset the world property)', function() {
      var world = new World();
      var dummyCamera = {};
      world.cameras.add(dummyCamera);
      world.cameras.remove(dummyCamera);
      expect(dummyCamera.world).to.equal(null);
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var world = new World();
      expect(world.name).to.equal(undefined);
      world.setProperties({
        name: 'World'
      });
      expect(world.name).to.equal('World');
    });

  });

});
