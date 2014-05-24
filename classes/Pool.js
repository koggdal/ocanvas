/**
 * @module ocanvas/classes/Pool
 */
'use strict';

/**
 * @classdesc Pool for objects. Can be used to create a pool of objects that
 * can be reused instead of creating and removing lots of objects.
 *
 * @property {Array} objects Available objects in the pool.
 * @property {Array} objectsInUse Objects currently in use.
 * @property {number} refillAmount The number of objects to add when trying
 *     to get an object from the pool and the pool is empty. Default is 10.
 * @property {function} createFunction A function that you need to provide.
 *     This function should return a new object that will be put in the pool
 *     and at a later point retrieved and used. By default this is a function
 *     that throws an error.
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 *
 * @example
 * var pool = new Pool();
 * pool.createFunction = function() {
 *   return new Bullet();
 * };
 * pool.add(20);
 *
 * var obj = pool.get();
 *
 * pool.putBack(obj);
 */
function Pool(opt_properties) {
  this.objects = [];
  this.objectsInUse = [];
  this.refillAmount = 10;

  this.createFunction = function() {
    throw new Error('You need to set the `createFunction` property to a function.');
  };

  if (opt_properties) {
    this.setProperties(opt_properties);
  }
}

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Pool.className = 'Pool';

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
Pool.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Add a number of objects to the pool.
 *
 * @param {number} num The number of objects to add.
 */
Pool.prototype.add = function(num) {
  for (var i = 0; i < num; i++) {
    this.objects.push(this.createFunction());
  }
};

/**
 * Remove a number of objects from the pool.
 *
 * @param {number} num The number of objects to remove.
 */
Pool.prototype.remove = function(num) {
  this.objects.splice(this.objects.length - num, num);
};

/**
 * Get one object from the pool.
 * Call putBack when you are done with the object to put it back into the pool.
 *
 * @return {Object} An object from the pool.
 */
Pool.prototype.get = function() {
  if (this.objects.length === 0) {
    this.add(this.refillAmount);
  }

  var obj = this.objects.pop();
  this.objectsInUse.push(obj);
  return obj;
};

/**
 * Put back an object in the pool.
 */
Pool.prototype.putBack = function(obj) {
  var index = this.objectsInUse.indexOf(obj);
  if (index > -1) {
    this.objectsInUse.splice(index, 1);
    this.objects.push(obj);
  }
};

module.exports = Pool;
