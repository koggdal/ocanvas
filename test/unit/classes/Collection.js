var expect = require('expect.js');
var Collection = require('../../../classes/Collection');
var EventEmitter = require('../../../classes/EventEmitter');

describe('Collection', function() {

  it('should inherit from EventEmitter', function() {
    var collection = new Collection();
    expect(Collection.prototype instanceof EventEmitter).to.equal(true);
    expect(collection instanceof EventEmitter).to.equal(true);
    expect(collection.emit).to.equal(EventEmitter.prototype.emit);
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
      collection.add('String 1');

      expect(collection.items[0]).to.equal('String 1');
      expect(collection.items[1]).to.equal('String 1');

      collection.remove('String 1');

      expect(collection.items[0]).to.equal(undefined);
      expect(collection.items[1]).to.equal(undefined);
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
