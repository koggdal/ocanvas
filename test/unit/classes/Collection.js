var expect = require('expect.js');
var Collection = require('../../../classes/Collection');

describe('Collection', function() {

  describe('#add()', function() {

    it('should add an item to the collection', function() {
      var collection = new Collection();

      collection.add('A string');

      expect(collection.items[0]).to.equal('A string');
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

  });

  describe('#removeAt()', function() {

    it('should remove an item from the collection based on a specified index', function() {
      var collection = new Collection();

      collection.add('String 1');

      expect(collection.items[0]).to.equal('String 1');

      collection.removeAt(0);

      expect(collection.items[0]).to.equal(undefined);
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

});
