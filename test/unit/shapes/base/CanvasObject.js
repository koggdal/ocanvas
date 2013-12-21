var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Collection = require('../../../../classes/Collection');
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

    it('should set the default value of property `children` to a new collection', function() {
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

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var object = new CanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
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

  });

  describe('#toJSON()', function() {

    it('should create JSON string from all specified properties', function() {
      var object = new CanvasObject({
        x: 35,
        y: 25,
        originX: 'left',
        originY: 'bottom',
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

});
