/**
 * @module ocanvas/classes/Collection
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('../utils/inherit');
var defineProperties = require('../utils/defineProperties');
var jsonHelpers = require('../utils/json');

/**
 * @classdesc The Collection class can be used to store items. When the
 *     collection is modified, events will be emitted to let anyone know
 *     about it.
 *
 * @property {number} length The number of items in the collection.
 * @property {Array} items The item storage. Use the collection methods to
 *     interact with this storage.
 *
 * @fires module:ocanvas/classes/Collection~Collection#insert
 * @fires module:ocanvas/classes/Collection~Collection#remove
 *
 * @constructor
 * @augments {module:ocanvas/classes/EventEmitter~EventEmitter}
 *
 * @example
 * var collection = new Collection();
 * collection.add(item);
 * collection.length; // 1
 */
function Collection() {
  EventEmitter.call(this);

  defineProperties(this, {
    length: {
      value: 0,
      get: function() {
        return this.items.length;
      },
      set: function(value) {
        if (value < this.items.length) {
          for (var i = value, l = this.items.length; i < l; i++) {
            this.removeAt(i);
            i--; l--;
          }
        } else {
          for (var n = this.items.length; n < value; n++) {
            this.add(undefined);
          }
        }
      }
    },
    items: {
      value: [],
      set: function(value) {
        this.length = 0;
        for (var i = 0, l = value.length; i < l; i++) {
          this.add(value[i]);
        }
      }
    }
  }, {enumerable: true});
}
inherit(Collection, EventEmitter);

/**
 * The name of the class. Useful after minification processes etc.
 *
 * @type {string}
 */
Collection.className = 'Collection';

/**
 * Create a new collection from a plain array.
 * If the array contains plain objects created by oCanvas JSON utils,
 * these will be expanded to their full objects.
 *
 * @param {Array} array The array.
 *
 * @return {Collection} A new Collection instance.
 */
Collection.fromArray = function(array) {
  var collection = new this();

  for (var i = 0, l = array.length; i < l; i++) {
    collection.add(jsonHelpers.fromObject(array[i]));
  }

  return collection;
};

/**
 * Create a new collection from a plain object. This object must match
 * the style that #toObject returns, otherwise it can't reproduce the
 * instance correctly. This means the object must have a __class__
 * property and an items property that contains all items.
 * The items will be expanded to instances if they also follow the correct
 * pattern.
 * You must first register the Collection class using the JSON utils.
 *
 * @param {Object} object The object.
 *
 * @return {Collection} A new Collection instance.
 */
Collection.fromObject = function(object) {
  return jsonHelpers.fromObject(object);
};

/**
 * Create a new collection from a JSON string representing a plain object.
 * This object must match the style that #toObject returns, otherwise it
 * can't reproduce the instance correctly. This means the object must have
 * a __class__ property and an items property that contains all items.
 * The items will be expanded to instances if they also follow the correct
 * pattern.
 * You must first register the Collection class using the JSON utils.
 *
 * @param {string} json The JSON string.
 *
 * @return {Collection} A new Collection instance.
 */
Collection.fromJSON = function(json) {
  return jsonHelpers.fromJSON(json);
};

/**
 * Convert the collection to a plain array and convert
 * each item to a plain object (if the item has a method
 * called toObject). This plain array can be converted
 * to a JSON string (if the items can).
 *
 * @return {Array} An array that represents this collection.
 */
Collection.prototype.toArray = function() {
  var object = jsonHelpers.toObject(this, ['items'], 'Collection');
  return object.items;
};

/**
 * Convert the collection to a plain object with an array and convert
 * each item to a plain object (if the item has a method called toObject).
 * This plain object can be converted to a JSON string (if the items can).
 *
 * @return {Object} An object that represents this collection.
 */
Collection.prototype.toObject = function() {
  return jsonHelpers.toObject(this, ['items'], 'Collection');
};

/**
 * Convert the collection to JSON. This is equal to running toObject
 * and converting that plain object to JSON.
 *
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} A JSON string.
 */
Collection.prototype.toJSON = function(opt_space) {
  return jsonHelpers.toJSON(this, ['items'], 'Collection', opt_space);
};

/**
 * Event for notifying that something was inserted into the collection.
 *
 * @event module:ocanvas/classes/Collection~Collection#insert
 * @property {*} item The inserted item.
 * @property {number} index The index at which the item was inserted.
 *
 * @example
 * var collection = new Collection();
 * collection.on('insert', function(event) {
 *   console.log(event.item, event.index);
 * });
 */

/**
 * Event for notifying that something was removed from the collection.
 *
 * @event module:ocanvas/classes/Collection~Collection#remove
 * @property {*} item The removed item.
 * @property {number} index The index at which the item was removed.
 *
 * @example
 * var collection = new Collection();
 * collection.on('remove', function(event) {
 *   console.log(event.item, event.index);
 * });
 */

/**
 * Add an item to the collection.
 *
 * @param {*} item Any value.
 *
 * @return {number} Returns the new length.
 */
Collection.prototype.add = function(item) {
  var length = this.items.push(item);
  this.emit('insert', {item: item, index: length - 1});
  return length;
};

/**
 * Insert an item at a specific position in the collection.
 * If an item already exists in that position, that item and
 * all the following will be moved one step.
 *
 * @param {*} item Any value.
 * @param {number} index The index to insert it to.
 *
 * @return {number} Returns the new length.
 */
Collection.prototype.insert = function(item, index) {
  this.items.splice(index, 0, item);
  this.emit('insert', {item: item, index: index});
  return this.items.length;
};

/**
 * Remove an item from the collection.
 * If this item exists more than one time in the collection,
 * all instances of it will be removed.
 *
 * @param {*} item Any value (that is in the collection).
 *
 * @return {number} Returns the new length.
 */
Collection.prototype.remove = function(item) {
  var items = this.items;

  for (var i = 0, l = items.length; i < l; i++) {
    if (items[i] === item) {
      items.splice(i, 1);
      this.emit('remove', {item: item, index: i});
      i--; l--;
    }
  }

  return items.length;
};

/**
 * Remove the item that is in the specified position.
 *
 * @param {number} index The index for the item to remove.
 *
 * @return {number} Returns the new length.
 */
Collection.prototype.removeAt = function(index) {
  var items = this.items;

  if (index in items) {
    var item = items[index];
    this.items.splice(index, 1);
    this.emit('remove', {item: item, index: index});
  }

  return items.length;
};

/**
 * Get the index for a specific item in the collection.
 * If the item exists multiple times, the index for the
 * first occurance is returned.
 *
 * @param {*} item Any value.
 *
 * @return {number} Returns the index for the item, or -1 if not found.
 */
Collection.prototype.indexOf = function(item) {
  return this.items.indexOf(item);
};

/**
 * Get the item that is in the specified position.
 *
 * @param {number} index The index to get the item from.
 *
 * @return {*} The item, or null if not found.
 */
Collection.prototype.get = function(index) {
  return index in this.items ? this.items[index] : null;
};

/**
 * Run the provided function once per item in the collection.
 * The function gets called with two arguments: `item` and `index`.
 * When called, `this` is the collection.
 *
 * @param {function} func The function to run.
 */
Collection.prototype.forEach = function(func) {
  var items = this.items;
  for (var i = 0, l = items.length; i < l; i++) {
    func.call(this, items[i], i);
  }
};

module.exports = Collection;
