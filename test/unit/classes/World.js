var expect = require('expect.js');
var World = require('../../../classes/World');
var Collection = require('../../../classes/Collection');
var Camera = require('../../../classes/Camera');
var CanvasObject = require('../../../shapes/base/CanvasObject');
var jsonHelpers = require('../../../utils/json');

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

    it('should not allow setting the cameras property to something that is not a collection', function() {
      var world = new World();
      expect(world.cameras instanceof Collection).to.equal(true);
      world.cameras = 'foo';
      expect(world.cameras instanceof Collection).to.equal(true);
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

  describe('.objectProperties', function() {

    it('should be an array of property names', function() {
      expect(Array.isArray(World.objectProperties)).to.equal(true);
      expect(typeof World.objectProperties[0]).to.equal('string');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'World': World,
      'Collection': Collection,
      'Camera': Camera,
      'CanvasObject': CanvasObject
    });

    var data = {
      __class__: 'World',
      cameras: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'Camera',
            x: 35
          }
        ]
      },
      objects: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'CanvasObject',
            x: 73
          }
        ]
      }
    };

    it('should create a World instance from a data object', function() {
      var world = World.fromObject(data);

      expect(world instanceof World).to.equal(true);
      expect(world.cameras instanceof Collection).to.equal(true);
      expect(world.objects instanceof Collection).to.equal(true);
      expect(world.cameras.get(0) instanceof Camera).to.equal(true);
      expect(world.objects.get(0) instanceof CanvasObject).to.equal(true);
      expect(world.cameras.get(0).x).to.equal(35);
      expect(world.objects.get(0).x).to.equal(73);
      expect(world.cameras.get(0).world).to.equal(world);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'World': World,
      'Collection': Collection,
      'Camera': Camera,
      'CanvasObject': CanvasObject
    });

    var data = {
      __class__: 'World',
      cameras: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'Camera',
            x: 35
          }
        ]
      },
      objects: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'CanvasObject',
            x: 73
          }
        ]
      }
    };
    var json = JSON.stringify(data);

    it('should create a World instance from a data object', function() {
      var world = World.fromJSON(json);

      expect(world instanceof World).to.equal(true);
      expect(world.cameras instanceof Collection).to.equal(true);
      expect(world.objects instanceof Collection).to.equal(true);
      expect(world.cameras.get(0) instanceof Camera).to.equal(true);
      expect(world.objects.get(0) instanceof CanvasObject).to.equal(true);
      expect(world.cameras.get(0).x).to.equal(35);
      expect(world.objects.get(0).x).to.equal(73);
      expect(world.cameras.get(0).world).to.equal(world);
    });

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var world = new World();
      var camera = new Camera();
      var canvasObject = new CanvasObject();

      world.cameras.add(camera);
      world.objects.add(canvasObject);

      var data = world.toObject();

      var props = World.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(world[props[i]]);
      }

      expect(data.__class__).to.equal('World');

      expect(typeof data.cameras).to.equal('object');
      expect(typeof data.objects).to.equal('object');

      expect(data.cameras.__class__).to.equal('Collection');
      expect(data.objects.__class__).to.equal('Collection');

      expect(Array.isArray(data.cameras.items)).to.equal(true);
      expect(Array.isArray(data.objects.items)).to.equal(true);

      expect(typeof data.cameras.items[0]).to.equal('object');
      expect(typeof data.objects.items[0]).to.equal('object');

      expect(data.cameras.items[0].__class__).to.equal('Camera');
      expect(data.objects.items[0].__class__).to.equal('CanvasObject');
    });

  });

  describe('#toJSON()', function() {

    it('should create a JSON string from all specified properties', function() {
      var world = new World();
      var camera = new Camera();
      var canvasObject = new CanvasObject();

      world.cameras.add(camera);
      world.objects.add(canvasObject);

      var json = world.toJSON();
      var data = JSON.parse(json);

      var props = World.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(world[props[i]]);
      }

      expect(data.__class__).to.equal('World');

      expect(typeof data.cameras).to.equal('object');
      expect(typeof data.objects).to.equal('object');

      expect(data.cameras.__class__).to.equal('Collection');
      expect(data.objects.__class__).to.equal('Collection');

      expect(Array.isArray(data.cameras.items)).to.equal(true);
      expect(Array.isArray(data.objects.items)).to.equal(true);

      expect(typeof data.cameras.items[0]).to.equal('object');
      expect(typeof data.objects.items[0]).to.equal('object');

      expect(data.cameras.items[0].__class__).to.equal('Camera');
      expect(data.objects.items[0].__class__).to.equal('CanvasObject');
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
