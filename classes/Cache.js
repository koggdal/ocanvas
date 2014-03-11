/**
 * @module ocanvas/classes/Cache
 */
'use strict';

/**
 * @classdesc The Cache class can be used to cache data. It allows you to
 *     invalidate the cache, which will also run handler functions to let you
 *     handle things automatically when the cache gets invalidated. There is
 *     also a dependency system where a cache unit can depend on other cache
 *     units and get invalidated automatically when the dependencies get
 *     invalidated.
 *
 * @property {Object} units The storage of cache units.
 * @property {Object} dependencies The storage of dependencies.
 *
 * @constructor
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
  this.units = {};
  this.dependencies = {};
  this.onInvalidate = null;
  this.onUpdate = null;
}

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Cache.className = 'Cache';

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
 * This will also invoke the `onUpdate` handler function if it's defined. The
 * handler function will get called with one argument—the name of the unit
 * being updated.
 *
 * @param {string} name The name of the cache unit.
 * @param {Object=} opt_data Optional data to set in the cache.
 *
 * @return {Cache} The Cache instance.
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
    if (this.onUpdate) this.onUpdate(name);
  }

  return this;
};

/**
 * Invalidate a cache unit.
 * This will also invoke the `onInvalidate` handler function if it's defined. The
 * handler function will get called with one argument—the name of the unit
 * being invalidated.
 *
 * @param {string|Array.<string>} name The name of the cache unit. Can be an
 *     array of many names.
 *
 * @return {Cache} The Cache instance.
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

  if (this.units[name] && this.units[name].isValid) {
    this.units[name].isValid = false;
    if (this.onInvalidate) this.onInvalidate(name);

    // Automatic invalidation of dependencies.
    // A unit that depends on the invalidated unit should also be invalidated.
    var dependencies = this.dependencies;
    for (var unitName in dependencies) {
      var deps = dependencies[unitName];
      for (var n = 0, len = deps.length; n < len; n++) {
        if (name === deps[n]) {
          this.invalidate(unitName);
        }
      }
    }
  }

  return this;
};

module.exports = Cache;
