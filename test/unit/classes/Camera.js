var expect = require('expect.js');
var Camera = require('../../../classes/Camera');

describe('Camera', function() {

  describe('Camera constructor', function() {

    var camera = new Camera({name: 'Camera'});

    it('should return a cached instance if there is one with the same ID', function() {
      var camera2 = new Camera({id: camera.id});
      expect(camera).to.equal(camera2);
    });

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

  describe('.cache', function() {

    it('should keep a cache of all camera instances', function() {
      expect(Camera.cache).to.be.ok();
      var camera = new Camera();
      expect(Camera.cache[camera.id]).to.equal(camera);
    });

  });

  describe('.objectProperties', function() {

    it('should be an array of property names', function() {
      expect(Array.isArray(Camera.objectProperties)).to.equal(true);
      expect(typeof Camera.objectProperties[0]).to.equal('string');
    });

  });

  describe('.generateID()', function() {

    it('should generate a new ID each time', function() {
      expect(Camera.generateID()).to.not.equal(Camera.generateID());
    });

  });

  describe('.fromObject()', function() {

    var cameraData = {
      id: '1ab',
      x: 200,
      y: 10,
      width: 300,
      height: 100,
      aspectRatio: 3,
      zoom: 1.5,
      rotation: 90
    };

    it('should create a Camera instance from a data object', function() {
      var camera = Camera.fromObject(cameraData);
      expect(camera instanceof Camera).to.equal(true);
      expect(camera.id).to.equal(cameraData.id);
      expect(camera.x).to.equal(cameraData.x);
      expect(camera.y).to.equal(cameraData.y);
      expect(camera.width).to.equal(cameraData.width);
      expect(camera.height).to.equal(cameraData.height);
      expect(camera.aspectRatio).to.equal(cameraData.aspectRatio);
      expect(camera.zoom).to.equal(cameraData.zoom);
      expect(camera.rotation).to.equal(cameraData.rotation);
    });

    it('should get the camera instance from the cache if one with the same ID exists', function() {
      var cameraData1 = Object.create(cameraData);
      cameraData1.id = '2ab';
      var camera1 = Camera.fromObject(cameraData1);
      var camera2 = Camera.fromObject(cameraData1);
      expect(camera1).to.equal(camera2);
    });

  });

  describe('.fromJSON()', function() {

    var cameraData = {
      id: '3ab',
      x: 200,
      y: 10,
      width: 300,
      height: 100,
      aspectRatio: 3,
      zoom: 1.5,
      rotation: 90
    };
    var cameraDataJSON = JSON.stringify(cameraData);

    it('should create a Camera instance from a JSON string', function() {
      var camera = Camera.fromJSON(cameraDataJSON);
      expect(camera instanceof Camera).to.equal(true);
      expect(camera.id).to.equal(cameraData.id);
      expect(camera.x).to.equal(cameraData.x);
      expect(camera.y).to.equal(cameraData.y);
      expect(camera.width).to.equal(cameraData.width);
      expect(camera.height).to.equal(cameraData.height);
      expect(camera.aspectRatio).to.equal(cameraData.aspectRatio);
      expect(camera.zoom).to.equal(cameraData.zoom);
      expect(camera.rotation).to.equal(cameraData.rotation);
    });

    it('should get the camera instance from the cache if one with the same ID exists', function() {
      var cameraData1 = Object.create(cameraData);
      cameraData1.id = '4ab';
      var cameraDataJSON1 = JSON.stringify(cameraData1);
      var camera1 = Camera.fromJSON(cameraDataJSON1);
      var camera2 = Camera.fromJSON(cameraDataJSON1);
      expect(camera1).to.equal(camera2);
    });

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var camera = new Camera({
        x: 200,
        y: 10,
        width: 300,
        height: 100,
        aspectRatio: 3,
        zoom: 1.5,
        rotation: 90
      });

      var cameraData = camera.toObject();

      var props = Camera.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        expect(cameraData[props[i]]).to.equal(camera[props[i]]);
      }

      expect(cameraData.__class__).to.equal('Camera');
    });

  });

  describe('#toJSON()', function() {

    it('should create a JSON string from all specified properties', function() {
      var camera = new Camera({
        x: 200,
        y: 10,
        width: 300,
        height: 100,
        aspectRatio: 3,
        zoom: 1.5,
        rotation: 90
      });

      var cameraDataJSON = camera.toJSON();
      var cameraData = JSON.parse(cameraDataJSON);

      var props = Camera.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        expect(cameraData[props[i]]).to.equal(camera[props[i]]);
      }

      expect(cameraData.__class__).to.equal('Camera');
    });

  });

  describe('#setProperties()', function() {

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
