var expect = require('expect.js');
var Ellipse = require('../../../shapes/Ellipse');
var Circle = require('../../../shapes/Circle');
var Collection = require('../../../classes/Collection');
var jsonHelpers = require('../../../utils/json');

describe('Circle', function() {

  it('should inherit from Ellipse', function() {
    var object = new Circle();
    expect(Circle.prototype instanceof Ellipse).to.equal(true);
    expect(object instanceof Ellipse).to.equal(true);
    expect(object.calculateOrigin).to.equal(Ellipse.prototype.calculateOrigin);
  });

  describe('Circle constructor', function() {

    var object = new Circle({name: 'Circle'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('Circle');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'Circle': Circle,
      'Collection': Collection
    });

    var data = {
      __class__: 'Circle',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      radiusX: 100,
      radiusY: 100,
      radius: 100,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'Circle',
            x: 10,
            y: 20
          }
        ]
      }
    };

    it('should create an Circle instance from a data object', function() {
      var object = Circle.fromObject(data);

      expect(object instanceof Circle).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.radiusX).to.equal(data.radiusX);
      expect(object.radiusY).to.equal(data.radiusY);
      expect(object.radius).to.equal(data.radius);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof Circle).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'Circle': Circle,
      'Collection': Collection
    });

    var data = {
      __class__: 'Circle',
      x: 35,
      y: 25,
      originX: 'left',
      originY: 'bottom',
      radiusX: 100,
      radiusY: 100,
      radius: 100,
      rotation: 98,
      fill: 'red',
      stroke: '10px green',
      opacity: 0.5,
      children: {
        __class__: 'Collection',
        items: [
          {
            __class__: 'Circle',
            x: 10,
            y: 20
          }
        ]
      }
    };
    var json = JSON.stringify(data);

    it('should create an Circle instance from a JSON string', function() {
      var object = Circle.fromJSON(json);

      expect(object instanceof Circle).to.equal(true);
      expect(object.x).to.equal(data.x);
      expect(object.y).to.equal(data.y);
      expect(object.originX).to.equal(data.originX);
      expect(object.originY).to.equal(data.originY);
      expect(object.radiusX).to.equal(data.radiusX);
      expect(object.radiusY).to.equal(data.radiusY);
      expect(object.radius).to.equal(data.radius);
      expect(object.rotation).to.equal(data.rotation);
      expect(object.fill).to.equal(data.fill);
      expect(object.stroke).to.equal(data.stroke);
      expect(object.opacity).to.equal(data.opacity);
      expect(object.children instanceof Collection).to.equal(true);
      expect(object.children.get(0) instanceof Circle).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('.radius', function() {

    it('should set radiusX and radiusY', function() {
      var circle = new Circle({radius: 30});
      expect(circle.radius).to.equal(30);
      expect(circle.radiusX).to.equal(30);
      expect(circle.radiusY).to.equal(30);
    });

    it('should set radiusX and radiusY when setting radius', function() {
      var circle = new Circle();
      circle.radius = 70;
      expect(circle.radius).to.equal(70);
      expect(circle.radiusX).to.equal(70);
      expect(circle.radiusY).to.equal(70);
    });

  });

  describe('.radiusX', function() {

    it('should set radius and radiusY', function() {
      var circle = new Circle({radiusX: 30});
      expect(circle.radius).to.equal(30);
      expect(circle.radiusX).to.equal(30);
      expect(circle.radiusY).to.equal(30);
    });

    it('should set radius and radiusY when setting radiusX', function() {
      var circle = new Circle();
      circle.radiusX = 70;
      expect(circle.radius).to.equal(70);
      expect(circle.radiusX).to.equal(70);
      expect(circle.radiusY).to.equal(70);
    });

  });

  describe('.radiusY', function() {

    it('should set radius and radiusX', function() {
      var circle = new Circle({radiusY: 30});
      expect(circle.radius).to.equal(30);
      expect(circle.radiusX).to.equal(30);
      expect(circle.radiusY).to.equal(30);
    });

    it('should set radius and radiusX when setting radiusY', function() {
      var circle = new Circle();
      circle.radiusY = 70;
      expect(circle.radius).to.equal(70);
      expect(circle.radiusX).to.equal(70);
      expect(circle.radiusY).to.equal(70);
    });

  });

});
