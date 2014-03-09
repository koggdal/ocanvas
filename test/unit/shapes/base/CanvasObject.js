var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Canvas = require('../../../../classes/Canvas');
var Camera = require('../../../../classes/Camera');
var Collection = require('../../../../classes/Collection');
var Cache = require('../../../../classes/Cache');
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

    it('should set the default value of property `parent` to null', function() {
      expect(object.parent).to.equal(null);
    });

    it('should set the default value of property `clippingMask` to null', function() {
      expect(object.clippingMask).to.equal(null);
    });

    it('should set the default value of property `cache` to a Cache instance', function() {
      expect(object.cache instanceof Cache).to.equal(true);
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

  describe('#isInView()', function() {

    it('should return true if the object is in view', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      object.getBoundingRectangle = function() {
        return {
          top: this.y,
          right: this.x + this.width,
          bottom: this.y + this.height,
          left: this.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isInView(canvas)).to.equal(true);
    });

    it('should return false if the object is not in view', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      object.getBoundingRectangle = function() {
        return {
          top: this.y,
          right: this.x + this.width,
          bottom: this.y + this.height,
          left: this.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isInView(canvas)).to.equal(false);
    });

  });

  describe('#isTreeInView()', function() {

    it('should return true if a child is in view', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: -500, y: 50
      });
      object1.children.add(object2);

      object1.getBoundingRectangleForTree = function() {
        var child = this.children.get(0);
        var x = this.x; var y = this.y;
        var w = this.width; var h = this.height;
        var cx = child.x; var cy = child.y;
        var cw = child.width; var ch = child.height;
        var rect = {
          top: Math.min(y, y + cy),
          right: Math.max(x + w, x + w + cx + cw),
          bottom: Math.max(y + h, y + h + cy + ch),
          left: Math.min(x, x + cx)
        };
        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;

        return rect;
      };

      expect(object1.isTreeInView(canvas)).to.equal(true);
    });

    it('should return false if the object and all children are not in view', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: 0, y: 50
      });
      object1.children.add(object2);

      object1.getBoundingRectangleForTree = function() {
        var child = this.children.get(0);
        var x = this.x; var y = this.y;
        var w = this.width; var h = this.height;
        var cx = child.x; var cy = child.y;
        var cw = child.width; var ch = child.height;
        var rect = {
          top: Math.min(y, y + cy),
          right: Math.max(x + w, x + w + cx + cw),
          bottom: Math.max(y + h, y + h + cy + ch),
          left: Math.min(x, x + cx)
        };
        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;

        return rect;
      };

      expect(object1.isTreeInView(canvas)).to.equal(false);
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
      var canvas = new Canvas({camera: camera});
      var matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);
    });

    it('should return a matrix that contains the transformations for the parent object', function() {
      var camera = new Camera({x: 0, y: 0});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({x: 10, y: 20});
      var object2 = new CanvasObject({x: 30, y: 50});
      object1.children.add(object2);

      var matrix = object2.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 40, 0, 1, 70, 0, 0, 1]);
    });

    it('should return a matrix that contains the transformations for the camera', function() {
      var camera = new Camera({x: 0, y: 0, zoom: 2});
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject({x: 10, y: 20});

      var matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([2, 0, 20, 0, 2, 40, 0, 0, 1]);
    });

    it('should return a cached matrix if nothing has changed', function(done) {
      var camera = new Camera({x: 0, y: 0});
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject({x: 10, y: 20});
      var matrix = object.getGlobalTransformationMatrix(canvas);
      var setData = matrix.setData;
      var setDataCalled = false;
      matrix.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      matrix = object.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);
    });

    it('should return an updated matrix when position has changed', function() {
      var camera = new Camera({x: 0, y: 0});
      var object = new CanvasObject({x: 10, y: 20});
      var canvas = new Canvas({camera: camera});
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
      var canvas = new Canvas({camera: camera});
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
      var canvas = new Canvas({camera: camera});
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
      var canvas = new Canvas({camera: camera});
      var matrix;

      matrix = object2.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 40, 0, 1, 70, 0, 0, 1]);

      object1.x = 40;

      matrix = object2.getGlobalTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([1, 0, 70, 0, 1, 70, 0, 0, 1]);
    });

  });

  describe('#getGlobalPoint()', function() {

    it('should return a point in global space', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});
    });

    it('should return a cached point if nothing has changed', function(done) {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      var globalPointMatrix = object2.cache.get('globalPoint').matrix;
      var setData = globalPointMatrix.setData;
      var setDataCalled = false;
      globalPointMatrix.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };

      point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);

    });

    it('should return an updated global point if position has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object2.x = 300;

      point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 435.1507575950825, y: 86.61165235168156});

      object2.y = 200;

      point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 435.1507575950825, y: 186.61165235168156});
    });

    it('should return an updated global point if rotation has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object2.rotation = 0;

      point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 134.3223304703363, y: 88.61165235168156});
    });

    it('should return an updated global point if scaling has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object2.scalingX = 2;

      point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 136.5649711574556, y: 85.19743878930846});

      object2.scalingY = 2;

      point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 137.97918471982868, y: 86.61165235168156});
    });

    it('should return an updated global point if a parent has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object1.rotation = 0;

      point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 205.03300858899104, y: 55.32233047033631});
    });

    it('should return an updated global point if a different local point was passed in', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = object2.getGlobalPoint(2, 2, canvas);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      point = object2.getGlobalPoint(4, 4, canvas);
      expect(point).to.eql({x: 137.97918471982868, y: 86.61165235168156});
    });

    it('should return the passed in point object with correct data', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});
      object1.children.add(object2);

      var point = {x: 0, y: 0};
      var returnedPoint = object2.getGlobalPoint(2, 2, canvas, point);
      expect(returnedPoint).to.equal(point);
      expect(returnedPoint).to.eql({x: 135.1507575950825, y: 86.61165235168156});
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

  describe('#getGlobalVertices()', function() {

    it('should be defined but throw an error (needs subclass implementation)', function(done) {
      var object = new CanvasObject();

      try {
        object.getGlobalVertices();
      } catch(error) {
        if (error.name === 'ocanvas-needs-subclass') {
          done();
        } else {
          done(error);
        }
      }
    });

  });

  describe('#getGlobalVerticesForTree()', function() {

    it('should return the coordinates of all vertices of the object and its children', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var object1 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
        }
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          return [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 150}];
        }
      });
      var object3 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          return [{x: 300, y: 150}, {x: 400, y: 150}, {x: 400, y: 200}];
        }
      });
      object1.children.add(object2);
      object2.children.add(object3);

      var vertices = object1.getGlobalVerticesForTree(canvas);

      expect(vertices.length).to.equal(9);
      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 200, y: 100});
      expect(vertices[4]).to.eql({x: 300, y: 100});
      expect(vertices[5]).to.eql({x: 300, y: 150});
      expect(vertices[6]).to.eql({x: 300, y: 150});
      expect(vertices[7]).to.eql({x: 400, y: 150});
      expect(vertices[8]).to.eql({x: 400, y: 200});
    });

    it('should return a cached array if nothing has changed', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var object1 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
        }
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          return [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 150}];
        }
      });
      object1.children.add(object2);

      var vertices = object1.getGlobalVerticesForTree(canvas);

      var hasAskedForNew = false;
      object1.getGlobalVertices = function() {
        hasAskedForNew = true;
      };

      object1.getGlobalVerticesForTree(canvas);

      setTimeout(function() {
        if (hasAskedForNew) done(new Error('The vertices were updated and did not use the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array if position has changed', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          this.cache.update('vertices', {
            vertices: [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}]
          });
          this.getGlobalTransformationMatrix(canvas);
          var x = this.x;
          var y = this.y;
          var w = this.width;
          var h = this.height;
          var globalVertices = [{x: x, y: y}, {x: x + w, y: y}, {x: x + w, y: y + h}, {x: x, y: y + h}];
          this.cache.update('globalVertices', {vertices: globalVertices});
          return globalVertices;
        }
      });

      var vertices = object.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});

      object.x = 200;
      vertices = object.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 200, y: 50});
      expect(vertices[1]).to.eql({x: 300, y: 50});
      expect(vertices[2]).to.eql({x: 300, y: 100});
      expect(vertices[3]).to.eql({x: 200, y: 100});

      object.y = 100;
      vertices = object.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 200, y: 100});
      expect(vertices[1]).to.eql({x: 300, y: 100});
      expect(vertices[2]).to.eql({x: 300, y: 150});
      expect(vertices[3]).to.eql({x: 200, y: 150});
    });

    it('should return an updated array if rotation has changed', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          this.cache.update('vertices', {
            vertices: [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}]
          });
          this.getGlobalTransformationMatrix(canvas);
          var globalVertices = [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
          this.cache.update('globalVertices', {vertices: globalVertices});
          return globalVertices;
        }
      });

      var vertices = object.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});

      var hasAskedForNew = false;
      object.getGlobalVertices = function() {
        hasAskedForNew = true;
      };

      object.rotation = 180;
      object.getGlobalVerticesForTree(canvas);

      setTimeout(function() {
        if (hasAskedForNew) done();
        else done(new Error('The vertices were still cached and were not invalidated'));
      }, 10);
    });

    it('should return an updated array if scaling has changed', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var updateCache = function(cache) {
        cache.update('vertices').update('globalVertices').update('treeVertices');
        cache.update('scaling').update('transformations').update('globalTransformations');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          updateCache(this.cache);
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
        }
      });

      var vertices = object.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});

      var hasAskedForNew = 0;
      object.getGlobalVertices = function() {
        hasAskedForNew++;
        updateCache(this.cache);
      };

      object.scalingX = 0.5;
      object.getGlobalVerticesForTree(canvas);
      object.scalingY = 0.5;
      object.getGlobalVerticesForTree(canvas);

      setTimeout(function() {
        if (hasAskedForNew === 2) done();
        else done(new Error('The vertices were still cached and were not invalidated'));
      }, 10);
    });

    it('should return an updated array if origin has changed', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var updateCache = function(cache) {
        cache.update('vertices').update('globalVertices').update('treeVertices');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          updateCache(this.cache);
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
        }
      });

      var vertices = object.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});

      var hasAskedForNew = 0;
      object.getGlobalVertices = function() {
        hasAskedForNew++;
        updateCache(this.cache);
      };

      object.originX = 10;
      object.getGlobalVerticesForTree(canvas);
      object.originY = 10;
      object.getGlobalVerticesForTree(canvas);

      setTimeout(function() {
        if (hasAskedForNew === 2) done();
        else done(new Error('The vertices were still cached and were not invalidated'));
      }, 10);
    });

    it('should return an updated array if a child has changed', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var updateCache = function(cache) {
        cache.update('vertices').update('globalVertices').update('treeVertices');
        cache.update('translation').update('transformations').update('globalTransformations');
      };

      var object1 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          updateCache(this.cache);
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
        }
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          updateCache(this.cache);
          return [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 150}];
        }
      });
      object1.children.add(object2);

      var vertices = object1.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 200, y: 100});
      expect(vertices[4]).to.eql({x: 300, y: 100});
      expect(vertices[5]).to.eql({x: 300, y: 150});

      var hasAskedForNew = false;
      object1.getGlobalVertices = function() {
        hasAskedForNew = true;
        updateCache(this.cache);
      };

      object2.x = 10;
      object1.getGlobalVerticesForTree(canvas);

      setTimeout(function() {
        if (hasAskedForNew) done();
        else done(new Error('The vertices were still cached and were not invalidated'));
      }, 10);
    });

    it('should return an updated array if a parent has changed', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var updateCache = function(cache) {
        cache.update('vertices').update('globalVertices').update('treeVertices');
        cache.update('translation').update('transformations').update('globalTransformations');
      };

      var object1 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          updateCache(this.cache);
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
        }
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getGlobalVertices: function() {
          updateCache(this.cache);
          object1.getGlobalVertices();
          return [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 150}];
        }
      });
      object1.children.add(object2);

      var vertices = object2.getGlobalVerticesForTree(canvas);

      expect(vertices[0]).to.eql({x: 200, y: 100});
      expect(vertices[1]).to.eql({x: 300, y: 100});
      expect(vertices[2]).to.eql({x: 300, y: 150});

      var hasAskedForNew = false;
      object2.getGlobalVertices = function() {
        hasAskedForNew = true;
        updateCache(this.cache);
      };

      object1.x = 10;
      object2.getGlobalVerticesForTree(canvas);

      setTimeout(function() {
        if (hasAskedForNew) done();
        else done(new Error('The vertices were still cached and were not invalidated'));
      }, 10);
    });

  });

  describe('#getBoundingRectangle()', function() {

    it('should return an object with data about the bounding rectangle', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject();
      object.getGlobalVertices = function() {
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      var rect = object.getBoundingRectangle(canvas);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return data only for this object, not its children', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      object1.getGlobalVertices = function() {
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object2.getGlobalVertices = function() {
        return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
      };
      var rect = object1.getBoundingRectangle(canvas);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return a cached rectangle if nothing has changed', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject();
      var numCalls = 0;
      object.getGlobalVertices = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangle(canvas);
      object.getBoundingRectangle(canvas);

      expect(numCalls).to.equal(1);
    });

    it('should return an updated rectangle if something has changed', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject();
      var numCalls = 0;

      var updateCache = function(cache) {
        cache.update('globalVertices').update('treeVertices');
        cache.update('translation').update('transformations').update('globalTransformations');
      };

      object.getGlobalVertices = function() {
        numCalls++;
        updateCache(this.cache);
        var x = this.x;
        return [{x: x, y: 0}, {x: x + 100, y: 0}, {x: x + 100, y: 50}];
      };
      object.getBoundingRectangle(canvas);
      object.x = 100;
      var rect = object.getBoundingRectangle(canvas);

      expect(numCalls).to.equal(2);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(200);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(100);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

  });

  describe('#getBoundingRectangleForTree()', function() {

    it('should return an object with data about the bounding rectangle', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject();
      object.getGlobalVerticesForTree = function() {
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      var rect = object.getBoundingRectangleForTree(canvas);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return data for this object and its children', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      object1.getGlobalVerticesForTree = function() {
        var vertices = [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
        var childVertices = object2.getGlobalVerticesForTree();
        return vertices.concat(childVertices);
      };
      object2.getGlobalVerticesForTree = function() {
        return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
      };
      var rect = object1.getBoundingRectangleForTree(canvas);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(200);
      expect(rect.bottom).to.equal(100);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(200);
      expect(rect.height).to.equal(100);
    });

    it('should return a cached rectangle if nothing has changed', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject();
      var numCalls = 0;
      object.getGlobalVerticesForTree = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangleForTree(canvas);
      object.getBoundingRectangleForTree(canvas);

      expect(numCalls).to.equal(1);
    });

    it('should return an updated rectangle if something has changed', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject();
      var numCalls = 0;

      var updateCache = function(cache) {
        cache.update('globalVertices').update('treeVertices');
        cache.update('translation').update('transformations').update('globalTransformations');
        cache.update('boundingRectangle').update('boundingRectangleForTree');
      };

      object.getGlobalVerticesForTree = function() {
        numCalls++;
        updateCache(this.cache);
        var x = this.x;
        return [{x: x, y: 0}, {x: x + 100, y: 0}, {x: x + 100, y: 50}];
      };
      object.getBoundingRectangleForTree(canvas);
      object.x = 100;
      var rect = object.getBoundingRectangleForTree(canvas);

      expect(numCalls).to.equal(2);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(200);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(100);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

  });

  describe('#cache', function() {
    var object = new CanvasObject();

    it('should have a cache unit for translation', function() {
      expect(object.cache.get('translation')).to.not.equal(null);
    });

    it('should have a cache unit for rotation', function() {
      expect(object.cache.get('rotation')).to.not.equal(null);
    });

    it('should have a cache unit for scaling', function() {
      expect(object.cache.get('scaling')).to.not.equal(null);
    });

    it('should have a cache unit for combined transformations', function() {
      expect(object.cache.get('transformations')).to.not.equal(null);
    });

    it('should have a cache unit for combined transformations in global space', function() {
      expect(object.cache.get('globalTransformations')).to.not.equal(null);
    });

    it('should have a cache unit for a local point', function() {
      expect(object.cache.get('point')).to.not.equal(null);
    });

    it('should have a cache unit for a global point', function() {
      expect(object.cache.get('globalPoint')).to.not.equal(null);
    });

    it('should have a cache unit for local vertices', function() {
      expect(object.cache.get('vertices')).to.not.equal(null);
    });

    it('should have a cache unit for global vertices', function() {
      expect(object.cache.get('globalVertices')).to.not.equal(null);
    });

    it('should have a cache unit for vertices for a subtree of objects', function() {
      expect(object.cache.get('treeVertices')).to.not.equal(null);
    });

    it('should have a cache unit for a bounding rectangle', function() {
      expect(object.cache.get('boundingRectangle')).to.not.equal(null);
    });

    it('should have a cache unit for a bounding rectangle for a subtree of objects', function() {
      expect(object.cache.get('boundingRectangleForTree')).to.not.equal(null);
    });

    it('should invalidate globalPoint on children when globalPoint is invalidated on this object', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);

      object1.getGlobalPoint(10, 10, canvas);
      object2.getGlobalPoint(10, 10, canvas);

      expect(object1.cache.test('globalPoint')).to.equal(true);
      expect(object2.cache.test('globalPoint')).to.equal(true);

      object1.cache.invalidate('globalPoint');

      expect(object1.cache.test('globalPoint')).to.equal(false);
      expect(object2.cache.test('globalPoint')).to.equal(false);
    });

    it('should invalidate boundingRectangleForTree on parent when boundingRectangleForTree is invalidated on this object', function() {
      var camera = new Camera();
      var object = new CanvasObject();
      var parent = new CanvasObject();
      parent.children.add(object);

      parent.cache.update('boundingRectangleForTree');
      object.cache.update('boundingRectangleForTree');

      expect(parent.cache.test('boundingRectangleForTree')).to.equal(true);
      expect(object.cache.test('boundingRectangleForTree')).to.equal(true);

      object.cache.invalidate('boundingRectangleForTree');

      expect(parent.cache.test('boundingRectangleForTree')).to.equal(false);
      expect(object.cache.test('boundingRectangleForTree')).to.equal(false);
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
