/**
 * @module ocanvas/classes/ResourceManager
 */
'use strict';

var defer = require('prime/defer');

var inherit = require('../utils/inherit');

var EventEmitter = require('./EventEmitter');

/**
 * @classdesc Manager for resources such as images.
 *
 * @property {number} loadingProgress The current progress of loading the
 *     resources. Number between 0 and 1. Default is 1.
 * @property {number} resourceCount The number of resources requested. If a
 *     resource is unloaded, this number decreases. Default is 0.
 * @property {number} loadedCount The number of loaded resources. If a
 *     resource is unloaded, this number decreases. Default is 0.
 * @property {Array.<string>} resourcePaths Array of paths to resources. This
 *     includes both loaded and not-yet-loaded resources.
 * @property {Array.<string>} loadedResourcePaths Array of paths to loaded
 *     resources.
 * @property {Object.<string, *>} loadedResources Object of resources. Keys are
 *     the paths, values are the resource objects.
 *
 * @constructor
 * @augments {EventEmitter}
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 */
function ResourceManager(opt_properties) {
  EventEmitter.call(this);

  this.loadingProgress = 1;
  this.resourceCount = 0;
  this.loadedCount = 0;
  this.resourcePaths = [];
  this.loadedResourcePaths = [];
  this.loadedResources = {};

  if (opt_properties) {
    for (var prop in opt_properties) {
      this[prop] = opt_properties[prop];
    }
  }
}
inherit(ResourceManager, EventEmitter);

/**
 * Load images from the provided paths.
 * For each resource that successfully loads, an event `resource-load` is
 * emitted. For each resource that fails to load, an event `resource-error` is
 * emitted. For a successful load, the resource must be a valid image.
 * This will automatically update properties in the manager for the new
 * resources.
 *
 * @param {Array.<string>} paths Array of paths to images.
 */
ResourceManager.prototype.loadImages = function(paths) {
  this.resourceCount += paths.length;
  this.loadingProgress = this.loadedCount / this.resourceCount;

  var manager = this;

  paths.forEach(function(path) {
    manager.resourcePaths.push(path);

    var image = new global.Image();

    image.onload = function() {
      if (manager.resourcePaths.indexOf(path) === -1) {
        return;
      }

      manager.loadedCount++;
      manager.loadingProgress = manager.loadedCount / manager.resourceCount;
      manager.loadedResourcePaths.push(path);
      manager.loadedResources[path] = image;

      manager.emit('resource-load', {
        resource: image,
        resourcePath: path
      });
    };

    image.onerror = function() {
      manager.emit('resource-error', {
        resourcePath: path
      });
    };

    image.src = path;
  });
};

/**
 * Check if a resource path has been loaded.
 *
 * @param {string} path A path to a resource.
 *
 * @return {boolean} True if it has been loaded, false otherwise.
 */
ResourceManager.prototype.hasResource = function(path) {
  return this.loadedResourcePaths.indexOf(path) > -1;
};

/**
 * Remove a resource from the manager. If the resource was not loaded yet, it
 * will cancel the loading of the resource.
 *
 * @param {Array.<string>} paths Array of paths to resources.
 */
ResourceManager.prototype.unload = function(paths) {
  var manager = this;

  paths.forEach(function(path) {
    var index = manager.resourcePaths.indexOf(path);
    if (index > -1) {
      manager.resourceCount--;
      manager.resourcePaths.splice(index, 1);
    }

    var loadedIndex = manager.loadedResourcePaths.indexOf(path);
    if (loadedIndex > -1) {
      manager.loadedResourcePaths.splice(loadedIndex, 1);
      manager.loadedCount--;
      delete manager.loadedResources[path];
    }

    manager.loadingProgress = manager.loadedCount / manager.resourceCount;

    // Emit an event on the next tick to make it async
    defer(function() {
      manager.emit('resource-unload', {
        resourcePath: path
      });
    });
  });
};

/**
 * Get a loaded resource by its path.
 *
 * @param {string} path Path to the resource.
 *
 * @return {*?} The resource object, or null if not loaded.
 */
ResourceManager.prototype.get = function(path) {
  return this.loadedResources[path] || null;
};

/**
 * Get an image resource by its path. If the resource is not loaded, it will
 * load it first. This is always asynchronous.
 *
 * @param {string} path Path to the resource.
 * @param {Function} callback A node-style callback function (first argument is
 *     an error object or null and second argument is the image resource if no
 *     error was encountered).
 */
ResourceManager.prototype.getImage = function(path, callback) {
  var image = this.loadedResources[path];

  if (image) {
    defer(function() {
      callback(null, image);
    });

  } else {
    this.loadImages([path]);

    var manager = this;

    var loadHandler = function(event) {
      if (event.resourcePath === path) {
        manager.off('resource-load', loadHandler);
        manager.off('resource-error', errorHandler);

        callback(null, event.resource);
      }
    };

    var errorHandler = function(event) {
      if (event.resourcePath === path) {
        manager.off('resource-load', loadHandler);
        manager.off('resource-error', errorHandler);

        callback(new Error('ResourceManager failed to load image: ' + path));
      }
    };

    this.on('resource-load', loadHandler);
    this.on('resource-error', errorHandler);
  }
};

module.exports = ResourceManager;
