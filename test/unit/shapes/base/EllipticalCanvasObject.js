var expect = require('expect.js');
var round = require('../../../utils/round');

var CanvasObject = require('../../../../shapes/base/CanvasObject');
var EllipticalCanvasObject = require('../../../../shapes/base/EllipticalCanvasObject');
var Collection = require('../../../../classes/Collection');
var Camera = require('../../../../classes/Camera');
var Scene = require('../../../../classes/Scene');
var Canvas = require('../../../../classes/Canvas');
var jsonHelpers = require('../../../../utils/json');

describe('EllipticalCanvasObject', function() {

  it('should inherit from CanvasObject', function() {
    var object = new EllipticalCanvasObject();
    expect(EllipticalCanvasObject.prototype instanceof CanvasObject).to.equal(true);
    expect(object instanceof CanvasObject).to.equal(true);
    expect(object.renderTree).to.equal(CanvasObject.prototype.renderTree);
  });

  describe('EllipticalCanvasObject constructor', function() {

    var object = new EllipticalCanvasObject({name: 'EllipticalCanvasObject'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('EllipticalCanvasObject');
    });

    it('should set the default value of property `radiusX` to 0', function() {
      expect(object.radiusX).to.equal(0);
    });

    it('should set the default value of property `radiusY` to 0', function() {
      expect(object.radiusY).to.equal(0);
    });

  });

  describe('.objectProperties', function() {

    it('should be an array of property names', function() {
      expect(Array.isArray(EllipticalCanvasObject.objectProperties)).to.equal(true);
      expect(typeof EllipticalCanvasObject.objectProperties[0]).to.equal('string');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'EllipticalCanvasObject': EllipticalCanvasObject,
      'Collection': Collection
    });

    var data = {
      __class__: 'EllipticalCanvasObject',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      radiusX: 100,
      radiusY: 50,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'EllipticalCanvasObject',
            x: 10,
            y: 20
          }
        ]
      }
    };

    it('should create an EllipticalCanvasObject instance from a data object', function() {
      var object = EllipticalCanvasObject.fromObject(data);

      expect(object instanceof EllipticalCanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.radiusX).to.equal(data.radiusX);
      expect(object.radiusY).to.equal(data.radiusY);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof EllipticalCanvasObject).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'EllipticalCanvasObject': EllipticalCanvasObject,
      'Collection': Collection
    });

    var data = {
      __class__: 'EllipticalCanvasObject',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      radiusX: 100,
      radiusY: 50,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'EllipticalCanvasObject',
            x: 10,
            y: 20
          }
        ]
      }
    };
    var json = JSON.stringify(data);

    it('should create an EllipticalCanvasObject instance from a JSON string', function() {
      var object = EllipticalCanvasObject.fromJSON(json);

      expect(object instanceof EllipticalCanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.radiusX).to.equal(data.radiusX);
      expect(object.radiusY).to.equal(data.radiusY);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof EllipticalCanvasObject).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var object = new EllipticalCanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
        radiusX: 100,
        radiusY: 50,
        rotation: 98,
        fill: 'red',
        stroke: '10px green',
        opacity: 0.5
      });
      var object2 = new EllipticalCanvasObject({
        x: 10,
        y: 20
      });
      object.children.add(object2);

      var data = object.toObject();

      var props = EllipticalCanvasObject.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(object[props[i]]);
      }

      expect(data.__class__).to.equal('EllipticalCanvasObject');
      expect(typeof data.children).to.equal('object');
      expect(data.children.__class__).to.equal('Collection');
      expect(Array.isArray(data.children.items)).to.equal(true);
      expect(typeof data.children.items[0]).to.equal('object');
      expect(data.children.items[0].__class__).to.equal('EllipticalCanvasObject');
      expect(data.children.items[0].x).to.equal(10);
      expect(data.children.items[0].y).to.equal(20);
    });

  });

  describe('#toJSON()', function() {

    it('should create JSON string from all specified properties', function() {
      var object = new EllipticalCanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
        rotation: 98,
        fill: 'red',
        stroke: '10px green',
        opacity: 0.5
      });
      var object2 = new EllipticalCanvasObject({
        x: 10,
        y: 20
      });
      object.children.add(object2);

      var json = object.toJSON();
      var data = JSON.parse(json);

      var props = EllipticalCanvasObject.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(object[props[i]]);
      }

      expect(data.__class__).to.equal('EllipticalCanvasObject');
      expect(typeof data.children).to.equal('object');
      expect(data.children.__class__).to.equal('Collection');
      expect(Array.isArray(data.children.items)).to.equal(true);
      expect(typeof data.children.items[0]).to.equal('object');
      expect(data.children.items[0].__class__).to.equal('EllipticalCanvasObject');
      expect(data.children.items[0].x).to.equal(10);
      expect(data.children.items[0].y).to.equal(20);
    });

  });

  describe('#calculateOrigin()', function() {

    var object = new EllipticalCanvasObject({
      radiusX: 200,
      radiusY: 100
    });

    it('should return an object with x/y properties', function() {
      var origin = object.calculateOrigin();
      expect(origin).to.be.an('object');
      expect(origin.x).to.be.a('number');
      expect(origin.y).to.be.a('number');
    });

    it('should return a number if an axis is passed', function() {
      var originX = object.calculateOrigin('x');
      var originY = object.calculateOrigin('y');
      expect(originX).to.be.a('number');
      expect(originY).to.be.a('number');
    });

    it('should return 0 if an invalid axis is passed', function() {
      object.originX = 'right';
      object.originY = 'bottom';
      var origin = object.calculateOrigin('foo');
      expect(origin).to.equal(0);
    });

    it('should return x=-radiusX for originX=left', function() {
      object.originX = 'left';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(-object.radiusX);
    });

    it('should return x=radiusX for originX=right', function() {
      object.originX = 'right';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(object.radiusX);
    });

    it('should return x=0 for originX=center', function() {
      object.originX = 'center';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(0);
    });

    it('should return x=37 for originX=37', function() {
      object.originX = 37;
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(37);
    });

    it('should return x=0 for originX=foo', function() {
      object.originX = 'foo';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(0);
    });

    it('should return y=-radiusY for originY=top', function() {
      object.originY = 'top';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(-object.radiusY);
    });

    it('should return y=radiusY for originY=bottom', function() {
      object.originY = 'bottom';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(object.radiusY);
    });

    it('should return y=0 for originY=center', function() {
      object.originY = 'center';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(0);
    });

    it('should return y=37 for originY=37', function() {
      object.originY = 37;
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(37);
    });

    it('should return y=0 for originY=foo', function() {
      object.originY = 'foo';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(0);
    });

  });

  describe('#getVertices()', function() {

    it('should return the coordinates of all vertices of the object', function() {
      var object = new EllipticalCanvasObject({radiusX: 100, radiusY: 50});
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 50});
      expect(vertices[3]).to.eql({x: -100, y: 0});
    });

    it('should return the coordinates of all vertices of the object, including the stroke', function() {
      var object = new EllipticalCanvasObject({radiusX: 100, radiusY: 50, stroke: '10px #f00'});
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -60});
      expect(vertices[1]).to.eql({x: 110, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 60});
      expect(vertices[3]).to.eql({x: -110, y: 0});
    });

    it('should return the coordinates of all vertices of the object, respecting origin', function() {
      var object = new EllipticalCanvasObject({
        radiusX: 100,
        radiusY: 50,
        originX: 'right',
        originY: 'bottom'
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: -100, y: -100});
      expect(vertices[1]).to.eql({x: 0, y: -50});
      expect(vertices[2]).to.eql({x: -100, y: 0});
      expect(vertices[3]).to.eql({x: -200, y: -50});
    });

    it('should return a cached array if nothing has changed', function(done) {
      var object = new EllipticalCanvasObject({radiusX: 100, radiusY: 50});
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -50});

      var hasBeenSet = false;
      var x = vertices[0].x;
      Object.defineProperty(vertices[0], 'x', {
        get: function() { return x; },
        set: function(value) {
          x = value;
          hasBeenSet = true;
        }
      });

      object.getVertices();

      setTimeout(function() {
        if (hasBeenSet) done(new Error('The vertex was updated and did not use the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array if radiusX has changed', function() {
      var object = new EllipticalCanvasObject({radiusX: 100, radiusY: 50});
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 50});
      expect(vertices[3]).to.eql({x: -100, y: 0});

      object.radiusX = 200;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 200, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 50});
      expect(vertices[3]).to.eql({x: -200, y: 0});
    });

    it('should return an updated array if radiusY has changed', function() {
      var object = new EllipticalCanvasObject({radiusX: 100, radiusY: 50});
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 50});
      expect(vertices[3]).to.eql({x: -100, y: 0});

      object.radiusY = 100;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -100});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 100});
      expect(vertices[3]).to.eql({x: -100, y: 0});
    });

    it('should return an updated array if stroke has changed', function() {
      var object = new EllipticalCanvasObject({
        radiusX: 100,
        radiusY: 50,
        stroke: '10px red'
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -60});
      expect(vertices[1]).to.eql({x: 110, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 60});
      expect(vertices[3]).to.eql({x: -110, y: 0});

      object.stroke = '20px red';
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -70});
      expect(vertices[1]).to.eql({x: 120, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 70});
      expect(vertices[3]).to.eql({x: -120, y: 0});
    });

    it('should return an updated array if originX has changed', function() {
      var object = new EllipticalCanvasObject({
        radiusX: 100,
        radiusY: 50,
        originX: 0
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 50});
      expect(vertices[3]).to.eql({x: -100, y: 0});

      object.originX = 10;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: -10, y: -50});
      expect(vertices[1]).to.eql({x: 90, y: 0});
      expect(vertices[2]).to.eql({x: -10, y: 50});
      expect(vertices[3]).to.eql({x: -110, y: 0});
    });

    it('should return an updated array if originY has changed', function() {
      var object = new EllipticalCanvasObject({
        radiusX: 100,
        radiusY: 50,
        originY: 0
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 0, y: 50});
      expect(vertices[3]).to.eql({x: -100, y: 0});

      object.originY = 10;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -60});
      expect(vertices[1]).to.eql({x: 100, y: -10});
      expect(vertices[2]).to.eql({x: 0, y: 40});
      expect(vertices[3]).to.eql({x: -100, y: -10});
    });

    it('should return an updated array if a parent moves', function() {
      var scene = new Scene();

      var parent = new EllipticalCanvasObject({
        radiusX: 100,
        radiusY: 50
      });
      var object = new EllipticalCanvasObject({
        radiusX: 100,
        radiusY: 50
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: -100, y: -50});
      expect(vertices[1]).to.eql({x: 100, y: -50});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: -100, y: 50});

      parent.x = 100;
      vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 200, y: -50});
      expect(vertices[2]).to.eql({x: 200, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});
    });

    it('should return the coordinates of all vertices relative to the reference set to the immediate parent', function() {
      var parent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45,
        scalingX: 0.5, scalingY: 2
      });
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45,
        scalingX: 0.5, scalingY: 2
      });
      parent.children.add(object);

      var vertices = object.getVertices(parent);

      expect(vertices[0]).to.eql({x: 20.943058495790524, y: -29.05694150420949});
      expect(vertices[1]).to.eql({x: 179.05694150420948, y: -29.05694150420949});
      expect(vertices[2]).to.eql({x: 179.05694150420948, y: 129.05694150420948});
      expect(vertices[3]).to.eql({x: 20.943058495790524, y: 129.05694150420948});
    });

    it('should return the coordinates of all vertices relative to the reference set to a parent further out', function() {
      var outerParent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var parent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });

      outerParent.children.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(outerParent);

      expect(round(vertices[0].x, 3)).to.equal(85.355);
      expect(round(vertices[0].y, 3)).to.equal(56.066);
      expect(round(vertices[1].x, 3)).to.equal(185.355);
      expect(round(vertices[1].y, 3)).to.equal(56.066);
      expect(round(vertices[2].x, 3)).to.equal(185.355);
      expect(round(vertices[2].y, 3)).to.equal(256.066);
      expect(round(vertices[3].x, 3)).to.equal(85.355);
      expect(round(vertices[3].y, 3)).to.equal(256.066);
    });

    it('should return the coordinates of all vertices relative to the reference set to the scene', function() {
      var scene = new Scene();
      var parent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(scene);

      expect(round(vertices[0].x, 3)).to.equal(85.355);
      expect(round(vertices[0].y, 3)).to.equal(56.066);
      expect(round(vertices[1].x, 3)).to.equal(185.355);
      expect(round(vertices[1].y, 3)).to.equal(56.066);
      expect(round(vertices[2].x, 3)).to.equal(185.355);
      expect(round(vertices[2].y, 3)).to.equal(256.066);
      expect(round(vertices[3].x, 3)).to.equal(85.355);
      expect(round(vertices[3].y, 3)).to.equal(256.066);
    });

    it('should return the coordinates of all vertices relative to the reference set to the camera', function() {
      var scene = new Scene();

      var camera = new Camera({
        width: 400, height: 300,
        x: -100, y: 150,
        rotation: 45
      });
      scene.cameras.add(camera);

      var parent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(camera);

      expect(round(vertices[0].x, 3)).to.equal(91.654);
      expect(round(vertices[0].y, 3)).to.equal(-241.189);
      expect(round(vertices[1].x, 3)).to.equal(249.768);
      expect(round(vertices[1].y, 3)).to.equal(-241.189);
      expect(round(vertices[2].x, 3)).to.equal(249.768);
      expect(round(vertices[2].y, 3)).to.equal(-83.075);
      expect(round(vertices[3].x, 3)).to.equal(91.654);
      expect(round(vertices[3].y, 3)).to.equal(-83.075);
    });

    it('should return the coordinates of all vertices relative to the reference set to the canvas', function() {
      var scene = new Scene();

      var camera = new Camera({
        width: 400, height: 300,
        x: -100, y: 150,
        rotation: 45
      });
      scene.cameras.add(camera);

      var canvas = new Canvas({
        width: 400, height: 300,
        camera: camera
      });

      var parent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        rotation: 45
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(canvas);

      expect(round(vertices[0].x, 3)).to.equal(291.654);
      expect(round(vertices[0].y, 3)).to.equal(-91.189);
      expect(round(vertices[1].x, 3)).to.equal(449.768);
      expect(round(vertices[1].y, 3)).to.equal(-91.189);
      expect(round(vertices[2].x, 3)).to.equal(449.768);
      expect(round(vertices[2].y, 3)).to.equal(66.925);
      expect(round(vertices[3].x, 3)).to.equal(291.654);
      expect(round(vertices[3].y, 3)).to.equal(66.925);
    });

    it('should return a cached array for reference if nothing has changed', function(done) {
      var scene = new Scene();
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50
      });

      scene.objects.add(object);

      var vertices = object.getVertices(scene);

      expect(vertices[2]).to.eql({x: 200, y: 100});

      var hasBeenSet = false;
      var x = vertices[0].x;
      Object.defineProperty(vertices[0], 'x', {
        get: function() { return x; },
        set: function(value) {
          x = value;
          hasBeenSet = true;
        }
      });

      object.getVertices(scene);

      setTimeout(function() {
        if (hasBeenSet) done(new Error('The vertex was updated and did not use the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array if radiusX has changed, with reference', function() {
      var scene = new Scene();
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50
      });

      scene.objects.add(object);

      var vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 200, y: 0});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 0, y: 100});

      object.radiusX = 200;
      vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: -100, y: 0});
      expect(vertices[1]).to.eql({x: 300, y: 0});
      expect(vertices[2]).to.eql({x: 300, y: 100});
      expect(vertices[3]).to.eql({x: -100, y: 100});
    });

    it('should return an updated array if radiusY has changed, with reference', function() {
      var scene = new Scene();
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50
      });

      scene.objects.add(object);

      var vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 200, y: 0});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 0, y: 100});

      object.radiusY = 100;
      vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 0, y: -50});
      expect(vertices[1]).to.eql({x: 200, y: -50});
      expect(vertices[2]).to.eql({x: 200, y: 150});
      expect(vertices[3]).to.eql({x: 0, y: 150});
    });

    it('should return an updated array if a different reference is passed', function() {
      var scene = new Scene();
      var outerParent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50
      });
      var parent = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50
      });
      var object = new EllipticalCanvasObject({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50
      });

      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(parent);

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 200, y: 0});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 0, y: 100});

      vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 200, y: 100});
      expect(vertices[1]).to.eql({x: 400, y: 100});
      expect(vertices[2]).to.eql({x: 400, y: 200});
      expect(vertices[3]).to.eql({x: 200, y: 200});
    });

  });

});
