/**
 * @module ocanvas/utils/json
 */
'use strict';

var mixin = require('./mixin');

/**
 * List of registered classes.
 * Object where keys are names of the classes, and the values are the actual
 * classes.
 *
 * @type {Object}
 */
exports.registeredClasses = {};

/**
 * Register classes to the JSON helpers.
 * This will allow the JSON loader to instantiate objects
 * using the classes provided here.
 *
 * @param {Object} classes Object where keys are names of the classes,
 *     and the values are the actual classes.
 */
exports.registerClasses = function(classes) {
  for (var className in classes) {
    exports.registeredClasses[className] = classes[className];
  }
};

/**
 * Convert a plain object to instances of the oCanvas classes.
 *
 * @param {Object} object A plain object.
 *
 * @return {Object} An object.
 */
exports.fromObject = function(object) {
  return expand(object);
};

/**
 * Convert a plain object represented as a JSON string
 * to instances of the oCanvas classes.
 *
 * @param {string} json JSON string.
 *
 * @return {Object} An object.
 */
exports.fromJSON = function(json) {
  return expand(JSON.parse(json));
};

/**
 * Convert an object to a plain object.
 *
 * @param {Object} object An object, normally an instance of an oCanvas class.
 * @param {Array} properties Array of property names to get from the input object.
 * @param {string=} opt_className The name of the class that the input object
 *     is an instance of.
 *
 * @return {Object} A plain object.
 */
exports.toObject = function(object, properties, opt_className) {
  var plainProperties = getProperties(object, properties);
  var obj = opt_className ? {__class__: opt_className} : {};
  return mixin(obj, plainProperties);
};

/**
 * Convert an object to a JSON string.
 *
 * @param {Object} object An object, normally an instance of an oCanvas class.
 * @param {Array} properties Array of property names to get from the input object.
 * @param {string=} opt_className The name of the class that the input object
 *     is an instance of.
 * @param {number|string=} opt_space Optional argument to control
 *     spacing in the output string. If set to a truthy value,
 *     the output will be pretty-printed. If a number, each
 *     indentation step will be that number of spaces wide. If it
 *     is a string, each indentation step will be this string.
 *
 * @return {string} An JSON string.
 */
exports.toJSON = function(object, properties, opt_className, opt_space) {
  object = exports.toObject(object, properties, opt_className);
  return JSON.stringify(object, null, opt_space);
};

/**
 * Set properties on an object and expand any embedded objects to class
 * instances. It will skip the __class__ property (which is used in
 * generated JSON).
 *
 * @param {Object} object Object that will get the properties.
 * @param {Object} properties Object with properties.
 *
 * @return {Object} The object that was passed in.
 */
exports.setProperties = function(object, properties) {
  var props = object.setProperties ? {} : object;
  for (var prop in properties) {

    // The __class__ property is only used in the conversion process,
    // so it's not needed in the final output object.
    if (prop === '__class__') continue;

    // If the value of the property is an object, we might need to
    // expand that object recursively.
    if (typeof properties[prop] === 'object') {
      props[prop] = expand(properties[prop]);

    // Or just set the property if it's not an object
    } else {
      props[prop] = properties[prop];
    }

  }
  if (props !== object) {
    object.setProperties(props);
  }
  return object;
};

function expand(object) {
  if (Array.isArray(object)) {
    var arrayOutput = [];
    for (var i = 0, l = object.length; i < l; i++) {
      arrayOutput.push(expand(object[i]));
    }
    return arrayOutput;
  }

  var className = object.__class__;
  if (className) {
    var Class = exports.registeredClasses[className];
    if (Class) {
      var output;
      if (className === 'Camera' && object.id) {
        output = new Class({id: object.id});
      } else {
        output = new Class();
      }
      return exports.setProperties(output, object);
    } else if (global.console && console.warn) {
      console.warn('JSON input has __class__ ' + className + ', ' +
          'but no class was registered with that name. \n' +
          'Use ocanvas/utils/json#registerClasses to register classes.'
      );
    }
  }

  // Expand special function syntax to a real function
  if (object.__type__ === 'function') {
    return object = eval('var func = ' + object.content + '; func;');
  }

  // If the object could not be handled before (no array, no class found or no
  // function), expand any properties the input object might have, and put it
  // on the same object.
  return exports.setProperties(object, object);
}

function getProperties(object, properties) {
  var output = {};

  for (var i = 0, l = properties.length; i < l; i++) {
    var property = properties[i];
    var value = object[property];

    if (Array.isArray(value)) {
      output[property] = value.map(function(item) {
        return item.toObject ? item.toObject() : item;
      });
    } else if (typeof value === 'object') {
      if (value && value.toObject) {
        output[property] = value.toObject();
      } else {
        output[property] = value;
      }
    } else if (typeof value === 'function') {
      var func = value.toString();
      output[property] = {__type__: 'function', content: func};
    } else {
      output[property] = value;
    }
  }

  return output;
}
