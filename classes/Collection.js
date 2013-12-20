/**
 * @module ocanvas/classes/Collection
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('../utils/inherit');
var defineProperties = require('../utils/defineProperties');

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

module.exports = Collection;
