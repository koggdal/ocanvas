var expect = require('expect.js');
var Scene = require('../../../classes/Scene');
var ObjectEventEmitter = require('../../../classes/ObjectEventEmitter');
var Collection = require('../../../classes/Collection');
var Camera = require('../../../classes/Camera');
var CanvasObject = require('../../../shapes/base/CanvasObject');
var jsonHelpers = require('../../../utils/json');

describe('Scene', function() {

  it('should inherit from ObjectEventEmitter', function() {
    var scene = new Scene();
    expect(Scene.prototype instanceof ObjectEventEmitter).to.equal(true);
    expect(scene instanceof ObjectEventEmitter).to.equal(true);
  });

  describe('Scene constructor', function() {

    it('should set any properties passed in', function() {
      var scene = new Scene({
        name: 'Scene'
      });
      expect(scene.name).to.equal('Scene');
    });

    it('should set up a collection of cameras', function() {
      var scene = new Scene();
      expect(scene.cameras instanceof Collection).to.equal(true);
    });

    it('should not allow setting the `cameras` property to something that is not a collection', function() {
      var scene = new Scene();
      expect(scene.cameras instanceof Collection).to.equal(true);
      scene.cameras = 'foo';
      expect(scene.cameras instanceof Collection).to.equal(true);
    });

    it('should set up an insert event listener for the `cameras` collection (to set the `scene` property)', function() {
      var scene = new Scene();
      var dummyCamera = {};
      scene.cameras.add(dummyCamera);
      expect(dummyCamera.scene).to.equal(scene);
    });

    it('should set up a remove event listener for the `cameras` collection (to unset the `scene` property)', function() {
      var scene = new Scene();
      var dummyCamera = {};
      scene.cameras.add(dummyCamera);
      scene.cameras.remove(dummyCamera);
      expect(dummyCamera.scene).to.equal(null);
    });

    it('should set up a collection of objects', function() {
      var scene = new Scene();
      expect(scene.objects instanceof Collection).to.equal(true);
    });

    it('should not allow setting the `objects` property to something that is not a collection', function() {
      var scene = new Scene();
      expect(scene.objects instanceof Collection).to.equal(true);
      scene.objects = 'foo';
      expect(scene.objects instanceof Collection).to.equal(true);
    });

    it('should set up an insert event listener for the `objects` collection (to set the `parent` property)', function() {
      var scene = new Scene();
      var dummyObject = {};
      scene.objects.add(dummyObject);
      expect(dummyObject.parent).to.equal(scene);
    });

    it('should set up a remove event listener for the `objects` collection (to unset the `parent` property)', function() {
      var scene = new Scene();
      var dummyObject = {};
      scene.objects.add(dummyObject);
      scene.objects.remove(dummyObject);
      expect(dummyObject.parent).to.equal(null);
    });

  });

  describe('.objectProperties', function() {

    it('should be an array of property names', function() {
      expect(Array.isArray(Scene.objectProperties)).to.equal(true);
      expect(typeof Scene.objectProperties[0]).to.equal('string');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'Scene': Scene,
      'Collection': Collection,
      'Camera': Camera,
      'CanvasObject': CanvasObject
    });

    var data = {
      __class__: 'Scene',
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

    it('should create a Scene instance from a data object', function() {
      var scene = Scene.fromObject(data);

      expect(scene instanceof Scene).to.equal(true);
      expect(scene.cameras instanceof Collection).to.equal(true);
      expect(scene.objects instanceof Collection).to.equal(true);
      expect(scene.cameras.get(0) instanceof Camera).to.equal(true);
      expect(scene.objects.get(0) instanceof CanvasObject).to.equal(true);
      expect(scene.cameras.get(0).x).to.equal(35);
      expect(scene.objects.get(0).x).to.equal(73);
      expect(scene.cameras.get(0).scene).to.equal(scene);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'Scene': Scene,
      'Collection': Collection,
      'Camera': Camera,
      'CanvasObject': CanvasObject
    });

    var data = {
      __class__: 'Scene',
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

    it('should create a Scene instance from a data object', function() {
      var scene = Scene.fromJSON(json);

      expect(scene instanceof Scene).to.equal(true);
      expect(scene.cameras instanceof Collection).to.equal(true);
      expect(scene.objects instanceof Collection).to.equal(true);
      expect(scene.cameras.get(0) instanceof Camera).to.equal(true);
      expect(scene.objects.get(0) instanceof CanvasObject).to.equal(true);
      expect(scene.cameras.get(0).x).to.equal(35);
      expect(scene.objects.get(0).x).to.equal(73);
      expect(scene.cameras.get(0).scene).to.equal(scene);
    });

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var scene = new Scene();
      var camera = new Camera();
      var canvasObject = new CanvasObject();

      scene.cameras.add(camera);
      scene.objects.add(canvasObject);

      var data = scene.toObject();

      var props = Scene.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(scene[props[i]]);
      }

      expect(data.__class__).to.equal('Scene');

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
      var scene = new Scene();
      var camera = new Camera();
      var canvasObject = new CanvasObject();

      scene.cameras.add(camera);
      scene.objects.add(canvasObject);

      var json = scene.toJSON();
      var data = JSON.parse(json);

      var props = Scene.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(scene[props[i]]);
      }

      expect(data.__class__).to.equal('Scene');

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
      var scene = new Scene();
      expect(scene.name).to.equal(undefined);
      scene.setProperties({
        name: 'Scene'
      });
      expect(scene.name).to.equal('Scene');
    });

  });

});
