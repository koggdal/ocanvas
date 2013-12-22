/**
 * @module ocanvas
 */
'use strict';

/**
 * Classes that are not shapes.
 * @type {Object}
 * @property {Object} Camera The Camera class.
 * @property {Object} Canvas The Canvas class.
 * @property {Object} Collection The Collection class.
 * @property {Object} EventEmitter The EventEmitter class.
 * @property {Object} World The World class.
 */
exports.classes = {
  Camera: require('./classes/Camera'),
  Canvas: require('./classes/Canvas'),
  Collection: require('./classes/Collection'),
  EventEmitter: require('./classes/EventEmitter'),
  World: require('./classes/World')
};

/**
 * Shape classes.
 * @type {Object}
 * @property {Object} Rectangle The Rectangle shape class.
 * @property {Object} base Base classes for shapes.
 */
exports.shapes = {
  base: {
    CanvasObject: require('./shapes/base/CanvasObject'),
    RectangularCanvasObject: require('./shapes/base/RectangularCanvasObject')
  },
  Rectangle: require('./shapes/Rectangle')
};

/**
 * Utility modules.
 * @type {Object}
 * @property {Object} defineProperties The defineProperties module.
 * @property {Object} inherit The inherit module.
 * @property {Object} mixin The mixin module.
 */
exports.utils = {
  defineProperties: require('./utils/defineProperties'),
  inherit: require('./utils/inherit'),
  json: require('./utils/json'),
  mixin: require('./utils/mixin')
};

/**
 * Helper for creating a base setup.
 * @type {function}
 */
exports.create = require('./create');
