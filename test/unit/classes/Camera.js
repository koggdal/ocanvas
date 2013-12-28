var expect = require('expect.js');
var Camera = require('../../../classes/Camera');
var Matrix = require('../../../classes/Matrix');

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

    it('should set the value of property `aspectRatio` correctly based on the options', function() {
      var camera1 = new Camera({width: 600});
      expect(camera1.aspectRatio).to.equal(4);
      var camera2 = new Camera({height: 100});
      expect(camera2.aspectRatio).to.equal(3);
      var camera3 = new Camera({width: 200, height: 100});
      expect(camera3.aspectRatio).to.equal(2);
      var camera4 = new Camera({aspectRatio: 6});
      expect(camera4.aspectRatio).to.equal(6);
      expect(camera4.width).to.equal(900);
      expect(camera4.height).to.equal(150);
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

  describe('#getTransformationMatrix()', function() {

    it('should return a matrix that does not contain translation', function() {
      var camera = new Camera({x: 10, y: 20});
      expect(camera.getTransformationMatrix().toArray()).to.eql([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    });

    it('should return a matrix that contains rotation', function() {
      var camera = new Camera({rotation: 10, x: 0, y: 0});
      expect(camera.getTransformationMatrix().toArray()).to.eql([
        0.984807753012208,
        -0.17364817766693033,
        0,
        0.17364817766693033,
        0.984807753012208,
        0,
        0,
        0,
        1
      ]);
    });

    it('should return a matrix that contains scaling', function() {
      var camera = new Camera({zoom: 0.5, x: 0, y: 0});
      expect(camera.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);
    });

    it('should return a matrix that combines rotation and scaling', function() {
      var camera = new Camera({
        x: 10, y: 20,
        rotation: 10,
        zoom: 0.5
      });

      expect(camera.getTransformationMatrix().toArray()).to.eql([
        0.492403876506104,
        -0.08682408883346517,
        6.812443011608264,
        0.08682408883346517,
        0.492403876506104,
        9.283681581543268,
        0,
        0,
        1
      ]);

    });

    it('should return a cached matrix if nothing has changed', function(done) {
      var camera = new Camera({zoom: 0.5, x: 0, y: 0});
      var matrix = camera.getTransformationMatrix();
      var setData = matrix.setData;
      var setDataCalled = false;
      matrix.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };
      expect(matrix.toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      expect(camera.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);
    });

    it('should return an updated matrix when position has changed', function() {
      var camera = new Camera({zoom: 0.5, x: 0, y: 0});

      expect(camera.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      camera.x = 20;

      expect(camera.getTransformationMatrix().toArray()).to.eql([0.5, 0, 10, 0, 0.5, 0, 0, 0, 1]);

      camera.y = 30;

      expect(camera.getTransformationMatrix().toArray()).to.eql([0.5, 0, 10, 0, 0.5, 15, 0, 0, 1]);
    });

    it('should return an updated matrix when rotation has changed', function() {
      var camera = new Camera({rotation: 0, x: 0, y: 0});

      expect(camera.getTransformationMatrix().toArray()).to.eql([1, 0, 0, 0, 1, 0, 0, 0, 1]);

      camera.rotation = 10;

      expect(camera.getTransformationMatrix().toArray()).to.eql([
        0.984807753012208,
        -0.17364817766693033,
        0,
        0.17364817766693033,
        0.984807753012208,
        0,
        0,
        0,
        1
      ]);
    });

    it('should return an updated matrix when scaling has changed', function() {
      var camera = new Camera({zoom: 2, x: 0, y: 0});

      expect(camera.getTransformationMatrix().toArray()).to.eql([2, 0, 0, 0, 2, 0, 0, 0, 1]);

      camera.zoom = 0.5;

      expect(camera.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);
    });

  });

  describe('#matrixCache', function() {

    it('should have four objects for matrices (combined, translation, rotation, scaling)', function() {
      var camera = new Camera();

      expect(camera.matrixCache.combined).to.eql({valid: false, matrix: null});
      expect(camera.matrixCache.translation).to.eql({valid: false, matrix: null, matrixReverse: null});
      expect(camera.matrixCache.rotation).to.eql({valid: false, matrix: null});
      expect(camera.matrixCache.scaling).to.eql({valid: false, matrix: null});
    });

    it('should store Matrix instances after first calculation', function() {
      var camera = new Camera();
      camera.getTransformationMatrix();

      var cache = camera.matrixCache;

      expect(cache.combined.matrix instanceof Matrix).to.eql(true);
      expect(cache.translation.matrix instanceof Matrix).to.eql(true);
      expect(cache.translation.matrixReverse instanceof Matrix).to.eql(true);
      expect(cache.rotation.matrix instanceof Matrix).to.eql(true);
      expect(cache.scaling.matrix instanceof Matrix).to.eql(true);
    });

    it('should have an invalidate method to invalidate all matrices', function() {
      var camera = new Camera();
      camera.getTransformationMatrix();

      var cache = camera.matrixCache;

      expect(cache.combined.valid).to.eql(true);
      expect(cache.translation.valid).to.eql(true);
      expect(cache.rotation.valid).to.eql(true);
      expect(cache.scaling.valid).to.eql(true);

      cache.invalidate();

      expect(cache.combined.valid).to.eql(false);
      expect(cache.translation.valid).to.eql(false);
      expect(cache.rotation.valid).to.eql(false);
      expect(cache.scaling.valid).to.eql(false);
    });

    it('should have an invalidate method to invalidate one type of matrix (plus the combined)', function() {
      var camera = new Camera();
      camera.getTransformationMatrix();

      var cache = camera.matrixCache;

      expect(cache.combined.valid).to.eql(true);
      expect(cache.translation.valid).to.eql(true);
      expect(cache.rotation.valid).to.eql(true);
      expect(cache.scaling.valid).to.eql(true);

      cache.invalidate('translation');

      expect(cache.combined.valid).to.eql(false);
      expect(cache.translation.valid).to.eql(false);
      expect(cache.rotation.valid).to.eql(true);
      expect(cache.scaling.valid).to.eql(true);
    });

  });

});
