var expect = require('expect.js');
var Collection = require('../../../classes/Collection');
var EventEmitter = require('../../../mixins/EventEmitter');
var jsonHelpers = require('../../../utils/json');

describe('Collection', function() {

  it('should mix in EventEmitter', function() {
    var collection = new Collection();
    expect(collection.emit).to.equal(EventEmitter.emit);
    expect(collection.on).to.equal(EventEmitter.on);
    expect(collection.off).to.equal(EventEmitter.off);
  });

  describe('.fromArray()', function() {

    it('should return a new Collection instance with the contents of the array', function() {
      var collection = Collection.fromArray(['String 1', 'String 2', 'String 3']);

      expect(collection instanceof Collection).to.equal(true);
      expect(collection.length).to.equal(3);
      expect(collection.get(0)).to.equal('String 1');
      expect(collection.get(1)).to.equal('String 2');
      expect(collection.get(2)).to.equal('String 3');
    });

    it('should expand array items to class instances if needed', function() {
      function MyItemClass() {}
      jsonHelpers.registerClasses({'MyItemClass': MyItemClass});

      var collection = Collection.fromArray([
        {
          __class__: 'MyItemClass',
          name: 'Item 1'
        },
        {
          __class__: 'MyItemClass',
          name: 'Item 2'
        }
      ]);

      expect(collection instanceof Collection).to.equal(true);
      expect(collection.length).to.equal(2);
      expect(collection.get(0) instanceof MyItemClass).to.equal(true);
      expect(collection.get(1) instanceof MyItemClass).to.equal(true);
      expect(collection.get(0).name).to.equal('Item 1');
      expect(collection.get(1).name).to.equal('Item 2');
    });

  });

  describe('.fromObject()', function() {

    it('should return a new Collection instance with the contents of the items array', function() {
      jsonHelpers.registerClasses({'Collection': Collection});

      var collection = Collection.fromObject({
        __class__: 'Collection',
        items: ['String 1', 'String 2', 'String 3']
      });

      expect(collection instanceof Collection).to.equal(true);
      expect(collection.length).to.equal(3);
      expect(collection.get(0)).to.equal('String 1');
      expect(collection.get(1)).to.equal('String 2');
      expect(collection.get(2)).to.equal('String 3');
    });

    it('should expand array items to class instances if needed', function() {
      function MyItemClass() {}
      jsonHelpers.registerClasses({
        'Collection': Collection,
        'MyItemClass': MyItemClass
      });

      var collection = Collection.fromObject({
        __class__: 'Collection',
        items: [
          {
            __class__: 'MyItemClass',
            name: 'Item 1'
          },
          {
            __class__: 'MyItemClass',
            name: 'Item 2'
          }
        ]
      });

      expect(collection instanceof Collection).to.equal(true);
      expect(collection.length).to.equal(2);
      expect(collection.get(0) instanceof MyItemClass).to.equal(true);
      expect(collection.get(1) instanceof MyItemClass).to.equal(true);
      expect(collection.get(0).name).to.equal('Item 1');
      expect(collection.get(1).name).to.equal('Item 2');
    });

  });

  describe('.fromJSON()', function() {

    it('should return a new Collection instance with the contents of the items array', function() {
      jsonHelpers.registerClasses({'Collection': Collection});

      var collection = Collection.fromJSON(JSON.stringify({
        __class__: 'Collection',
        items: ['String 1', 'String 2', 'String 3']
      }));

      expect(collection instanceof Collection).to.equal(true);
      expect(collection.length).to.equal(3);
      expect(collection.get(0)).to.equal('String 1');
      expect(collection.get(1)).to.equal('String 2');
      expect(collection.get(2)).to.equal('String 3');
    });

    it('should expand array items to class instances if needed', function() {
      function MyItemClass() {}
      jsonHelpers.registerClasses({
        'Collection': Collection,
        'MyItemClass': MyItemClass
      });

      var collection = Collection.fromJSON(JSON.stringify({
        __class__: 'Collection',
        items: [
          {
            __class__: 'MyItemClass',
            name: 'Item 1'
          },
          {
            __class__: 'MyItemClass',
            name: 'Item 2'
          }
        ]
      }));

      expect(collection instanceof Collection).to.equal(true);
      expect(collection.length).to.equal(2);
      expect(collection.get(0) instanceof MyItemClass).to.equal(true);
      expect(collection.get(1) instanceof MyItemClass).to.equal(true);
      expect(collection.get(0).name).to.equal('Item 1');
      expect(collection.get(1).name).to.equal('Item 2');
    });

  });

  describe('#toArray()', function() {

    it('should convert the collection to a plain array', function() {
      var inputArray = ['String 1', 'String 2', 'String 3'];
      var collection = Collection.fromArray(inputArray);
      var outputArray = collection.toArray();

      expect(Array.isArray(outputArray)).to.equal(true);
      expect(outputArray).to.eql(inputArray);
    });

    it('should convert nested objects to plain objects', function() {
      function MyItemClass(x, y) {
        this.x = x;
        this.y = y;
      }
      MyItemClass.prototype.toObject = function() {
        return {
          __class__: 'MyItemClass',
          x: this.x,
          y: this.y
        };
      };

      var collection = Collection.fromArray([
        new MyItemClass(20, 30),
        new MyItemClass(45, 55)
      ]);

      var outputArray = collection.toArray();

      expect(Array.isArray(outputArray)).to.equal(true);
      expect(outputArray.length).to.equal(2);
      expect(outputArray[0]).to.eql({
        __class__: 'MyItemClass',
        x: 20, y: 30
      });
      expect(outputArray[1]).to.eql({
        __class__: 'MyItemClass',
        x: 45, y: 55
      });
    });

  });

  describe('#toObject()', function() {

    it('should convert the collection to a plain object', function() {
      var inputArray = ['String 1', 'String 2', 'String 3'];
      var collection = Collection.fromArray(inputArray);
      var outputObject = collection.toObject();

      expect(outputObject.items).to.eql(inputArray);
    });

    it('should convert nested objects to plain objects', function() {
      function MyItemClass(x, y) {
        this.x = x;
        this.y = y;
      }
      MyItemClass.prototype.toObject = function() {
        return {
          __class__: 'MyItemClass',
          x: this.x,
          y: this.y
        };
      };

      var collection = Collection.fromArray([
        new MyItemClass(20, 30),
        new MyItemClass(45, 55)
      ]);

      var outputObject = collection.toObject();

      expect(typeof outputObject).to.equal('object');
      expect(Array.isArray(outputObject.items)).to.equal(true);
      expect(outputObject.items.length).to.equal(2);
      expect(outputObject.items[0]).to.eql({
        __class__: 'MyItemClass',
        x: 20, y: 30
      });
      expect(outputObject.items[1]).to.eql({
        __class__: 'MyItemClass',
        x: 45, y: 55
      });
    });

  });

  describe('#toJSON()', function() {

    it('should convert the collection to a JSON string representing a plain object', function() {
      var inputArray = ['String 1', 'String 2', 'String 3'];
      var collection = Collection.fromArray(inputArray);
      var outputJSON = collection.toJSON();
      var outputObject = JSON.parse(outputJSON);

      expect(outputObject.items).to.eql(inputArray);
    });

    it('should convert nested objects to plain objects and then stringify them', function() {
      function MyItemClass(x, y) {
        this.x = x;
        this.y = y;
      }
      MyItemClass.prototype.toObject = function() {
        return {
          __class__: 'MyItemClass',
          x: this.x,
          y: this.y
        };
      };

      var collection = Collection.fromArray([
        new MyItemClass(20, 30),
        new MyItemClass(45, 55)
      ]);

      var outputJSON = collection.toJSON();
      var outputObject = JSON.parse(outputJSON);

      expect(typeof outputObject).to.equal('object');
      expect(Array.isArray(outputObject.items)).to.equal(true);
      expect(outputObject.items.length).to.equal(2);
      expect(outputObject.items[0]).to.eql({
        __class__: 'MyItemClass',
        x: 20, y: 30
      });
      expect(outputObject.items[1]).to.eql({
        __class__: 'MyItemClass',
        x: 45, y: 55
      });
    });

  });

  describe('#add()', function() {

    it('should add an item to the collection', function() {
      var collection = new Collection();

      collection.add('A string');

      expect(collection.items[0]).to.equal('A string');
    });

    it('should emit an `insert` event when something is added', function(done) {
      var collection = new Collection();

      collection.on('insert', function(event) {
        expect(event.item).to.equal('String 1');
        expect(event.index).to.equal(0);
        done();
      });

      collection.add('String 1');
    });

  });

  describe('#insert()', function() {

    it('should insert an item into the collection at a specific position', function() {
      var collection = new Collection();

      collection.add('String 1');
      collection.add('String 2');
      collection.add('String 3');
      collection.add('String 5');
      collection.insert('String 4', 3);

      expect(collection.items[0]).to.equal('String 1');
      expect(collection.items[1]).to.equal('String 2');
      expect(collection.items[2]).to.equal('String 3');
      expect(collection.items[3]).to.equal('String 4');
      expect(collection.items[4]).to.equal('String 5');
    });

    it('should emit an `insert` event when something is inserted', function(done) {
      var collection = new Collection();

      collection.on('insert', function(event) {
        expect(event.item).to.equal('String 1');
        expect(event.index).to.equal(0);
        done();
      });

      collection.insert('String 1', 0);
    });

  });

  describe('#remove()', function() {

    it('should remove an item from the collection', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.items[0]).to.equal('String 1');

      collection.remove('String 1');

      expect(collection.items[0]).to.equal(undefined);
    });

    it('should remove all instances of the item from the collection', function() {
      var collection = new Collection();

      collection.add('String 1');
      collection.add('String 2');
      collection.add('String 2');

      expect(collection.items[0]).to.equal('String 1');
      expect(collection.items[1]).to.equal('String 2');
      expect(collection.items[2]).to.equal('String 2');

      collection.remove('String 2');

      expect(collection.length).to.equal(1);
      expect(collection.items.length).to.equal(1);
      expect(collection.items[0]).to.equal('String 1');
      expect(collection.items[1]).to.equal(undefined);
      expect(collection.items[2]).to.equal(undefined);
    });

    it('should emit a `remove` event when something is removed', function(done) {
      var collection = new Collection();

      collection.add('String 1');

      collection.on('remove', function(event) {
        expect(event.item).to.equal('String 1');
        expect(event.index).to.equal(0);
        done();
      });

      collection.remove('String 1');
    });

  });

  describe('#removeAt()', function() {

    it('should remove an item from the collection based on a specified index', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.items[0]).to.equal('String 1');

      collection.removeAt(0);

      expect(collection.items[0]).to.equal(undefined);
    });

    it('should not remove anything from the collection if the specified index was not found', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.length).to.equal(1);
      expect(collection.items.length).to.equal(1);
      expect(collection.items[0]).to.equal('String 1');

      collection.removeAt(1);

      expect(collection.length).to.equal(1);
      expect(collection.items.length).to.equal(1);
      expect(collection.items[0]).to.equal('String 1');
    });

    it('should emit a `remove` event when something is removed', function(done) {
      var collection = new Collection();

      collection.add('String 1');

      collection.on('remove', function(event) {
        expect(event.item).to.equal('String 1');
        expect(event.index).to.equal(0);
        done();
      });

      collection.removeAt(0);
    });

  });

  describe('#indexOf()', function() {

    it('should return the index of the first occurance of the item in the collection', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.indexOf('String 1')).to.equal(0);
    });

    it('should return -1 if the item is not in the collection', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.indexOf('String 2')).to.equal(-1);
    });

  });

  describe('#get()', function() {

    it('should return the item found in the specified position in the collection', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.get(0)).to.equal('String 1');
    });

    it('should return null if no item is found in that position', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.get(1)).to.equal(null);
    });

  });

  describe('#forEach()', function() {

    it('should loop through all items and call the function for every item', function() {
      var collection = new Collection();
      collection.add('String 1');
      collection.add('String 2');
      collection.add('String 3');

      var i = 0;
      collection.forEach(function(item, index) {
        expect(index).to.equal(i);
        expect(item).to.equal(collection.items[i]);
        i++;
      });
    });

  });

  describe('#length', function() {

    var collection = new Collection();
    collection.add('String 1');
    collection.add('String 2');
    collection.add('String 3');

    it('should be the number of items in the collection', function() {
      expect(collection.length).to.equal(3);
    });

    it('should remove items from the collection if the length is set to less than the current length', function() {
      expect(collection.get(2)).to.equal('String 3');
      collection.length = 2;
      expect(collection.get(2)).to.equal(null);
      expect(collection.length).to.equal(2);
      expect(collection.items.length).to.equal(2);
    });

    it('should add undefined items to the collection if the length is set to more than the current length', function() {
      collection.length = 10;
      expect(collection.get(6)).to.equal(undefined);
      expect(collection.length).to.equal(10);
      expect(collection.items.length).to.equal(10);
    });

  });

  describe('#items', function() {

    it('should be an array', function() {
      var collection = new Collection();
      expect(Array.isArray(collection.items)).to.equal(true);
    });

    it('should contain all the items', function() {
      var collection = new Collection();
      collection.add('String 1');
      expect(collection.items[0]).to.equal('String 1');
    });

    it('should update length when the property is set to a new array', function() {
      var collection = new Collection();
      collection.add('String 1');

      expect(collection.length).to.equal(1);
      collection.items = [];
      expect(collection.length).to.equal(0);
      collection.items = ['String 1', 'String 2'];
      expect(collection.length).to.equal(2);
    });

    it('should update the content when the property is set to a new array', function() {
      var collection = new Collection();
      collection.add('String 1');

      collection.items = ['String 1', 'String 2'];
      expect(collection.get(0)).to.equal('String 1');
      expect(collection.get(1)).to.equal('String 2');
    });

    it('should emit insert/remove events when the property is set to a new array', function(done) {
      var collection = new Collection();
      collection.add('String 1');

      var numRemoves = 0;
      collection.on('remove', function() {
        numRemoves++;
        if (numRemoves === 1 && numInserts === 2) done();
      });

      var numInserts = 0;
      collection.on('insert', function() {
        numInserts++;
        if (numRemoves === 1 && numInserts === 2) done();
      });

      collection.items = ['String 1', 'String 2'];
    });

  });

});
