/**
 * @module ocanvas/classes/Cache
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('../utils/inherit');

/**
 * @classdesc The Cache class can be used to cache data. It allows you to
 *     invalidate the cache, which will also emit events to let you handle
 *     things automatically when the cache gets invalidated. There is also a
 *     dependency system where a cache unit can depend on other cache units
 *     and get invalidated automatically when the dependencies get invalidated.
 *
 * @property {Object} units The storage of cache units.
 * @property {Object} dependencies The storage of dependencies.
 *
 * @fires module:ocanvas/classes/Cache~Cache#invalidate
 * @fires module:ocanvas/classes/Cache~Cache#update
 *
 * @constructor
 * @augments {module:ocanvas/classes/EventEmitter~EventEmitter}
 *
 * @example
 * var cache = new Cache();
 * cache.define('translation');
 *
 * if (cache.test('translation')) {
 *   var data = cache.get('translation'); // Use cached data
 * } else {
 *   var data = {matrix: new Matrix(3, 3)};
 *   cache.update('translation', data);
 *   // use new data
 * }
 *
 * // later
 * cache.invalidate('translation');
 */
function Cache() {
  EventEmitter.call(this);

  this.units = {};
  this.dependencies = {};

  // Automatic invalidation of dependencies
  var self = this;
  this.on('invalidate', function(event) {
    var dependencies = self.dependencies;
    for (var unitName in dependencies) {
      var deps = dependencies[unitName];
      for (var i = 0, l = deps.length; i < l; i++) {
        if (event.unit === deps[i]) {
          self.invalidate(unitName);
        }
      }
    }
  });
}
inherit(Cache, EventEmitter);

/**
 * Event for notifying that a unit was invalidated.
 *
 * @event module:ocanvas/classes/Cache~Cache#invalidate
 * @property {string} unit The name of the unit that was invalidated.
 *
 * @example
 * var cache = new Cache();
 * cache.on('invalidate', function(event) {
 *   console.log(event.unit);
 * });
 */

/**
 * Event for notifying that a unit was updated.
 *
 * @event module:ocanvas/classes/Cache~Cache#update
 * @property {string} unit The name of the unit that was updated.
 *
 * @example
 * var cache = new Cache();
 * cache.on('update', function(event) {
 *   console.log(event.unit);
 * });
 */

/**
 * Define a new cache unit.
 * A unit can store cached values, which can be invalidated as one unit.
 *
 * @param {string|Array.<string>} name The name of the cache unit. Can be an
 *     array of many names.
 * @param {Object=} opt_options Optional options object. It can contain a
 *     `dependencies` property, which will set up watchers for changes. If a
 *     dependency is invalidated, this unit gets invalidated automatically.
 *
 * @return {Cache} The Cache instance.
 *
 * @example
 * var cache = new Cache();
 * cache.define('translation');
 * cache.define(['rotation', 'scaling']);
 * cache.define('transformations', {
 *   dependencies: ['translation', 'rotation', 'scaling']
 * });
 */
Cache.prototype.define = function(name, opt_options) {
  if (Array.isArray(name)) {
    for (var i = 0, l = name.length; i < l; i++) {
      this.define(name[i], opt_options);
    }
    return this;
  }

  this.units[name] = {isValid: false};

  var dependencies = opt_options && opt_options.dependencies;
  if (Array.isArray(dependencies)) {
    this.dependencies[name] = dependencies.slice();
  }

  return this;
};

/**
 * Get the data for a cache unit.
 *
 * @param {string} name The name of the cache unit.
 *
 * @return {Object?} The data object or null if not found.
 *
 * @example
 * var cache = new Cache();
 * cache.define('translation').update('translation', {foo: 'bar'});
 * cache.get('translation').foo; // 'bar'
 */
Cache.prototype.get = function(name) {
  return this.units[name] || null;
};

/**
 * Test if the cache unit is valid at the moment.
 *
 * @param {string} name The name of the cache unit.
 *
 * @return {boolean} True if it's valid, false otherwise.
 *
 * @example
 * var cache = new Cache();
 * cache.define('translation');
 * cache.test('translation'); // false
 */
Cache.prototype.test = function(name) {
  return !!(this.units[name] && this.units[name].isValid);
};

/**
 * Update a cache unit to be valid. This can optionally take new data.
 * The stored data will not be completely replaced by the new data. Data
 * properties that already exist in the cache will be replaced and properties
 * that do not exist will be added. Properties that exist in the cache but
 * are not present in the new data will be left untouched.
 *
 * @param {string} name The name of the cache unit.
 * @param {Object=} opt_data Optional data to set in the cache.
 *
 * @return {Cache} The Cache instance.
 *
 * @fires module:ocanvas/classes/Cache~Cache#update
 *
 * @example
 * var cache = new Cache();
 * cache.define('translation');
 * cache.update('translation', {matrix: translationMatrix});
 */
Cache.prototype.update = function(name, opt_data) {
  var unit = this.units[name];

  if (unit) {
    if (opt_data) {
      for (var prop in opt_data) {
        unit[prop] = opt_data[prop];
      }
    }
    unit.isValid = true;
    this.emit('update', {unit: name});
  }

  return this;
};

/**
 * Invalidate a cache unit.
 * This will also emit the event `invalidate` with an event object with a
 * property called `unit`, which is the name of the invalidated unit.
 *
 * @param {string|Array.<string>} name The name of the cache unit. Can be an
 *     array of many names.
 *
 * @return {Cache} The Cache instance.
 *
 * @fires module:ocanvas/classes/Cache~Cache#invalidate
 *
 * @example
 * var cache = new Cache();
 * cache.define(['translation', 'rotation', 'scaling']);
 * cache.invalidate('translation');
 * cache.invalidate(['rotation', 'scaling']);
 */
Cache.prototype.invalidate = function(name) {
  if (Array.isArray(name)) {
    for (var i = 0, l = name.length; i < l; i++) {
      this.invalidate(name[i]);
    }
    return this;
  }

  if (this.units[name]) {
    this.units[name].isValid = false;
    this.emit('invalidate', {unit: name});
  }

  return this;
};

module.exports = Cache;
