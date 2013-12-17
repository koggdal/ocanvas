/**
 * @module ocanvas/utils/defineProperties
 */
'use strict';

/**
 * Define properties on an object.
 * This is similar to Object.defineProperties, but has some
 * extra nice things. The configuration objects you pass to
 * contains hints for this method. It can be used to add
 * a getter and setter automatically, but also allows you to
 * do custom things when setting a property.
 *
 * @param {Object} object The object that should receive the properties.
 * @param {Object} properties An object with other configuration objects.
 *
 * @example
 * var defineProperties = require('ocanvas/utils/defineProperties');
 * defineProperties(object, {
 *   width: {
 *     value: 0,
 *     get: true,
 *     set: function(value) {
 *       this.element.width = width;
 *     }
 *   },
 *   height: {
 *     value: 0,
 *     get: true,
 *     set: function(value) {
 *       this.element.height = height;
 *     }
 *   }
 * });
 */
function defineProperties(object, properties) {
  var privateVars = {};

  var props = {};
  for (var prop in properties) {
    (function(prop) {
      privateVars[prop] = properties[prop].value;
      props[prop] = {};

      if (properties[prop].get === true) {
        props[prop].get = function() { return privateVars[prop]; };
      } else if (typeof properties[prop].get === 'function') {
        props[prop].get = properties[prop].get;
      }

      if (properties[prop].set) {
        var setFunction = properties[prop].set;
        if (typeof setFunction !== 'function') {
          setFunction = null;
        }
        props[prop].set = function(value) {
          if (setFunction) {
            var returnValue = setFunction.call(object, value, privateVars);
            if (returnValue !== undefined) {
              value = returnValue;
            }
          }
          privateVars[prop] = value;
        };
      } else if (typeof properties[prop].set === 'function') {
        props[prop].set = properties[prop].set;
      }
    }(prop));
  }

  Object.defineProperties(object, props);
}

module.exports = defineProperties;
