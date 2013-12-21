var expect = require('expect.js');
var RectangularCanvasObject = require('../../../shapes/base/RectangularCanvasObject');
var Rectangle = require('../../../shapes/Rectangle');
var Collection = require('../../../classes/Collection');
var jsonHelpers = require('../../../utils/json');

describe('Rectangle', function() {

  it('should inherit from RectangularCanvasObject', function() {
    var object = new Rectangle();
    expect(Rectangle.prototype instanceof RectangularCanvasObject).to.equal(true);
    expect(object instanceof RectangularCanvasObject).to.equal(true);
    expect(object.calculateOrigin).to.equal(RectangularCanvasObject.prototype.calculateOrigin);
  });

  describe('Rectangle constructor', function() {

    var object = new Rectangle({name: 'Rectangle'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('Rectangle');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'Rectangle': Rectangle,
      'Collection': Collection
    });

    var data = {
      __class__: 'Rectangle',
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
            __class__: 'Rectangle',
            x: 10,
            y: 20
          }
        ]
      }
    };

    it('should create a Rectangle instance from a data object', function() {
      var object = Rectangle.fromObject(data);

      expect(object instanceof Rectangle).to.equal(true);
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
      expect(object.children.get(0) instanceof Rectangle).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'Rectangle': Rectangle,
      'Collection': Collection
    });

    var data = {
      __class__: 'Rectangle',
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
            __class__: 'Rectangle',
            x: 10,
            y: 20
          }
        ]
      }
    };
    var json = JSON.stringify(data);

    it('should create a Rectangle instance from a JSON string', function() {
      var object = Rectangle.fromJSON(json);

      expect(object instanceof Rectangle).to.equal(true);
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
      expect(object.children.get(0) instanceof Rectangle).to.equal(true);
      expect(object.children.get(0).x).to.equal(10);
      expect(object.children.get(0).y).to.equal(20);
    });

  });

});
