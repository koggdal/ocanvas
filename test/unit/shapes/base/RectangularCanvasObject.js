var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var RectangularCanvasObject = require('../../../../shapes/base/RectangularCanvasObject');
var Collection = require('../../../../classes/Collection');
var Camera = require('../../../../classes/Camera');
var World = require('../../../../classes/World');
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

  });

  describe('#getGlobalVertices()', function() {

    it('should return the coordinates of all vertices of the object', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        rotation: 45,
        scalingX: 0.5, scalingY: 2
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 135.35533905932738, y: 85.35533905932738});
      expect(vertices[2]).to.eql({x: 64.64466094067264, y: 156.06601717798213});
      expect(vertices[3]).to.eql({x: 29.28932188134526, y: 120.71067811865476});
    });

    it('should return the coordinates of all vertices of the object, including the stroke', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        stroke: '10px #f00'
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 90, y: 40});
      expect(vertices[1]).to.eql({x: 210, y: 40});
      expect(vertices[2]).to.eql({x: 210, y: 110});
      expect(vertices[3]).to.eql({x: 90, y: 110});
    });

    it('should return the coordinates of all vertices of the object, respecting origin', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        originX: 'center',
        originY: 'center'
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 50, y: 25});
      expect(vertices[1]).to.eql({x: 150, y: 25});
      expect(vertices[2]).to.eql({x: 150, y: 75});
      expect(vertices[3]).to.eql({x: 50, y: 75});
    });

    it('should return a cached array if nothing has changed', function(done) {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});

      var hasBeenSet = false;
      var zero = vertices[0];
      Object.defineProperty(vertices, '0', {
        get: function() { return zero; },
        set: function(value) {
          zero = value;
          hasBeenSet = true;
        }
      });

      object.getGlobalVertices({camera: camera});

      setTimeout(function() {
        if (hasBeenSet) done(new Error('The vertex was updated and did not use the cache'));
        else done();
      }, 10);
    });

    it('should return an updated array if width has changed', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});

      object.width = 200;
      vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 300, y: 50});
      expect(vertices[2]).to.eql({x: 300, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});
    });

    it('should return an updated array if height has changed', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});

      object.height = 100;
      vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 150});
      expect(vertices[3]).to.eql({x: 100, y: 150});
    });

    it('should return an updated array if stroke has changed', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        stroke: '10px red'
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 90, y: 40});
      expect(vertices[1]).to.eql({x: 210, y: 40});
      expect(vertices[2]).to.eql({x: 210, y: 110});
      expect(vertices[3]).to.eql({x: 90, y: 110});

      object.stroke = '20px red';
      vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 80, y: 30});
      expect(vertices[1]).to.eql({x: 220, y: 30});
      expect(vertices[2]).to.eql({x: 220, y: 120});
      expect(vertices[3]).to.eql({x: 80, y: 120});
    });

    it('should return an updated array if originX has changed', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        originX: 0
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});

      object.originX = 10;
      vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 90, y: 50});
      expect(vertices[1]).to.eql({x: 190, y: 50});
      expect(vertices[2]).to.eql({x: 190, y: 100});
      expect(vertices[3]).to.eql({x: 90, y: 100});
    });

    it('should return an updated array if originY has changed', function() {
      var camera = new Camera();
      var object = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50,
        originY: 0
      });
      var vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 50});
      expect(vertices[1]).to.eql({x: 200, y: 50});
      expect(vertices[2]).to.eql({x: 200, y: 100});
      expect(vertices[3]).to.eql({x: 100, y: 100});

      object.originY = 10;
      vertices = object.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 100, y: 40});
      expect(vertices[1]).to.eql({x: 200, y: 40});
      expect(vertices[2]).to.eql({x: 200, y: 90});
      expect(vertices[3]).to.eql({x: 100, y: 90});
    });

    it('should return an updated array if a parent has changed', function() {
      var camera = new Camera();
      var world = new World();
      world.cameras.add(camera);
      var object1 = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });
      world.objects.add(object1);
      var object2 = new RectangularCanvasObject({
        width: 100, height: 50,
        x: 100, y: 50
      });
      object1.children.add(object2);
      var vertices = object2.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 200, y: 100});
      expect(vertices[1]).to.eql({x: 300, y: 100});
      expect(vertices[2]).to.eql({x: 300, y: 150});
      expect(vertices[3]).to.eql({x: 200, y: 150});

      object1.y = 100;
      vertices = object2.getGlobalVertices({camera: camera});

      expect(vertices[0]).to.eql({x: 200, y: 150});
      expect(vertices[1]).to.eql({x: 300, y: 150});
      expect(vertices[2]).to.eql({x: 300, y: 200});
      expect(vertices[3]).to.eql({x: 200, y: 200});
    });

  });

});
