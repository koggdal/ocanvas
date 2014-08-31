var expect = require('expect.js');
var EllipticalCanvasObject = require('../../../shapes/base/EllipticalCanvasObject');
var Ellipse = require('../../../shapes/Ellipse');
var Collection = require('../../../classes/Collection');
var jsonHelpers = require('../../../utils/json');

describe('Ellipse', function() {

  it('should inherit from EllipticalCanvasObject', function() {
    var object = new Ellipse();
    expect(Ellipse.prototype instanceof EllipticalCanvasObject).to.equal(true);
    expect(object instanceof EllipticalCanvasObject).to.equal(true);
    expect(object.calculateOrigin).to.equal(EllipticalCanvasObject.prototype.calculateOrigin);
  });

  describe('Ellipse constructor', function() {

    var object = new Ellipse({name: 'Ellipse'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('Ellipse');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'Ellipse': Ellipse,
      'Collection': Collection
    });

    var data = {
      __class__: 'Ellipse',
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
            __class__: 'Ellipse',
            x: 10,
            y: 20
          }
        ]
      }
    };

    it('should create an Ellipse instance from a data object', function() {
      var object = Ellipse.fromObject(data);

      expect(object instanceof Ellipse).to.equal(true);
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
      expect(object.children.get(0) instanceof Ellipse).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'Ellipse': Ellipse,
      'Collection': Collection
    });

    var data = {
      __class__: 'Ellipse',
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
            __class__: 'Ellipse',
            x: 10,
            y: 20
          }
        ]
      }
    };
    var json = JSON.stringify(data);

    it('should create an Ellipse instance from a JSON string', function() {
      var object = Ellipse.fromJSON(json);

      expect(object instanceof Ellipse).to.equal(true);
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
      expect(object.children.get(0) instanceof Ellipse).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

});
