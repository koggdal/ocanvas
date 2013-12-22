var expect = require('expect.js');
var Pool = require('../../../classes/Pool');

describe('Pool', function() {

  describe('Pool constructor', function() {

    it('should set any properties passed in', function() {
      var pool = new Pool({name: 'Pool'});
      expect(pool.name).to.equal('Pool');
    });

    it('should set the default value of property `objects` to an empty array', function() {
      var pool = new Pool();
      expect(Array.isArray(pool.objects)).to.equal(true);
      expect(pool.objects.length).to.equal(0);
    });

    it('should set the default value of property `objectsInUse` to an empty array', function() {
      var pool = new Pool();
      expect(Array.isArray(pool.objects)).to.equal(true);
      expect(pool.objects.length).to.equal(0);
    });

    it('should set the default value of property `refillAmount` to 10', function() {
      var pool = new Pool();
      expect(pool.refillAmount).to.equal(10);
    });

    it('should set the default value of property `createFunction` to a function that throws an error', function(done) {
      var pool = new Pool();
      expect(typeof pool.createFunction).to.equal('function');

      try {
        pool.createFunction();
      } catch(error) {
        done();
      }
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var pool = new Pool();
      expect(pool.name).to.equal(undefined);
      pool.setProperties({
        name: 'Pool'
      });
      expect(pool.name).to.equal('Pool');
    });

  });

  describe('#add()', function() {

    it('should add the specified number of new objects to the pool', function() {
      var pool = new Pool();

      var numOjects = 5;
      var numOjectsAdded = 0;
      pool.createFunction = function() {
        numOjectsAdded++;
        return {};
      };
      pool.add(numOjects);

      expect(numOjectsAdded).to.equal(numOjects);
      expect(pool.objects.length).to.equal(numOjects);
    });

  });

  describe('#remove()', function() {

    it('should remove the specified number of objects from the pool', function() {
      var pool = new Pool();
      pool.createFunction = function() { return {}; };
      pool.add(5);

      expect(pool.objects.length).to.equal(5);
      pool.remove(3);
      expect(pool.objects.length).to.equal(2);
    });

  });

  describe('#get()', function() {

    it('should get an object from the pool', function() {
      var pool = new Pool();
      pool.createFunction = function() { return {name: 'foo'}; };
      pool.add(5);

      var object = pool.get();
      expect(typeof object).to.equal('object');
      expect(object.name).to.equal('foo');

      expect(pool.objects.length).to.equal(4);
      expect(pool.objectsInUse.length).to.equal(1);
      expect(pool.objectsInUse[0]).to.equal(object);
    });

    it('should add more objects to the pool if it\'s empty (using the refillAmount property)', function() {
      var pool = new Pool();
      pool.createFunction = function() { return {name: 'foo'}; };

      expect(pool.objects.length).to.equal(0);
      var object = pool.get();
      expect(pool.objects.length).to.equal(pool.refillAmount - 1);

      expect(typeof object).to.equal('object');
      expect(object.name).to.equal('foo');
    });

  });

  describe('#putBack()', function() {

    it('should put back an object into the pool of available objects', function() {
      var pool = new Pool();
      pool.createFunction = function() { return {name: 'foo'}; };
      pool.add(5);

      var object = pool.get();
      expect(pool.objects.length).to.equal(4);
      expect(pool.objectsInUse.length).to.equal(1);

      pool.putBack(object);
      expect(pool.objects.length).to.equal(5);
      expect(pool.objectsInUse.length).to.equal(0);
    });

    it('should not put back an object if it\'s not in the list of used objects', function() {
      var pool = new Pool();

      expect(pool.objects.length).to.equal(0);
      expect(pool.objectsInUse.length).to.equal(0);
      pool.putBack({});
      expect(pool.objects.length).to.equal(0);
      expect(pool.objectsInUse.length).to.equal(0);
    });

  });

});
