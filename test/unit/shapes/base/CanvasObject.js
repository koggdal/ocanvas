var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Camera = require('../../../../classes/Camera');
var Collection = require('../../../../classes/Collection');
var Matrix = require('../../../../classes/Matrix');
var jsonHelpers = require('../../../../utils/json');

describe('CanvasObject', function() {

  describe('CanvasObject constructor', function() {

    var object = new CanvasObject({name: 'CanvasObject'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('CanvasObject');
    });

    it('should set the default value of property `x` to 0', function() {
      expect(object.x).to.equal(0);
    });

    it('should set the default value of property `y` to 0', function() {
      expect(object.y).to.equal(0);
    });

    it('should set the default value of property `originX` to 0', function() {
      expect(object.originX).to.equal(0);
    });

    it('should set the default value of property `originY` to 0', function() {
      expect(object.originY).to.equal(0);
    });

    it('should set the default value of property `scalingX` to 1', function() {
      expect(object.scalingX).to.equal(1);
    });

    it('should set the default value of property `scalingY` to 1', function() {
      expect(object.scalingY).to.equal(1);
    });

    it('should set the default value of property `rotation` to 0', function() {
      expect(object.rotation).to.equal(0);
    });

    it('should set the default value of property `fill` to \'\' (transparent)', function() {
      expect(object.fill).to.equal('');
    });

    it('should set the default value of property `stroke` to \'\' (transparent, no thickness)', function() {
      expect(object.stroke).to.equal('');
    });

    it('should set the default value of property `opacity` to 1', function() {
      expect(object.opacity).to.equal(1);
    });

    it('should set the default value of property `clippingMask` to null', function() {
      expect(object.clippingMask).to.equal(null);
    });

    it('should set the default value of property `matrixCache` to an object', function() {
      expect(typeof object.matrixCache).to.equal('object');
    });

    it('should set the default value of property `vertexCache` to an object', function() {
      expect(typeof object.vertexCache).to.equal('object');
    });

    it('should set the default value of property `children` to a new collection', function() {
      expect(object.children instanceof Collection).to.equal(true);
    });

    it('should not allow setting the children property to something that is not a collection', function() {
      expect(object.children instanceof Collection).to.equal(true);
      object.children = 'foo';
      expect(object.children instanceof Collection).to.equal(true);
    });

    it('should set up an insert event listener for the children collection (to set the parent property)', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      expect(object2.parent).to.equal(object1);
    });

    it('should set up a remove event listener for the children collection (to unset the parent property)', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      object1.children.remove(object2);
      expect(object2.parent).to.equal(null);
    });

  });

  describe('.objectProperties', function() {

    it('should be an array of property names', function() {
      expect(Array.isArray(CanvasObject.objectProperties)).to.equal(true);
      expect(typeof CanvasObject.objectProperties[0]).to.equal('string');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'CanvasObject': CanvasObject,
      'Collection': Collection
    });

    var data = {
      __class__: 'CanvasObject',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      scalingX: 1.5,
      scalingY: 1.2,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'CanvasObject',
            x: 10,
            y: 20
          }
        ]
      }
    };

    it('should create a CanvasObject instance from a data object', function() {
      var object = CanvasObject.fromObject(data);

      expect(object instanceof CanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.scalingX).to.equal(data.scalingX);
      expect(object.scalingY).to.equal(data.scalingY);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof CanvasObject).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
      expect(object.children.get(0).parent).to.equal(object);
    });

    it('should restore a clipping mask (CanvasObject) from a data object', function() {
      var data = {
        __class__: 'CanvasObject',
        x: 35,
        clippingMask: {
          __class__: 'CanvasObject',
          x: 10
        }
      };

      var object = CanvasObject.fromObject(data);

      expect(object instanceof CanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.clippingMask instanceof CanvasObject).to.equal(true);
      expect(object.clippingMask.x).to.equal(data.clippingMask.x);
    });

    it('should restore a clipping mask (function) from a data object', function() {
      var data = {
        __class__: 'CanvasObject',
        x: 35,
        clippingMask: {
          __type__: 'function',
          content: 'function(param) { return param; }'
        }
      };

      var object = CanvasObject.fromObject(data);

      expect(object instanceof CanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(typeof object.clippingMask).to.equal('function');
      expect(object.clippingMask('foo')).to.equal('foo');
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'CanvasObject': CanvasObject,
      'Collection': Collection
    });

    var data = {
      __class__: 'CanvasObject',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      scalingX: 1.5,
      scalingY: 1.2,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'CanvasObject',
            x: 10,
            y: 20
          }
        ]
      }
    };
    var json = JSON.stringify(data);

    it('should create a CanvasObject instance from a JSON string', function() {
      var object = CanvasObject.fromJSON(json);

      expect(object instanceof CanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.scalingX).to.equal(data.scalingX);
      expect(object.scalingY).to.equal(data.scalingY);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof CanvasObject).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
      expect(object.children.get(0).parent).to.equal(object);
    });

    it('should restore a clipping mask (CanvasObject) from a data object', function() {
      var data = {
        __class__: 'CanvasObject',
        x: 35,
        clippingMask: {
          __class__: 'CanvasObject',
          x: 10
        }
      };
      var json = JSON.stringify(data);

      var object = CanvasObject.fromJSON(json);

      expect(object instanceof CanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.clippingMask instanceof CanvasObject).to.equal(true);
      expect(object.clippingMask.x).to.equal(data.clippingMask.x);
    });

    it('should restore a clipping mask (function) from a data object', function() {
      var data = {
        __class__: 'CanvasObject',
        x: 35,
        clippingMask: {
          __type__: 'function',
          content: 'function(param) { return param; }'
        }
      };
      var json = JSON.stringify(data);

      var object = CanvasObject.fromJSON(json);

      expect(object instanceof CanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(typeof object.clippingMask).to.equal('function');
      expect(object.clippingMask('foo')).to.equal('foo');
    });

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var object = new CanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
        scalingX: 1.5,
        scalingY: 1.2,
        rotation: 98,
        fill: 'red',
        stroke: '10px green',
        opacity: 0.5
      });
      var object2 = new CanvasObject({
        x: 10,
        y: 20
      });
      object.children.add(object2);

      var data = object.toObject();

      var props = CanvasObject.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(object[props[i]]);
      }

      expect(data.__class__).to.equal('CanvasObject');
      expect(typeof data.children).to.equal('object');
      expect(data.children.__class__).to.equal('Collection');
      expect(Array.isArray(data.children.items)).to.equal(true);
      expect(typeof data.children.items[0]).to.equal('object');
      expect(data.children.items[0].__class__).to.equal('CanvasObject');
      expect(data.children.items[0].x).to.equal(10);
      expect(data.children.items[0].y).to.equal(20);
    });

    it('should handle serializing a clipping mask specified with a canvas object', function() {
      var clippingMask = new CanvasObject({
        x: 10, y: 15
      });
      var object = new CanvasObject({
        x: 35, y: 25,
        clippingMask: clippingMask
      });

      var data = object.toObject();

      expect(typeof data.clippingMask).to.equal('object');
      expect(data.clippingMask.__class__).to.equal('CanvasObject');
      expect(data.clippingMask.x).to.equal(10);
      expect(data.clippingMask.y).to.equal(15);
      expect(data.x).to.equal(35);
      expect(data.y).to.equal(25);
    });

    it('should handle serializing a clipping mask specified with a function', function() {
      var clippingMask = function(context) {
        context.rect(0, 0, 100, 100);
      };
      var object = new CanvasObject({
        x: 35, y: 25,
        clippingMask: clippingMask
      });

      var data = object.toObject();

      expect(typeof data.clippingMask).to.equal('object');
      expect(data.clippingMask.__type__).to.equal('function');
      expect(data.clippingMask.content).to.equal(clippingMask.toString());
    });

  });

  describe('#toJSON()', function() {

    it('should create JSON string from all specified properties', function() {
      var object = new CanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
        scalingX: 1.5,
        scalingY: 1.2,
        rotation: 98,
        fill: 'red',
        stroke: '10px green',
        opacity: 0.5
      });
      var object2 = new CanvasObject({
        x: 10,
        y: 20
      });
      object.children.add(object2);

      var json = object.toJSON();
      var data = JSON.parse(json);

      var props = CanvasObject.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(object[props[i]]);
      }

      expect(data.__class__).to.equal('CanvasObject');
      expect(typeof data.children).to.equal('object');
      expect(data.children.__class__).to.equal('Collection');
      expect(Array.isArray(data.children.items)).to.equal(true);
      expect(typeof data.children.items[0]).to.equal('object');
      expect(data.children.items[0].__class__).to.equal('CanvasObject');
      expect(data.children.items[0].x).to.equal(10);
      expect(data.children.items[0].y).to.equal(20);
    });

    it('should handle serializing a clipping mask specified with a canvas object', function() {
      var clippingMask = new CanvasObject({
        x: 10, y: 15
      });
      var object = new CanvasObject({
        x: 35, y: 25,
        clippingMask: clippingMask
      });

      var json = object.toJSON();
      var data = JSON.parse(json);

      expect(typeof data.clippingMask).to.equal('object');
      expect(data.clippingMask.__class__).to.equal('CanvasObject');
      expect(data.clippingMask.x).to.equal(10);
      expect(data.clippingMask.y).to.equal(15);
      expect(data.x).to.equal(35);
      expect(data.y).to.equal(25);
    });

    it('should handle serializing a clipping mask specified with a function', function() {
      var clippingMask = function(context) {
        context.rect(0, 0, 100, 100);
      };
      var object = new CanvasObject({
        x: 35, y: 25,
        clippingMask: clippingMask
      });

      var json = object.toJSON();
      var data = JSON.parse(json);

      expect(typeof data.clippingMask).to.equal('object');
      expect(data.clippingMask.__type__).to.equal('function');
      expect(data.clippingMask.content).to.equal(clippingMask.toString());
    });

  });

  describe('#calculateOrigin()', function() {

    it('should be defined but throw an error (needs subclass implementation)', function(done) {
      var object = new CanvasObject();

      try {
        object.calculateOrigin();
      } catch(error) {
        if (error.name === 'ocanvas-needs-subclass') {
          done();
        } else {
          done(error);
        }
      }
    });

  });

  describe('#renderPath()', function() {

    it('should be defined but throw an error (needs subclass implementation)', function(done) {
      var object = new CanvasObject();

      try {
        object.renderPath();
      } catch(error) {
        if (error.name === 'ocanvas-needs-subclass') {
          done();
        } else {
          done(error);
        }
      }
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var object = new CanvasObject();
      expect(object.name).to.equal(undefined);
      object.setProperties({
        name: 'CanvasObject'
      });
      expect(object.name).to.equal('CanvasObject');
    });

  });

  describe('#getTransformationMatrix()', function() {

    it('should return a matrix that contains translation', function() {
      var object = new CanvasObject({x: 10, y: 20});
      expect(object.getTransformationMatrix().toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);
    });

    it('should return a matrix that contains rotation', function() {
      var object = new CanvasObject({rotation: 10});
      expect(object.getTransformationMatrix().toArray()).to.eql([
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
      var object = new CanvasObject({scalingX: 0.5, scalingY: 2});
      expect(object.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 2, 0, 0, 0, 1]);
    });

    it('should return a matrix that combines translation, rotation and scaling', function() {
      var object = new CanvasObject({
        x: 10, y: 20,
        rotation: 10,
        scalingX: 0.5, scalingY: 2
      });

      expect(object.getTransformationMatrix().toArray()).to.eql([
        0.492403876506104,
        -0.34729635533386066,
        10,
        0.08682408883346517,
        1.969615506024416,
        20,
        0,
        0,
        1
      ]);

    });

    it('should return a cached matrix if nothing has changed', function(done) {
      var object = new CanvasObject({x: 10, y: 20});
      var matrix = object.getTransformationMatrix();
      var setData = matrix.setData;
      var setDataCalled = false;
      matrix.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      expect(object.getTransformationMatrix().toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);
    });

    it('should return an updated matrix when position has changed', function() {
      var object = new CanvasObject({x: 10, y: 20});

      expect(object.getTransformationMatrix().toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      object.x = 15;

      expect(object.getTransformationMatrix().toArray()).to.eql([1, 0, 15, 0, 1, 20, 0, 0, 1]);

      object.y = 25;

      expect(object.getTransformationMatrix().toArray()).to.eql([1, 0, 15, 0, 1, 25, 0, 0, 1]);
    });

    it('should return an updated matrix when rotation has changed', function() {
      var object = new CanvasObject({rotation: 0});

      expect(object.getTransformationMatrix().toArray()).to.eql([1, 0, 0, 0, 1, 0, 0, 0, 1]);

      object.rotation = 10;

      expect(object.getTransformationMatrix().toArray()).to.eql([
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
      var object = new CanvasObject({scalingX: 2, scalingY: 0.5});

      expect(object.getTransformationMatrix().toArray()).to.eql([2, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      object.scalingX = 0.5;

      expect(object.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      object.scalingY = 2;

      expect(object.getTransformationMatrix().toArray()).to.eql([0.5, 0, 0, 0, 2, 0, 0, 0, 1]);
    });

  });

  describe('#getGlobalTransformationMatrix()', function() {

    it('should throw an error if the camera instance does not have a camera', function(done) {
      var object = new CanvasObject();
      try {
        var matrix = object.getGlobalTransformationMatrix({});
      } catch(error) {
        if (error.name === 'ocanvas-needs-camera') done();
        else done(error);
      }
    });

    it('should return a matrix that contains the transformations for this object', function() {
      var camera = new Camera({x: 0, y: 0});
      var object = new CanvasObject({x: 10, y: 20});
      var matrix = object.getGlobalTransformationMatrix({camera: camera});
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);
    });

    it('should return a matrix that contains the transformations for the parent object', function() {
      var camera = new Camera({x: 0, y: 0});
      var object1 = new CanvasObject({x: 10, y: 20});
      var object2 = new CanvasObject({x: 30, y: 50});
      object1.children.add(object2);

      var matrix = object2.getGlobalTransformationMatrix({camera: camera});
      expect(matrix.toArray()).to.eql([1, 0, 40, 0, 1, 70, 0, 0, 1]);
    });

    it('should return a matrix that contains the transformations for the camera', function() {
      var camera = new Camera({x: 0, y: 0, zoom: 2});
      var object = new CanvasObject({x: 10, y: 20});

      var matrix = object.getGlobalTransformationMatrix({camera: camera});
      expect(matrix.toArray()).to.eql([2, 0, 20, 0, 2, 40, 0, 0, 1]);
    });

    it('should return a cached matrix if nothing has changed', function(done) {
      var camera = new Camera({x: 0, y: 0});
      var object = new CanvasObject({x: 10, y: 20});
      var matrix = object.getGlobalTransformationMatrix({camera: camera});
      var setData = matrix.setData;
      var setDataCalled = false;
      matrix.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      matrix = object.getGlobalTransformationMatrix({camera: camera});
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);
    });

    it('should return an updated matrix when position has changed', function() {
      var camera = new Camera({x: 0, y: 0});
      var object = new CanvasObject({x: 10, y: 20});
      var canvas = {camera: camera};
      var matrix;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      object.x = 15;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 15, 0, 1, 20, 0, 0, 1]);

      object.y = 25;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 15, 0, 1, 25, 0, 0, 1]);
    });

    it('should return an updated matrix when rotation has changed', function() {
      var camera = new Camera({x: 0, y: 0});
      var object = new CanvasObject({rotation: 0});
      var canvas = {camera: camera};
      var matrix;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 0, 0, 1, 0, 0, 0, 1]);

      object.rotation = 10;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([
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
      var camera = new Camera({x: 0, y: 0});
      var object = new CanvasObject({scalingX: 2, scalingY: 0.5});
      var canvas = {camera: camera};
      var matrix;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([2, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      object.scalingX = 0.5;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([0.5, 0, 0, 0, 0.5, 0, 0, 0, 1]);

      object.scalingY = 2;

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([0.5, 0, 0, 0, 2, 0, 0, 0, 1]);
    });

    it('should return an updated matrix when a parent has changed', function() {
      var camera = new Camera({x: 0, y: 0});
      var object1 = new CanvasObject({x: 10, y: 20});
      var object2 = new CanvasObject({x: 30, y: 50});
      object1.children.add(object2);
      var canvas = {camera: camera};
      var matrix;

      matrix = object2.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 40, 0, 1, 70, 0, 0, 1]);

      object1.x = 40;

      matrix = object2.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 70, 0, 1, 70, 0, 0, 1]);
    });

  });

  describe('#getVertices()', function() {

    it('should be defined but throw an error (needs subclass implementation)', function(done) {
      var object = new CanvasObject();

      try {
        object.getVertices();
      } catch(error) {
        if (error.name === 'ocanvas-needs-subclass') {
          done();
        } else {
          done(error);
        }
      }
    });

  });

  describe('#matrixCache', function() {

    it('should have five objects for matrices (translation, rotation, scaling, combined, global)', function() {
      var object = new CanvasObject();

      ['translation', 'rotation', 'scaling', 'combined', 'global'].forEach(function(property) {
        expect(object.matrixCache[property]).to.eql({valid: false, matrix: null});
      });
    });

    it('should store Matrix instances after first calculation', function() {
      var camera = new Camera();
      var object = new CanvasObject();
      object.getGlobalTransformationMatrix({camera: camera});

      var cache = object.matrixCache;

      ['translation', 'rotation', 'scaling', 'combined', 'global'].forEach(function(property) {
        expect(cache[property].matrix instanceof Matrix).to.equal(true);
      });
    });

    it('should have an invalidate method to invalidate all matrices', function() {
      var camera = new Camera();
      var object = new CanvasObject();
      object.getGlobalTransformationMatrix({camera: camera});

      var cache = object.matrixCache;

      ['translation', 'rotation', 'scaling', 'combined', 'global'].forEach(function(property) {
        expect(cache[property].valid).to.equal(true);
      });

      cache.invalidate();

      ['translation', 'rotation', 'scaling', 'combined', 'global'].forEach(function(property) {
        expect(cache[property].valid).to.equal(false);
      });
    });

    it('should have an invalidate method to invalidate one type of matrix (plus the combined)', function() {
      var camera = new Camera();
      var object = new CanvasObject();
      object.getGlobalTransformationMatrix({camera: camera});

      var cache = object.matrixCache;

      ['translation', 'rotation', 'scaling', 'combined', 'global'].forEach(function(property) {
        expect(cache[property].valid).to.equal(true);
      });

      cache.invalidate('translation');

      ['rotation', 'scaling'].forEach(function(property) {
        expect(cache[property].valid).to.equal(true);
      });
      ['translation', 'combined', 'global'].forEach(function(property) {
        expect(cache[property].valid).to.equal(false);
      });
    });

    it('should have an invalidate method that invalidates all child objects as well', function() {
      var camera = new Camera();
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      object2.getGlobalTransformationMatrix({camera: camera});

      var cache1 = object1.matrixCache;
      var cache2 = object2.matrixCache;

      ['translation', 'rotation', 'scaling', 'combined', 'global'].forEach(function(property) {
        expect(cache1[property].valid).to.equal(true);
      });

      ['translation', 'rotation', 'scaling', 'combined', 'global'].forEach(function(property) {
        expect(cache2[property].valid).to.equal(true);
      });

      cache1.invalidate('translation');

      ['rotation', 'scaling'].forEach(function(property) {
        expect(cache1[property].valid).to.equal(true);
      });
      ['translation', 'combined', 'global'].forEach(function(property) {
        expect(cache1[property].valid).to.equal(false);
      });

      ['translation', 'rotation', 'scaling', 'combined'].forEach(function(property) {
        expect(cache2[property].valid).to.equal(true);
      });
      ['global'].forEach(function(property) {
        expect(cache2[property].valid).to.equal(false);
      });
    });

  });

  describe('#vertexCache', function() {

    it('should have one object for vertices (local)', function() {
      var object = new CanvasObject();

      expect(object.vertexCache.local).to.eql({valid: false, vertices: null});
    });

    it('should have an invalidate method to invalidate all vertices', function() {
      var object = new CanvasObject();
      var cache = object.vertexCache;
      cache.local.valid = true;

      cache.invalidate();

      expect(cache.local.valid).to.eql(false);
    });

    it('should have an invalidate method to invalidate one type of vertices', function() {
      var object = new CanvasObject();
      var cache = object.vertexCache;
      cache.local.valid = true;

      cache.invalidate('local');

      expect(cache.local.valid).to.eql(false);
    });

  });

  describe('#clippingMask', function() {

    it('should only accept to be set to a CanvasObject, a function or null', function() {
      var object = new CanvasObject();
      var clippingMaskCanvasObject = new CanvasObject();
      var clippingMaskFunction = function() {};
      var clippingMaskString = 'foo';

      object.clippingMask = clippingMaskCanvasObject;
      expect(object.clippingMask).to.equal(clippingMaskCanvasObject);

      object.clippingMask = clippingMaskString;
      expect(object.clippingMask).to.equal(null);

      object.clippingMask = clippingMaskFunction;
      expect(object.clippingMask).to.equal(clippingMaskFunction);

      object.clippingMask = null;
      expect(object.clippingMask).to.equal(null);
    });

  });

});
