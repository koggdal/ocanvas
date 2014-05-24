var expect = require('expect.js');
var Camera = require('../../../classes/Camera');
var jsonHelpers = require('../../../utils/json');

describe('json', function() {

  describe('.registeredClasses', function() {

    it('should have a storage of registered classes', function() {
      expect(typeof jsonHelpers.registeredClasses).to.equal('object');
    });

  });

  describe('.registerClasses()', function() {

    it('should register all classes passed to it', function() {
      function MyClass() {}
      jsonHelpers.registerClasses({
        'MyClass': MyClass
      });
      expect(jsonHelpers.registeredClasses.MyClass).to.equal(MyClass);
    });

  });

  describe('.fromObject()', function() {

    it('should create an instance of a registered class from a plain object', function() {
      function MyClass() {}
      jsonHelpers.registerClasses({
        'MyClass': MyClass
      });
      expect(jsonHelpers.registeredClasses.MyClass).to.equal(MyClass);
      var instance = jsonHelpers.fromObject({
        __class__: 'MyClass',
        x: 10,
        y: 20
      });
      expect(instance instanceof MyClass).to.equal(true);
      expect(instance.__class__).to.equal(undefined);
      expect(instance.x).to.equal(10);
      expect(instance.y).to.equal(20);
    });

    it('should pass an id to the constructor if the class is Camera (to get cached instance)', function() {
      jsonHelpers.registerClasses({
        Camera: Camera
      });
      var camera = new Camera({id: 'abc'});
      var instance = jsonHelpers.fromObject({
        __class__: 'Camera',
        id: 'abc',
        x: 10,
        y: 20
      });
      expect(instance).to.equal(camera);
    });

    it('should handle converting arrays in the data', function() {
      function MyCollection() {
        this.items = [];
      }
      function MyCollectionItem(name) {
        this.name = name;
      }
      jsonHelpers.registerClasses({
        'MyCollection': MyCollection,
        'MyCollectionItem': MyCollectionItem
      });
      expect(jsonHelpers.registeredClasses.MyCollection).to.equal(MyCollection);

      var instance = jsonHelpers.fromObject({
        __class__: 'MyCollection',
        items: [
          {
            __class__: 'MyCollectionItem',
            name: 'Item 1'
          },
          {
            __class__: 'MyCollectionItem',
            name: 'Item 2'
          }
        ]
      });

      expect(instance instanceof MyCollection).to.equal(true);
      expect(instance.__class__).to.equal(undefined);

      expect(instance.items[0] instanceof MyCollectionItem).to.equal(true);
      expect(instance.items[0].__class__).to.equal(undefined);

      expect(instance.items[1] instanceof MyCollectionItem).to.equal(true);
      expect(instance.items[1].__class__).to.equal(undefined);

      expect(instance.items[0].name).to.equal('Item 1');
      expect(instance.items[1].name).to.equal('Item 2');
    });

    it('should handle converting data with functions', function() {
      var data = {
        add: {
          __type__: 'function',
          content: 'function (a, b) { return a + b; }'
        }
      };
      var object = jsonHelpers.fromObject(data);
      expect(typeof object.add).to.equal('function');
      expect(object.add(2, 3)).to.equal(5);
    });

    it('should warn in the console if data has a class that\'s not registered', function(done) {
      var data = {
        object: {
          __class__: 'ObjectClass',
          x: 10
        }
      };

      var originalConsoleWarn = global.console && global.console.warn;
      global.console.warn = function() {
        done();
      };

      var object = jsonHelpers.fromObject(data);

      global.console.warn = originalConsoleWarn;
    });

    it('should return the same object if data has a class that\'s not registered and console is not there', function() {
      var data = {
        object: {
          __class__: 'ObjectClass',
          x: 10
        }
      };

      var originalConsole = global.console;
      delete global.console;

      var object = jsonHelpers.fromObject(data);

      global.console = originalConsole;

      expect(object).to.equal(data);
    });

  });

  describe('.fromJSON()', function() {

    it('should create an instance of a registered class from a plain object represented as a JSON string', function() {
      function MyClass() {}
      jsonHelpers.registerClasses({
        'MyClass': MyClass
      });
      expect(jsonHelpers.registeredClasses.MyClass).to.equal(MyClass);
      var json = JSON.stringify({
        __class__: 'MyClass',
        x: 10,
        y: 20
      });
      var instance = jsonHelpers.fromJSON(json);
      expect(instance instanceof MyClass).to.equal(true);
      expect(instance.__class__).to.equal(undefined);
      expect(instance.x).to.equal(10);
      expect(instance.y).to.equal(20);
    });

    it('should handle converting data with functions', function() {
      var json = JSON.stringify({
        add: {
          __type__: 'function',
          content: 'function (a, b) { return a + b; }'
        }
      });
      var object = jsonHelpers.fromJSON(json);
      expect(typeof object.add).to.equal('function');
      expect(object.add(2, 3)).to.equal(5);
    });

  });

  describe('.toObject()', function() {

    it('should create a plain object from an instance of a class', function() {
      function MyClass(x, y) {
        this.x = x;
        this.y = y;
        this.foo = 'bar';
      }
      var instance = new MyClass(10, 20);
      var object = jsonHelpers.toObject(instance, ['x', 'y'], 'MyClass');
      expect(object.__class__).to.equal('MyClass');
      expect(object.x).to.equal(10);
      expect(object.y).to.equal(20);
      expect(object.foo).to.equal(undefined);
    });

    it('should handle converting real functions to data with embedded functions', function() {
      var object = {
        add: function(a, b) { return a + b; }
      };
      var data = jsonHelpers.toObject(object, ['add']);
      expect(typeof data.add).to.equal('object');
      expect(data.add.__type__).to.equal('function');
      expect(data.add.content).to.equal(object.add.toString());
    });

    it('should handle converting nested objects (plain)', function() {
      var object = {
        x: 10,
        y: 5,
        nested: {
          x: 25,
          y: 80
        }
      };
      var data = jsonHelpers.toObject(object, ['x', 'nested']);
      expect(data.x).to.equal(10);
      expect(data.y).to.equal(undefined);
      expect(typeof data.nested).to.equal('object');
      expect(data.nested.x).to.equal(25);
      expect(data.nested.y).to.equal(80);
    });

    it('should handle converting nested objects (class instances)', function() {
      function MyObject(x, y) {
        this.x = x;
        this.y = y;
      }
      MyObject.prototype.toObject = function() {
        return jsonHelpers.toObject(this, ['x', 'y'], 'MyObject');
      };
      var object = {
        x: 10,
        y: 5,
        nested: new MyObject(25, 80)
      };
      var data = jsonHelpers.toObject(object, ['x', 'nested']);
      expect(data.x).to.equal(10);
      expect(data.y).to.equal(undefined);
      expect(typeof data.nested).to.equal('object');
      expect(data.nested.__class__).to.equal('MyObject');
      expect(data.nested.x).to.equal(25);
      expect(data.nested.y).to.equal(80);
    });

    it('should handle converting objects with null properties', function() {
      var object = {
        x: 10,
        y: null
      };
      var data = jsonHelpers.toObject(object, ['x', 'y']);
      expect(data.x).to.equal(10);
      expect(data.y).to.equal(null);
    });

  });

  describe('.toJSON()', function() {

    it('should create a JSON string representing a plain object from an instance of a class', function() {
      function MyClass(x, y) {
        this.x = x;
        this.y = y;
        this.foo = 'bar';
      }
      var instance = new MyClass(10, 20);
      var json = jsonHelpers.toJSON(instance, ['x', 'y'], 'MyClass');
      var object = JSON.parse(json);
      expect(object.__class__).to.equal('MyClass');
      expect(object.x).to.equal(10);
      expect(object.y).to.equal(20);
      expect(object.foo).to.equal(undefined);
    });

    it('should format the JSON according to the space option', function() {
      function MyClass(x, y) {
        this.x = x;
        this.y = y;
        this.foo = 'bar';
      }
      var instance = new MyClass(10, 20);
      var json = jsonHelpers.toJSON(instance, ['x', 'y'], 'MyClass', '\t');
      var manualJSON = '{\n' +
          '\t"__class__": "MyClass",\n' +
          '\t"x": 10,\n' +
          '\t"y": 20\n' +
          "}";
      expect(json).to.equal(manualJSON);
    });

    it('should handle converting real functions to data with embedded functions', function() {
      var object = {
        add: function(a, b) { return a + b; }
      };
      var json = jsonHelpers.toJSON(object, ['add']);
      var data = JSON.parse(json);
      expect(typeof data.add).to.equal('object');
      expect(data.add.__type__).to.equal('function');
      expect(data.add.content).to.equal(object.add.toString());
    });

    it('should handle converting nested objects (plain)', function() {
      var object = {
        x: 10,
        y: 5,
        nested: {
          x: 25,
          y: 80
        }
      };
      var json = jsonHelpers.toJSON(object, ['x', 'nested']);
      var data = JSON.parse(json);
      expect(data.x).to.equal(10);
      expect(data.y).to.equal(undefined);
      expect(typeof data.nested).to.equal('object');
      expect(data.nested.x).to.equal(25);
      expect(data.nested.y).to.equal(80);
    });

    it('should handle converting nested objects (class instances)', function() {
      function MyObject(x, y) {
        this.x = x;
        this.y = y;
      }
      MyObject.prototype.toObject = function() {
        return jsonHelpers.toObject(this, ['x', 'y'], 'MyObject');
      };
      var object = {
        x: 10,
        y: 5,
        nested: new MyObject(25, 80)
      };
      var json = jsonHelpers.toJSON(object, ['x', 'nested']);
      var data = JSON.parse(json);
      expect(data.x).to.equal(10);
      expect(data.y).to.equal(undefined);
      expect(typeof data.nested).to.equal('object');
      expect(data.nested.__class__).to.equal('MyObject');
      expect(data.nested.x).to.equal(25);
      expect(data.nested.y).to.equal(80);
    });

  });

  describe('.setProperties()', function() {

    it('should set properties on an object and expand any class properties to instances', function() {
      function MyObject(x, y) {
        this.x = x;
        this.y = y;
      }
      function MyCamera(x, y) {
        this.x = x;
        this.y = y;
      }

      jsonHelpers.registerClasses({
        'MyObject': MyObject,
        'MyCamera': MyCamera
      });

      var output = {};
      jsonHelpers.setProperties(output, {
        object: {
          __class__: 'MyObject',
          x: 20,
          y: 30
        },
        camera: {
          __class__: 'MyCamera',
          x: 40,
          y: 70
        }
      });

      expect(output.object instanceof MyObject).to.equal(true);
      expect(output.camera instanceof MyCamera).to.equal(true);
      expect(output.object.x).to.equal(20);
      expect(output.object.y).to.equal(30);
      expect(output.camera.x).to.equal(40);
      expect(output.camera.y).to.equal(70);
    });

  });

});
