var expect = require('expect.js');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var Scene = require('../../../classes/Scene');
var CanvasObject = require('../../../shapes/base/CanvasObject');
var Matrix = require('../../../classes/Matrix');
var Cache = require('../../../classes/Cache');

var round = require('../../utils/round');

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

    it('should set the default value of property `scene` to null', function() {
      expect(camera.scene).to.equal(null);
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

    it('should set the default value of property `cache` to a Cache instance', function() {
      expect(camera.cache instanceof Cache).to.equal(true);
    });

    it('should set the value of property `width` to 0 if passed', function() {
      var camera1 = new Camera({width: 0});
      expect(camera1.width).to.equal(0);
    });

    it('should set the value of property `height` to 0 if passed', function() {
      var camera1 = new Camera({height: 0});
      expect(camera1.height).to.equal(0);
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

    it('should return a matrix that contains translation', function() {
      var camera = new Camera({x: 10, y: 20});
      expect(camera.getTransformationMatrix().toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);
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
      expect(camera.getTransformationMatrix().toArray()).to.eql([2, 0, 0, 0, 2, 0, 0, 0, 1]);
    });

    it('should return a matrix that combines translation, rotation and scaling', function() {
      var camera = new Camera({
        x: 10, y: 20,
        rotation: 10,
        zoom: 0.5
      });

      expect(camera.getTransformationMatrix().toArray()).to.eql([
        1.969615506024416,
        -0.34729635533386066,
        10,
        0.34729635533386066,
        1.969615506024416,
        20,
        0,
        0,
        1
      ]);

    });

    it('should return a matrix that contains rotation with changed sign if a canvas is provided', function() {
      var camera = new Camera({rotation: 10, x: 0, y: 0});
      var canvas = new Canvas({camera: camera});
      expect(camera.getTransformationMatrix(canvas).toArray()).to.eql([
        0.984807753012208,
        0.17364817766693033,
        0,
        -0.17364817766693033,
        0.984807753012208,
        0,
        0,
        0,
        1
      ]);
    });

    it('should return a matrix that contains inverted scaling (exact zoom value) if canvas is provided', function() {
      var camera = new Camera({zoom: 0.5, x: 0, y: 0});
      var canvas = new Canvas({camera: camera});
      expect(camera.getTransformationMatrix(canvas).toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);
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
      expect(matrix.toArray()).to.eql([2, 0, 0, 0, 2, 0, 0, 0, 1]);

      expect(camera.getTransformationMatrix().toArray()).to.eql([2, 0, 0, 0, 2, 0, 0, 0, 1]);

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);
    });

    it('should return an updated matrix when position has changed', function() {
      var camera = new Camera({zoom: 0.5, x: 0, y: 0});

      expect(camera.getTransformationMatrix().toArray()).to.eql([2, 0, 0, 0, 2, 0, 0, 0, 1]);

      camera.x = 20;

      expect(camera.getTransformationMatrix().toArray()).to.eql([2, 0, 20, 0, 2, 0, 0, 0, 1]);

      camera.y = 30;

      expect(camera.getTransformationMatrix().toArray()).to.eql([2, 0, 20, 0, 2, 30, 0, 0, 1]);
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

      expect(camera.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      camera.zoom = 0.5;

      expect(camera.getTransformationMatrix().toArray()).to.eql([2, 0, 0, 0, 2, 0, 0, 0, 1]);
    });

    it('should create a cached matrix for inverted transformations', function() {
      var camera = new Camera({zoom: 2, x: 100, y: 200, rotation: 45});

      camera.getTransformationMatrix();

      var transformations = camera.cache.get('transformations');
      var normalInverted = transformations.matrix.clone().invert().toArray();
      var inverted = transformations.matrixInverted.toArray();

      expect(inverted).to.eql(normalInverted);

      expect(inverted).to.eql([
        1.4142135623730951,
        1.414213562373095,
        -424.2640687119285,
        -1.414213562373095,
        1.4142135623730951,
        -141.42135623730954,
        0,
        0,
        1
      ]);
    });

  });

  describe('#getPointIn()', function() {

    it('should return a point in the reference (scene)', function() {
      var scene = new Scene();
      var camera = new Camera({x: 150, y: 75});
      scene.cameras.add(camera);

      var point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 160, y: 85});
    });

    it('should return a point in the reference (canvas)', function() {
      var scene = new Scene();
      var camera = new Camera({x: 500, y: 75});
      var canvas = new Canvas({camera: camera});
      scene.cameras.add(camera);

      var point = camera.getPointIn(canvas, 10, 10);
      expect(point).to.eql({x: 160, y: 85});
    });

    it('should return a cached point if nothing has changed', function(done) {
      var scene = new Scene();
      var camera = new Camera({x: 150, y: 75});
      scene.cameras.add(camera);

      var point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 160, y: 85});

      var pointInReferenceMatrix = camera.cache.get('getPointIn-output').matrix;
      var setData = pointInReferenceMatrix.setData;
      var setDataCalled = false;
      pointInReferenceMatrix.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };

      point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 160, y: 85});

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);

    });

    it('should return an updated point if position has changed', function() {
      var scene = new Scene();
      var camera = new Camera({x: 150, y: 75});
      scene.cameras.add(camera);

      var point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 160, y: 85});

      camera.x = 300;

      point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 310, y: 85});

      camera.y = 200;

      point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 310, y: 210});
    });

    it('should return an updated point if rotation has changed', function() {
      var scene = new Scene();
      var camera = new Camera({x: 150, y: 75});
      scene.cameras.add(camera);

      var point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 160, y: 85});

      camera.rotation = 45;

      point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 150, y: 89.14213562373095});
    });

    it('should return an updated point if zoom has changed', function() {
      var scene = new Scene();
      var camera = new Camera({x: 150, y: 75});
      scene.cameras.add(camera);

      var point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 160, y: 85});

      camera.zoom = 2;

      point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 155, y: 80});
    });

    it('should return an updated point if a different local point was passed in', function() {
      var scene = new Scene();
      var camera = new Camera({x: 150, y: 75});
      scene.cameras.add(camera);

      var point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 160, y: 85});

      point = camera.getPointIn(scene, 20, 20);
      expect(point).to.eql({x: 170, y: 95});
    });

    it('should return an updated point when a different reference is passed', function() {
      var scene = new Scene();
      var camera = new Camera({x: 400, y: 75});
      var canvas = new Canvas({camera: camera, width: 600, height: 300});
      scene.cameras.add(camera);

      var point = camera.getPointIn(scene, 10, 10);
      expect(point).to.eql({x: 410, y: 85});

      point = camera.getPointIn(canvas, 10, 10);
      expect(point).to.eql({x: 320, y: 170});
    });

    it('should return the passed in point object with correct data', function() {
      var scene = new Scene();
      var camera = new Camera({x: 150, y: 75});
      scene.cameras.add(camera);

      var point = {x: 0, y: 0};
      var returnedPoint = camera.getPointIn(scene, 10, 10, point);

      expect(returnedPoint).to.equal(point);
      expect(returnedPoint).to.eql({x: 160, y: 85});
    });

  });

  describe('#getVertices()', function() {

    it('should return the coordinates of all vertices of the camera', function() {
      var camera = new Camera({width: 100, height: 50});
      var vertices = camera.getVertices();

      expect(vertices[0]).to.eql({x: -50, y: -25});
      expect(vertices[1]).to.eql({x: 50, y: -25});
      expect(vertices[2]).to.eql({x: 50, y: 25});
      expect(vertices[3]).to.eql({x: -50, y: 25});
    });

    it('should respect the `zoom` mode', function() {
      var camera = new Camera({width: 100, height: 50, zoom: 2});
      var vertices = camera.getVertices(null, 'zoom');

      expect(vertices[0]).to.eql({x: -25, y: -12.5});
      expect(vertices[1]).to.eql({x: 25, y: -12.5});
      expect(vertices[2]).to.eql({x: 25, y: 12.5});
      expect(vertices[3]).to.eql({x: -25, y: 12.5});
    });

    it('should respect the `size` mode', function() {
      var camera = new Camera({width: 100, height: 50, zoom: 2});
      var vertices = camera.getVertices(null, 'size');

      expect(vertices[0]).to.eql({x: -50, y: -25});
      expect(vertices[1]).to.eql({x: 50, y: -25});
      expect(vertices[2]).to.eql({x: 50, y: 25});
      expect(vertices[3]).to.eql({x: -50, y: 25});
    });

    it('should return a cached array if nothing has changed', function(done) {
      var camera = new Camera({
        width: 100,
        height: 50
      });
      var vertices = camera.getVertices();

      expect(vertices[0]).to.eql({x: -50, y: -25});

      var hasBeenSet = false;
      var x = vertices[0].x;
      Object.defineProperty(vertices[0], 'x', {
        get: function() { return x; },
        set: function(value) {
          x = value;
          hasBeenSet = true;
        }
      });

      camera.getVertices();

      setTimeout(function() {
        if (hasBeenSet) done(new Error('The vertex was updated and did not use the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array if width has changed', function() {
      var camera = new Camera({
        width: 100,
        height: 50
      });
      var vertices = camera.getVertices();

      expect(vertices[0]).to.eql({x: -50, y: -25});
      expect(vertices[1]).to.eql({x: 50, y: -25});
      expect(vertices[2]).to.eql({x: 50, y: 25});
      expect(vertices[3]).to.eql({x: -50, y: 25});

      camera.width = 200;
      vertices = camera.getVertices();

      expect(vertices[0]).to.eql({x: -100, y: -25});
      expect(vertices[1]).to.eql({x: 100, y: -25});
      expect(vertices[2]).to.eql({x: 100, y: 25});
      expect(vertices[3]).to.eql({x: -100, y: 25});
    });

    it('should return an updated array if height has changed', function() {
      var camera = new Camera({
        width: 100,
        height: 50
      });
      var vertices = camera.getVertices();

      expect(vertices[0]).to.eql({x: -50, y: -25});
      expect(vertices[1]).to.eql({x: 50, y: -25});
      expect(vertices[2]).to.eql({x: 50, y: 25});
      expect(vertices[3]).to.eql({x: -50, y: 25});

      camera.height = 100;
      vertices = camera.getVertices();

      expect(vertices[0]).to.eql({x: -50, y: -50});
      expect(vertices[1]).to.eql({x: 50, y: -50});
      expect(vertices[2]).to.eql({x: 50, y: 50});
      expect(vertices[3]).to.eql({x: -50, y: 50});
    });

    it('should return the coordinates of all vertices relative to the reference set to the scene', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        zoom: 2
      });
      scene.cameras.add(camera);

      var vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 91.16116523516816, y: 23.48349570550447});
      expect(vertices[1]).to.eql({x: 126.51650429449553, y: 58.838834764831844});
      expect(vertices[2]).to.eql({x: 108.83883476483184, y: 76.51650429449553});
      expect(vertices[3]).to.eql({x: 73.48349570550447, y: 41.161165235168156});
    });

    it('should return the coordinates of all vertices relative to the reference set to the canvas', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        zoom: 2
      });
      var canvas = new Canvas({
        camera: camera,
        width: 200, height: 100
      });
      scene.cameras.add(camera);

      var vertices = camera.getVertices(canvas);

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 200, y: 0});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 0, y: 100});
    });

    it('should return a cached array for the reference if nothing has changed', function(done) {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });
      scene.cameras.add(camera);
      var vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 50, y: 25});

      var hasBeenSet = false;
      var x = vertices[0].x;
      Object.defineProperty(vertices[0], 'x', {
        get: function() { return x; },
        set: function(value) {
          x = value;
          hasBeenSet = true;
        }
      });

      camera.getVertices(scene);

      setTimeout(function() {
        if (hasBeenSet) done(new Error('The vertex was updated and did not use the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array for the reference if the reference has changed', function(done) {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });
      var canvas = new Canvas({camera: camera});
      scene.cameras.add(camera);
      var vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 50, y: 25});

      var hasBeenSet = false;
      var x = vertices[0].x;
      Object.defineProperty(vertices[0], 'x', {
        get: function() { return x; },
        set: function(value) {
          x = value;
          hasBeenSet = true;
        }
      });

      camera.getVertices(canvas);

      setTimeout(function() {
        if (!hasBeenSet) done(new Error('The vertex was not updated and used the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array for the reference if the mode has changed', function(done) {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });
      scene.cameras.add(camera);
      var vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 50, y: 25});

      var hasBeenSet = false;
      var x = vertices[0].x;
      Object.defineProperty(vertices[0], 'x', {
        get: function() { return x; },
        set: function(value) {
          x = value;
          hasBeenSet = true;
        }
      });

      camera.getVertices(scene, 'zoom');

      setTimeout(function() {
        if (!hasBeenSet) done(new Error('The vertex was not updated and used the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array for the reference if width has changed', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });
      scene.cameras.add(camera);
      var vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 50, y: 25});
      expect(vertices[1]).to.eql({x: 150, y: 25});
      expect(vertices[2]).to.eql({x: 150, y: 75});
      expect(vertices[3]).to.eql({x: 50, y: 75});

      camera.width = 200;
      vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 0, y: 25});
      expect(vertices[1]).to.eql({x: 200, y: 25});
      expect(vertices[2]).to.eql({x: 200, y: 75});
      expect(vertices[3]).to.eql({x: 0, y: 75});
    });

    it('should return an updated array if height has changed', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });
      scene.cameras.add(camera);
      var vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 50, y: 25});
      expect(vertices[1]).to.eql({x: 150, y: 25});
      expect(vertices[2]).to.eql({x: 150, y: 75});
      expect(vertices[3]).to.eql({x: 50, y: 75});

      camera.height = 100;
      vertices = camera.getVertices(scene);

      expect(vertices[0]).to.eql({x: 50, y: 0});
      expect(vertices[1]).to.eql({x: 150, y: 0});
      expect(vertices[2]).to.eql({x: 150, y: 100});
      expect(vertices[3]).to.eql({x: 50, y: 100});
    });

  });

  describe('#getBoundingRectangle()', function() {

    it('should return an object with data about the bounding rectangle, with no reference', function() {
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        zoom: 2
      });

      var rect = camera.getBoundingRectangle();

      expect(rect.top).to.equal(-25);
      expect(rect.right).to.equal(50);
      expect(rect.bottom).to.equal(25);
      expect(rect.left).to.equal(-50);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the scene', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        zoom: 2
      });
      scene.cameras.add(camera);

      var rect = camera.getBoundingRectangle(scene);

      expect(round(rect.top, 3)).to.equal(23.483);
      expect(round(rect.right, 3)).to.equal(126.517);
      expect(round(rect.bottom, 3)).to.equal(76.517);
      expect(round(rect.left, 3)).to.equal(73.483);
      expect(round(rect.width, 3)).to.equal(53.033);
      expect(round(rect.height, 3)).to.equal(53.033);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the canvas', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        zoom: 2
      });
      scene.cameras.add(camera);
      var canvas = new Canvas({
        width: 200, height: 100,
        camera: camera
      });

      var rect = camera.getBoundingRectangle(canvas);

      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(canvas.width);
      expect(rect.bottom).to.equal(canvas.height);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(canvas.width);
      expect(rect.height).to.equal(canvas.height);
    });

    it('should respect the `zoom` mode', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        zoom: 2
      });
      scene.cameras.add(camera);

      var rect = camera.getBoundingRectangle(scene, 'zoom');

      expect(round(rect.top, 3)).to.equal(23.483);
      expect(round(rect.right, 3)).to.equal(126.517);
      expect(round(rect.bottom, 3)).to.equal(76.517);
      expect(round(rect.left, 3)).to.equal(73.483);
      expect(round(rect.width, 3)).to.equal(53.033);
      expect(round(rect.height, 3)).to.equal(53.033);
    });

    it('should respect the `size` mode', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        zoom: 2
      });
      scene.cameras.add(camera);

      var rect = camera.getBoundingRectangle(scene, 'size');

      expect(round(rect.top, 3)).to.equal(23.483);
      expect(round(rect.right, 3)).to.equal(126.517);
      expect(round(rect.bottom, 3)).to.equal(76.517);
      expect(round(rect.left, 3)).to.equal(73.483);
      expect(round(rect.width, 3)).to.equal(53.033);
      expect(round(rect.height, 3)).to.equal(53.033);
    });

    it('should return a cached rectangle if nothing has changed', function() {
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });

      var numCalls = 0;
      camera.getVertices = function() {
        numCalls++;
        this.cache.update('vertices-local').update('vertices-reference');
        return [];
      };

      camera.getBoundingRectangle();
      camera.getBoundingRectangle();

      expect(numCalls).to.equal(1);
    });

    it('should return an updated rectangle if something has changed', function() {
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });

      var numCalls = 0;
      camera.getVertices = function() {
        numCalls++;
        this.cache.update('vertices-local').update('vertices-reference');
        return [];
      };

      camera.getBoundingRectangle();
      camera.width = 200;
      camera.getBoundingRectangle();

      expect(numCalls).to.equal(2);
    });

    it('should return a cached rectangle if the reference is the same', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });
      scene.cameras.add(camera);

      var numCalls = 0;
      camera.getVertices = function() {
        numCalls++;
        this.cache.update('vertices-local').update('vertices-reference');
        return [];
      };

      camera.getBoundingRectangle(scene);
      camera.getBoundingRectangle(scene);

      expect(numCalls).to.equal(1);
    });

    it('should return an updared rectangle if a different reference is passed', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 100, height: 50,
        x: 100, y: 50
      });
      scene.cameras.add(camera);

      var canvas = new Canvas({
        width: 200, height: 100,
        camera: camera
      });

      var numCalls = 0;
      camera.getVertices = function() {
        numCalls++;
        this.cache.update('vertices-local').update('vertices-reference');
        return [];
      };

      camera.getBoundingRectangle(scene);
      camera.getBoundingRectangle(canvas);

      expect(numCalls).to.equal(2);
    });

  });

  describe('#cache', function() {
    var camera = new Camera();

    it('should have a cache unit for translation', function() {
      expect(camera.cache.get('translation')).to.not.equal(null);
    });

    it('should have a cache unit for rotation', function() {
      expect(camera.cache.get('rotation')).to.not.equal(null);
    });

    it('should have a cache unit for scaling', function() {
      expect(camera.cache.get('scaling')).to.not.equal(null);
    });

    it('should have a cache unit for combined transformations', function() {
      expect(camera.cache.get('transformations')).to.not.equal(null);
    });

    it('should have a cache unit for an input point to getPointIn', function() {
      expect(camera.cache.get('getPointIn-input')).to.not.equal(null);
    });

    it('should have a cache unit for an output point from getPointIn', function() {
      expect(camera.cache.get('getPointIn-output')).to.not.equal(null);
    });

    it('should have a cache unit for local vertices', function() {
      expect(camera.cache.get('vertices-local')).to.not.equal(null);
    });

    it('should have a cache unit for vertices relative to the reference', function() {
      expect(camera.cache.get('vertices-reference')).to.not.equal(null);
    });

    it('should invalidate combinedTransformations on objects in the connected scene when camera changes', function() {
      var camera = new Camera();
      var scene = new Scene();
      var object = new CanvasObject();

      scene.cameras.add(camera);
      scene.objects.add(object);

      object.getTransformationMatrix(camera);

      expect(object.cache.test('combinedTransformations')).to.equal(true);

      camera.rotation = 45;

      expect(object.cache.test('combinedTransformations')).to.equal(false);
    });

    it('should invalidate combinedTransformations on objects in the connected scene when camera changes and reference is a Canvas', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object = new CanvasObject();

      scene.cameras.add(camera);
      scene.objects.add(object);

      object.getTransformationMatrix(canvas);

      expect(object.cache.test('combinedTransformations')).to.equal(true);

      camera.rotation = 45;

      expect(object.cache.test('combinedTransformations')).to.equal(false);
    });

    it('should not invalidate combinedTransformations on objects in the connected scene when camera changes and the matrix has no reference', function() {
      var camera = new Camera();
      var scene = new Scene();
      var object = new CanvasObject();

      scene.cameras.add(camera);
      scene.objects.add(object);

      camera.getTransformationMatrix();
      object.getTransformationMatrix();

      expect(object.cache.test('combinedTransformations')).to.equal(true);

      camera.rotation = 45;

      expect(object.cache.test('combinedTransformations')).to.equal(true);
    });

  });

  describe('#width', function() {

    it('should not change `x` when changed', function() {
      var camera = new Camera({width: 300, height: 150});
      expect(camera.width).to.equal(300);
      expect(camera.x).to.equal(150);

      camera.width = 500;

      expect(camera.width).to.equal(500);
      expect(camera.x).to.equal(150);
    });

  });

  describe('#height', function() {

    it('should not change `y` when changed', function() {
      var camera = new Camera({width: 300, height: 150});
      expect(camera.height).to.equal(150);
      expect(camera.y).to.equal(75);

      camera.height = 300;

      expect(camera.height).to.equal(300);
      expect(camera.y).to.equal(75);
    });

  });

});
