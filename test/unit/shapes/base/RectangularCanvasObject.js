var expect = require('expect.js');
var round = require('../../../utils/round');

var CanvasObject = require('../../../../shapes/base/CanvasObject');
var RectangularCanvasObject = require('../../../../shapes/base/RectangularCanvasObject');
var Collection = require('../../../../classes/Collection');
var Camera = require('../../../../classes/Camera');
var Scene = require('../../../../classes/Scene');
var Canvas = require('../../../../classes/Canvas');
var jsonHelpers = require('../../../../utils/json');

describe('RectangularCanvasObject', function() {

  it('should inherit from CanvasObject', function() {
    var object = new RectangularCanvasObject();
    expect(RectangularCanvasObject.prototype instanceof CanvasObject).to.equal(true);
    expect(object instanceof CanvasObject).to.equal(true);
    expect(object.renderTree).to.equal(CanvasObject.prototype.renderTree);
  });

  describe('RectangularCanvasObject constructor', function() {

    var object = new RectangularCanvasObject({name: 'RectangularCanvasObject'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('RectangularCanvasObject');
    });

    it('should set the default value of property `width` to 0', function() {
      expect(object.width).to.equal(0);
    });

    it('should set the default value of property `height` to 0', function() {
      expect(object.height).to.equal(0);
    });

  });

  describe('.objectProperties', function() {

    it('should be an array of property names', function() {
      expect(Array.isArray(RectangularCanvasObject.objectProperties)).to.equal(true);
      expect(typeof RectangularCanvasObject.objectProperties[0]).to.equal('string');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'RectangularCanvasObject': RectangularCanvasObject,
      'Collection': Collection
    });

    var data = {
      __class__: 'RectangularCanvasObject',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      width: 100,
      height: 50,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'RectangularCanvasObject',
            x: 10,
            y: 20
          }
        ]
      }
    };

    it('should create a RectangularCanvasObject instance from a data object', function() {
      var object = RectangularCanvasObject.fromObject(data);

      expect(object instanceof RectangularCanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.width).to.equal(data.width);
      expect(object.height).to.equal(data.height);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof RectangularCanvasObject).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'RectangularCanvasObject': RectangularCanvasObject,
      'Collection': Collection
    });

    var data = {
      __class__: 'RectangularCanvasObject',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      width: 100,
      height: 50,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'RectangularCanvasObject',
            x: 10,
            y: 20
          }
        ]
      }
    };
    var json = JSON.stringify(data);

    it('should create a RectangularCanvasObject instance from a JSON string', function() {
      var object = RectangularCanvasObject.fromJSON(json);

      expect(object instanceof RectangularCanvasObject).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.width).to.equal(data.width);
      expect(object.height).to.equal(data.height);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof RectangularCanvasObject).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var object = new RectangularCanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
        width: 100,
        height: 50,
        rotation: 98,
        fill: 'red',
        stroke: '10px green',
        opacity: 0.5
      });
      var object2 = new RectangularCanvasObject({
        x: 10,
        y: 20
      });
      object.children.add(object2);

      var data = object.toObject();

      var props = RectangularCanvasObject.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(object[props[i]]);
      }

      expect(data.__class__).to.equal('RectangularCanvasObject');
      expect(typeof data.children).to.equal('object');
      expect(data.children.__class__).to.equal('Collection');
      expect(Array.isArray(data.children.items)).to.equal(true);
      expect(typeof data.children.items[0]).to.equal('object');
      expect(data.children.items[0].__class__).to.equal('RectangularCanvasObject');
      expect(data.children.items[0].x).to.equal(10);
      expect(data.children.items[0].y).to.equal(20);
    });

  });

  describe('#toJSON()', function() {

    it('should create JSON string from all specified properties', function() {
      var object = new RectangularCanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
        rotation: 98,
        fill: 'red',
        stroke: '10px green',
        opacity: 0.5
      });
      var object2 = new RectangularCanvasObject({
        x: 10,
        y: 20
      });
      object.children.add(object2);

      var json = object.toJSON();
      var data = JSON.parse(json);

      var props = RectangularCanvasObject.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(object[props[i]]);
      }

      expect(data.__class__).to.equal('RectangularCanvasObject');
      expect(typeof data.children).to.equal('object');
      expect(data.children.__class__).to.equal('Collection');
      expect(Array.isArray(data.children.items)).to.equal(true);
      expect(typeof data.children.items[0]).to.equal('object');
      expect(data.children.items[0].__class__).to.equal('RectangularCanvasObject');
      expect(data.children.items[0].x).to.equal(10);
      expect(data.children.items[0].y).to.equal(20);
    });

  });

  describe('#calculateOrigin()', function() {

    var object = new RectangularCanvasObject({
      width: 200,
      height: 100
    });

    it('should return an object with x/y properties', function() {
      var origin = object.calculateOrigin();
      expect(origin.x).to.not.equal(undefined);
      expect(origin.y).to.not.equal(undefined);
    });

    it('should return x=0 for originX=left', function() {
      object.originX = 'left';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(0);
    });

    it('should return x=width for originX=right', function() {
      object.originX = 'right';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(object.width);
    });

    it('should return x=width/2 for originX=center', function() {
      object.originX = 'center';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(object.width / 2);
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

    it('should return y=0 for originY=top', function() {
      object.originY = 'top';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(0);
    });

    it('should return y=height for originY=bottom', function() {
      object.originY = 'bottom';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(object.height);
    });

    it('should return y=height/2 for originY=center', function() {
      object.originY = 'center';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(object.height / 2);
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
      var object = new RectangularCanvasObject({width: 100, height: 50});
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});
    });

    it('should return the coordinates of all vertices of the object, including the stroke', function() {
      var object = new RectangularCanvasObject({width: 100, height: 50, stroke: '10px #f00'});
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: -10, y: -10});
      expect(vertices[1]).to.eql({x: 110, y: -10});
      expect(vertices[2]).to.eql({x: 110, y: 60});
      expect(vertices[3]).to.eql({x: -10, y: 60});
    });

    it('should return the coordinates of all vertices of the object, respecting origin', function() {
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50,
        originX: 'center',
        originY: 'center'
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: -50, y: -25});
      expect(vertices[1]).to.eql({x: 50, y: -25});
      expect(vertices[2]).to.eql({x: 50, y: 25});
      expect(vertices[3]).to.eql({x: -50, y: 25});
    });

    it('should return a cached array if nothing has changed', function(done) {
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50,
        originX: 'center',
        originY: 'center'
      });
      var vertices = object.getVertices();

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

      object.getVertices();

      setTimeout(function() {
        if (hasBeenSet) done(new Error('The vertex was updated and did not use the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array if width has changed', function() {
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});

      object.width = 200;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 200, y: 0});
      expect(vertices[2]).to.eql({x: 200, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});
    });

    it('should return an updated array if height has changed', function() {
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});

      object.height = 100;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 100});
      expect(vertices[3]).to.eql({x: 0, y: 100});
    });

    it('should return an updated array if stroke has changed', function() {
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50,
        stroke: '10px red'
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: -10, y: -10});
      expect(vertices[1]).to.eql({x: 110, y: -10});
      expect(vertices[2]).to.eql({x: 110, y: 60});
      expect(vertices[3]).to.eql({x: -10, y: 60});

      object.stroke = '20px red';
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: -20, y: -20});
      expect(vertices[1]).to.eql({x: 120, y: -20});
      expect(vertices[2]).to.eql({x: 120, y: 70});
      expect(vertices[3]).to.eql({x: -20, y: 70});
    });

    it('should return an updated array if originX has changed', function() {
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50,
        originX: 0
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});

      object.originX = 10;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: -10, y: 0});
      expect(vertices[1]).to.eql({x: 90, y: 0});
      expect(vertices[2]).to.eql({x: 90, y: 50});
      expect(vertices[3]).to.eql({x: -10, y: 50});
    });

    it('should return an updated array if originY has changed', function() {
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50,
        originY: 0
      });
      var vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});

      object.originY = 10;
      vertices = object.getVertices();

      expect(vertices[0]).to.eql({x: 0, y: -10});
      expect(vertices[1]).to.eql({x: 100, y: -10});
      expect(vertices[2]).to.eql({x: 100, y: 40});
      expect(vertices[3]).to.eql({x: 0, y: 40});
    });

    it('should return an updated array if a parent moves', function() {
      var scene = new Scene();

      var parent = new RectangularCanvasObject({
        width: 100,
        height: 50
      });
      var object = new RectangularCanvasObject({
        width: 100,
        height: 50
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 0, y: 0});
      expect(vertices[1]).to.eql({x: 100, y: 0});
      expect(vertices[2]).to.eql({x: 100, y: 50});
      expect(vertices[3]).to.eql({x: 0, y: 50});

      parent.x = 100;
      vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 100, y: 0});
      expect(vertices[1]).to.eql({x: 200, y: 0});
      expect(vertices[2]).to.eql({x: 200, y: 50});
      expect(vertices[3]).to.eql({x: 100, y: 50});
    });

    it('should return the coordinates of all vertices relative to the reference set to the immediate parent', function() {
      var parent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        scalingX: 0.5, scalingY: 2
      });
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        scalingX: 0.5, scalingY: 2
      });
      parent.children.add(object);

      var vertices = object.getVertices(parent);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 135.35533905932738, y: 85.35533905932738});
      expect(vertices[2]).to.eql({x: 64.64466094067264, y: 156.06601717798213});
      expect(vertices[3]).to.eql({x: 29.28932188134526, y: 120.71067811865476});
    });

    it('should return the coordinates of all vertices relative to the reference set to a parent further out', function() {
      var outerParent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var parent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });

      outerParent.children.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(outerParent);

      expect(round(vertices[0].x, 3)).to.equal(135.355);
      expect(round(vertices[0].y, 3)).to.equal(156.066);
      expect(round(vertices[1].x, 3)).to.equal(135.355);
      expect(round(vertices[1].y, 3)).to.equal(256.066);
      expect(round(vertices[2].x, 3)).to.equal(85.355);
      expect(round(vertices[2].y, 3)).to.equal(256.066);
      expect(round(vertices[3].x, 3)).to.equal(85.355);
      expect(round(vertices[3].y, 3)).to.equal(156.066);
    });

    it('should return the coordinates of all vertices relative to the reference set to the scene', function() {
      var scene = new Scene();
      var parent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(scene);

      expect(round(vertices[0].x, 3)).to.equal(135.355);
      expect(round(vertices[0].y, 3)).to.equal(156.066);
      expect(round(vertices[1].x, 3)).to.equal(135.355);
      expect(round(vertices[1].y, 3)).to.equal(256.066);
      expect(round(vertices[2].x, 3)).to.equal(85.355);
      expect(round(vertices[2].y, 3)).to.equal(256.066);
      expect(round(vertices[3].x, 3)).to.equal(85.355);
      expect(round(vertices[3].y, 3)).to.equal(156.066);
    });

    it('should return the coordinates of all vertices relative to the reference set to the camera', function() {
      var scene = new Scene();

      var camera = new Camera({
        width: 400, height: 300,
        x: -100, y: 150,
        rotation: 45
      });
      scene.cameras.add(camera);

      var parent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(camera);

      expect(round(vertices[0].x, 3)).to.equal(170.711);
      expect(round(vertices[0].y, 3)).to.equal(-162.132);
      expect(round(vertices[1].x, 3)).to.equal(241.421);
      expect(round(vertices[1].y, 3)).to.equal(-91.421);
      expect(round(vertices[2].x, 3)).to.equal(206.066);
      expect(round(vertices[2].y, 3)).to.equal(-56.066);
      expect(round(vertices[3].x, 3)).to.equal(135.355);
      expect(round(vertices[3].y, 3)).to.equal(-126.777);
    });

    it('should return the coordinates of all vertices relative to the reference set to the canvas', function() {
      var scene = new Scene();

      var camera = new Camera({
        width: 400, height: 300,
        x: 100, y: 150,
        rotation: 45
      });
      scene.cameras.add(camera);

      var canvas = new Canvas({
        width: 400, height: 300,
        camera: camera
      });

      var parent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45
      });

      scene.objects.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(canvas);

      expect(round(vertices[0].x, 3)).to.equal(229.289);
      expect(round(vertices[0].y, 3)).to.equal(129.289);
      expect(round(vertices[1].x, 3)).to.equal(300);
      expect(round(vertices[1].y, 3)).to.equal(200);
      expect(round(vertices[2].x, 3)).to.equal(264.645);
      expect(round(vertices[2].y, 3)).to.equal(235.355);
      expect(round(vertices[3].x, 3)).to.equal(193.934);
      expect(round(vertices[3].y, 3)).to.equal(164.645);
    });

    it('should return a cached array for reference if nothing has changed', function(done) {
      var scene = new Scene();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });

      scene.objects.add(object);

      var vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 100, y: 50});

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

    it('should return an updated array if width has changed', function() {
      var scene = new Scene();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });

      scene.objects.add(object);

      var vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});

      object.width = 200;
      vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 300, y: 50});
      expect(vertices[2]).to.eql({x: 300, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});
    });

    it('should return an updated array if a different reference is passed', function() {
      var scene = new Scene();
      var outerParent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });
      var parent = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });

      scene.objects.add(outerParent);
      outerParent.children.add(parent);
      parent.children.add(object);

      var vertices = object.getVertices(parent);

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});

      vertices = object.getVertices(scene);

      expect(vertices[0]).to.eql({x: 300, y: 150});
      expect(vertices[1]).to.eql({x: 400, y: 150});
      expect(vertices[2]).to.eql({x: 400, y: 200});
      expect(vertices[3]).to.eql({x: 300, y: 200});
    });

  });

});
