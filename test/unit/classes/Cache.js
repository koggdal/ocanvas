var expect = require('expect.js');
var Cache = require('../../../classes/Cache');
var EventEmitter = require('../../../classes/EventEmitter');

describe('Cache', function() {

  it('should inherit from EventEmitter', function() {
    var cache = new Cache();
    expect(Cache.prototype instanceof EventEmitter).to.equal(true);
    expect(cache instanceof EventEmitter).to.equal(true);
    expect(cache.emit).to.equal(EventEmitter.prototype.emit);
  });

  describe('Cache constructor', function() {

    var cache = new Cache();

    it('should set the default value of property `units` to an object', function() {
      expect(typeof cache.units).to.equal('object');
    });

    it('should set the default value of property `dependencies` to an object', function() {
      expect(typeof cache.dependencies).to.equal('object');
    });

  });

  describe('#define()', function() {

    it('should define a cache unit from a single name argument', function() {
      var cache = new Cache();
      cache.define('translation');
      expect(cache.units.translation).to.be.ok();
    });

    it('should define multiple cache units from an array of names', function() {
      var cache = new Cache();
      cache.define(['translation', 'rotation']);
      expect(cache.units.translation).to.be.ok();
      expect(cache.units.rotation).to.be.ok();
    });

    it('should define a cache unit with dependencies', function() {
      var cache = new Cache();
      cache.define('translation');
      cache.define('rotation', {dependencies: ['translation']});
      expect(cache.units.translation).to.be.ok();
      expect(cache.units.rotation).to.be.ok();
      expect(cache.dependencies.rotation).to.be.ok();
      expect(cache.dependencies.rotation.indexOf('translation')).to.equal(0);
    });

    it('should define multiple cache units with dependencies', function() {
      var cache = new Cache();
      cache.define('translation');
      cache.define(['rotation', 'scaling'], {dependencies: ['translation']});
      expect(cache.units.translation).to.be.ok();
      expect(cache.units.rotation).to.be.ok();
      expect(cache.units.scaling).to.be.ok();
      expect(cache.dependencies.rotation).to.be.ok();
      expect(cache.dependencies.scaling).to.be.ok();
      expect(cache.dependencies.rotation.indexOf('translation')).to.equal(0);
      expect(cache.dependencies.scaling.indexOf('translation')).to.equal(0);
    });

    it('should return the cache instance', function() {
      var cache = new Cache();
      var cacheReturn = cache.define('translation');
      expect(cache).to.equal(cacheReturn);
    });

  });

  describe('#get()', function() {

    it('should get the data object for a cache unit', function() {
      var cache = new Cache();
      cache.define('translation');

      var data = cache.get('translation');
      expect(data).to.be.ok();
      data.foo = 'bar';

      data = cache.get('translation');
      expect(data.foo).to.equal('bar');
    });

    it('should return null if the cache unit was not found', function() {
      var cache = new Cache();
      expect(cache.get('translation')).to.equal(null);
    });

  });

  describe('#test()', function() {

    it('should return false if the cache unit does not exist', function() {
      var cache = new Cache();
      expect(cache.test('translation')).to.equal(false);
    });

    it('should return false if the cache unit is valid', function() {
      var cache = new Cache();
      cache.define('translation');
      expect(cache.test('translation')).to.equal(false);
    });

    it('should return true if the cache unit is valid', function() {
      var cache = new Cache();
      cache.define('translation');
      cache.get('translation').isValid = true;

      expect(cache.test('translation')).to.equal(true);
    });

  });

  describe('#update()', function() {

    it('should make a cache unit valid', function() {
      var cache = new Cache();
      cache.define('translation');
      cache.update('translation');
      expect(cache.test('translation')).to.equal(true);
      expect(cache.get('translation').isValid).to.equal(true);
    });

    it('should update the cache unit data', function() {
      var cache = new Cache();
      cache.define('translation');
      cache.update('translation', {foo: 'bar'});
      expect(cache.test('translation')).to.equal(true);
      expect(cache.get('translation').isValid).to.equal(true);
      expect(cache.get('translation').foo).to.equal('bar');
    });

    it('should emit an `update` event', function(done) {
      var cache = new Cache();
      cache.define('translation');
      cache.on('update', function(event) {
        expect(event.unit).to.equal('translation');
        done();
      });
      cache.update('translation');
    });

    it('should return the cache instance', function() {
      var cache = new Cache();
      var cacheReturn = cache.update('translation');
      expect(cache).to.equal(cacheReturn);
    });

  });

  describe('#invalidate()', function() {

    it('should invalidate one cache unit', function() {
      var cache = new Cache();
      cache.define('translation').update('translation');
      expect(cache.test('translation')).to.equal(true);

      cache.invalidate('translation');

      expect(cache.test('translation')).to.equal(false);
      expect(cache.get('translation').isValid).to.equal(false);
    });

    it('should invalidate multiple cache units', function() {
      var cache = new Cache();
      cache.define(['translation', 'rotation']);
      cache.update('translation').update('rotation');
      expect(cache.test('translation')).to.equal(true);
      expect(cache.test('rotation')).to.equal(true);

      cache.invalidate(['translation', 'rotation']);

      expect(cache.test('translation')).to.equal(false);
      expect(cache.test('rotation')).to.equal(false);
      expect(cache.get('translation').isValid).to.equal(false);
      expect(cache.get('rotation').isValid).to.equal(false);
    });

    it('should emit an `invalidate` event', function(done) {
      var cache = new Cache();
      cache.define('translation').update('translation');
      cache.on('invalidate', function(event) {
        expect(event.unit).to.equal('translation');
        done();
      });
      cache.invalidate('translation');
    });

    it('should return the cache instance', function() {
      var cache = new Cache();
      var cacheReturn = cache.invalidate('translation');
      expect(cache).to.equal(cacheReturn);
      cacheReturn = cache.invalidate(['translation', 'rotation']);
      expect(cache).to.equal(cacheReturn);
    });

  });

});
