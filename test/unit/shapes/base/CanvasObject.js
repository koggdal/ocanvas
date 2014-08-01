var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Canvas = require('../../../../classes/Canvas');
var ObjectEventEmitter = require('../../../../classes/ObjectEventEmitter');
var Camera = require('../../../../classes/Camera');
var Collection = require('../../../../classes/Collection');
var Cache = require('../../../../classes/Cache');
var Scene = require('../../../../classes/Scene');
var Matrix = require('../../../../classes/Matrix');
var jsonHelpers = require('../../../../utils/json');
var round = require('../../../utils/round');

describe('CanvasObject', function() {

  it('should inherit from ObjectEventEmitter', function() {
    var object = new CanvasObject();
    expect(CanvasObject.prototype instanceof ObjectEventEmitter).to.equal(true);
    expect(object instanceof ObjectEventEmitter).to.equal(true);
  });

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
      var scene = new Scene();
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      scene.cameras.add(camera);
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      scene.objects.add(object);
      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(scene);
        return {
          top: this.y,
          right: this.x + this.width,
          bottom: this.y + this.height,
          left: this.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isInView(camera)).to.equal(true);
    });

    it('should return false if the object is not in view', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      scene.cameras.add(camera);
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      scene.objects.add(object);
      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(scene);
        return {
          top: this.y,
          right: this.x + this.width,
          bottom: this.y + this.height,
          left: this.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isInView(camera)).to.equal(false);
    });

    it('should return false if the camera is not connected to a scene', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      expect(object.isInView(camera)).to.equal(false);
    });

    it('should take camera zoom into account', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150,
        zoom: 2
      });
      scene.cameras.add(camera);
      var object = new CanvasObject({
        width: 10, height: 10,
        x: 0, y: 0
      });
      scene.objects.add(object);
      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(scene);
        return {
          top: this.y,
          right: this.x + this.width,
          bottom: this.y + this.height,
          left: this.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isInView(camera)).to.equal(false);
    });

  });

  describe('#isTreeInView()', function() {

    it('should return true if a child is in view', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      scene.cameras.add(camera);
      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      scene.objects.add(object1);
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

      expect(object1.isTreeInView(camera)).to.equal(true);
    });

    it('should return false if the object and all children are not in view', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      scene.cameras.add(camera);
      var canvas = new Canvas({camera: camera});
      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      scene.objects.add(object1);
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

      expect(object1.isTreeInView(camera)).to.equal(false);
    });

    it('should take camera zoom into account', function() {
      var scene = new Scene();
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150,
        zoom: 2
      });
      scene.cameras.add(camera);
      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 500, y: 50
      });
      scene.objects.add(object1);
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: -270, y: 50
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

      expect(object1.isTreeInView(camera)).to.equal(false);
    });

  });

  describe('#isPointInside()', function() {

    it('should return true if the point is inside the object, with no reference', function() {
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.not.be.ok();
        return {
          top: 0,
          right: this.width,
          bottom: this.height,
          left: 0,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInside(20, 20)).to.equal(true);
    });

    it('should return false if the point is not inside the object, with no reference', function() {
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.not.be.ok();
        return {
          top: 0,
          right: this.width,
          bottom: this.height,
          left: 0,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInside(20, 120)).to.equal(false);
    });

    it('should return true if the point is inside the object, with reference set to the immediate parent', function() {
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      parent.children.add(object);

      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(parent);
        return {
          top: this.y,
          right: this.x + this.width,
          bottom: this.y + this.height,
          left: this.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInside(60, 60, parent)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to a parent further out', function() {
      var outerParent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      outerParent.children.add(parent);
      parent.children.add(object);

      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(outerParent);
        return {
          top: this.y + this.parent.y,
          right: this.x + this.parent.x + this.width,
          bottom: this.y + this.parent.y + this.height,
          left: this.x + this.parent.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInside(120, 120, outerParent)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to the scene', function() {
      var scene = new Scene();
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      scene.objects.add(parent);
      parent.children.add(object);

      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(scene);
        var xInScene = this.x + this.parent.x;
        var yInScene = this.y + this.parent.y;
        return {
          top: yInScene,
          right: xInScene + this.width,
          bottom: yInScene + this.height,
          left: xInScene,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInside(120, 120, scene)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to the camera', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var scene = new Scene();
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object);

      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(camera);
        var xInScene = this.x + this.parent.x;
        var yInScene = this.y + this.parent.y;
        var cameraOffsetX = camera.x;
        var cameraOffsetY = camera.y;
        return {
          top: yInScene - cameraOffsetY,
          right: xInScene - cameraOffsetX + this.width,
          bottom: yInScene - cameraOffsetY + this.height,
          left: xInScene - cameraOffsetX,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInside(20, 20, camera)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to the canvas', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var canvas = new Canvas({
        width: 300, height: 300,
        camera: camera
      });
      var scene = new Scene();
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object);

      object.getBoundingRectangle = function(opt_reference) {
        expect(opt_reference).to.equal(canvas);
        var xInScene = this.x + this.parent.x;
        var yInScene = this.y + this.parent.y;
        var cameraOffsetX = camera.x - camera.width / 2;
        var cameraOffsetY = camera.y - camera.height / 2;
        return {
          top: yInScene - cameraOffsetY,
          right: xInScene - cameraOffsetX + this.width,
          bottom: yInScene - cameraOffsetY + this.height,
          left: xInScene - cameraOffsetX,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInside(170, 170, canvas)).to.equal(true);
    });

  });

  describe('#isPointInsideTree()', function() {

    it('should return true if the point is inside the object, with no reference', function() {
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.not.be.ok();
        return {
          top: 0,
          right: this.width,
          bottom: this.height,
          left: 0,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInsideTree(20, 20)).to.equal(true);
    });

    it('should return false if the point is not inside the object, with no reference', function() {
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.not.be.ok();
        return {
          top: 0,
          right: this.width,
          bottom: this.height,
          left: 0,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInsideTree(20, 120)).to.equal(false);
    });

    it('should return true if the point is inside a child of this object, with no reference', function() {
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var child = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      object.children.add(child);

      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.not.be.ok();
        var width = Math.max(child.x + child.width, this.width);
        var height = Math.max(child.y + child.height, this.height);
        return {
          top: 0,
          right: width,
          bottom: height,
          left: 0,
          width: width,
          height: height
        };
      };

      expect(object.isPointInsideTree(120, 120)).to.equal(true);
    });

    it('should return false if the point is not inside the object or its children, with no reference', function() {
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var child = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      object.children.add(child);

      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.not.be.ok();
        var width = Math.max(child.x + child.width, this.width);
        var height = Math.max(child.y + child.height, this.height);
        return {
          top: 0,
          right: width,
          bottom: height,
          left: 0,
          width: width,
          height: height
        };
      };

      expect(object.isPointInsideTree(160, 160)).to.equal(false);
    });

    it('should return true if the point is inside the object, with reference set to the immediate parent', function() {
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      parent.children.add(object);

      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.equal(parent);
        return {
          top: this.y,
          right: this.x + this.width,
          bottom: this.y + this.height,
          left: this.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInsideTree(60, 60, parent)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to a parent further out', function() {
      var outerParent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      outerParent.children.add(parent);
      parent.children.add(object);

      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.equal(outerParent);
        return {
          top: this.y + this.parent.y,
          right: this.x + this.parent.x + this.width,
          bottom: this.y + this.parent.y + this.height,
          left: this.x + this.parent.x,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInsideTree(120, 120, outerParent)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to the scene', function() {
      var scene = new Scene();
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      scene.objects.add(parent);
      parent.children.add(object);

      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.equal(scene);
        var xInScene = this.x + this.parent.x;
        var yInScene = this.y + this.parent.y;
        return {
          top: yInScene,
          right: xInScene + this.width,
          bottom: yInScene + this.height,
          left: xInScene,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInsideTree(120, 120, scene)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to the camera', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var scene = new Scene();
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object);

      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.equal(camera);
        var xInScene = this.x + this.parent.x;
        var yInScene = this.y + this.parent.y;
        var cameraOffsetX = camera.x;
        var cameraOffsetY = camera.y;
        return {
          top: yInScene - cameraOffsetY,
          right: xInScene - cameraOffsetX + this.width,
          bottom: yInScene - cameraOffsetY + this.height,
          left: xInScene - cameraOffsetX,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInsideTree(20, 20, camera)).to.equal(true);
    });

    it('should return true if the point is inside the object, with reference set to the canvas', function() {
      var camera = new Camera({
        width: 300, height: 300,
        x: 150, y: 150
      });
      var canvas = new Canvas({
        width: 300, height: 300,
        camera: camera
      });
      var scene = new Scene();
      var parent = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object);

      object.getBoundingRectangleForTree = function(opt_reference) {
        expect(opt_reference).to.equal(canvas);
        var xInScene = this.x + this.parent.x;
        var yInScene = this.y + this.parent.y;
        var cameraOffsetX = camera.x - camera.width / 2;
        var cameraOffsetY = camera.y - camera.height / 2;
        return {
          top: yInScene - cameraOffsetY,
          right: xInScene - cameraOffsetX + this.width,
          bottom: yInScene - cameraOffsetY + this.height,
          left: xInScene - cameraOffsetX,
          width: this.width,
          height: this.height
        };
      };
      expect(object.isPointInsideTree(170, 170, canvas)).to.equal(true);
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

    it('should return a matrix that contains the transformations for the parent object if a reference is passed', function() {
      var camera = new Camera({x: 0, y: 0});
      var object1 = new CanvasObject({x: 10, y: 20});
      var object2 = new CanvasObject({x: 30, y: 50});
      object1.children.add(object2);

      var matrix = object2.getTransformationMatrix(camera);
      expect(matrix.toArray()).to.eql([1, 0, 40, 0, 1, 70, 0, 0, 1]);
    });

    it('should return a matrix that contains the transformations for the camera if passed as reference', function() {
      var camera = new Camera({x: 100, y: 200, zoom: 2});
      var object = new CanvasObject({x: 10, y: 20});

      var matrix = object.getTransformationMatrix(camera);
      expect(matrix.toArray()).to.eql([0.5, 0, 105, 0, 0.5, 210, 0, 0, 1]);
    });

    it('should return a matrix that contains the transformations for the camera with canvas as reference if canvas is passed as reference', function() {
      var camera = new Camera({x: 0, y: 0, zoom: 2});
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject({x: 10, y: 20});

      var matrix = object.getTransformationMatrix(canvas);
      expect(matrix.toArray()).to.eql([2, 0, 20, 0, 2, 40, 0, 0, 1]);
    });

    it('should return a local matrix for the object itself if no parent is found and no reference is passed', function() {
      var camera = new Camera({x: 0, y: 0, zoom: 2});
      var canvas = new Canvas({camera: camera});
      var object = new CanvasObject({x: 10, y: 20});

      var matrix = object.getTransformationMatrix();
      expect(matrix.toArray()).to.eql([1, 0, 10, 0, 1, 20, 0, 0, 1]);
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

    it('should return an updated matrix when a parent has changed', function() {
      var camera = new Camera({x: 0, y: 0});
      var object1 = new CanvasObject({x: 10, y: 20});
      var object2 = new CanvasObject({x: 30, y: 50});
      object1.children.add(object2);
      var matrix;

      matrix = object2.getTransformationMatrix(camera);
      expect(matrix.toArray()).to.eql([1, 0, 40, 0, 1, 70, 0, 0, 1]);

      object1.x = 40;

      matrix = object2.getTransformationMatrix(camera);
      expect(matrix.toArray()).to.eql([1, 0, 70, 0, 1, 70, 0, 0, 1]);
    });

    it('should return an updated matrix when a different reference is passed', function() {
      var camera = new Camera({x: 100, y: 200});
      var object1 = new CanvasObject({x: 10, y: 20});
      var object2 = new CanvasObject({x: 30, y: 50});
      object1.children.add(object2);
      var matrix;

      matrix = object2.getTransformationMatrix();
      expect(matrix.toArray()).to.eql([1, 0, 30, 0, 1, 50, 0, 0, 1]);

      matrix = object2.getTransformationMatrix(object1);
      expect(matrix.toArray()).to.eql([1, 0, 40, 0, 1, 70, 0, 0, 1]);

      matrix = object2.getTransformationMatrix(camera);
      expect(matrix.toArray()).to.eql([1, 0, 140, 0, 1, 270, 0, 0, 1]);
    });

    it('should return a cached matrix when the same reference is passed', function(done) {
      var camera = new Camera({x: 100, y: 200});
      var object1 = new CanvasObject({x: 10, y: 20});
      var object2 = new CanvasObject({x: 30, y: 50});
      object1.children.add(object2);

      var matrix = object2.getTransformationMatrix(object1);

      var setData = matrix.setData;
      var setDataCalled = false;
      matrix.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };

      var matrix2 = object2.getTransformationMatrix(object1);

      expect(matrix).to.equal(matrix2);

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);
    });

  });

  describe('#getPointIn()', function() {

    it('should return a point relative to the immediate parent', function() {
      var parent = new CanvasObject({rotation: -45, x: 200});
      var object = new CanvasObject({rotation: 45, y: 100});
      parent.children.add(object);

      var point = object.getPointIn(parent, 50, 50);
      expect(round(point.x, 3)).to.equal(0);
      expect(round(point.y, 3)).to.equal(170.711);
    });

    it('should return a point relative to a parent further out', function() {
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointIn(outerParent, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(220.711);
    });

    it('should return a point relative to the scene', function() {
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointIn(scene, 50, 50);
      expect(round(point.x, 3)).to.equal(270.711);
      expect(round(point.y, 3)).to.equal(241.421);
    });

    it('should return a point relative to the camera', function() {
      var scene = new Scene();
      var camera = new Camera({rotation: -45, x: 100, y: 100});
      scene.cameras.add(camera);

      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointIn(camera, 50, 50);
      expect(round(point.x, 3)).to.equal(20.711);
      expect(round(point.y, 3)).to.equal(220.711);
    });

    it('should return a point relative to the canvas', function() {
      var canvas = new Canvas({width: 300, height: 180});
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      canvas.camera = camera;
      var scene = new Scene();
      scene.cameras.add(camera);

      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointIn(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(191.421);
      expect(round(point.y, 3)).to.equal(531.421);
    });

    it('should return the input point if an invalid reference was passed', function() {
      var object = new CanvasObject({rotation: 45, y: 100});

      var point1 = object.getPointIn({}, 50, 50);
      expect(point1.x).to.equal(50);
      expect(point1.y).to.equal(50);

      var point2var = {};
      var point2 = object.getPointIn({}, 50, 50, point2var);
      expect(point2.x).to.equal(50);
      expect(point2.y).to.equal(50);
      expect(point2).to.equal(point2var);
    });

    it('should return an updated point if position has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      var point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object2.x = 300;

      point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 435.1507575950825, y: 86.61165235168156});

      object2.y = 200;

      point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 435.1507575950825, y: 186.61165235168158});
    });

    it('should return an updated point if rotation has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      var point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object2.rotation = 0;

      point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 134.3223304703363, y: 88.61165235168154});
    });

    it('should return an updated point if scaling has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      var point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object2.scalingX = 2;

      point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 136.56497115745557, y: 85.19743878930845});

      object2.scalingY = 2;

      point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 137.97918471982868, y: 86.61165235168156});
    });

    it('should return an updated point if a parent has changed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      var point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      object1.rotation = 0;

      point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 205.03300858899107, y: 55.32233047033631});
    });

    it('should return an updated point if a different local point was passed in', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      var point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      point = object2.getPointIn(canvas, 4, 4);
      expect(point).to.eql({x: 137.97918471982868, y: 86.61165235168156});
    });

    it('should return an updated point when a different reference is passed', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      var point = object2.getPointIn(canvas, 2, 2);
      expect(point).to.eql({x: 135.1507575950825, y: 86.61165235168156});

      point = object2.getPointIn(object1, 2, 2);
      expect(point).to.eql({x: 2.82842712474619, y: 100});
    });

    it('should return the passed in point object with correct data', function() {
      var camera = new Camera({rotation: 45});
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      var object1 = new CanvasObject({rotation: 45, x: 200});
      var object2 = new CanvasObject({rotation: -45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      var point = {x: 0, y: 0};
      var returnedPoint = object2.getPointIn(canvas, 2, 2, point);
      expect(returnedPoint).to.equal(point);
      expect(returnedPoint).to.eql({x: 135.1507575950825, y: 86.61165235168156});
    });

  });

  describe('#getPointFrom()', function() {

    it('should return a point from the immediate parent', function() {
      var parent = new CanvasObject({rotation: -45, x: 200});
      var object = new CanvasObject({rotation: 45, y: 100});

      parent.children.add(object);

      var point = object.getPointFrom(parent, 50, 50);
      expect(round(point.x, 3)).to.equal(0);
      expect(round(point.y, 3)).to.equal(-70.711);
    });

    it('should return a point from a parent further out', function() {
      var outerMostParent = new CanvasObject({rotation: -90, x: -200});
      var outerParent = new CanvasObject({rotation: 45, x: -100});
      var parent = new CanvasObject({rotation: -45, x: 200});
      var object = new CanvasObject({rotation: 45, y: 100});

      outerMostParent.children.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(outerMostParent, 50, 50);
      expect(round(point.x, 3)).to.equal(-129.289);
      expect(round(point.y, 3)).to.equal(-141.421);
    });

    it('should return a point from the scene', function() {
      var scene = new Scene();
      var parent = new CanvasObject({rotation: -45, x: 200});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.objects.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(scene, 50, 50);
      expect(round(point.x, 3)).to.equal(-220.711);
      expect(round(point.y, 3)).to.equal(-20.711);
    });

    it('should return a point from the camera', function() {
      var scene = new Scene();
      var camera = new Camera({rotation: -45, x: 100, y: 100});
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(camera, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);
    });

    it('should return a point from the canvas', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);
    });

    it('should return a cached point if nothing has changed', function(done) {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      var pointMatrix1 = object.cache.get('getPointFrom-output').matrix;
      var setData = pointMatrix1.setData;
      var setDataCalled = false;
      pointMatrix1.setData = function() {
        setDataCalled = true;
        setData.apply(this, arguments);
      };

      point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      var pointMatrix2 = object.cache.get('getPointFrom-output').matrix;
      expect(pointMatrix1).to.equal(pointMatrix2);

      setTimeout(function() {
        if (!setDataCalled) done();
        else done(new Error('The matrix was updated and did not use the cache'));
      }, 10);

    });

    it('should return an updated point if position has changed', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      object.x = 300;

      point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-332.843);
      expect(round(point.y, 3)).to.equal(232.843);

      object.y = 200;

      point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-403.553);
      expect(round(point.y, 3)).to.equal(162.132);
    });

    it('should return an updated point if rotation has changed', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      object.rotation = 0;

      point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-100);
      expect(round(point.y, 3)).to.equal(-70.711);
    });

    it('should return an updated point if scaling has changed', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      object.scalingX = 2;

      point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-60.355);
      expect(round(point.y, 3)).to.equal(20.711);

      object.scalingY = 2;

      point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-60.355);
      expect(round(point.y, 3)).to.equal(10.355);
    });

    it('should return an updated point if a parent has changed', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      parent.rotation = 0;

      point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-170.711);
      expect(round(point.y, 3)).to.equal(-41.421);
    });

    it('should return an updated point if a different input point was passed in', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      point = object.getPointFrom(canvas, 30, 20);
      expect(round(point.x, 3)).to.equal(-150.711);
      expect(round(point.y, 3)).to.equal(40.711);
    });

    it('should return an updated point when a different reference is passed', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = object.getPointFrom(canvas, 50, 50);
      expect(round(point.x, 3)).to.equal(-120.711);
      expect(round(point.y, 3)).to.equal(20.711);

      point = object.getPointFrom(scene, 50, 50);
      expect(round(point.x, 3)).to.equal(-241.421);
      expect(round(point.y, 3)).to.equal(70.711);
    });

    it('should return the passed in point object with correct data', function() {
      var camera = new Camera({
        width: 150, height: 90,
        rotation: -45, x: 100, y: 100
      });
      var canvas = new Canvas({
        width: 300, height: 180,
        camera: camera
      });
      var scene = new Scene();
      var outerParent = new CanvasObject({rotation: -45, x: 200});
      var parent = new CanvasObject({rotation: 45, y: 100});
      var object = new CanvasObject({rotation: 45, y: 100});

      scene.cameras.add(camera);
      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var point = {x: 0, y: 0};
      var returnedPoint = object.getPointFrom(canvas, 50, 50, point);
      expect(returnedPoint).to.equal(point);
      expect(round(returnedPoint.x, 3)).to.equal(-120.711);
      expect(round(returnedPoint.y, 3)).to.equal(20.711);
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

  describe('#getVerticesForTree()', function() {

    it('should return the coordinates of all vertices of the object and its children, relative to itself', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});

      var object1 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.not.be.ok();
          // Since no reference is passed to the outermost call to
          // getVerticesForTree, no reference will be sent to getVertices for
          // the first object, and thus the coordinates will be local here.
          return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}, {x: 0, y: 50}];
        }
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(object1);
          // This is a child of the object that getVerticesForTree was called
          // for, so object1 will be sent as reference to this object, so the
          // coordinates will be relative to object1.
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}, {x: 100, y: 100}];
        }
      });
      var object3 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(object1);
          // This is a grand child of the object that getVerticesForTree was
          // called for, so object1 will be sent as reference to this object, so
          // the coordinates will be relative to object1.
          return [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 150}, {x: 200, y: 150}];
        }
      });
      object1.children.add(object2);
      object2.children.add(object3);

      var vertices = object1.getVerticesForTree();

      expect(vertices.length).to.equal(12);
      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});
      expect(vertices[4]).to.eql({x: 100, y: 50});
      expect(vertices[5]).to.eql({x: 200, y: 50});
      expect(vertices[6]).to.eql({x: 200, y: 100});
      expect(vertices[7]).to.eql({x: 100, y: 100});
      expect(vertices[8]).to.eql({x: 200, y: 100});
      expect(vertices[9]).to.eql({x: 300, y: 100});
      expect(vertices[10]).to.eql({x: 300, y: 150});
      expect(vertices[11]).to.eql({x: 200, y: 150});
    });

    it('should return the coordinates of all vertices of the object and its children, relative to a reference', function() {
      var scene = new Scene();

      var object1 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}, {x: 100, y: 100}];
        }
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          return [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 150}, {x: 200, y: 150}];
        }
      });
      var object3 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          return [{x: 300, y: 150}, {x: 400, y: 150}, {x: 400, y: 200}, {x: 300, y: 200}];
        }
      });

      scene.objects.add(object1);
      object1.children.add(object2);
      object2.children.add(object3);

      var vertices = object1.getVerticesForTree(scene);

      expect(vertices.length).to.equal(12);
      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});
      expect(vertices[4]).to.eql({x: 200, y: 100});
      expect(vertices[5]).to.eql({x: 300, y: 100});
      expect(vertices[6]).to.eql({x: 300, y: 150});
      expect(vertices[7]).to.eql({x: 200, y: 150});
      expect(vertices[8]).to.eql({x: 300, y: 150});
      expect(vertices[9]).to.eql({x: 400, y: 150});
      expect(vertices[10]).to.eql({x: 400, y: 200});
      expect(vertices[11]).to.eql({x: 300, y: 200});
    });

    it('should return a cached array if nothing has changed', function(done) {
      var scene = new Scene();

      var object1 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}, {x: 100, y: 100}];
        }
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          return [{x: 200, y: 100}, {x: 300, y: 100}, {x: 300, y: 150}, {x: 200, y: 150}];
        }
      });

      scene.objects.add(object1);
      object1.children.add(object2);

      var vertices = object1.getVerticesForTree(scene);

      var hasAskedForNew1 = false;
      object1.getVertices = function() {
        hasAskedForNew1 = true;
      };
      var hasAskedForNew2 = false;
      object2.getVertices = function() {
        hasAskedForNew2 = true;
      };

      object1.getVerticesForTree(scene);

      setTimeout(function() {
        if (hasAskedForNew1 || hasAskedForNew2) {
          done(new Error('The vertices were updated and did not use the cache'));
        } else {
          done();
        }
      }, 10);
    });

    it('should return a cached array if nothing has changed, with no reference', function(done) {
      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.not.be.ok();
          return [{x: 100, y: 50}];
        }
      });

      object.getVerticesForTree();

      var hasAskedForNew = false;
      object.getVertices = function() {
        hasAskedForNew = true;
      };

      object.getVerticesForTree();

      setTimeout(function() {
        if (hasAskedForNew) {
          done(new Error('The vertices were updated and did not use the cache'));
        } else {
          done();
        }
      }, 10);
    });

    it('should return an updated array if position has changed', function(done) {
      var scene = new Scene();
      var callCount = 0;

      // Trigger cache updates, which will make the caches valid, which
      // allows the caches to be invalidated when properties are changed.
      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      scene.objects.add(object);

      var vertices = object.getVerticesForTree(scene);
      object.x = 200;
      vertices = object.getVerticesForTree(scene);
      object.y = 100;
      vertices = object.getVerticesForTree(scene);

      setTimeout(function() {
        expect(callCount).to.equal(3);
        done();
      }, 10);
    });

    it('should return an updated array if rotation has changed', function(done) {
      var scene = new Scene();
      var callCount = 0;

      // Trigger cache updates, which will make the caches valid, which
      // allows the caches to be invalidated when properties are changed.
      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      scene.objects.add(object);

      var vertices = object.getVerticesForTree(scene);
      object.rotation = 45;
      vertices = object.getVerticesForTree(scene);

      setTimeout(function() {
        expect(callCount).to.equal(2);
        done();
      }, 10);
    });

    it('should return an updated array if scaling has changed', function(done) {
      var scene = new Scene();
      var callCount = 0;

      // Trigger cache updates, which will make the caches valid, which
      // allows the caches to be invalidated when properties are changed.
      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      scene.objects.add(object);

      var vertices = object.getVerticesForTree(scene);
      object.scalingX = 2;
      vertices = object.getVerticesForTree(scene);
      object.scalingY = 2;
      vertices = object.getVerticesForTree(scene);

      setTimeout(function() {
        expect(callCount).to.equal(3);
        done();
      }, 10);
    });

    it('should return an updated array if origin has changed', function(done) {
      var scene = new Scene();
      var callCount = 0;

      // Trigger cache updates, which will make the caches valid, which
      // allows the caches to be invalidated when properties are changed.
      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function(opt_reference) {
          expect(opt_reference).to.be(scene);
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      scene.objects.add(object);

      var vertices = object.getVerticesForTree(scene);
      object.originX = 2;
      vertices = object.getVerticesForTree(scene);
      object.originY = 2;
      vertices = object.getVerticesForTree(scene);

      setTimeout(function() {
        expect(callCount).to.equal(3);
        done();
      }, 10);
    });

    it('should return an updated array if a child has changed', function(done) {
      var callCount = 0;

      // Trigger cache updates, which will make the caches valid, which
      // allows the caches to be invalidated when properties are changed.
      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function() {
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      var child = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function() {
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      object.children.add(child);

      var vertices = object.getVerticesForTree();
      child.x = 200;
      vertices = object.getVerticesForTree();

      setTimeout(function() {
        expect(callCount).to.equal(4);
        done();
      }, 10);
    });

    it('should return an updated array if a parent has changed', function(done) {
      var callCount = 0;

      // Trigger cache updates, which will make the caches valid, which
      // allows the caches to be invalidated when properties are changed.
      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });

      var child = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function() {
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      object.children.add(child);

      updateCache(object.cache);

      var vertices = child.getVerticesForTree();
      object.x = 200;
      vertices = child.getVerticesForTree();

      setTimeout(function() {
        expect(callCount).to.equal(2);
        done();
      }, 10);
    });

    it('should return an updated array if a different reference is passed', function(done) {
      var callCount = 0;

      // Trigger cache updates, which will make the caches valid, which
      // allows the caches to be invalidated when properties are changed.
      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      var parent = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });

      var object = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });

      var child = new CanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        getVertices: function() {
          updateCache(this.cache);
          callCount++;
          return [];
        }
      });

      parent.children.add(object);
      object.children.add(child);

      updateCache(object.cache);

      var vertices = child.getVerticesForTree(object);
      vertices = child.getVerticesForTree(parent);

      setTimeout(function() {
        expect(callCount).to.equal(2);
        done();
      }, 10);
    });

  });

  describe('#getBoundingRectangle()', function() {

    it('should return an object with data about the bounding rectangle, with no reference', function() {
      var object = new CanvasObject();
      object.getVertices = function(opt_reference) {
        expect(opt_reference).to.not.be.ok();
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      var rect = object.getBoundingRectangle();
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the immediate parent', function() {
      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVertices = function(opt_reference) {
        expect(opt_reference).to.equal(parent);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      parent.children.add(object);

      var rect = object.getBoundingRectangle(parent);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to a parent further out', function() {
      var outerParent = new CanvasObject();
      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVertices = function(opt_reference) {
        expect(opt_reference).to.equal(outerParent);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      outerParent.children.add(parent);
      parent.children.add(object);

      var rect = object.getBoundingRectangle(outerParent);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the scene', function() {
      var scene = new Scene();
      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVertices = function(opt_reference) {
        expect(opt_reference).to.equal(scene);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      scene.objects.add(parent);
      parent.children.add(object);

      var rect = object.getBoundingRectangle(scene);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the camera', function() {
      var scene = new Scene();
      var camera = new Camera();
      scene.cameras.add(camera);

      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVertices = function(opt_reference) {
        expect(opt_reference).to.equal(camera);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      scene.objects.add(parent);
      parent.children.add(object);

      var rect = object.getBoundingRectangle(camera);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the canvas', function() {
      var scene = new Scene();
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      scene.cameras.add(camera);

      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVertices = function(opt_reference) {
        expect(opt_reference).to.equal(canvas);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      scene.objects.add(parent);
      parent.children.add(object);

      var rect = object.getBoundingRectangle(canvas);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return data only for this object, not its children', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      object1.getVertices = function() {
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object2.getVertices = function() {
        return [{x: 100, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}];
      };
      var rect = object1.getBoundingRectangle();
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return a cached rectangle if nothing has changed', function() {
      var object = new CanvasObject();
      var numCalls = 0;
      object.getVertices = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangle();
      object.getBoundingRectangle();

      expect(numCalls).to.equal(1);
    });

    it('should return an updated rectangle if something has changed', function() {
      var object = new CanvasObject();
      var numCalls = 0;

      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
      };

      object.getVertices = function() {
        numCalls++;
        updateCache(this.cache);
        var x = this.x;
        return [{x: x, y: 0}, {x: x + 100, y: 0}, {x: x + 100, y: 50}];
      };
      object.getBoundingRectangle();
      object.x = 100;
      var rect = object.getBoundingRectangle();

      expect(numCalls).to.equal(2);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(200);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(100);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return a cached rectangle if the reference is the same', function() {
      var parent = new CanvasObject();
      var object = new CanvasObject();
      parent.children.add(object);

      var numCalls = 0;
      object.getVertices = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangle(parent);
      object.getBoundingRectangle(parent);

      expect(numCalls).to.equal(1);
    });

    it('should return an updared rectangle if a different reference is passed', function() {
      var outerParent = new CanvasObject();
      var parent = new CanvasObject();
      var object = new CanvasObject();
      outerParent.children.add(parent);
      parent.children.add(object);

      var numCalls = 0;
      object.getVertices = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangle(parent);
      object.getBoundingRectangle(outerParent);

      expect(numCalls).to.equal(2);
    });

  });

  describe('#getBoundingRectangleForTree()', function() {

    it('should return an object with data about the bounding rectangle, with no reference', function() {
      var object = new CanvasObject();
      object.getVerticesForTree = function() {
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      var rect = object.getBoundingRectangleForTree();
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the immediate parent', function() {
      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVerticesForTree = function(opt_reference) {
        expect(opt_reference).to.equal(parent);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      parent.children.add(object);

      var rect = object.getBoundingRectangleForTree(parent);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to a parent further out', function() {
      var outerParent = new CanvasObject();
      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVerticesForTree = function(opt_reference) {
        expect(opt_reference).to.equal(outerParent);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      outerParent.children.add(parent);
      parent.children.add(object);

      var rect = object.getBoundingRectangleForTree(outerParent);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the scene', function() {
      var scene = new Scene();
      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVerticesForTree = function(opt_reference) {
        expect(opt_reference).to.equal(scene);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      scene.objects.add(parent);
      parent.children.add(object);

      var rect = object.getBoundingRectangleForTree(scene);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the camera', function() {
      var scene = new Scene();
      var camera = new Camera();
      scene.cameras.add(camera);

      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVerticesForTree = function(opt_reference) {
        expect(opt_reference).to.equal(camera);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      scene.objects.add(parent);
      parent.children.add(object);

      var rect = object.getBoundingRectangleForTree(camera);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(100);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return an object with data about the bounding rectangle, with reference set to the canvas', function() {
      var scene = new Scene();
      var camera = new Camera();
      scene.cameras.add(camera);
      var canvas = new Canvas({camera: camera});

      var parent = new CanvasObject();
      var object = new CanvasObject();

      // Since getVertices is not implemented in this base class, we need to
      // fake it, and because of that, we can't do all the work to transform
      // the coordinates to the reference. However, we check that the reference
      // passed to getVertices is the expected one.
      object.getVerticesForTree = function(opt_reference) {
        expect(opt_reference).to.equal(canvas);
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      scene.objects.add(parent);
      parent.children.add(object);

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
      object1.getVerticesForTree = function() {
        var vertices = [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
        var childVertices = object2.getVerticesForTree();
        return vertices.concat(childVertices);
      };
      object2.getVerticesForTree = function() {
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
      var object = new CanvasObject();
      var numCalls = 0;
      object.getVerticesForTree = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangleForTree();
      object.getBoundingRectangleForTree();

      expect(numCalls).to.equal(1);
    });

    it('should return an updated rectangle if something has changed', function() {
      var object = new CanvasObject();
      var numCalls = 0;

      var updateCache = function(cache) {
        cache.update('translation').update('rotation').update('scaling');
        cache.update('transformations').update('combinedTransformations');
        cache.update('vertices-local').update('vertices-reference');
        cache.update('vertices-tree-local').update('vertices-tree-reference');
        cache.update('bounds-local').update('bounds-reference');
        cache.update('bounds-tree-local').update('bounds-tree-reference');
      };

      object.getVerticesForTree = function() {
        numCalls++;
        updateCache(this.cache);
        var x = this.x;
        return [{x: x, y: 0}, {x: x + 100, y: 0}, {x: x + 100, y: 50}];
      };
      object.getBoundingRectangleForTree();
      object.x = 100;
      var rect = object.getBoundingRectangleForTree();

      expect(numCalls).to.equal(2);
      expect(rect.top).to.equal(0);
      expect(rect.right).to.equal(200);
      expect(rect.bottom).to.equal(50);
      expect(rect.left).to.equal(100);
      expect(rect.width).to.equal(100);
      expect(rect.height).to.equal(50);
    });

    it('should return a cached rectangle if the reference is the same', function() {
      var parent = new CanvasObject();
      var object = new CanvasObject();
      parent.children.add(object);

      var numCalls = 0;
      object.getVerticesForTree = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangleForTree(parent);
      object.getBoundingRectangleForTree(parent);

      expect(numCalls).to.equal(1);
    });

    it('should return an updared rectangle if a different reference is passed', function() {
      var outerParent = new CanvasObject();
      var parent = new CanvasObject();
      var object = new CanvasObject();
      outerParent.children.add(parent);
      parent.children.add(object);

      var numCalls = 0;
      object.getVerticesForTree = function() {
        numCalls++;
        return [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}];
      };
      object.getBoundingRectangleForTree(parent);
      object.getBoundingRectangleForTree(outerParent);

      expect(numCalls).to.equal(2);
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
      expect(object.cache.get('combinedTransformations')).to.not.equal(null);
    });

    it('should have a cache unit for an input point to getPointIn', function() {
      expect(object.cache.get('getPointIn-input')).to.not.equal(null);
    });

    it('should have a cache unit for an output point from getPointIn', function() {
      expect(object.cache.get('getPointIn-output')).to.not.equal(null);
    });

    it('should have a cache unit for local vertices', function() {
      expect(object.cache.get('vertices-local')).to.not.equal(null);
    });

    it('should have a cache unit for vertices relative to the reference', function() {
      expect(object.cache.get('vertices-reference')).to.not.equal(null);
    });

    it('should have a cache unit for local vertices for a subtree of objects', function() {
      expect(object.cache.get('vertices-tree-local')).to.not.equal(null);
    });

    it('should have a cache unit for vertices relative to the reference for a subtree of objects', function() {
      expect(object.cache.get('vertices-tree-reference')).to.not.equal(null);
    });

    it('should have a cache unit for a local bounding rectangle', function() {
      expect(object.cache.get('bounds-local')).to.not.equal(null);
    });

    it('should have a cache unit for a bounding rectangle relative to a reference', function() {
      expect(object.cache.get('bounds-reference')).to.not.equal(null);
    });

    it('should have a cache unit for a local bounding rectangle for a subtree of objects', function() {
      expect(object.cache.get('bounds-tree-local')).to.not.equal(null);
    });

    it('should have a cache unit for a bounding rectangle for a subtree of objects, relative to a reference', function() {
      expect(object.cache.get('bounds-tree-reference')).to.not.equal(null);
    });

    it('should invalidate `bounds-tree-local` on parent when `bounds-tree-local` is invalidated on this object', function() {
      var object = new CanvasObject();
      var parent = new CanvasObject();
      parent.children.add(object);

      parent.cache.update('bounds-tree-local');
      object.cache.update('bounds-tree-local');

      expect(parent.cache.test('bounds-tree-local')).to.equal(true);
      expect(object.cache.test('bounds-tree-local')).to.equal(true);

      object.cache.invalidate('bounds-tree-local');

      expect(parent.cache.test('bounds-tree-local')).to.equal(false);
      expect(object.cache.test('bounds-tree-local')).to.equal(false);
    });

    it('should invalidate `bounds-tree-reference` on parent when `bounds-tree-reference` is invalidated on this object', function() {
      var object = new CanvasObject();
      var parent = new CanvasObject();
      parent.children.add(object);

      parent.cache.update('bounds-tree-reference');
      object.cache.update('bounds-tree-reference');

      expect(parent.cache.test('bounds-tree-reference')).to.equal(true);
      expect(object.cache.test('bounds-tree-reference')).to.equal(true);

      object.cache.invalidate('bounds-tree-reference');

      expect(parent.cache.test('bounds-tree-reference')).to.equal(false);
      expect(object.cache.test('bounds-tree-reference')).to.equal(false);
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
