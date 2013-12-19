/**
 * @module ocanvas/utils/defineProperties
 */
'use strict';

/**
 * Define properties on an object.
 * This is similar to Object.defineProperties, but has some extra nice things.
 * The configuration objects you pass to the method contains hints. It can be
 * used to add a getter and setter automatically, but also allows you to
 * do custom things when setting a property. It hides away the internal
 * storage of values, so your setter method can contain only the extra things
 * you want to do. You are of course able to tell it exactly what it should
 * get/set.
 *
 * @param {Object} object The object that should receive the properties.
 * @param {Object} properties An object with other configuration objects.
 * @param {Object} opt_default Default options. If a property descriptor
 *     doesn't include something that's specified in this default object,
 *     that property will get the the property from this object. Useful
 *     if you for example want to make all properties enumerable, without
 *     typing enumerable on every property.
 *
 * @example
 * var defineProperties = require('ocanvas/utils/defineProperties');
 * defineProperties(object, {
 *   width: {
 *     value: 0,
 *     set: function(value) {
 *       this.element.width = width;
 *     }
 *   },
 *   height: {
 *     value: 0,
 *     set: function(value) {
 *       this.element.height = height;
 *     }
 *   }
 * });
 */
function defineProperties(object, properties, opt_defaults) {
  var privateVars = {};

  var props = {};
  for (var prop in properties) {
    (function(prop) {

      // Set defaults from the defaults object
      if (opt_defaults) {
        for (var defaultProp in opt_defaults) {
          if (!(defaultProp in properties[prop])) {
            properties[prop][defaultProp] = opt_defaults[defaultProp];
          }
        }
      }

      privateVars[prop] = properties[prop].value;
      props[prop] = {};

      if ('configurable' in properties[prop]) {
        props[prop].configurable = !!properties[prop].configurable;
      }
      if ('enumerable' in properties[prop]) {
        props[prop].enumerable = !!properties[prop].enumerable;
      }
      if ('value' in properties[prop]) {
        privateVars[prop] = properties[prop].value;
      }

      if (properties[prop].writable) {
        properties[prop].set = true;
      }

      if (typeof properties[prop].get === 'function') {
        props[prop].get = properties[prop].get;
      } else {
        props[prop].get = function() { return privateVars[prop]; };
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
      }
    }(prop));
  }

  Object.defineProperties(object, props);
}

module.exports = defineProperties;
