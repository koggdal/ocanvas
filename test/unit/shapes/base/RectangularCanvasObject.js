var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var RectangularCanvasObject = require('../../../../shapes/base/RectangularCanvasObject');
var Collection = require('../../../../classes/Collection');
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

});
